#!/usr/bin/env python3
"""
Migrate data from old MongoDB export to the new PostgreSQL schema.
Run from the project root:  python3 migrate.py
"""

import bson
import psycopg2
from datetime import datetime
import os

BSON_DIR = '/home/brett/Documents/maddenrecords/MaddenRecords'

# Old TeamLogo abbr -> new team id (handles relocated franchises)
TEAM_ABBR_MAP = {
    'ARI': 'ari', 'ATL': 'atl', 'BAL': 'bal', 'BUF': 'buf',
    'CAR': 'car', 'CHI': 'chi', 'CIN': 'cin', 'CLE': 'cle',
    'DAL': 'dal', 'DEN': 'den', 'DET': 'det', 'GB':  'gb',
    'HOU': 'hou', 'IND': 'ind', 'JAC': 'jax',  # JAC -> JAX
    'KC':  'kc',  'MIA': 'mia', 'MIN': 'min',
    'NE':  'ne',  'NO':  'no',  'NYG': 'nyg', 'NYJ': 'nyj',
    'PHI': 'phi', 'PIT': 'pit', 'SEA': 'sea', 'SF':  'sf',
    'STL': 'lar',  # Rams: St. Louis -> Los Angeles
    'OAK': 'lv',   # Raiders: Oakland -> Las Vegas
    'SD':  'lac',  # Chargers: San Diego -> Los Angeles
    'TB':  'tb',  'TEN': 'ten', 'WAS': 'was',
}

def load_bson(name):
    with open(f'{BSON_DIR}/{name}.bson', 'rb') as f:
        return bson.decode_all(f.read())

def parse_date(date_str, fallback_ts):
    """Parse 'M/D/YYYY' date string; fall back to Unix timestamp."""
    try:
        return datetime.strptime(date_str, '%m/%d/%Y').date()
    except Exception:
        try:
            return datetime.utcfromtimestamp(fallback_ts).date()
        except Exception:
            return datetime.today().date()

def main():
    conn = psycopg2.connect(
        host=os.environ.get('DB_HOST', 'localhost'),
        port=int(os.environ.get('DB_PORT', 5432)),
        dbname=os.environ.get('DB_NAME', 'madden'),
        user=os.environ.get('DB_USER', 'madden'),
        password=os.environ.get('DB_PASSWORD', 'madden'),
    )
    cur = conn.cursor()

    # ── Load source data ────────────────────────────────────────────────────
    old_players = {p['_id']: p for p in load_bson('players')}
    old_teams   = {t['_id']: t for t in load_bson('teams')}
    old_games   = load_bson('games')

    # Build old-team-id -> new-team-id lookup
    team_id_map = {}
    for t in old_teams.values():
        abbr = t.get('TeamLogo', '')
        new_id = TEAM_ABBR_MAP.get(abbr)
        if new_id:
            team_id_map[t['_id']] = new_id

    print(f'Players: {len(old_players)}  |  Games: {len(old_games)}  |  Teams mapped: {len(team_id_map)}')

    # ── Check existing data ──────────────────────────────────────────────────
    cur.execute('SELECT COUNT(*) FROM games')
    existing_games = cur.fetchone()[0]
    if existing_games > 0:
        print(f'\nWARNING: The database already has {existing_games} game(s).')
        resp = input('Continue and ADD to existing data? [y/N] ').strip().lower()
        if resp != 'y':
            print('Aborted.')
            return

    # ── Insert players ───────────────────────────────────────────────────────
    old_to_new_player = {}  # old mongo _id -> new postgres player id
    for old_id, p in old_players.items():
        name = f"{p['FName']} {p['LName']}"
        cur.execute(
            'INSERT INTO players (name) VALUES (%s) ON CONFLICT (name) DO UPDATE SET name=EXCLUDED.name RETURNING id',
            (name,)
        )
        new_id = cur.fetchone()[0]
        old_to_new_player[old_id] = new_id
        print(f'  Player: {name} -> id={new_id}')

    # ── Insert games ─────────────────────────────────────────────────────────
    skipped = 0
    inserted = 0

    for g in old_games:
        home_player_old = g.get('HomePlayer')
        away_player_old = g.get('AwayPlayer')
        home_team_old   = g.get('HomeTeam')
        away_team_old   = g.get('AwayTeam')

        home_player_id = old_to_new_player.get(home_player_old)
        away_player_id = old_to_new_player.get(away_player_old)
        home_team_id   = team_id_map.get(home_team_old)
        away_team_id   = team_id_map.get(away_team_old)

        if not all([home_player_id, away_player_id, home_team_id, away_team_id]):
            skipped += 1
            continue

        game_date = parse_date(g.get('GameDate', ''), g.get('GameTime', 0))

        cur.execute('INSERT INTO games (date) VALUES (%s) RETURNING id', (game_date,))
        game_id = cur.fetchone()[0]

        cur.execute(
            'INSERT INTO game_entries (game_id, player_id, team_id, score, is_home) VALUES (%s,%s,%s,%s,%s)',
            (game_id, home_player_id, home_team_id, g['HomeScore'], True)
        )
        cur.execute(
            'INSERT INTO game_entries (game_id, player_id, team_id, score, is_home) VALUES (%s,%s,%s,%s,%s)',
            (game_id, away_player_id, away_team_id, g['AwayScore'], False)
        )
        inserted += 1

    conn.commit()
    cur.close()
    conn.close()

    print(f'\nDone! Inserted {inserted} games, skipped {skipped}.')

if __name__ == '__main__':
    main()
