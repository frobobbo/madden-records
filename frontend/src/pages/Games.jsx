import { useState } from 'react';
import { getTeamById } from '../data/teams';
import { getWinner } from '../utils/stats';
import TeamLogo from '../components/TeamLogo';
import EditGameModal from '../components/EditGameModal';
import { formatDate } from '../utils/date';

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
          />
        ))}
      </div>

      {editing && (
        <EditGameModal
          game={editing}
          onSave={onUpdate}
          onDelete={id => { onDelete(id); setEditing(null); }}
          onClose={() => setEditing(null)}
        />
      )}
    </>
  );
}

function GameCard({ game, onEdit }) {
  const winner = getWinner(game);
  const dateStr = formatDate(game.date);

  // Always show exactly two entries side-by-side
  const [left, right] = game.entries;

  return (
    <div className="rounded-xl overflow-hidden shadow-sm border border-gray-200">
      {/* Header */}
      <div className="bg-blue-700 text-white text-sm font-semibold px-4 py-2 flex justify-between items-center">
        <span>{dateStr}</span>
        <button onClick={onEdit} className="text-blue-200 hover:text-white text-xs" aria-label="Edit game">✎</button>
      </div>

      {/* Scoreboard row */}
      <div className="bg-gray-900 flex items-stretch">
        <TeamSide entry={left} winner={winner} side="left" />
        <div className="flex items-center justify-center px-3 shrink-0">
          <span className="text-gray-500 font-bold text-sm">vs</span>
        </div>
        <TeamSide entry={right} winner={winner} side="right" />
      </div>
    </div>
  );
}

function TeamSide({ entry, winner, side }) {
  if (!entry) return null;
  const team = getTeamById(entry.teamId);
  const isWinner = winner?.playerId === entry.playerId;
  const isLeft = side === 'left';

  return (
    <div className={`flex-1 flex ${isLeft ? 'flex-row' : 'flex-row-reverse'} items-center gap-2 px-3 py-3`}>
      {/* Logo */}
      <div className="shrink-0">
        {team ? <TeamLogo abbr={team.abbr} size={52} /> : <div className="w-13 h-13 bg-gray-700 rounded-full" />}
      </div>
      {/* Name + team */}
      <div className={`flex flex-col flex-1 min-w-0 ${isLeft ? 'items-start' : 'items-end'}`}>
        <span className="text-gray-400 text-xs truncate">{entry.playerName}</span>
      </div>
      {/* Score */}
      <span className={`text-3xl font-black shrink-0 ${isWinner ? 'text-white' : 'text-gray-500'}`}>
        {entry.score}
      </span>
    </div>
  );
}

function Spinner() {
  return <div className="flex justify-center mt-20"><div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" /></div>;
}
