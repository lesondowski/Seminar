export default function CategoryChips({ categories, activeCategory, onChange }) {
  return (
    <div className="absolute left-3 right-3 top-[58px] z-[52] flex gap-2 overflow-x-auto pb-1 md:left-1/2 md:right-auto md:w-[720px] md:-translate-x-1/2 xl:left-5 xl:w-[430px] xl:translate-x-0">
      {categories.map((category) => (
        <button
          key={category.key}
          type="button"
          onClick={() => onChange(category.key)}
          className={`shrink-0 rounded-full border px-3.5 py-1.5 text-xs font-medium transition active:scale-95 md:px-4 md:py-2 md:text-sm ${
            activeCategory === category.key
              ? "border-teal-700 bg-teal-600 text-white shadow-[0_6px_14px_rgba(15,118,110,0.35)]"
              : "border-white/75 bg-white/95 text-slate-600 shadow-[0_6px_14px_rgba(16,24,20,0.14)]"
          }`}
        >
          {category.label}
        </button>
      ))}
    </div>
  );
}
