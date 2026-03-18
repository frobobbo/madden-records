import { getTeamById, getTeamHelmetUrl } from '../data/teams';
import { getRecords, getWinner } from '../utils/stats';
import { formatDate } from '../utils/date';

export default function Home({ games, players, loading }) {
  const last = games[0] ?? null;
  const records = getRecords(games, players);

  if (loading) return <LoadingSpinner />;

  return (
    <div className="p-4">
      {last ? (
        <LastGame game={last} records={records} players={players} />
      ) : (
        <div className="text-center text-gray-500 mt-16">
          <p className="text-4xl mb-3">🏈</p>
          <p className="font-medium text-gray-400">No games yet.</p>
          <p className="text-sm text-gray-500">Tap <strong className="text-gray-300">Add</strong> to record your first game!</p>
        </div>
      )}
    </div>
  );
}

function LastGame({ game, records, players }) {
  const winner = getWinner(game);
  const dateStr = formatDate(game.date);
  // Away on left, Home on right
  const entryA = game.entries.find(e => !e.isHome) ?? game.entries[0];
  const entryB = game.entries.find(e => e.isHome) ?? game.entries[1];
  const teamA = getTeamById(entryA?.teamId);
  const teamB = getTeamById(entryB?.teamId);
  const aWins = winner?.playerId === entryA?.playerId;
  const bWins = winner?.playerId === entryB?.playerId;

  return (
    <div className="rounded-xl overflow-hidden shadow-xl border border-gray-700">

      {/* ── Football field ── */}
      <div
        className="relative"
        style={{
          background: 'repeating-linear-gradient(180deg,#1a5c2a 0px,#1a5c2a 30px,#1e6e30 30px,#1e6e30 60px)',
        }}
      >
        {/* Horizontal yard lines */}
        <div className="absolute inset-0 pointer-events-none flex flex-col justify-evenly">
          {[0,1,2,3].map(i => (
            <div key={i} className="w-full border-t border-white/10" />
          ))}
        </div>

        {/* Centre field line */}
        <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-px bg-white/20 pointer-events-none" />

        {/* Hash marks */}
        <div className="absolute inset-0 pointer-events-none">
          {[25,50,75].map(pct => (
            <div key={pct} className="absolute inset-y-0 flex flex-col justify-evenly"
              style={{ left: `${pct}%` }}>
              {[0,1,2,3,4].map(i => (
                <div key={i} className="w-2 h-px bg-white/20" />
              ))}
            </div>
          ))}
        </div>

        {/* Date bar */}
        <div className="relative z-10 bg-black/50 py-1.5 px-4 flex justify-between items-center">
          <span className="text-white/50 text-xs font-semibold tracking-widest uppercase">AWAY</span>
          <span className="text-white/80 text-xs font-semibold tracking-widest uppercase">Last Game · {dateStr}</span>
          <span className="text-white/50 text-xs font-semibold tracking-widest uppercase">HOME</span>
        </div>

        {/* Main scoreboard */}
        <div className="relative z-10 flex items-center justify-between px-4 py-6 gap-2">

          {/* Left player (Away) — helmet faces right/inward */}
          <div className="flex-1 flex flex-col items-center gap-2">
            <div style={{ filter: 'drop-shadow(0 6px 14px rgba(0,0,0,0.7))' }}>
              {teamA
                ? <img src={getTeamHelmetUrl(teamA.abbr, 'right')} alt={teamA.name}
                    className="w-28 h-auto object-contain" />
                : <div className="w-24 h-20 rounded bg-black/30" />}
            </div>
            <span className="text-white font-bold text-sm text-center drop-shadow">
              {entryA?.playerName}
            </span>
            <span
              className="font-black drop-shadow-lg"
              style={{
                fontSize: '3.5rem',
                lineHeight: 1,
                color: aWins ? '#ffffff' : 'rgba(255,255,255,0.3)',
                textShadow: aWins ? '0 0 20px rgba(255,255,255,0.4)' : 'none',
              }}
            >
              {entryA?.score}
            </span>
          </div>

          {/* Centre label */}
          <div className="flex flex-col items-center gap-1 shrink-0">
            <span className="text-white/40 text-xs font-bold tracking-widest">FINAL</span>
            <div className="h-6 w-px bg-white/20" />
          </div>

          {/* Right player (Home) — helmet faces left/inward */}
          <div className="flex-1 flex flex-col items-center gap-2">
            <div style={{ filter: 'drop-shadow(0 6px 14px rgba(0,0,0,0.7))' }}>
              {teamB
                ? <img src={getTeamHelmetUrl(teamB.abbr, 'left')} alt={teamB.name}
                    className="w-28 h-auto object-contain" />
                : <div className="w-24 h-20 rounded bg-black/30" />}
            </div>
            <span className="text-white font-bold text-sm text-center drop-shadow">
              {entryB?.playerName}
            </span>
            <span
              className="font-black drop-shadow-lg"
              style={{
                fontSize: '3.5rem',
                lineHeight: 1,
                color: bWins ? '#ffffff' : 'rgba(255,255,255,0.3)',
                textShadow: bWins ? '0 0 20px rgba(255,255,255,0.4)' : 'none',
              }}
            >
              {entryB?.score}
            </span>
          </div>
        </div>

        {/* End-zone tint strips */}
        <div className="absolute inset-y-0 left-0 w-8 bg-black/15 pointer-events-none" />
        <div className="absolute inset-y-0 right-0 w-8 bg-black/15 pointer-events-none" />
      </div>

      {/* ── Records panel ── */}
      <div className="metallic px-5 py-4 border-t border-gray-700">
        <p className="text-center text-xs font-semibold text-gray-500 uppercase tracking-widest mb-3">
          Season Record
        </p>
        <div className="flex flex-col gap-2">
          {players.map(p => (
            <div key={p.id} className="flex justify-between items-center">
              <span className="text-gray-300 text-sm">{p.name}</span>
              <span className="text-white font-mono font-bold text-sm">
                {records[p.name]?.wins ?? 0} – {records[p.name]?.losses ?? 0}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function LoadingSpinner() {
  return (
    <div className="flex justify-center mt-20">
      <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );
}
