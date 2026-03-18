import { useState } from 'react';
import { NFL_TEAMS, getTeamLogoUrl } from '../data/teams';

export default function AddGameModal({ players, onAdd, onClose }) {
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [entries, setEntries] = useState(
    players.map(p => ({ playerId: p.id, playerName: p.name, teamId: '', score: '' }))
  );
  // Track which playerId is the home player (null = not set yet)
  const [homePlayerId, setHomePlayerId] = useState(null);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  function setEntry(idx, field, value) {
    setEntries(prev => prev.map((e, i) => i === idx ? { ...e, [field]: value } : e));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (homePlayerId === null) { setError('Select Home or Away for each player'); return; }
    for (const entry of entries) {
      if (!entry.teamId) { setError(`Select a team for ${entry.playerName}`); return; }
      const s = parseInt(entry.score, 10);
      if (entry.score === '' || isNaN(s) || s < 0) {
        setError(`Enter a valid score for ${entry.playerName}`); return;
      }
    }
    setSaving(true);
    try {
      await onAdd({
        date,
        entries: entries.map(e => ({
          playerId: e.playerId,
          teamId: e.teamId,
          score: parseInt(e.score, 10),
          isHome: e.playerId === homePlayerId,
        })),
      });
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-end justify-center z-50" onClick={onClose}>
      <div className="metallic w-full max-w-md rounded-t-2xl p-6 pb-10 max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-white">Add Game</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-300 text-2xl leading-none">&times;</button>
        </div>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Date</label>
            <input type="date" value={date} onChange={e => setDate(e.target.value)}
              className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          {entries.map((entry, idx) => (
            <PlayerEntry
              key={entry.playerId}
              entry={entry}
              isHome={homePlayerId === entry.playerId}
              onToggleHome={() => setHomePlayerId(entry.playerId)}
              onChange={(f, v) => setEntry(idx, f, v)}
            />
          ))}
          {error && <p className="text-red-400 text-sm">{error}</p>}
          <button type="submit" disabled={saving}
            className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-semibold py-3 rounded-xl text-base transition-colors">
            {saving ? 'Saving...' : 'Save Game'}
          </button>
        </form>
      </div>
    </div>
  );
}

function PlayerEntry({ entry, isHome, onToggleHome, onChange }) {
  const selected = NFL_TEAMS.find(t => t.id === entry.teamId);
  return (
    <div className={`border rounded-xl p-4 transition-colors ${isHome ? 'border-green-500/60 bg-green-950/30' : 'border-gray-600'}`}>
      <div className="flex items-center justify-between mb-3">
        <p className="font-semibold text-gray-100">{entry.playerName}</p>
        <button
          type="button"
          onClick={onToggleHome}
          className={`px-3 py-1 rounded-full text-xs font-bold transition-colors ${
            isHome
              ? 'bg-green-600 text-white'
              : 'bg-gray-700 text-gray-400 hover:text-gray-200'
          }`}
        >
          {isHome ? '🏠 HOME' : '✈️ AWAY'}
        </button>
      </div>
      <div className="flex gap-3 items-center">
        {selected && <img src={getTeamLogoUrl(selected.abbr)} alt={selected.name} className="w-10 h-10 object-contain shrink-0" />}
        <div className="flex flex-col gap-2 flex-1">
          <select value={entry.teamId} onChange={e => onChange('teamId', e.target.value)}
            className="bg-gray-700 border border-gray-600 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="">Select Team...</option>
            {NFL_TEAMS.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>
          <input type="number" inputMode="numeric" pattern="[0-9]*" min="0" placeholder="Score" value={entry.score} onChange={e => onChange('score', e.target.value)}
            className="bg-gray-700 border border-gray-600 text-white placeholder-gray-400 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-full" />
        </div>
      </div>
    </div>
  );
}
