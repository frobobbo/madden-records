import { getTeamById } from '../data/teams';
import { getRecords, getWinner } from '../utils/stats';
import TeamLogo from '../components/TeamLogo';

export default function Home({ games, players, loading }) {
  const last = games[0] ?? null;
  const records = getRecords(games, players);

  if (loading) return <LoadingSpinner />;

  return (
    <div className="p-4">
      {last ? (
        <LastGame game={last} records={records} players={players} />
      ) : (
        <div className="text-center text-gray-500 mt-16">
          <p className="text-4xl mb-3">🏈</p>
          <p className="font-medium">No games yet.</p>
          <p className="text-sm">Tap <strong>Add</strong> to record your first game!</p>
        </div>
      )}
    </div>
  );
}

function LastGame({ game, records, players }) {
  const winner = getWinner(game);
  const dateStr = new Date(game.date + 'T00:00:00').toLocaleDateString('en-US', {
    month: 'numeric', day: 'numeric', year: 'numeric',
  });

  return (
    <>
      <div className="bg-blue-700 text-white text-center font-bold text-lg py-3 rounded-t-xl">
        Last Game: {dateStr}
      </div>
      <div className="bg-white rounded-b-xl shadow-sm border border-t-0 border-gray-200 p-5">
        <div className="flex items-center justify-around flex-wrap gap-4">
          {game.entries.map((entry, idx) => {
            const team = getTeamById(entry.teamId);
            const isWinner = winner?.playerId === entry.playerId;
            return (
              <div key={entry.playerId} className="flex flex-col items-center gap-2">
                <span className={`font-bold text-base ${isWinner ? 'text-blue-700' : 'text-gray-700'}`}>
                  {entry.playerName}
                </span>
                {team && <TeamLogo abbr={team.abbr} size={56} />}
                <span className={`text-4xl font-black ${isWinner ? 'text-blue-700' : 'text-gray-400'}`}>
                  {entry.score}
                </span>
              </div>
            );
          })}
        </div>

        <div className="mt-5 border-t border-gray-100 pt-4">
          <p className="text-center text-sm font-medium text-gray-500 mb-2">Player Records:</p>
          <div className="flex flex-col gap-1 text-sm text-gray-700">
            {players.map(p => (
              <div key={p.id} className="flex justify-between">
                <span>{p.name}:</span>
                <span className="font-mono">({records[p.name]?.wins ?? 0} - {records[p.name]?.losses ?? 0})</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

function LoadingSpinner() {
  return (
    <div className="flex justify-center mt-20">
      <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );
}
