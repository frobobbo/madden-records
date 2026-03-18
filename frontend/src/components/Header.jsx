export default function Header({ onAdd }) {
  return (
    <header
      className="sticky top-0 z-10 overflow-hidden"
      style={{ background: '#060d1c', paddingTop: 'env(safe-area-inset-top)' }}
    >
      <div className="relative" style={{ height: 88 }}>
        <img
          src="/banner.png"
          alt="Madden Records"
          className="absolute inset-0 w-full h-full object-cover object-center"
          draggable={false}
        />
        {/* subtle right-side fade so the Add button stays readable */}
        <div
          className="absolute inset-y-0 right-0 w-28"
          style={{ background: 'linear-gradient(to left, rgba(6,13,28,0.75) 0%, transparent 100%)' }}
        />
        <div className="absolute inset-0 flex items-center justify-end px-3">
          <button
            onClick={onAdd}
            className="bg-red-700 active:bg-red-600 text-white font-semibold px-4 py-1.5 rounded-md text-sm transition-colors shadow-lg"
          >
            Add
          </button>
        </div>
      </div>
    </header>
  );
}
