export default function Header({ onAdd }) {
  return (
    <header className="flex items-center justify-between px-4 py-3 bg-gray-900 border-b border-gray-700 sticky top-0 z-10">
      <div className="flex items-center gap-1">
        <span className="text-2xl font-black tracking-tight text-white">MADDEN</span>
        <span className="text-xl">🏈</span>
        <span className="text-2xl font-black tracking-tight text-blue-400">RECORDS</span>
      </div>
      <button
        onClick={onAdd}
        className="bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white font-semibold px-4 py-1.5 rounded-md text-sm transition-colors"
      >
        Add
      </button>
    </header>
  );
}
