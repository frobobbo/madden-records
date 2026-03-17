export const NFL_TEAMS = [
  { id: 'ari', name: 'Arizona Cardinals', abbr: 'ARI' },
  { id: 'atl', name: 'Atlanta Falcons', abbr: 'ATL' },
  { id: 'bal', name: 'Baltimore Ravens', abbr: 'BAL' },
  { id: 'buf', name: 'Buffalo Bills', abbr: 'BUF' },
  { id: 'car', name: 'Carolina Panthers', abbr: 'CAR' },
  { id: 'chi', name: 'Chicago Bears', abbr: 'CHI' },
  { id: 'cin', name: 'Cincinnati Bengals', abbr: 'CIN' },
  { id: 'cle', name: 'Cleveland Browns', abbr: 'CLE' },
  { id: 'dal', name: 'Dallas Cowboys', abbr: 'DAL' },
  { id: 'den', name: 'Denver Broncos', abbr: 'DEN' },
  { id: 'det', name: 'Detroit Lions', abbr: 'DET' },
  { id: 'gb', name: 'Green Bay Packers', abbr: 'GB' },
  { id: 'hou', name: 'Houston Texans', abbr: 'HOU' },
  { id: 'ind', name: 'Indianapolis Colts', abbr: 'IND' },
  { id: 'jax', name: 'Jacksonville Jaguars', abbr: 'JAX' },
  { id: 'kc', name: 'Kansas City Chiefs', abbr: 'KC' },
  { id: 'lv', name: 'Las Vegas Raiders', abbr: 'LV' },
  { id: 'lac', name: 'Los Angeles Chargers', abbr: 'LAC' },
  { id: 'lar', name: 'Los Angeles Rams', abbr: 'LAR' },
  { id: 'mia', name: 'Miami Dolphins', abbr: 'MIA' },
  { id: 'min', name: 'Minnesota Vikings', abbr: 'MIN' },
  { id: 'ne', name: 'New England Patriots', abbr: 'NE' },
  { id: 'no', name: 'New Orleans Saints', abbr: 'NO' },
  { id: 'nyg', name: 'New York Giants', abbr: 'NYG' },
  { id: 'nyj', name: 'New York Jets', abbr: 'NYJ' },
  { id: 'phi', name: 'Philadelphia Eagles', abbr: 'PHI' },
  { id: 'pit', name: 'Pittsburgh Steelers', abbr: 'PIT' },
  { id: 'sf', name: 'San Francisco 49ers', abbr: 'SF' },
  { id: 'sea', name: 'Seattle Seahawks', abbr: 'SEA' },
  { id: 'tb', name: 'Tampa Bay Buccaneers', abbr: 'TB' },
  { id: 'ten', name: 'Tennessee Titans', abbr: 'TEN' },
  { id: 'was', name: 'Washington Commanders', abbr: 'WAS' },
];

export function getTeamById(id) {
  return NFL_TEAMS.find(t => t.id === id) || null;
}

export function getTeamLogoUrl(abbr) {
  return `https://a.espncdn.com/i/teamlogos/nfl/500/${abbr.toLowerCase()}.png`;
}
