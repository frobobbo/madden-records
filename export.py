#!/usr/bin/env python3
"""
Convert the MongoDB BSON export to import.json for the Helm import job.

Usage:
  python3 export.py                        # writes import.json
  python3 export.py --out /tmp/data.json   # custom output path

Then create the Kubernetes ConfigMap:
  kubectl create configmap <release>-madden-records-import \
    --from-file=data.json=import.json -n <namespace>

On the next helm install/upgrade the import job will pick it up automatically.
"""

import bson
import json
import argparse
from datetime import datetime

BSON_DIR = '/home/brett/Documents/maddenrecords/MaddenRecords'

# Old TeamLogo abbr -> new team id (handles relocated franchises)
TEAM_ABBR_MAP = {
    'ARI': 'ari', 'ATL': 'atl', 'BAL': 'bal', 'BUF': 'buf',
    'CAR': 'car', 'CHI': 'chi', 'CIN': 'cin', 'CLE': 'cle',
    'DAL': 'dal', 'DEN': 'den', 'DET': 'det', 'GB':  'gb',
    'HOU': 'hou', 'IND': 'ind', 'JAC': 'jax',
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
    try:
        return datetime.strptime(date_str, '%m/%d/%Y').strftime('%Y-%m-%d')
    except Exception:
        try:
            return datetime.utcfromtimestamp(fallback_ts).strftime('%Y-%m-%d')
        except Exception:
            return datetime.today().strftime('%Y-%m-%d')

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--out', default='import.json', help='Output file path')
    args = parser.parse_args()

    old_players = {p['_id']: p for p in load_bson('players')}
    old_teams   = {t['_id']: t for t in load_bson('teams')}
    old_games   = load_bson('games')

    team_id_map = {
        t['_id']: TEAM_ABBR_MAP[t['TeamLogo']]
        for t in old_teams.values()
        if t.get('TeamLogo') in TEAM_ABBR_MAP
    }

    players_out = [
        {'name': f"{p['FName']} {p['LName']}"}
        for p in old_players.values()
    ]

    player_name = {
        old_id: f"{p['FName']} {p['LName']}"
        for old_id, p in old_players.items()
    }

    games_out = []
    skipped = 0
    for g in old_games:
        hp = player_name.get(g.get('HomePlayer'))
        ap = player_name.get(g.get('AwayPlayer'))
        ht = team_id_map.get(g.get('HomeTeam'))
        at = team_id_map.get(g.get('AwayTeam'))

        if not all([hp, ap, ht, at]):
            skipped += 1
            continue

        games_out.append({
            'date': parse_date(g.get('GameDate', ''), g.get('GameTime', 0)),
            'home': {'playerName': hp, 'teamId': ht, 'score': g['HomeScore']},
            'away': {'playerName': ap, 'teamId': at, 'score': g['AwayScore']},
        })

    output = {'players': players_out, 'games': games_out}
    with open(args.out, 'w') as f:
        json.dump(output, f, indent=2)

    print(f'Wrote {len(players_out)} players and {len(games_out)} games to {args.out}')
    if skipped:
        print(f'Skipped {skipped} games (unresolvable team/player references)')

if __name__ == '__main__':
    main()
