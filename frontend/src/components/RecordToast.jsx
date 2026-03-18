import { useEffect } from 'react';

// Pre-computed burst particles — 3 bursts at different positions/timings
function makeBurst(cx, cy, delayBase, colors) {
  return Array.from({ length: 16 }, (_, i) => {
    const angle = (i / 16) * 2 * Math.PI;
    const dist = i % 2 === 0 ? 110 : 72;
    return {
      cx, cy,
      tx: Math.round(Math.cos(angle) * dist),
      ty: Math.round(Math.sin(angle) * dist),
      color: colors[i % colors.length],
      delay: delayBase + (i % 4) * 0.06,
      size: i % 3 === 0 ? 8 : 5,
    };
  });
}

const BURSTS = [
  ...makeBurst('22%', '28%', 0.05, ['#ffd700', '#fb923c', '#fef08a', '#fff']),
  ...makeBurst('78%', '22%', 0.35, ['#38bdf8', '#c084fc', '#a5f3fc', '#fff']),
  ...makeBurst('50%', '18%', 0.65, ['#ef4444', '#ffd700', '#f87171', '#fff']),
];

export default function RecordToast({ records, onDismiss }) {
  useEffect(() => {
    const t = setTimeout(onDismiss, 5000);
    return () => clearTimeout(t);
  }, [onDismiss]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: 'rgba(0,0,0,0.65)' }}
      onClick={onDismiss}
    >
      {/* Firework particles */}
      {BURSTS.map((p, i) => (
        <div key={i} style={{ position: 'absolute', left: p.cx, top: p.cy, pointerEvents: 'none' }}>
          <div style={{
            width: p.size,
            height: p.size,
            borderRadius: '50%',
            background: p.color,
            marginLeft: -p.size / 2,
            marginTop: -p.size / 2,
            animation: `fw-particle 1.5s ease-out ${p.delay}s both`,
            '--tx': `${p.tx}px`,
            '--ty': `${p.ty}px`,
          }} />
        </div>
      ))}

      {/* Toast card */}
      <div
        className="relative mx-6 rounded-2xl border border-yellow-500/40 shadow-2xl overflow-hidden"
        style={{ animation: 'toast-enter 0.4s cubic-bezier(0.34,1.56,0.64,1) both', maxWidth: 320, width: '100%' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Gold shimmer top bar */}
        <div style={{ background: 'linear-gradient(90deg, #92400e, #fbbf24, #ffd700, #fbbf24, #92400e)', height: 3 }} />

        <div className="metallic-dark px-6 py-6 flex flex-col items-center gap-3">
          {/* Glowing trophy */}
          <div style={{ fontSize: 56, lineHeight: 1, filter: 'drop-shadow(0 0 16px #ffd70088)' }}>
            🏆
          </div>

          <div className="text-center">
            <p className="text-yellow-400 font-black text-xl tracking-widest uppercase" style={{ textShadow: '0 0 12px #ffd70066' }}>
              New Record!
            </p>
          </div>

          {/* Record rows */}
          <div className="w-full flex flex-col gap-2 mt-1">
            {records.map((r, i) => (
              <div key={i} className="rounded-xl px-4 py-3 flex items-center gap-3" style={{ background: 'rgba(255,215,0,0.08)', border: '1px solid rgba(255,215,0,0.2)' }}>
                <span style={{ fontSize: 24 }}>{r.emoji}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-yellow-300 text-xs font-semibold uppercase tracking-wide">{r.label}</p>
                  <p className="text-white font-bold text-sm truncate">{r.player}</p>
                </div>
                <span className="text-white font-black text-lg shrink-0">{r.value}</span>
              </div>
            ))}
          </div>

          <p className="text-gray-600 text-xs mt-1">Tap anywhere to dismiss</p>
        </div>

        {/* Gold shimmer bottom bar */}
        <div style={{ background: 'linear-gradient(90deg, #92400e, #fbbf24, #ffd700, #fbbf24, #92400e)', height: 3 }} />
      </div>
    </div>
  );
}
