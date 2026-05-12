import { Sparkles, MapPinned, ChevronRight } from "lucide-react";
import { useVisitorExploreStore } from "@/stores/visitorExploreStore";

export default function SuggestionPanel({ onClose, onSelectPoi }) {
  const poiList = useVisitorExploreStore((s) => s.poiList);

  const suggestions = [...(poiList || [])]
    .sort((left, right) => left.distanceKm - right.distanceKm)
    .slice(0, 4);

  return (
    <div className="rounded-t-[28px] bg-white px-5 pb-6 pt-3 shadow-[0_-10px_28px_rgba(16,24,20,0.18)]">
      <div className="mx-auto h-1.5 w-14 rounded-full bg-slate-200" />
      <div className="mt-4 flex items-center gap-3">
        <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-teal-50 text-teal-700">
          <Sparkles size={20} />
        </span>
        <div>
          <h3 className="m-0 text-2xl font-bold text-slate-900">Gợi ý gần bạn</h3>
          <p className="m-0 mt-1 text-sm text-slate-500">Các điểm nổi bật được đề xuất từ dữ liệu hiện có.</p>
        </div>
      </div>

      <div className="mt-4 flex flex-col gap-3">
        {suggestions.map((poi) => (
          <button
            key={poi.id}
            type="button"
            onClick={() => {
              onSelectPoi?.(poi.id);
              onClose?.();
            }}
            className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-3 text-left shadow-[0_8px_18px_rgba(16,24,20,0.06)]"
          >
            <img src={poi.image} alt="" className="h-16 w-16 rounded-2xl object-cover" />
            <div className="min-w-0 flex-1">
              <strong className="block truncate text-base text-slate-900">{poi.name}</strong>
              <span className="mt-1 inline-flex items-center gap-1 text-sm text-slate-500">
                <MapPinned size={14} />
                {poi.distanceKm} km • {poi.categoryLabel}
              </span>
            </div>
            <ChevronRight size={18} className="text-slate-400" />
          </button>
        ))}
      </div>
    </div>
  );
}
