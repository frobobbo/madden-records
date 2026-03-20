import { useEffect, useState } from 'react';
import { getTeamById, getTeamHelmetUrl } from '../data/teams';
import { getRecords, getWinner, getCurrentStreak } from '../utils/stats';
import { formatDate } from '../utils/date';

function useCountUp(target, duration = 1000) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (!target) { setValue(0); return; }
    const start = Date.now();
    let raf;
    function tick() {
      const progress = Math.min((Date.now() - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
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

  if (!last) {
    return (
      <div className="text-center text-gray-500 mt-16 p-4">
        <p className="text-4xl mb-3">🏈</p>
        <p className="font-medium text-gray-400">No games yet.</p>
        <p className="text-sm text-gray-500">Tap <strong className="text-gray-300">Add</strong> to record your first game!</p>
      </div>
    );
  }

  return (
    <div className="p-4 flex flex-col gap-4">
      <FieldCard game={last} />
      <SeasonRecordCard players={players} records={records} streaks={streaks} />
    </div>
  );
}

function FieldCard({ game }) {
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
      <div
        className="relative"
        style={{ backgroundImage: 'url(/field.jpg)', backgroundSize: 'cover', backgroundPosition: 'center' }}
      >
        {/* Full dark overlay */}
        <div className="absolute inset-0 bg-black/40 pointer-events-none" />

        {/* Header bar */}
        <div className="relative z-10 bg-black/50 py-1.5 px-4 flex justify-between items-center">
          <span className="text-white/50 text-xs font-semibold tracking-widest uppercase">AWAY</span>
          <span className="text-white/80 text-xs font-semibold tracking-widest uppercase">Last Game · {dateStr}</span>
          <span className="text-white/50 text-xs font-semibold tracking-widest uppercase">HOME</span>
        </div>

        {/* Scoreboard */}
        <div
          key={game.id}
          className="relative z-10 flex items-center justify-between px-4 py-6 gap-2"
          style={{ animation: 'crash-impact 1.4s ease-out both' }}
        >

          {/* Away */}
          <div className="flex-1 flex flex-col items-center gap-2">
            <span className="font-bold text-sm text-white text-center drop-shadow-lg">{entryA?.playerName}</span>
            <div className="flex flex-col items-center">
              {teamA
                ? <img src={getTeamHelmetUrl(teamA.abbr, 'left')} alt={teamA.name} className="w-28 h-auto object-contain relative z-10" style={{ filter: `drop-shadow(0 6px 18px ${colorA}99)`, animation: 'helmet-rush-left 1.4s ease-out both' }} />
                : <div className="w-24 h-20 rounded bg-black/30" />}
              <div style={{ width: 115, height: 19, borderRadius: '50%', background: 'radial-gradient(ellipse at center, rgba(0,0,0,0.55) 0%, transparent 72%)', marginTop: -4 }} />
            </div>
            <span className="font-black drop-shadow-lg" style={{ fontSize: '3.5rem', lineHeight: 1, color: aWins ? '#ffffff' : 'rgba(255,255,255,0.3)', textShadow: aWins ? `0 0 24px ${colorA}` : 'none' }}>
              {scoreA}
            </span>
          </div>

          {/* Centre divider */}
          <div className="shrink-0">
            <div className="h-6 w-px bg-white/20" />
          </div>

          {/* Home */}
          <div className="flex-1 flex flex-col items-center gap-2">
            <span className="font-bold text-sm text-white text-center drop-shadow-lg">{entryB?.playerName}</span>
            <div className="flex flex-col items-center">
              {teamB
                ? <img src={getTeamHelmetUrl(teamB.abbr, 'right')} alt={teamB.name} className="w-28 h-auto object-contain relative z-10" style={{ filter: `drop-shadow(0 6px 18px ${colorB}99)`, animation: 'helmet-rush-right 1.4s ease-out both' }} />
                : <div className="w-24 h-20 rounded bg-black/30" />}
              <div style={{ width: 115, height: 19, borderRadius: '50%', background: 'radial-gradient(ellipse at center, rgba(0,0,0,0.55) 0%, transparent 72%)', marginTop: -4 }} />
            </div>
            <span className="font-black drop-shadow-lg" style={{ fontSize: '3.5rem', lineHeight: 1, color: bWins ? '#ffffff' : 'rgba(255,255,255,0.3)', textShadow: bWins ? `0 0 24px ${colorB}` : 'none' }}>
              {scoreB}
            </span>
          </div>
        </div>

        {/* Footer bar */}
        <div className="relative z-10 bg-black/50 py-1.5 px-4 flex justify-between items-center">
          <span className="text-white/70 text-xs font-semibold tracking-wide uppercase">{teamA?.name ?? '—'}</span>
          <span className="text-white/30 text-xs">vs</span>
          <span className="text-white/70 text-xs font-semibold tracking-wide uppercase">{teamB?.name ?? '—'}</span>
        </div>
      </div>
    </div>
  );
}

function SeasonRecordCard({ players, records, streaks }) {
  return (
    <div className="rounded-xl overflow-hidden shadow-xl border border-gray-700">
      <div className="bg-blue-950 px-4 py-2.5 flex items-center justify-between">
        <span className="text-white text-sm font-semibold tracking-wide uppercase">Season Record</span>
        <span className="text-white/40 text-xs uppercase tracking-widest">W — L</span>
      </div>

      {players.map((p, i) => {
        const rec = records[p.name] ?? { wins: 0, losses: 0 };
        const total = rec.wins + rec.losses;
        const pct = total ? Math.round((rec.wins / total) * 100) : 0;
        const streak = streaks[p.name] ?? 0;

        return (
          <div
            key={p.id}
            className={`metallic flex items-center px-4 py-4 gap-3 ${i > 0 ? 'border-t border-gray-700' : ''}`}
          >
            {/* Win % ring / badge */}
            <div className="shrink-0 w-14 h-14 rounded-full border-2 border-blue-700 flex flex-col items-center justify-center bg-black/30">
              <span className="text-white font-black text-lg leading-none">{pct}%</span>
            </div>

            {/* Name + streak */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-white font-bold text-xl truncate">{p.name}</span>
                {streak >= 3 && <span className="text-sm font-bold text-orange-400">🔥 {streak}</span>}
                {streak <= -3 && <span className="text-sm font-bold text-sky-400">🥶 {Math.abs(streak)}</span>}
              </div>
              <span className="text-gray-400 text-sm">{total} Games Played</span>
            </div>

            {/* W-L */}
            <div className="shrink-0 flex flex-col items-end">
              <span className="text-white font-black text-2xl leading-none">{rec.wins} — {rec.losses}</span>
              <span className="text-gray-500 text-xs mt-0.5">Wins — Losses</span>
            </div>
          </div>
        );
      })}
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
