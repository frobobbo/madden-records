export default function Header({ onAdd }) {
  return (
    <header className="metallic-dark flex items-center justify-between px-4 py-3 border-b border-gray-700 sticky top-0 z-10">
      <div className="flex items-center gap-1.5">
        <span className="text-3xl tracking-wide text-white">MADDEN</span>
        <span className="text-xl">🏈</span>
        <span className="text-3xl tracking-wide text-blue-700">RECORDS</span>
      </div>
      <button
        onClick={onAdd}
        className="bg-blue-900 hover:bg-blue-800 active:bg-blue-950 text-white font-semibold px-4 py-1.5 rounded-md text-sm transition-colors"
      >
        Add
      </button>
    </header>
  );
}
