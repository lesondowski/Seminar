import { ArrowRight, Clock3 } from "lucide-react";

export default function TourRouteCard({ poi, onOpenPoi, onOpenItinerary }) {
  if (!poi) return null;

  return (
    <div className="absolute bottom-24 left-4 right-4 z-[56] rounded-[26px] bg-white p-4 shadow-[0_14px_30px_rgba(16,24,20,0.2)] md:left-1/2 md:right-auto md:w-[520px] md:-translate-x-1/2 xl:bottom-6 xl:left-auto xl:right-24 xl:w-[420px] xl:translate-x-0">
      <button type="button" className="flex w-full items-center gap-4 text-left" onClick={onOpenPoi}>
        <img src={poi.image} alt="" className="h-24 w-24 rounded-[20px] object-cover" />
        <div className="min-w-0 flex-1">
          <div className="text-sm font-semibold text-teal-700">Đang đến ({poi.distanceKm} km)</div>
          <div className="mt-1 truncate text-2xl font-bold text-slate-900">Điểm đến: {poi.name}</div>
          <div className="mt-2 inline-flex items-center gap-2 text-sm text-slate-500">
            <Clock3 size={15} />
            Khoảng {poi.walkMinutes} phút đi bộ
          </div>
        </div>
        <span className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-teal-700 text-white shadow-[0_8px_20px_rgba(15,118,110,0.28)]">
          <ArrowRight size={22} />
        </span>
      </button>
      <button type="button" className="mt-3 text-sm font-semibold text-teal-700" onClick={onOpenItinerary}>
        Xem lộ trình của bạn
      </button>
    </div>
  );
}
