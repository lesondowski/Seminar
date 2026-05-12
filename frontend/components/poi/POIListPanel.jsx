import { Route, Share2, Search, Star, MapPin } from "lucide-react";
import { useVisitorExploreStore } from "@/stores/visitorExploreStore";

async function sharePoi(poi) {
  const text = `${poi.name} - ${poi.address}`;

  if (navigator.share) {
    try {
      await navigator.share({ title: poi.name, text });
      return;
    } catch {
      // Ignore and fall back
    }
  }

  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
  }
}

export default function POIListPanel({ onClose, onSelectPoi }) {
  const poiList = useVisitorExploreStore((s) => s.poiList);
  const filters = useVisitorExploreStore((s) => s.filters);
  const setQuery = useVisitorExploreStore((s) => s.setQuery);
  const setCategory = useVisitorExploreStore((s) => s.setCategory);
  const addPoiToItinerary = useVisitorExploreStore((s) => s.addPoiToItinerary);

  return (
    <div className="rounded-t-[28px] bg-white px-5 pb-28 pt-4 shadow-[0_-10px_28px_rgba(16,24,20,0.18)] md:rounded-[28px] md:pb-6">
      <div className="mx-auto h-1.5 w-14 rounded-full bg-slate-200 md:hidden" />

      <div className="mt-3 flex items-center gap-2 rounded-[20px] bg-slate-50 px-3 py-2.5 shadow-[inset_0_0_0_1px_rgba(208,218,216,0.8)] md:mt-4 md:gap-3 md:rounded-[24px] md:px-4 md:py-3">
        <Search size={18} className="text-slate-400" />
        <input
          value={filters.query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Tìm kiếm địa điểm tham quan..."
          className="min-w-0 flex-1 bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400 md:text-base"
        />
      </div>

      <div className="mt-3 flex gap-2 overflow-x-auto pb-2 md:mt-4">
        {["all", "cafe", "hotel", "shopping"].map((category) => {
          const label =
            category === "all"
              ? "Tất cả"
              : poiList.find((poi) => poi.category === category)?.categoryLabel || category;

          const active = filters.category === category;

          return (
            <button
              key={category}
              type="button"
              onClick={() => setCategory(category)}
              className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold md:px-4 md:py-2 md:text-sm ${
                active ? "bg-teal-600 text-white" : "bg-teal-50 text-teal-700"
              }`}
            >
              {label}
            </button>
          );
        })}
      </div>

      <div className="mt-3 flex flex-col gap-3 md:mt-4 md:gap-4">
        {poiList
          .filter(
            (poi) =>
              (filters.category === "all" || poi.category === filters.category) &&
              (!filters.query ||
                `${poi.name} ${poi.description}`.toLowerCase().includes(filters.query.toLowerCase()))
          )
          .map((poi) => (
            <article
              key={poi.id}
              className="rounded-[20px] border border-slate-200 bg-slate-50 p-3 shadow-[0_10px_24px_rgba(16,24,20,0.06)] md:rounded-[24px] md:p-4"
            >
              <div className="flex items-start gap-3 md:gap-4">
                <img
                  src={poi.image}
                  alt={poi.name}
                  className="h-20 w-20 rounded-[14px] object-cover md:h-24 md:w-24 md:rounded-[20px]"
                />

                <div className="min-w-0 flex-1">
                  <button
                    type="button"
                    className="block text-left"
                    onClick={() => onSelectPoi?.(poi.id)}
                  >
                    <h3 className="m-0 text-lg font-semibold leading-tight text-slate-900 md:text-2xl">
                      {poi.name}
                    </h3>
                  </button>

                  <div className="mt-2 flex items-center gap-2 text-sm text-slate-500">
                    <MapPin size={14} />
                    <span>
                      {poi.distanceKm} km • {poi.categoryLabel}
                    </span>
                  </div>

                  <div className="mt-2 flex items-center gap-2 text-sm text-slate-600">
                    <Star size={15} className="fill-teal-600 text-teal-600" />
                    <span>
                      {poi.rating} ({(poi.reviewCount / 1000).toFixed(1)}k)
                    </span>
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <button
                    type="button"
                    className="icon-btn"
                    onClick={() => sharePoi(poi)}
                    aria-label="Chia sẻ"
                  >
                    <Share2 size={18} />
                  </button>

                  <button
                    type="button"
                    className="icon-btn"
                    onClick={() => {
                      addPoiToItinerary(poi.id);
                      onSelectPoi?.(poi.id);
                    }}
                    aria-label="Đường đi"
                  >
                    <Route size={18} />
                  </button>
                </div>
              </div>
            </article>
          ))}
      </div>
    </div>
  );
}