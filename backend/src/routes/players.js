import { Router } from 'express';
import pool from '../db/index.js';

const router = Router();

// GET /api/players
router.get('/', async (req, res) => {
  const result = await pool.query('SELECT * FROM players ORDER BY name ASC');
  res.json(result.rows);
});

// POST /api/players
router.post('/', async (req, res) => {
  const { name } = req.body;
  if (!name?.trim()) return res.status(400).json({ error: 'Name is required' });
  const result = await pool.query(
    'INSERT INTO players (name) VALUES ($1) RETURNING *',
    [name.trim()]
  );
  res.status(201).json(result.rows[0]);
});

// PUT /api/players/:id
router.put('/:id', async (req, res) => {
  const { name } = req.body;
  if (!name?.trim()) return res.status(400).json({ error: 'Name is required' });
  const result = await pool.query(
    'UPDATE players SET name = $1 WHERE id = $2 RETURNING *',
    [name.trim(), req.params.id]
  );
  if (!result.rows.length) return res.status(404).json({ error: 'Player not found' });
  res.json(result.rows[0]);
});

// DELETE /api/players/:id
router.delete('/:id', async (req, res) => {
  const result = await pool.query(
    'DELETE FROM players WHERE id = $1 RETURNING id',
    [req.params.id]
  );
  if (!result.rows.length) return res.status(404).json({ error: 'Player not found' });
  res.json({ deleted: result.rows[0].id });
});

export default router;
