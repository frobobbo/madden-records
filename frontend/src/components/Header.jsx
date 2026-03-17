export default function Header({ onAdd }) {
  return (
    <header className="flex items-center justify-between px-4 py-3 bg-white border-b border-gray-200 sticky top-0 z-10">
      <div className="flex items-center gap-1">
        <span className="text-2xl font-black tracking-tight text-gray-900">MADDEN</span>
        <span className="text-xl">🏈</span>
        <span className="text-2xl font-black tracking-tight text-blue-700">RECORDS</span>
      </div>
      <button
        onClick={onAdd}
        className="bg-blue-500 hover:bg-blue-600 active:bg-blue-700 text-white font-semibold px-4 py-1.5 rounded-md text-sm transition-colors"
      >
        Add
      </button>
    </header>
  );
}
