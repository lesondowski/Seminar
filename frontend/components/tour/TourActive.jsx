import { useEffect, useMemo } from "react";
import { useTourStore } from "@/stores/tourStore";
import { useVisitorExploreStore } from "@/stores/visitorExploreStore";
import { useGpsStore } from "@/stores/gpsStore";
import { Sparkles, Navigation, Play, SkipBack, SkipForward, LogOut } from "lucide-react";
import { planVisitorRoute } from "@/services/visitorRoutePlanner";

function getDistanceMeters(from, to) {
  if (!from || !to) return null;
  const earthRadius = 6371000;
  const dLat = ((to.lat - from.lat) * Math.PI) / 180;
  const dLng = ((to.lng - from.lng) * Math.PI) / 180;
  const lat1 = (from.lat * Math.PI) / 180;
  const lat2 = (to.lat * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2
    + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(earthRadius * c);
}

export default function TourActive({ onSelectPoi }) {
  const {
    activeTourId,
    orderedPoiIds,
    currentPoiId,
    journeyStarted,
    startJourney,
    setCurrentPoiId,
    goToNextPoi,
    goToPreviousPoi,
    exitTour,
  } = useTourStore();
  const poiList = useVisitorExploreStore((s) => s.poiList);
  const optimizeItinerary = useVisitorExploreStore((s) => s.optimizeItinerary);
  const setActiveRoute = useVisitorExploreStore((s) => s.setActiveRoute);
  const setRouteBanner = useVisitorExploreStore((s) => s.setRouteBanner);
  const permission = useGpsStore((s) => s.permission);
  const currentPosition = useGpsStore((s) => s.currentPosition);

  if (!activeTourId) return null;

  const visiblePoiIds = orderedPoiIds;
  const currentIndex = visiblePoiIds.indexOf(currentPoiId);
  const currentPoi = currentIndex >= 0
    ? poiList.find((poi) => poi.id === visiblePoiIds[currentIndex])
    : null;
  const previousPoi = currentIndex > 0
    ? poiList.find((poi) => poi.id === visiblePoiIds[currentIndex - 1])
    : null;
  const remainingMeters = useMemo(
    () => (currentPoi ? getDistanceMeters(currentPosition, { lat: currentPoi.lat, lng: currentPoi.lng }) : null),
    [currentPosition, currentPoi]
  );

  useEffect(() => {
    let cancelled = false;

    async function syncRoute() {
      if (!journeyStarted || !currentPoi) return;

      const sourcePosition = currentPosition || (previousPoi ? { lat: previousPoi.lat, lng: previousPoi.lng } : null);
      const result = await planVisitorRoute({
        permission,
        currentPosition,
        sourcePosition,
        targetPoi: currentPoi,
      });

      if (cancelled) return;

      if (!result.ok) {
        setActiveRoute(null);
        setRouteBanner({ type: "error", message: result.message });
        return;
      }

      setActiveRoute(result.route);
      setRouteBanner({ type: "success", message: `Đang dẫn tới ${currentPoi.name}.` });
    }

    void syncRoute();

    return () => {
      cancelled = true;
    };
  }, [journeyStarted, currentPoiId, currentPosition]);

  return (
    <div className="rounded-t-[28px] bg-white px-5 pb-8 pt-3 shadow-[0_-10px_28px_rgba(16,24,20,0.18)] md:rounded-[28px]">
      <div className="mx-auto h-1.5 w-14 rounded-full bg-slate-200 md:hidden" />
      <div className="mt-4 flex items-center justify-between gap-3">
        <h3 className="m-0 text-3xl font-bold text-slate-900 md:text-[2rem]">Lộ trình của bạn</h3>
        <button type="button" className="inline-flex h-10 items-center gap-2 rounded-full bg-slate-100 px-3 text-sm font-semibold text-slate-700 md:h-12 md:px-5 md:text-base" onClick={optimizeItinerary}>
          <Sparkles size={18} />
          Tự động sắp xếp tối ưu
        </button>
      </div>

      <div className="mt-3 flex items-center justify-between gap-2 rounded-2xl bg-teal-50 px-3 py-2 text-sm font-semibold text-teal-700">
        <span>{remainingMeters != null ? `Còn ${remainingMeters}m tới điểm hiện tại` : "Chưa có vị trí GPS để tính khoảng cách"}</span>
        <button
          type="button"
          className="inline-flex h-8 items-center gap-1 rounded-full bg-rose-100 px-3 text-xs font-bold text-rose-700"
          onClick={exitTour}
        >
          <LogOut size={14} />
          Thoát tour
        </button>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2">
        <button
          type="button"
          className="inline-flex h-10 items-center justify-center gap-2 rounded-full bg-slate-100 text-sm font-semibold text-slate-700"
          onClick={goToPreviousPoi}
          disabled={currentIndex <= 0}
        >
          <SkipBack size={14} />
          Quay lại điểm cũ
        </button>
        <button
          type="button"
          className="inline-flex h-10 items-center justify-center gap-2 rounded-full bg-slate-100 text-sm font-semibold text-slate-700"
          onClick={goToNextPoi}
          disabled={currentIndex < 0 || currentIndex >= visiblePoiIds.length - 1}
        >
          <SkipForward size={14} />
          Tới điểm tiếp theo
        </button>
      </div>

      <div className="mt-4 flex flex-col gap-3 md:mt-5 md:gap-4">
        {visiblePoiIds.map((id, idx) => {
          const poi = poiList.find((item) => item.id === id);
          if (!poi) return null;
          const isCurrent = currentPoiId === id;

          return (
            <button
              key={id}
              type="button"
              className={`flex items-center gap-3 rounded-[20px] border p-3 text-left shadow-[0_10px_24px_rgba(16,24,20,0.06)] md:gap-4 md:rounded-[24px] md:p-4 ${isCurrent ? "border-teal-300 bg-teal-50" : "border-slate-200 bg-white"}`}
              onClick={() => {
                setCurrentPoiId(id);
                onSelectPoi?.(id);
              }}
            >
              <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-teal-700 text-base font-bold text-white md:h-11 md:w-11 md:text-lg">{idx + 1}</span>
              <img src={poi.image} alt="" className="h-16 w-20 rounded-[14px] object-cover md:h-20 md:w-24 md:rounded-[18px]" />
              <div className="min-w-0 flex-1">
                <strong className="block truncate text-lg font-semibold text-slate-900 md:text-2xl">{poi.name}</strong>
                <span className="mt-1 inline-flex items-center gap-2 text-sm text-slate-500 md:mt-2 md:text-base">
                  <Navigation size={16} />
                  {poi.distanceKm} km từ đây
                </span>
              </div>
            </button>
          );
        })}
      </div>

      <button
        type="button"
        className="mt-5 inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-teal-700 text-xl font-bold text-white md:mt-6 md:h-14 md:gap-3 md:text-[2rem]"
        onClick={startJourney}
      >
        <Play size={22} />
        {journeyStarted ? "Tiếp tục hành trình" : "Bắt đầu hành trình"}
      </button>
    </div>
  );
}
