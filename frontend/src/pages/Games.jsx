import { useState } from 'react';
import { getTeamById } from '../data/teams';
import { getWinner } from '../utils/stats';
import TeamLogo from '../components/TeamLogo';
import EditGameModal from '../components/EditGameModal';

export default function Games({ games, loading, onUpdate, onDelete }) {
  const [editing, setEditing] = useState(null);

  if (loading) return <Spinner />;

  if (!games.length) {
    return (
      <div className="text-center text-gray-500 mt-16 p-4">
        <p className="text-4xl mb-3">🏈</p>
        <p className="font-medium">No games recorded yet.</p>
      </div>
    );
  }

  return (
    <>
      <div className="p-4 flex flex-col gap-4">
        {games.map(game => (
          <GameCard
            key={game.id}
            game={game}
            onEdit={() => setEditing(game)}
            onDelete={() => onDelete(game.id)}
          />
        ))}
      </div>

      {editing && (
        <EditGameModal
          game={editing}
          onSave={onUpdate}
          onClose={() => setEditing(null)}
        />
      )}
    </>
  );
}

function GameCard({ game, onEdit, onDelete }) {
  const winner = getWinner(game);
  const dateStr = new Date(game.date + 'T00:00:00').toLocaleDateString('en-US', {
    month: 'numeric', day: 'numeric', year: 'numeric',
  });

  const sorted = [...game.entries].sort((a, b) => b.score - a.score);

  return (
    <div className="rounded-xl overflow-hidden shadow-sm border border-gray-200">
      <div className="bg-blue-700 text-white text-sm font-semibold px-4 py-2 flex justify-between items-center">
        <span>Game Played: {dateStr}</span>
        <div className="flex gap-3">
          <button onClick={onEdit} className="text-blue-200 hover:text-white text-xs" aria-label="Edit game">✎</button>
          <button onClick={onDelete} className="text-blue-200 hover:text-white text-xs" aria-label="Delete game">✕</button>
        </div>
      </div>
      {sorted.map((entry, i) => {
        const team = getTeamById(entry.teamId);
        const isWinner = winner?.playerId === entry.playerId;
        return (
          <div key={entry.playerId} className={`flex items-center gap-3 px-4 py-3 bg-white ${i > 0 ? 'border-t border-gray-100' : ''}`}>
            {team && <TeamLogo abbr={team.abbr} size={32} />}
            <div className="flex flex-col flex-1 min-w-0">
              <span className="text-xs text-gray-500">{entry.playerName}</span>
              <span className={`font-semibold text-sm truncate ${isWinner ? 'text-gray-900' : 'text-gray-600'}`}>
                {team?.name ?? 'Unknown'}
              </span>
            </div>
            <span className={`text-xl font-bold ${isWinner ? 'text-gray-900' : 'text-gray-400'}`}>
              {entry.score}
            </span>
          </div>
        );
      })}
    </div>
  );
}

function Spinner() {
  return <div className="flex justify-center mt-20"><div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" /></div>;
}
