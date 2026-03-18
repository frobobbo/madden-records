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
    <div className="rounded-xl overflow-hidden shadow-sm border border-gray-700">
      <div className="bg-blue-900 text-white text-sm font-semibold px-4 py-2">{title}</div>
      {rows.length ? rows.map((child, i) => (
        <div key={i} className={i > 0 ? 'border-t border-gray-700' : ''}>{child}</div>
      )) : (
        <div className="px-4 py-3 metallic text-gray-500 text-sm">No data yet</div>
      )}
    </div>
  );
}

function TeamStatRow({ player, team, value }) {
  return (
    <div className="flex items-center gap-3 px-4 py-3 metallic">
      {team && <TeamLogo abbr={team.abbr} size={32} />}
      <div className="flex flex-col flex-1 min-w-0">
        <span className="text-xs text-gray-400">{player}</span>
        <span className="font-semibold text-sm text-gray-100 truncate">{team?.name ?? '—'}</span>
      </div>
      <span className="text-xl font-bold text-white">{value}</span>
    </div>
  );
}

function ScoreStatRow({ player, value }) {
  return (
    <div className="flex items-center gap-3 px-4 py-3 metallic">
      <div className="w-8 h-8 bg-red-700 rounded flex items-center justify-center text-white font-black text-xs shrink-0">SB</div>
      <div className="flex flex-col flex-1">
        <span className="text-xs text-gray-400">{player}</span>
        <span className="text-sm font-medium text-gray-300">Points Scored</span>
      </div>
      <span className="text-xl font-bold text-white">{value}</span>
    </div>
  );
}
