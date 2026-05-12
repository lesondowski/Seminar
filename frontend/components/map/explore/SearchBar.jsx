import { Search } from "lucide-react";

export default function SearchBar({ query, onChange, suggestions, onSelectSuggestion }) {
  return (
    <div className="absolute left-3 right-3 top-3 z-[55] md:left-1/2 md:right-auto md:w-[720px] md:-translate-x-1/2 xl:left-5 xl:w-[430px] xl:translate-x-0">
      <div className="flex h-11 items-center gap-2 rounded-full border border-white/70 bg-white/95 px-3 shadow-[0_8px_24px_rgba(16,24,20,0.16)]">
        <Search size={18} className="text-slate-500" />
        <input
          value={query}
          onChange={(event) => onChange(event.target.value)}
          placeholder="Tìm kiếm địa điểm, món ăn..."
          className="h-full flex-1 bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400"
          aria-label="Tim kiem POI"
        />
      </div>

      {Boolean(suggestions?.length) && (
        <ul className="mt-2 max-h-52 overflow-y-auto rounded-2xl border border-slate-200 bg-white py-2 shadow-[0_12px_26px_rgba(16,24,20,0.14)]">
          {suggestions.map((poi) => (
            <li key={poi.id}>
              <button
                type="button"
                className="flex w-full flex-col items-start px-4 py-2 text-left transition hover:bg-slate-50"
                onClick={() => onSelectSuggestion(poi)}
              >
                <span className="text-sm font-semibold text-slate-800">{poi.name}</span>
                <span className="text-xs text-slate-500">{poi.category}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
