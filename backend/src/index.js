import express from 'express';
import cors from 'cors';
import { migrate } from './db/index.js';
import playersRouter from './routes/players.js';
import gamesRouter from './routes/games.js';

const app = express();
const PORT = process.env.PORT || 3001;

let dbReady = false;

app.use(cors({ origin: process.env.CORS_ORIGIN || '*' }));
app.use(express.json());

// Log every incoming request
app.use((req, res, next) => {
  res.on('finish', () => {
    console.log(`${req.method} ${req.path} ${res.statusCode}`);
  });
  next();
});

// Health: always responds so liveness probes pass immediately.
// Reports db status so readiness probes can gate traffic until DB is ready.
app.get('/health', (req, res) => {
  if (!dbReady) return res.status(503).json({ status: 'starting', db: false });
  res.json({ status: 'ok', db: true });
});

app.use('/api/players', playersRouter);
app.use('/api/games', gamesRouter);

// Central error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
});

async function connectDb() {
  let retries = 20;
  while (retries > 0) {
    try {
      await migrate();
      dbReady = true;
      console.log('Database ready');
      return;
    } catch (err) {
      retries--;
      console.log(`DB not ready (${err.message}), retrying in 5s... (${retries} left)`);
      await new Promise(r => setTimeout(r, 5000));
    }
  }
  console.error('Could not connect to database after all retries');
  process.exit(1);
}

// Start listening immediately so liveness probes succeed,
// then connect to the DB in the background.
app.listen(PORT, () => {
  console.log(`API listening on :${PORT}`);
  connectDb();
});
