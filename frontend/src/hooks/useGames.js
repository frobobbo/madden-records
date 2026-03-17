import { useState, useEffect, useCallback } from 'react';
import { api } from '../api';

export function useGames() {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setGames(await api.games.list());
      setError(null);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const addGame = useCallback(async (data) => {
    const g = await api.games.create(data);
    setGames(prev => [g, ...prev]);
    return g;
  }, []);

  const updateGame = useCallback(async (id, data) => {
    const g = await api.games.update(id, data);
    setGames(prev => prev.map(x => x.id === id ? g : x));
    return g;
  }, []);

  const deleteGame = useCallback(async (id) => {
    await api.games.delete(id);
    setGames(prev => prev.filter(x => x.id !== id));
  }, []);

  return { games, loading, error, addGame, updateGame, deleteGame, reload: load };
}
