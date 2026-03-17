const BASE = import.meta.env.VITE_API_URL || '/api';

async function req(method, path, body) {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: body ? { 'Content-Type': 'application/json' } : {},
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || res.statusText);
  }
  return res.json();
}

export const api = {
  players: {
    list: () => req('GET', '/players'),
    create: (data) => req('POST', '/players', data),
    update: (id, data) => req('PUT', `/players/${id}`, data),
    delete: (id) => req('DELETE', `/players/${id}`),
  },
  games: {
    list: () => req('GET', '/games'),
    create: (data) => req('POST', '/games', data),
    update: (id, data) => req('PUT', `/games/${id}`, data),
    delete: (id) => req('DELETE', `/games/${id}`),
  },
};
