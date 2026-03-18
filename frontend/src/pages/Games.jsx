import { useState, useRef } from 'react';
import { getTeamById } from '../data/teams';
import { getWinner } from '../utils/stats';
import TeamLogo from '../components/TeamLogo';
import EditGameModal from '../components/EditGameModal';
import { formatDate } from '../utils/date';

const REVEAL_WIDTH = 148;
const SWIPE_THRESHOLD = 60;

export default function Games({ games, loading, onUpdate, onDelete }) {
  const [editing, setEditing] = useState(null);

  if (loading) return <Spinner />;

  if (!games.length) {
    return (
      <div className="text-center mt-16 p-4">
        <p className="text-4xl mb-3">🏈</p>
        <p className="font-medium text-gray-400">No games recorded yet.</p>
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
          onDelete={id => { onDelete(id); setEditing(null); }}
          onClose={() => setEditing(null)}
        />
      )}
    </>
  );
}

function GameCard({ game, onEdit, onDelete }) {
  const winner = getWinner(game);
  const dateStr = formatDate(game.date);
  const [left, right] = game.entries;

  const [offset, setOffset] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const startX = useRef(null);
  const startOffset = useRef(0);

  function onTouchStart(e) {
    startX.current = e.touches[0].clientX;
    startOffset.current = offset;
    setDragging(true);
  }

  function onTouchMove(e) {
    if (startX.current === null) return;
    const dx = e.touches[0].clientX - startX.current;
    const next = Math.min(0, Math.max(-REVEAL_WIDTH, startOffset.current + dx));
    setOffset(next);
  }

  function onTouchEnd() {
    setDragging(false);
    startX.current = null;
    if (offset < -SWIPE_THRESHOLD) {
      setOffset(-REVEAL_WIDTH);
      setIsOpen(true);
    } else {
      setOffset(0);
      setIsOpen(false);
    }
  }

  function close() {
    setOffset(0);
    setIsOpen(false);
  }

  return (
    <>
      <div className="relative rounded-xl overflow-hidden border border-gray-700 shadow-sm">
        {/* Action buttons revealed by swipe */}
        <div className="absolute inset-y-0 right-0 flex" style={{ width: REVEAL_WIDTH }}>
          <button
            onClick={() => { close(); onEdit(); }}
            className="flex-1 bg-blue-600 active:bg-blue-500 text-white font-semibold text-sm flex flex-col items-center justify-center gap-1"
          >
            <EditIcon />
            <span>Edit</span>
          </button>
          <button
            onClick={() => setConfirmDelete(true)}
            className="flex-1 bg-red-600 active:bg-red-500 text-white font-semibold text-sm flex flex-col items-center justify-center gap-1"
          >
            <TrashIcon />
            <span>Delete</span>
          </button>
        </div>

        {/* Sliding card content */}
        <div
          style={{
            transform: `translateX(${offset}px)`,
            transition: dragging ? 'none' : 'transform 0.25s ease',
          }}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
          onClick={isOpen ? close : undefined}
        >
          <div className="bg-blue-700 text-white text-sm font-semibold px-4 py-2">
            {dateStr}
          </div>
          <div className="bg-gray-900 flex items-stretch">
            <TeamSide entry={left} winner={winner} side="left" />
            <div className="flex items-center justify-center px-3 shrink-0">
              <span className="text-gray-500 font-bold text-sm">vs</span>
            </div>
            <TeamSide entry={right} winner={winner} side="right" />
          </div>
        </div>
      </div>

      {confirmDelete && (
        <ConfirmDialog
          onConfirm={() => { setConfirmDelete(false); onDelete(); }}
          onCancel={() => setConfirmDelete(false)}
        />
      )}
    </>
  );
}

function TeamSide({ entry, winner, side }) {
  if (!entry) return null;
  const team = getTeamById(entry.teamId);
  const isWinner = winner?.playerId === entry.playerId;
  const isLeft = side === 'left';

  return (
    <div className={`flex-1 flex ${isLeft ? 'flex-row' : 'flex-row-reverse'} items-center gap-2 px-3 py-3`}>
      <div className="shrink-0">
        {team ? <TeamLogo abbr={team.abbr} size={52} /> : <div className="w-13 h-13 bg-gray-700 rounded-full" />}
      </div>
      <div className={`flex flex-col flex-1 min-w-0 ${isLeft ? 'items-start' : 'items-end'}`}>
        <span className="text-gray-400 text-xs truncate">{entry.playerName}</span>
      </div>
      <span className={`text-3xl font-black shrink-0 ${isWinner ? 'text-white' : 'text-gray-500'}`}>
        {entry.score}
      </span>
    </div>
  );
}

function ConfirmDialog({ onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-6">
      <div className="bg-gray-800 rounded-2xl p-6 w-full max-w-xs text-center shadow-2xl border border-gray-700">
        <p className="text-3xl mb-3">🗑️</p>
        <p className="font-bold text-white text-lg mb-1">Delete Game?</p>
        <p className="text-sm text-gray-400 mb-6">This game will be permanently removed.</p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 bg-gray-700 hover:bg-gray-600 text-gray-200 py-3 rounded-xl font-semibold text-sm transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 bg-red-600 hover:bg-red-500 text-white py-3 rounded-xl font-semibold text-sm transition-colors"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

function EditIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04a1 1 0 0 0 0-1.41l-2.34-2.34a1 1 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
    </svg>
  );
}

function Spinner() {
  return <div className="flex justify-center mt-20"><div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" /></div>;
}
