import { getMostUsedTeam, getLeastUsedTeam, getAverageScore } from '../utils/stats';
import TeamLogo from '../components/TeamLogo';

export default function Stats({ games, players }) {
  const mostUsed = getMostUsedTeam(games, players);
  const leastUsed = getLeastUsedTeam(games, players);
  const avgScore = getAverageScore(games, players);

  return (
    <div className="p-4 flex flex-col gap-5">
      <StatCard title="Most Used Team">
        {players.map(p => mostUsed[p.name] ? (
          <TeamStatRow key={p.id} player={p.name} team={mostUsed[p.name].team} value={mostUsed[p.name].count} />
        ) : null)}
      </StatCard>

      <StatCard title="Least Used Team">
        {players.map(p => leastUsed[p.name] ? (
          <TeamStatRow key={p.id} player={p.name} team={leastUsed[p.name].team} value={leastUsed[p.name].count} />
        ) : null)}
      </StatCard>

      <StatCard title="Average Score">
        {players.map(p => (
          <ScoreStatRow key={p.id} player={p.name} value={avgScore[p.name]} />
        ))}
      </StatCard>
    </div>
  );
}

function StatCard({ title, children }) {
  const rows = (Array.isArray(children) ? children : [children]).filter(Boolean);
  return (
    <div className="rounded-xl overflow-hidden shadow-sm border border-gray-200">
      <div className="bg-blue-700 text-white text-sm font-semibold px-4 py-2">{title}</div>
      {rows.length ? rows.map((child, i) => (
        <div key={i} className={i > 0 ? 'border-t border-gray-100' : ''}>{child}</div>
      )) : (
        <div className="px-4 py-3 bg-white text-gray-400 text-sm">No data yet</div>
      )}
    </div>
  );
}

function TeamStatRow({ player, team, value }) {
  return (
    <div className="flex items-center gap-3 px-4 py-3 bg-white">
      {team && <TeamLogo abbr={team.abbr} size={32} />}
      <div className="flex flex-col flex-1 min-w-0">
        <span className="text-xs text-gray-500">{player}</span>
        <span className="font-semibold text-sm text-gray-900 truncate">{team?.name ?? '—'}</span>
      </div>
      <span className="text-xl font-bold text-gray-900">{value}</span>
    </div>
  );
}

function ScoreStatRow({ player, value }) {
  return (
    <div className="flex items-center gap-3 px-4 py-3 bg-white">
      <div className="w-8 h-8 bg-red-600 rounded flex items-center justify-center text-white font-black text-xs shrink-0">SB</div>
      <div className="flex flex-col flex-1">
        <span className="text-xs text-gray-500">{player}</span>
        <span className="text-sm font-medium text-gray-700">Points Scored</span>
      </div>
      <span className="text-xl font-bold text-gray-900">{value}</span>
    </div>
  );
}
