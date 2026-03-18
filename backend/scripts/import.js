/**
 * Data import script — runs as a Kubernetes Job on helm install/upgrade.
 * Reads /import/data.json (mounted from a ConfigMap) and imports into PostgreSQL.
 * If the file is absent, or the database already has data, it exits cleanly.
 */
import fs from 'fs';
import pg from 'pg';

const IMPORT_FILE = '/import/data.json';

const pool = new pg.Pool({
  host:     process.env.DB_HOST     || 'localhost',
  port:     parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME     || 'madden',
  user:     process.env.DB_USER     || 'madden',
  password: process.env.DB_PASSWORD || 'madden',
});

async function main() {
  if (!fs.existsSync(IMPORT_FILE)) {
    console.log(`No import file at ${IMPORT_FILE} — starting with blank database.`);
    await pool.end();
    process.exit(0);
  }

  const client = await pool.connect();
  try {
    // Ensure schema exists (same migration as backend startup)
    await client.query(`
      CREATE TABLE IF NOT EXISTS players (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL UNIQUE,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
      CREATE TABLE IF NOT EXISTS games (
        id SERIAL PRIMARY KEY,
        date DATE NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
      CREATE TABLE IF NOT EXISTS game_entries (
        id SERIAL PRIMARY KEY,
        game_id INTEGER NOT NULL REFERENCES games(id) ON DELETE CASCADE,
        player_id INTEGER NOT NULL REFERENCES players(id) ON DELETE CASCADE,
        team_id VARCHAR(20) NOT NULL,
        score INTEGER NOT NULL CHECK (score >= 0)
      );
      ALTER TABLE game_entries ADD COLUMN IF NOT EXISTS is_home BOOLEAN NOT NULL DEFAULT FALSE;
    `);

    // Skip if data already exists
    const { rows: countRows } = await client.query('SELECT COUNT(*) FROM games');
    if (parseInt(countRows[0].count) > 0) {
      console.log(`Database already has ${countRows[0].count} game(s) — skipping import.`);
      return;
    }

    const { players, games } = JSON.parse(fs.readFileSync(IMPORT_FILE, 'utf-8'));

    await client.query('BEGIN');

    // Insert players, get their new IDs
    const playerIdMap = {};
    for (const p of players) {
      const { rows } = await client.query(
        'INSERT INTO players (name) VALUES ($1) ON CONFLICT (name) DO UPDATE SET name=EXCLUDED.name RETURNING id',
        [p.name]
      );
      playerIdMap[p.name] = rows[0].id;
    }
    console.log(`Inserted ${players.length} player(s).`);

    // Insert games + entries
    let count = 0;
    for (const g of games) {
      const homeId = playerIdMap[g.home.playerName];
      const awayId = playerIdMap[g.away.playerName];
      if (!homeId || !awayId) {
        console.warn(`Skipping game on ${g.date} — unknown player name in entry.`);
        continue;
      }

      const { rows } = await client.query(
        'INSERT INTO games (date) VALUES ($1) RETURNING id',
        [g.date]
      );
      const gameId = rows[0].id;

      await client.query(
        'INSERT INTO game_entries (game_id, player_id, team_id, score, is_home) VALUES ($1,$2,$3,$4,$5)',
        [gameId, homeId, g.home.teamId, g.home.score, true]
      );
      await client.query(
        'INSERT INTO game_entries (game_id, player_id, team_id, score, is_home) VALUES ($1,$2,$3,$4,$5)',
        [gameId, awayId, g.away.teamId, g.away.score, false]
      );
      count++;
    }

    await client.query('COMMIT');
    console.log(`Import complete — ${count} game(s) loaded.`);

  } catch (err) {
    await client.query('ROLLBACK').catch(() => {});
    console.error('Import failed:', err.message);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

main();
