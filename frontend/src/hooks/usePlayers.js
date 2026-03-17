import { useState, useEffect, useCallback } from 'react';
import { api } from '../api';

export function usePlayers() {
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setPlayers(await api.players.list());
      setError(null);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const addPlayer = useCallback(async (name) => {
    const p = await api.players.create({ name });
    setPlayers(prev => [...prev, p].sort((a, b) => a.name.localeCompare(b.name)));
    return p;
  }, []);

  const updatePlayer = useCallback(async (id, name) => {
    const p = await api.players.update(id, { name });
    setPlayers(prev => prev.map(x => x.id === id ? p : x).sort((a, b) => a.name.localeCompare(b.name)));
    return p;
  }, []);

  const deletePlayer = useCallback(async (id) => {
    await api.players.delete(id);
    setPlayers(prev => prev.filter(x => x.id !== id));
  }, []);

  return { players, loading, error, addPlayer, updatePlayer, deletePlayer, reload: load };
}
