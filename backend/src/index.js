import express from 'express';
import cors from 'cors';
import { migrate } from './db/index.js';
import playersRouter from './routes/players.js';
import gamesRouter from './routes/games.js';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({ origin: process.env.CORS_ORIGIN || '*' }));
app.use(express.json());

app.use('/api/players', playersRouter);
app.use('/api/games', gamesRouter);

app.get('/health', (req, res) => res.json({ status: 'ok' }));

// Central error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
});

async function start() {
  let retries = 10;
  while (retries > 0) {
    try {
      await migrate();
      console.log('Database ready');
      break;
    } catch (err) {
      retries--;
      console.log(`DB not ready, retrying... (${retries} left)`);
      await new Promise(r => setTimeout(r, 3000));
    }
  }
  if (retries === 0) {
    console.error('Could not connect to database');
    process.exit(1);
  }

  app.listen(PORT, () => console.log(`API listening on :${PORT}`));
}

start();
