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

// Current active streak per player: { [playerName]: number }
// Positive = win streak, negative = loss streak. Games must be newest-first.
export function getCurrentStreak(games, players) {
  const result = {};
  for (const p of players) {
    let streakType = null;
    let count = 0;
    for (const g of games) {
      const entry = g.entries.find(e => e.playerId === p.id);
      if (!entry) continue;
      const won = getWinner(g)?.playerId === p.id;
      if (streakType === null) {
        streakType = won ? 'win' : 'loss';
        count = 1;
      } else if ((won && streakType === 'win') || (!won && streakType === 'loss')) {
        count++;
      } else {
        break;
      }
    }
    result[p.name] = streakType === 'win' ? count : -count;
  }
  return result;
}

// Longest win streak per player: { [playerName]: number }
export function getLongestWinStreak(games, players) {
  const sorted = [...games].sort((a, b) => {
    const dateDiff = new Date(a.date) - new Date(b.date);
    return dateDiff !== 0 ? dateDiff : a.id - b.id;
  });
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

// Win percentage per player: { [playerName]: { wins, losses, pct } }
export function getWinPercentage(games, players) {
  const records = getRecords(games, players);
  const result = {};
  for (const p of players) {
    const { wins, losses } = records[p.name] || { wins: 0, losses: 0 };
    const total = wins + losses;
    result[p.name] = { wins, losses, pct: total ? Math.round((wins / total) * 100) : 0 };
  }
  return result;
}

// Head-to-head record: { [playerNameA]: { [playerNameB]: { wins, losses } } }
export function getHeadToHead(games, players) {
  const result = {};
  for (const p of players) {
    result[p.name] = {};
    for (const q of players) {
      if (p.id !== q.id) result[p.name][q.name] = { wins: 0, losses: 0 };
    }
  }

  for (const g of games) {
    const winner = getWinner(g);
    if (!winner || g.entries.length < 2) continue;
    for (const e of g.entries) {
      for (const f of g.entries) {
        if (e.playerId === f.playerId) continue;
        if (!result[e.playerName]) result[e.playerName] = {};
        if (!result[e.playerName][f.playerName]) result[e.playerName][f.playerName] = { wins: 0, losses: 0 };
        if (winner.playerId === e.playerId) result[e.playerName][f.playerName].wins++;
        else if (winner.playerId === f.playerId) result[e.playerName][f.playerName].losses++;
      }
    }
  }
  return result;
}

// Best/worst team per player (min 2 games with that team): { [playerName]: { team, wins, total, pct } | null }
function buildTeamRecord(games) {
  const teamRecord = {};
  for (const g of games) {
    const winner = getWinner(g);
    for (const e of g.entries) {
      if (!teamRecord[e.playerName]) teamRecord[e.playerName] = {};
      if (!teamRecord[e.playerName][e.teamId]) teamRecord[e.playerName][e.teamId] = { wins: 0, total: 0 };
      teamRecord[e.playerName][e.teamId].total++;
      if (winner?.playerId === e.playerId) teamRecord[e.playerName][e.teamId].wins++;
    }
  }
  return teamRecord;
}

export function getBestTeam(games, players) {
  const teamRecord = buildTeamRecord(games);
  const result = {};
  for (const p of players) {
    const entries = Object.entries(teamRecord[p.name] || {}).filter(([, v]) => v.total >= 2);
    if (!entries.length) { result[p.name] = null; continue; }
    const [teamId, stats] = entries.sort((a, b) => (b[1].wins / b[1].total) - (a[1].wins / a[1].total))[0];
    result[p.name] = { team: getTeamById(teamId), wins: stats.wins, total: stats.total, pct: Math.round((stats.wins / stats.total) * 100) };
  }
  return result;
}

export function getWorstTeam(games, players) {
  const teamRecord = buildTeamRecord(games);
  const result = {};
  for (const p of players) {
    const entries = Object.entries(teamRecord[p.name] || {}).filter(([, v]) => v.total >= 2);
    if (!entries.length) { result[p.name] = null; continue; }
    const [teamId, stats] = entries.sort((a, b) => (a[1].wins / a[1].total) - (b[1].wins / b[1].total))[0];
    result[p.name] = { team: getTeamById(teamId), wins: stats.wins, total: stats.total, pct: Math.round((stats.wins / stats.total) * 100) };
  }
  return result;
}

// Win streak per game (consecutive wins ending at that game): { [gameId]: number }
export function getGameStreaks(games) {
  const sorted = [...games].sort((a, b) => {
    const dateDiff = new Date(a.date) - new Date(b.date);
    return dateDiff !== 0 ? dateDiff : a.id - b.id;
  });
  const running = {};
  const result = {};

  for (const g of sorted) {
    const winner = getWinner(g);
    for (const e of g.entries) {
      if (winner?.playerId === e.playerId) {
        running[e.playerId] = (running[e.playerId] || 0) + 1;
      } else {
        running[e.playerId] = 0;
      }
    }
    if (winner) result[g.id] = running[winner.playerId];
  }
  return result;
}
