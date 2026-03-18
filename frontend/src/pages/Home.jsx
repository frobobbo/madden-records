import { useEffect, useState } from 'react';
import { getTeamById, getTeamHelmetUrl } from '../data/teams';
import { getRecords, getWinner, getCurrentStreak } from '../utils/stats';
import { formatDate } from '../utils/date';

// Counts up from 0 to `target` over `duration` ms with ease-out
function useCountUp(target, duration = 1000) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (!target) { setValue(0); return; }
    const start = Date.now();
    let raf;
    function tick() {
      const progress = Math.min((Date.now() - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      setValue(Math.round(eased * target));
      if (progress < 1) raf = requestAnimationFrame(tick);
    }
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);
  return value;
}

export default function Home({ games, players, loading }) {
  const last = games[0] ?? null;
  const records = getRecords(games, players);
  const streaks = getCurrentStreak(games, players);

  if (loading) return <LoadingSpinner />;

  return (
    <div className="p-4">
      {last ? (
        <LastGame game={last} records={records} streaks={streaks} players={players} />
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

function LastGame({ game, records, streaks, players }) {
  const winner = getWinner(game);
  const dateStr = formatDate(game.date);

  const entryA = game.entries.find(e => !e.isHome) ?? game.entries[0];
  const entryB = game.entries.find(e => e.isHome)  ?? game.entries[1];
  const teamA = getTeamById(entryA?.teamId);
  const teamB = getTeamById(entryB?.teamId);
  const aWins = winner?.playerId === entryA?.playerId;
  const bWins = winner?.playerId === entryB?.playerId;

  const scoreA = useCountUp(entryA?.score ?? 0, 1200);
  const scoreB = useCountUp(entryB?.score ?? 0, 1200);

  const colorA = teamA?.color ?? '#1e40af';
  const colorB = teamB?.color ?? '#1e40af';

  return (
    <div className="rounded-xl overflow-hidden shadow-xl border border-gray-700">

      {/* ── Football field ── */}
      <div
        className="relative"
        style={{
          background: 'repeating-linear-gradient(180deg,#1a5c2a 0px,#1a5c2a 30px,#1e6e30 30px,#1e6e30 60px)',
        }}
      >
        {/* Yard lines */}
        <div className="absolute inset-0 pointer-events-none flex flex-col justify-evenly">
          {[0,1,2,3].map(i => <div key={i} className="w-full border-t border-white/10" />)}
        </div>
        <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-px bg-white/20 pointer-events-none" />
        <div className="absolute inset-0 pointer-events-none">
          {[25,50,75].map(pct => (
            <div key={pct} className="absolute inset-y-0 flex flex-col justify-evenly" style={{ left: `${pct}%` }}>
              {[0,1,2,3,4].map(i => <div key={i} className="w-2 h-px bg-white/20" />)}
            </div>
          ))}
        </div>

        {/* Date bar */}
        <div className="relative z-10 bg-black/50 py-1.5 px-4 flex justify-between items-center">
          <span className="text-white/50 text-xs font-semibold tracking-widest uppercase">AWAY</span>
          <span className="text-white/80 text-xs font-semibold tracking-widest uppercase">Last Game · {dateStr}</span>
          <span className="text-white/50 text-xs font-semibold tracking-widest uppercase">HOME</span>
        </div>

        {/* Scoreboard */}
        <div className="relative z-10 flex items-center justify-between px-4 py-6 gap-2">

          {/* Away (left) */}
          <div className="flex-1 flex flex-col items-center gap-2">
            <div style={{ filter: `drop-shadow(0 6px 18px ${colorA}99)` }}>
              {teamA
                ? <img src={getTeamHelmetUrl(teamA.abbr, 'right')} alt={teamA.name} className="w-28 h-auto object-contain" />
                : <div className="w-24 h-20 rounded bg-black/30" />}
            </div>
            <span className="font-bold text-sm text-center drop-shadow" style={{ color: colorA, textShadow: `0 0 12px ${colorA}88` }}>
              {entryA?.playerName}
            </span>
            <span
              className="font-black drop-shadow-lg"
              style={{
                fontSize: '3.5rem', lineHeight: 1,
                color: aWins ? '#ffffff' : 'rgba(255,255,255,0.3)',
                textShadow: aWins ? `0 0 24px ${colorA}` : 'none',
              }}
            >
              {scoreA}
            </span>
          </div>

          {/* Centre */}
          <div className="flex flex-col items-center gap-1 shrink-0">
            <span className="text-white/40 text-xs font-bold tracking-widest">FINAL</span>
            <div className="h-6 w-px bg-white/20" />
          </div>

          {/* Home (right) */}
          <div className="flex-1 flex flex-col items-center gap-2">
            <div style={{ filter: `drop-shadow(0 6px 18px ${colorB}99)` }}>
              {teamB
                ? <img src={getTeamHelmetUrl(teamB.abbr, 'left')} alt={teamB.name} className="w-28 h-auto object-contain" />
                : <div className="w-24 h-20 rounded bg-black/30" />}
            </div>
            <span className="font-bold text-sm text-center drop-shadow" style={{ color: colorB, textShadow: `0 0 12px ${colorB}88` }}>
              {entryB?.playerName}
            </span>
            <span
              className="font-black drop-shadow-lg"
              style={{
                fontSize: '3.5rem', lineHeight: 1,
                color: bWins ? '#ffffff' : 'rgba(255,255,255,0.3)',
                textShadow: bWins ? `0 0 24px ${colorB}` : 'none',
              }}
            >
              {scoreB}
            </span>
          </div>
        </div>

        <div className="absolute inset-y-0 left-0 w-8 bg-black/15 pointer-events-none" />
        <div className="absolute inset-y-0 right-0 w-8 bg-black/15 pointer-events-none" />
      </div>

      {/* ── Records panel ── */}
      <div className="metallic px-5 py-4 border-t border-gray-700">
        <p className="text-center text-xs font-semibold text-gray-500 uppercase tracking-widest mb-3">
          Season Record
        </p>
        <div className="flex flex-col gap-2">
          {players.map(p => {
            const streak = streaks[p.name] ?? 0;
            return (
              <div key={p.id} className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <span className="text-gray-300 text-sm">{p.name}</span>
                  {streak >= 3 && (
                    <span className="text-xs font-bold text-orange-400">🔥 {streak}</span>
                  )}
                  {streak <= -3 && (
                    <span className="text-xs font-bold text-sky-400">🥶 {Math.abs(streak)}</span>
                  )}
                </div>
                <span className="text-white font-mono font-bold text-sm">
                  {records[p.name]?.wins ?? 0} – {records[p.name]?.losses ?? 0}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function LoadingSpinner() {
  return (
    <div className="flex justify-center mt-20">
      <div className="w-8 h-8 border-4 border-sky-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );
}
