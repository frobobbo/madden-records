import { useState } from 'react';
import { NFL_TEAMS, getTeamLogoUrl } from '../data/teams';

export default function EditGameModal({ game, onSave, onDelete, onClose }) {
  const [date, setDate] = useState(game.date.slice(0, 10));
  const [entries, setEntries] = useState(
    game.entries.map(e => ({ playerId: e.playerId, playerName: e.playerName, teamId: e.teamId, score: String(e.score) }))
  );
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  function setEntry(idx, field, value) {
    setEntries(prev => prev.map((e, i) => i === idx ? { ...e, [field]: value } : e));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    for (const entry of entries) {
      if (!entry.teamId) { setError(`Select a team for ${entry.playerName}`); return; }
      const s = parseInt(entry.score, 10);
      if (entry.score === '' || isNaN(s) || s < 0) {
        setError(`Enter a valid score for ${entry.playerName}`); return;
      }
    }
    setSaving(true);
    try {
      await onSave(game.id, {
        date,
        entries: entries.map(e => ({ playerId: e.playerId, teamId: e.teamId, score: parseInt(e.score, 10) })),
      });
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-end justify-center z-50" onClick={onClose}>
      <div className="bg-white w-full max-w-md rounded-t-2xl p-6 pb-10 max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-gray-900">Edit Game</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">&times;</button>
        </div>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
            <input type="date" value={date} onChange={e => setDate(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          {entries.map((entry, idx) => (
            <PlayerEntry key={entry.playerId} entry={entry} onChange={(f, v) => setEntry(idx, f, v)} />
          ))}
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <button type="submit" disabled={saving}
            className="bg-blue-500 hover:bg-blue-600 disabled:opacity-50 text-white font-semibold py-3 rounded-xl text-base transition-colors">
            {saving ? 'Saving...' : 'Update Game'}
          </button>
          <button type="button"
            onClick={() => { if (confirm('Delete this game? This cannot be undone.')) onDelete(game.id); }}
            className="text-red-500 hover:text-red-700 font-semibold py-2 text-sm transition-colors">
            Delete Game
          </button>
        </form>
      </div>
    </div>
  );
}

function PlayerEntry({ entry, onChange }) {
  const selected = NFL_TEAMS.find(t => t.id === entry.teamId);
  return (
    <div className="border border-gray-200 rounded-xl p-4">
      <p className="font-semibold text-gray-800 mb-3">{entry.playerName}</p>
      <div className="flex gap-3 items-center">
        {selected && <img src={getTeamLogoUrl(selected.abbr)} alt={selected.name} className="w-10 h-10 object-contain shrink-0" />}
        <div className="flex flex-col gap-2 flex-1">
          <select value={entry.teamId} onChange={e => onChange('teamId', e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
            <option value="">Select Team...</option>
            {NFL_TEAMS.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>
          <input type="number" min="0" placeholder="Score" value={entry.score} onChange={e => onChange('score', e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-full" />
        </div>
      </div>
    </div>
  );
}
