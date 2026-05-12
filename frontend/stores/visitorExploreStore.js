import { create } from "zustand";

const DEFAULT_STATE = {
  userLocation: null,
  poiList: [],
  selectedPOI: null,
  activeTab: "explore",
  savedPoiIds: [],
  itineraryDraftPoiIds: [],
  activeRoute: null,
  routeBanner: null,
  filters: {
    query: "",
    category: "all",
  },
};

function getDistanceMeters(from, to) {
  if (!from || !to) return Number.POSITIVE_INFINITY;
  const earthRadius = 6371000;
  const dLat = ((to.lat - from.lat) * Math.PI) / 180;
  const dLng = ((to.lng - from.lng) * Math.PI) / 180;
  const lat1 = (from.lat * Math.PI) / 180;
  const lat2 = (to.lat * Math.PI) / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return earthRadius * c;
}

export const useVisitorExploreStore = create((set) => ({
  ...DEFAULT_STATE,
  setUserLocation(userLocation) {
    set({ userLocation });
  },
  setPoiList(poiList) {
    set({ poiList });
  },
  setSelectedPOI(selectedPOI) {
    set({ selectedPOI });
  },
  setActiveTab(activeTab) {
    set({ activeTab });
  },
  toggleSavedPoi(poiId) {
    set((state) => ({
      savedPoiIds: state.savedPoiIds.includes(poiId)
        ? state.savedPoiIds.filter((id) => id !== poiId)
        : [...state.savedPoiIds, poiId],
    }));
  },
  addPoiToItinerary(poiId) {
    set((state) => ({
      itineraryDraftPoiIds: state.itineraryDraftPoiIds.includes(poiId)
        ? state.itineraryDraftPoiIds
        : [...state.itineraryDraftPoiIds, poiId],
    }));
  },
  reorderItinerary(activePoiId, overPoiId) {
    set((state) => {
      const next = [...state.itineraryDraftPoiIds];
      const fromIndex = next.indexOf(activePoiId);
      const toIndex = next.indexOf(overPoiId);
      if (fromIndex < 0 || toIndex < 0 || fromIndex === toIndex) {
        return { itineraryDraftPoiIds: next };
      }

      const [moved] = next.splice(fromIndex, 1);
      next.splice(toIndex, 0, moved);
      return { itineraryDraftPoiIds: next };
    });
  },
  removePoiFromItinerary(poiId) {
    set((state) => ({
      itineraryDraftPoiIds: state.itineraryDraftPoiIds.filter((id) => id !== poiId),
    }));
  },
  optimizeItinerary() {
    set((state) => {
      const sortedIds = [...state.itineraryDraftPoiIds].sort((leftId, rightId) => {
        const leftPoi = state.poiList.find((poi) => poi.id === leftId);
        const rightPoi = state.poiList.find((poi) => poi.id === rightId);

        if (state.userLocation) {
          const leftDistance = getDistanceMeters(state.userLocation, leftPoi);
          const rightDistance = getDistanceMeters(state.userLocation, rightPoi);
          return leftDistance - rightDistance;
        }

        return (leftPoi?.distanceKm || 0) - (rightPoi?.distanceKm || 0);
      });

      return {
        itineraryDraftPoiIds: sortedIds,
      };
    });
  },
  setActiveRoute(activeRoute) {
    set({ activeRoute });
  },
  clearActiveRoute() {
    set({ activeRoute: null });
  },
  setRouteBanner(routeBanner) {
    set({ routeBanner });
  },
  clearRouteBanner() {
    set({ routeBanner: null });
  },
  setQuery(query) {
    set((state) => ({
      filters: {
        ...state.filters,
        query,
      },
    }));
  },
  setCategory(category) {
    set((state) => ({
      filters: {
        ...state.filters,
        category,
      },
    }));
  },
  resetFilters() {
    set((state) => ({
      filters: {
        ...state.filters,
        query: "",
        category: "all",
      },
    }));
  },
  reset() {
    set(DEFAULT_STATE);
  },
}));
