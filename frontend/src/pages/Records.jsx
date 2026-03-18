import { getLongestWinStreak, getLargestMargin, getMostPointsScored } from '../utils/stats';

export default function Records({ games, players }) {
  const streaks = getLongestWinStreak(games, players);
  const margins = getLargestMargin(games, players);
  const mostPoints = getMostPointsScored(games, players);

  const sections = [
    { title: 'Longest Win Streak', data: streaks, format: v => `${v} Games` },
    { title: 'Largest Margin of Victory', data: margins, format: v => `${v} Points` },
    { title: 'Most Points Scored', data: mostPoints, format: v => `${v} Points` },
  ];

  return (
    <div className="p-4 flex flex-col gap-5">
      {sections.map(({ title, data, format }) => (
        <RecordCard key={title} title={title} data={data} format={format} />
      ))}
    </div>
  );
}

function RecordCard({ title, data, format }) {
  const sorted = Object.entries(data).sort((a, b) => b[1] - a[1]);
  return (
    <div className="rounded-xl overflow-hidden shadow-sm border border-gray-700">
      <div className="bg-blue-700 text-white text-sm font-semibold px-4 py-2">{title}</div>
      {sorted.map(([player, value], i) => (
        <div key={player} className={`flex items-center gap-3 px-4 py-3 metallic ${i > 0 ? 'border-t border-gray-700' : ''}`}>
          <TrophyIcon gold={i === 0} />
          <span className="font-medium text-gray-200 flex-1">{player}</span>
          <span className="text-xl font-bold text-white">{format(value)}</span>
        </div>
      ))}
      {!sorted.length && <div className="px-4 py-3 metallic text-gray-500 text-sm">No data yet</div>}
    </div>
  );
}

function TrophyIcon({ gold }) {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill={gold ? '#f59e0b' : '#4b5563'}>
      <path d="M19 5h-2V3H7v2H5c-1.1 0-2 .9-2 2v1c0 2.55 1.92 4.63 4.39 4.94.63 1.5 1.98 2.63 3.61 2.96V19H7v2h10v-2h-4v-3.1c1.63-.33 2.98-1.46 3.61-2.96C19.08 12.63 21 10.55 21 8V7c0-1.1-.9-2-2-2zM5 8V7h2v3.82C5.84 10.4 5 9.3 5 8zm14 0c0 1.3-.84 2.4-2 2.82V7h2v1z" />
    </svg>
  );
}
