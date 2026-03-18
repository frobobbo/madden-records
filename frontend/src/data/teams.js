export const NFL_TEAMS = [
  { id: 'ari', name: 'Arizona Cardinals',      abbr: 'ARI', color: '#97233F' },
  { id: 'atl', name: 'Atlanta Falcons',         abbr: 'ATL', color: '#A71930' },
  { id: 'bal', name: 'Baltimore Ravens',        abbr: 'BAL', color: '#241773' },
  { id: 'buf', name: 'Buffalo Bills',           abbr: 'BUF', color: '#00338D' },
  { id: 'car', name: 'Carolina Panthers',       abbr: 'CAR', color: '#0085CA' },
  { id: 'chi', name: 'Chicago Bears',           abbr: 'CHI', color: '#C83803' },
  { id: 'cin', name: 'Cincinnati Bengals',      abbr: 'CIN', color: '#FB4F14' },
  { id: 'cle', name: 'Cleveland Browns',        abbr: 'CLE', color: '#FF3C00' },
  { id: 'dal', name: 'Dallas Cowboys',          abbr: 'DAL', color: '#003594' },
  { id: 'den', name: 'Denver Broncos',          abbr: 'DEN', color: '#FB4F14' },
  { id: 'det', name: 'Detroit Lions',           abbr: 'DET', color: '#0076B6' },
  { id: 'gb',  name: 'Green Bay Packers',       abbr: 'GB',  color: '#203731' },
  { id: 'hou', name: 'Houston Texans',          abbr: 'HOU', color: '#03202F' },
  { id: 'ind', name: 'Indianapolis Colts',      abbr: 'IND', color: '#002C5F' },
  { id: 'jax', name: 'Jacksonville Jaguars',    abbr: 'JAX', color: '#006778' },
  { id: 'kc',  name: 'Kansas City Chiefs',      abbr: 'KC',  color: '#E31837' },
  { id: 'lv',  name: 'Las Vegas Raiders',       abbr: 'LV',  color: '#A5ACAF' },
  { id: 'lac', name: 'Los Angeles Chargers',    abbr: 'LAC', color: '#0080C6' },
  { id: 'lar', name: 'Los Angeles Rams',        abbr: 'LAR', color: '#003594' },
  { id: 'mia', name: 'Miami Dolphins',          abbr: 'MIA', color: '#008E97' },
  { id: 'min', name: 'Minnesota Vikings',       abbr: 'MIN', color: '#4F2683' },
  { id: 'ne',  name: 'New England Patriots',    abbr: 'NE',  color: '#002244' },
  { id: 'no',  name: 'New Orleans Saints',      abbr: 'NO',  color: '#9F8958' },
  { id: 'nyg', name: 'New York Giants',         abbr: 'NYG', color: '#0B2265' },
  { id: 'nyj', name: 'New York Jets',           abbr: 'NYJ', color: '#125740' },
  { id: 'phi', name: 'Philadelphia Eagles',     abbr: 'PHI', color: '#004C54' },
  { id: 'pit', name: 'Pittsburgh Steelers',     abbr: 'PIT', color: '#FFB612' },
  { id: 'sf',  name: 'San Francisco 49ers',     abbr: 'SF',  color: '#AA0000' },
  { id: 'sea', name: 'Seattle Seahawks',        abbr: 'SEA', color: '#002244' },
  { id: 'tb',  name: 'Tampa Bay Buccaneers',    abbr: 'TB',  color: '#D50A0A' },
  { id: 'ten', name: 'Tennessee Titans',        abbr: 'TEN', color: '#4B92DB' },
  { id: 'was', name: 'Washington Commanders',   abbr: 'WAS', color: '#773141' },
];

export function getTeamById(id) {
  return NFL_TEAMS.find(t => t.id === id) || null;
}

export function getTeamLogoUrl(abbr) {
  return `/logos/${abbr.toUpperCase()}.png`;
}

// direction: 'left' | 'right'
// Away (left side of screen) → right-facing helmet (faces inward)
// Home (right side of screen) → left-facing helmet (faces inward)
export function getTeamHelmetUrl(abbr, direction = 'right') {
  return `/helmets/${abbr.toUpperCase()}_${direction}.png`;
}
