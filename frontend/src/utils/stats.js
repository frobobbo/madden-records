import { getTeamById } from '../data/teams';

// A game has: { id, date, entries: [{ playerId, playerName, teamId, score }] }

export function getWinner(game) {
  if (!game.entries?.length) return null;
  const sorted = [...game.entries].sort((a, b) => b.score - a.score);
  if (sorted[0].score === sorted[1]?.score) return null; // tie
  return sorted[0];
}

// Returns { [playerName]: { wins, losses } } for all players
export function getRecords(games, players) {
  const records = {};
  for (const p of players) records[p.name] = { wins: 0, losses: 0 };

  for (const g of games) {
    const winner = getWinner(g);
    if (!winner) continue;
    for (const e of g.entries) {
      if (!records[e.playerName]) records[e.playerName] = { wins: 0, losses: 0 };
      if (e.playerId === winner.playerId) {
        records[e.playerName].wins++;
      } else {
        records[e.playerName].losses++;
      }
    }
  }
  return records;
}

// Longest win streak per player: { [playerName]: number }
export function getLongestWinStreak(games, players) {
  const sorted = [...games].sort((a, b) => new Date(a.date) - new Date(b.date));
  const result = {};
  for (const p of players) {
    let max = 0, current = 0;
    for (const g of sorted) {
      const winner = getWinner(g);
      const inGame = g.entries.some(e => e.playerId === p.id);
      if (!inGame) continue;
      if (winner?.playerId === p.id) {
        current++;
        max = Math.max(max, current);
      } else {
        current = 0;
      }
    }
    result[p.name] = max;
  }
  return result;
}

// Largest margin of victory per player: { [playerName]: number }
export function getLargestMargin(games, players) {
  const result = {};
  for (const p of players) result[p.name] = 0;

  for (const g of games) {
    if (g.entries.length < 2) continue;
    const scores = g.entries.map(e => e.score).sort((a, b) => b - a);
    const margin = scores[0] - scores[1];
    const winner = getWinner(g);
    if (winner && margin > (result[winner.playerName] ?? 0)) {
      result[winner.playerName] = margin;
    }
  }
  return result;
}

// Most points scored in a single game per player: { [playerName]: number }
export function getMostPointsScored(games, players) {
  const result = {};
  for (const p of players) result[p.name] = 0;

  for (const g of games) {
    for (const e of g.entries) {
      if (e.score > (result[e.playerName] ?? 0)) {
        result[e.playerName] = e.score;
      }
    }
  }
  return result;
}

// Team usage per player: { [playerName]: { [teamId]: count } }
export function getTeamUsage(games) {
  const usage = {};
  for (const g of games) {
    for (const e of g.entries) {
      if (!usage[e.playerName]) usage[e.playerName] = {};
      usage[e.playerName][e.teamId] = (usage[e.playerName][e.teamId] || 0) + 1;
    }
  }
  return usage;
}

export function getMostUsedTeam(games, players) {
  const usage = getTeamUsage(games);
  const result = {};
  for (const p of players) {
    const entries = Object.entries(usage[p.name] || {});
    if (!entries.length) { result[p.name] = null; continue; }
    const [teamId, count] = entries.sort((a, b) => b[1] - a[1])[0];
    result[p.name] = { team: getTeamById(teamId), count };
  }
  return result;
}

export function getLeastUsedTeam(games, players) {
  const usage = getTeamUsage(games);
  const result = {};
  for (const p of players) {
    const entries = Object.entries(usage[p.name] || {});
    if (!entries.length) { result[p.name] = null; continue; }
    const [teamId, count] = entries.sort((a, b) => a[1] - b[1])[0];
    result[p.name] = { team: getTeamById(teamId), count };
  }
  return result;
}

export function getAverageScore(games, players) {
  const totals = {};
  const counts = {};
  for (const p of players) { totals[p.name] = 0; counts[p.name] = 0; }

  for (const g of games) {
    for (const e of g.entries) {
      if (totals[e.playerName] === undefined) { totals[e.playerName] = 0; counts[e.playerName] = 0; }
      totals[e.playerName] += e.score;
      counts[e.playerName]++;
    }
  }

  const result = {};
  for (const p of players) {
    result[p.name] = counts[p.name] ? (totals[p.name] / counts[p.name]).toFixed(2) : '0.00';
  }
  return result;
}
