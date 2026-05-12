import dynamic from "next/dynamic";
import { useEffect, useMemo, useState } from "react";
import { useBootstrapStore } from "@/stores/bootstrapStore";
import { useGpsStore } from "@/stores/gpsStore";
import { useUiStore } from "@/stores/uiStore";
import { useAudioStore } from "@/stores/audioStore";
import { useVisitorExploreStore } from "@/stores/visitorExploreStore";
import { useTourStore } from "@/stores/tourStore";
import { MapPin } from "lucide-react";
import SearchBar from "./explore/SearchBar";
import CategoryChips from "./explore/CategoryChips";
import FloatingButtons from "./explore/FloatingButtons";
import BottomNavigation from "./explore/BottomNavigation";
import TourRouteCard from "@/components/tour/TourRouteCard";
import {
  CATEGORIES,
  filterPoiList,
  getPoiById,
  normalizePoiForExplore,
} from "./explore/poiExploreUtils";

const LeafletMap = dynamic(() => import("./LeafletMap"), { ssr: false });

export default function VisitorMapHome({ onOpenChat, onOpenItinerary, onSelectPoi }) {
  const { site, pois, translations } = useBootstrapStore();
  const { currentPosition } = useGpsStore();
  const { openSurface } = useUiStore();
  const { currentPoiId } = useAudioStore();
  const {
    activeTourId,
    orderedPoiIds,
    currentPoiId: currentTourPoiId,
    journeyStarted,
  } = useTourStore();
  const {
    userLocation,
    poiList,
    selectedPOI,
    activeTab,
    filters,
    setUserLocation,
    setPoiList,
    setSelectedPOI,
    setActiveTab,
    setQuery,
    setCategory,
    activeRoute,
    routeBanner,
    clearRouteBanner,
  } = useVisitorExploreStore();

  const [recenterSignal, setRecenterSignal] = useState(0);
  const siteName = site?.name || "GPS Visitor Experience";

  useEffect(() => {
    setPoiList(
      (pois || [])
        .map((poi) => normalizePoiForExplore(poi, translations || []))
        .filter(Boolean)
    );
  }, [pois, translations, setPoiList]);

  useEffect(() => {
    setUserLocation(currentPosition);
  }, [currentPosition, setUserLocation]);

  const filteredPois = useMemo(
    () => filterPoiList(poiList || [], filters),
    [poiList, filters]
  );

  const suggestions = useMemo(() => {
    const query = (filters.query || "").trim();
    if (!query) return [];
    return filteredPois.slice(0, 6);
  }, [filters.query, filteredPois]);

  const currentRoutePoi = useMemo(
    () => getPoiById(poiList, currentTourPoiId || orderedPoiIds?.[0]),
    [poiList, currentTourPoiId, orderedPoiIds]
  );

  useEffect(() => {
    if (!routeBanner) return;
    const timeoutId = setTimeout(() => clearRouteBanner(), 3200);
    return () => clearTimeout(timeoutId);
  }, [routeBanner, clearRouteBanner]);

  function handleNavSelect(nextTab) {
    setActiveTab(nextTab);
    if (nextTab === "explore") {
      openSurface("map");
      return;
    }
    if (nextTab === "tour") {
      openSurface("tour");
      return;
    }
    if (nextTab === "poi") {
      openSurface("poi-list");
    }
  }

  function handleSelectSuggestion(poi) {
    setSelectedPOI(poi.id);
    setRecenterSignal((prev) => prev + 1);
  }

  function handleMarkerClick(poiId) {
    setSelectedPOI(poiId);
    if (onSelectPoi) {
      onSelectPoi(poiId);
    }
  }

  return (
    <section className="relative h-full w-full overflow-hidden">
      <div className="map-layer">
        <LeafletMap
          pois={filteredPois}
          allPois={poiList}
          currentPosition={userLocation}
          currentPoiId={selectedPOI || currentPoiId}
          routePoiIds={activeTourId ? orderedPoiIds : []}
          visitorRoutePath={activeRoute?.geometry || []}
          recenterSignal={recenterSignal}
          focusedPoiId={selectedPOI}
          onSelectPoi={handleMarkerClick}
        />
      </div>

      <div className="pointer-events-none absolute inset-0 z-[45] bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.22),_transparent_45%),linear-gradient(to_bottom,_transparent_58%,_rgba(14,26,23,0.12)_100%)]" />

      <SearchBar
        query={filters.query}
        onChange={setQuery}
        suggestions={suggestions}
        onSelectSuggestion={handleSelectSuggestion}
      />

      <CategoryChips
        categories={CATEGORIES.filter((item) => item.key !== "all")}
        activeCategory={filters.category}
        onChange={setCategory}
      />

      <h2 className="absolute left-3 top-[114px] z-[50] rounded-full bg-white/90 px-3 py-1 text-sm font-semibold text-slate-700 shadow-[0_8px_20px_rgba(16,24,20,0.12)] md:left-1/2 md:-translate-x-1/2 xl:left-5 xl:translate-x-0">
        {siteName}
      </h2>

      <FloatingButtons
        onLocate={() => setRecenterSignal((prev) => prev + 1)}
        onChat={onOpenChat}
        onOpenItinerary={onOpenItinerary}
      />

      {routeBanner && (
        <div
          className={`absolute left-3 right-3 top-[106px] z-[57] rounded-2xl px-4 py-3 text-sm font-semibold shadow-[0_10px_24px_rgba(16,24,20,0.18)] md:left-1/2 md:right-auto md:w-[520px] md:-translate-x-1/2 xl:left-5 xl:w-[430px] xl:translate-x-0 ${routeBanner.type === "error" ? "bg-rose-50 text-rose-700" : routeBanner.type === "info" ? "bg-sky-50 text-sky-700" : "bg-teal-50 text-teal-700"}`}
          role="status"
          aria-live="polite"
        >
          {routeBanner.message}
        </div>
      )}

      {activeTab === "tour" && journeyStarted && currentRoutePoi && (
        <TourRouteCard
          poi={currentRoutePoi}
          onOpenPoi={() => onSelectPoi?.(currentRoutePoi.id)}
          onOpenItinerary={() => openSurface("tour-active")}
        />
      )}

      <BottomNavigation activeTab={activeTab} onChange={handleNavSelect} />

      <aside className="pointer-events-auto absolute left-5 top-24 z-[58] hidden w-[360px] rounded-[22px] border border-white/70 bg-white/94 p-4 shadow-[0_14px_30px_rgba(16,24,20,0.18)] xl:block">
        <h3 className="text-xl font-bold text-slate-800">Khám phá điểm đến</h3>
        <p className="mt-1 text-sm text-slate-600">Chạm vào marker để xem nhanh địa điểm trên bản đồ.</p>
        <ul className="mt-3 flex max-h-[56vh] flex-col gap-2 overflow-y-auto pr-1">
          {filteredPois.map((poi) => (
            <li key={poi.id}>
              <button
                type="button"
                className={`flex w-full items-center gap-3 rounded-xl border px-3 py-2 text-left transition ${
                  selectedPOI === poi.id ? "border-teal-300 bg-teal-50" : "border-slate-200 bg-white"
                }`}
                onClick={() => handleSelectSuggestion(poi)}
              >
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-teal-100 text-teal-700">
                  <MapPin size={14} />
                </span>
                <span className="flex-1">
                  <strong className="block text-sm text-slate-800">{poi.name}</strong>
                  <span className="text-xs text-slate-500">{poi.category}</span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      </aside>
    </section>
  );
}
