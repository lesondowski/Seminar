import { useBootstrapStore } from "@/stores/bootstrapStore";
import { useTourStore } from "@/stores/tourStore";
import { useUiStore } from "@/stores/uiStore";
import { useVisitorExploreStore } from "@/stores/visitorExploreStore";
import { Clock3, MapPin, Plus, Play, X } from "lucide-react";

export default function TourList({ onClose }) {
  const { tours, translations } = useBootstrapStore();
  const { activateTour } = useTourStore();
  const { language } = useUiStore();
  const addPoiToItinerary = useVisitorExploreStore((s) => s.addPoiToItinerary);
  const poiList = useVisitorExploreStore((s) => s.poiList);

  function handleSelect(tour) {
    activateTour(tour);
    if (onClose) onClose();
  }

  const getName = (tour) => {
    const t = (translations || []).find((x) => x.tour_id === tour.id && x.language === language);
    return t?.name || tour.name || `Tour #${tour.id}`;
  };

  const getHeroImage = (tour) => {
    const poi = poiList.find((item) => item.id === tour.poi_ids?.[0]);
    return poi?.image || "https://images.unsplash.com/photo-1473177104440-ffee2f376098?auto=format&fit=crop&w=1200&q=80";
  };

  const getDistance = (tour) => {
    const total = (tour.poi_ids || [])
      .map((poiId) => poiList.find((poi) => poi.id === poiId)?.distanceKm || 0)
      .reduce((sum, value) => sum + value, 0);
    return total ? Number(total.toFixed(1)) : 3.2;
  };

  return (
    <div className="rounded-t-[28px] bg-white px-5 pb-24 pt-3 shadow-[0_-10px_28px_rgba(16,24,20,0.18)] md:rounded-[28px] md:pb-6">
      <div className="mx-auto h-1.5 w-14 rounded-full bg-slate-200 md:hidden" />
      <div className="flex items-center justify-between mt-4">
        <h2 className="text-3xl font-bold tracking-[-0.03em] text-slate-900 md:text-[2rem]">Chọn Tour của bạn</h2>
        {onClose && (
          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200"
            onClick={onClose}
            aria-label="Đóng"
          >
            <X size={20} />
          </button>
        )}
      </div>
      <p className="mt-2 text-base leading-7 text-slate-600 md:text-lg md:leading-8">Khám phá thành phố theo cách của riêng bạn với các hành trình được thiết kế sẵn.</p>
      <div className="mt-4 flex flex-col gap-4 md:mt-5 md:gap-5">
        {(tours || []).map((tour, index) => {
          const distance = getDistance(tour);
          const duration = 90 + index * 30;
          return (
            <article key={tour.id} className="overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-[0_14px_28px_rgba(16,24,20,0.08)] md:rounded-[28px]">
              <img src={getHeroImage(tour)} alt="" className="h-44 w-full object-cover md:h-52" />
              <div className="p-4 md:p-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="m-0 text-2xl font-bold leading-tight text-slate-900 md:text-[2rem]">{getName(tour)}</h3>
                    <p className="m-0 mt-2 text-sm leading-6 text-slate-600 md:mt-3 md:text-lg md:leading-8">Hành trình nổi bật giúp bạn đi qua các điểm tham quan tiêu biểu ở trung tâm thành phố.</p>
                  </div>
                  <span className="shrink-0 rounded-full bg-teal-100 px-3 py-1.5 text-sm font-semibold text-teal-700 md:px-4 md:py-2 md:text-base">{duration} Phút</span>
                </div>
                <div className="mt-4 flex flex-wrap items-center gap-2.5 md:mt-5 md:gap-3">
                  <span className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 md:text-base">
                    <MapPin size={16} />
                    {distance} km
                  </span>
                  <button
                    type="button"
                    className="inline-flex h-10 items-center gap-2 rounded-full border border-teal-700 px-4 text-base font-semibold text-teal-700 md:h-12 md:px-6 md:text-lg"
                    onClick={() => (tour.poi_ids || []).forEach((poiId) => addPoiToItinerary(poiId))}
                  >
                    <Plus size={18} />
                    Thêm
                  </button>
                  <button
                    type="button"
                    className="ml-auto inline-flex h-10 items-center gap-2 rounded-full bg-teal-700 px-4 text-base font-semibold text-white md:h-12 md:px-6 md:text-lg"
                    onClick={() => handleSelect(tour)}
                  >
                    <Play size={18} />
                    Bắt đầu
                  </button>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
