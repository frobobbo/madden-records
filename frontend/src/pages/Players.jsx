import { useState } from 'react';

export default function Players({ players, loading, onAdd, onUpdate, onDelete }) {
  const [modal, setModal] = useState(null); // null | 'add' | { id, name }
  const [error, setError] = useState('');

  async function handleSave(name) {
    setError('');
    try {
      if (modal === 'add') {
        await onAdd(name);
      } else {
        await onUpdate(modal.id, name);
      }
      setModal(null);
    } catch (e) {
      setError(e.message);
    }
  }

  async function handleDelete(player) {
    if (!confirm(`Delete player "${player.name}"? This will also delete all their game entries.`)) return;
    try {
      await onDelete(player.id);
    } catch (e) {
      alert(e.message);
    }
  }

  if (loading) return <Spinner />;

  return (
    <>
      <div className="p-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold text-gray-900">Players</h2>
          <button
            onClick={() => { setError(''); setModal('add'); }}
            className="bg-blue-500 hover:bg-blue-600 text-white text-sm font-semibold px-4 py-1.5 rounded-lg transition-colors"
          >
            + Add
          </button>
        </div>

        {players.length === 0 ? (
          <div className="text-center text-gray-500 mt-12">
            <p className="text-3xl mb-2">👤</p>
            <p className="font-medium">No players yet.</p>
            <p className="text-sm">Add players before logging games.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {players.map(p => (
              <div key={p.id} className="flex items-center bg-white border border-gray-200 rounded-xl px-4 py-3 shadow-sm">
                <div className="w-9 h-9 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm mr-3 shrink-0">
                  {p.name[0].toUpperCase()}
                </div>
                <span className="flex-1 font-medium text-gray-900">{p.name}</span>
                <button
                  onClick={() => { setError(''); setModal({ id: p.id, name: p.name }); }}
                  className="text-gray-400 hover:text-blue-600 px-2 py-1 text-sm"
                  aria-label="Edit player"
                >✎</button>
                <button
                  onClick={() => handleDelete(p)}
                  className="text-gray-400 hover:text-red-500 px-2 py-1 text-sm"
                  aria-label="Delete player"
                >✕</button>
              </div>
            ))}
          </div>
        )}
      </div>

      {modal !== null && (
        <PlayerModal
          initial={modal === 'add' ? '' : modal.name}
          title={modal === 'add' ? 'Add Player' : 'Edit Player'}
          error={error}
          onSave={handleSave}
          onClose={() => setModal(null)}
        />
      )}
    </>
  );
}

function PlayerModal({ initial, title, error, onSave, onClose }) {
  const [name, setName] = useState(initial);
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!name.trim()) return;
    setSaving(true);
    await onSave(name.trim());
    setSaving(false);
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-end justify-center z-50" onClick={onClose}>
      <div className="bg-white w-full max-w-md rounded-t-2xl p-6 pb-10" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-gray-900">{title}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">&times;</button>
        </div>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="text"
            placeholder="Player name"
            value={name}
            onChange={e => setName(e.target.value)}
            autoFocus
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <button type="submit" disabled={saving || !name.trim()}
            className="bg-blue-500 hover:bg-blue-600 disabled:opacity-50 text-white font-semibold py-3 rounded-xl text-base transition-colors">
            {saving ? 'Saving...' : 'Save'}
          </button>
        </form>
      </div>
    </div>
  );
}

function Spinner() {
  return <div className="flex justify-center mt-20"><div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" /></div>;
}
