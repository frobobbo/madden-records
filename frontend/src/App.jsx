import { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useGames } from './hooks/useGames';
import { usePlayers } from './hooks/usePlayers';
import Header from './components/Header';
import BottomNav from './components/BottomNav';
import AddGameModal from './components/AddGameModal';
import RecordToast from './components/RecordToast';
import Home from './pages/Home';
import Records from './pages/Records';
import Games from './pages/Games';
import Stats from './pages/Stats';
import Players from './pages/Players';
import { checkNewRecords } from './utils/stats';

export default function App() {
  const { games, loading: gamesLoading, addGame, updateGame, deleteGame } = useGames();
  const { players, loading: playersLoading, addPlayer, updatePlayer, deletePlayer } = usePlayers();
  const [showAdd, setShowAdd] = useState(false);
  const [brokenRecords, setBrokenRecords] = useState(null);

  async function handleAddGame(data) {
    const prevGames = games;
    const newGame = await addGame(data);
    setShowAdd(false);
    const broken = checkNewRecords(prevGames, [newGame, ...prevGames], players);
    if (broken.length) setBrokenRecords(broken);
  }

  return (
    <BrowserRouter>
      <div className="flex flex-col min-h-screen max-w-md mx-auto bg-gray-950">
        <Header onAdd={() => setShowAdd(true)} />

        <main className="flex-1 overflow-y-auto pb-20">
          <Routes>
            <Route path="/" element={<Home games={games} players={players} loading={gamesLoading || playersLoading} />} />
            <Route path="/records" element={<Records games={games} players={players} />} />
            <Route path="/games" element={<Games games={games} loading={gamesLoading} onUpdate={updateGame} onDelete={deleteGame} />} />
            <Route path="/stats" element={<Stats games={games} players={players} />} />
            <Route path="/players" element={
              <Players
                players={players}
                loading={playersLoading}
                onAdd={addPlayer}
                onUpdate={updatePlayer}
                onDelete={deletePlayer}
              />
            } />
          </Routes>
        </main>

        <BottomNav />

        {brokenRecords && (
          <RecordToast records={brokenRecords} onDismiss={() => setBrokenRecords(null)} />
        )}

        {showAdd && players.length >= 2 && (
          <AddGameModal players={players} onAdd={handleAddGame} onClose={() => setShowAdd(false)} />
        )}
        {showAdd && players.length < 2 && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-6" onClick={() => setShowAdd(false)}>
            <div className="metallic rounded-2xl p-6 text-center shadow-xl" onClick={e => e.stopPropagation()}>
              <p className="text-2xl mb-2">👤</p>
              <p className="font-semibold text-white mb-1">Need at least 2 players</p>
              <p className="text-sm text-gray-400 mb-4">Go to the Players tab to add players first.</p>
              <button onClick={() => setShowAdd(false)} className="bg-blue-500 text-white px-6 py-2 rounded-lg font-medium">OK</button>
            </div>
          </div>
        )}
      </div>
    </BrowserRouter>
  );
}
