import { Router } from 'express';
import pool from '../db/index.js';

const router = Router();

// Helper: fetch games with their entries joined
async function fetchGames(whereClause = '', params = []) {
  const result = await pool.query(
    `SELECT
       g.id,
       g.date,
       g.created_at,
       json_agg(
         json_build_object(
           'id', ge.id,
           'playerId', ge.player_id,
           'playerName', p.name,
           'teamId', ge.team_id,
           'score', ge.score,
           'isHome', ge.is_home
         ) ORDER BY ge.id
       ) AS entries
     FROM games g
     JOIN game_entries ge ON ge.game_id = g.id
     JOIN players p ON p.id = ge.player_id
     ${whereClause}
     GROUP BY g.id
     ORDER BY g.date DESC, g.id DESC`,
    params
  );
  return result.rows;
}

// GET /api/games
router.get('/', async (req, res) => {
  const games = await fetchGames();
  res.json(games);
});

// GET /api/games/:id
router.get('/:id', async (req, res) => {
  const games = await fetchGames('WHERE g.id = $1', [req.params.id]);
  if (!games.length) return res.status(404).json({ error: 'Game not found' });
  res.json(games[0]);
});

// POST /api/games  body: { date, entries: [{ playerId, teamId, score }] }
router.post('/', async (req, res) => {
  const { date, entries } = req.body;
  if (!date) return res.status(400).json({ error: 'date is required' });
  if (!Array.isArray(entries) || entries.length < 2)
    return res.status(400).json({ error: 'At least 2 entries required' });

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const gameRes = await client.query(
      'INSERT INTO games (date) VALUES ($1) RETURNING *',
      [date]
    );
    const game = gameRes.rows[0];
    for (const e of entries) {
      await client.query(
        'INSERT INTO game_entries (game_id, player_id, team_id, score, is_home) VALUES ($1, $2, $3, $4, $5)',
        [game.id, e.playerId, e.teamId, e.score, e.isHome ?? false]
      );
    }
    await client.query('COMMIT');
    const games = await fetchGames('WHERE g.id = $1', [game.id]);
    res.status(201).json(games[0]);
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
});

// PUT /api/games/:id  body: { date, entries: [{ playerId, teamId, score }] }
router.put('/:id', async (req, res) => {
  const { date, entries } = req.body;
  if (!date) return res.status(400).json({ error: 'date is required' });
  if (!Array.isArray(entries) || entries.length < 2)
    return res.status(400).json({ error: 'At least 2 entries required' });

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const gameRes = await client.query(
      'UPDATE games SET date = $1 WHERE id = $2 RETURNING *',
      [date, req.params.id]
    );
    if (!gameRes.rows.length) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Game not found' });
    }
    await client.query('DELETE FROM game_entries WHERE game_id = $1', [req.params.id]);
    for (const e of entries) {
      await client.query(
        'INSERT INTO game_entries (game_id, player_id, team_id, score, is_home) VALUES ($1, $2, $3, $4, $5)',
        [req.params.id, e.playerId, e.teamId, e.score, e.isHome ?? false]
      );
    }
    await client.query('COMMIT');
    const games = await fetchGames('WHERE g.id = $1', [req.params.id]);
    res.json(games[0]);
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
});

// DELETE /api/games/:id
router.delete('/:id', async (req, res) => {
  const result = await pool.query(
    'DELETE FROM games WHERE id = $1 RETURNING id',
    [req.params.id]
  );
  if (!result.rows.length) return res.status(404).json({ error: 'Game not found' });
  res.json({ deleted: result.rows[0].id });
});

export default router;
