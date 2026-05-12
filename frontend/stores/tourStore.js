import { create } from "zustand";

export const useTourStore = create((set) => ({
  activeTourId: null,
  orderedPoiIds: [],
  visitedPoiIds: [],
  currentPoiId: null,
  journeyStarted: false,
  activateTour(tour) {
    set({
      activeTourId: tour.id,
      orderedPoiIds: tour.poi_ids || [],
      visitedPoiIds: [],
      currentPoiId: tour.poi_ids?.[0] || null,
      journeyStarted: false,
    });
  },
  startJourney() {
    set({ journeyStarted: true });
  },
  startCustomJourney(poiIds) {
    const normalizedPoiIds = (poiIds || []).filter((id) => Number.isFinite(id));
    set({
      activeTourId: normalizedPoiIds.length > 0 ? "custom" : null,
      orderedPoiIds: normalizedPoiIds,
      visitedPoiIds: [],
      currentPoiId: normalizedPoiIds[0] || null,
      journeyStarted: normalizedPoiIds.length > 0,
    });
  },
  stopJourney() {
    set({ journeyStarted: false });
  },
  goToNextPoi() {
    set((state) => {
      const currentIndex = state.orderedPoiIds.indexOf(state.currentPoiId);
      if (currentIndex < 0 || currentIndex >= state.orderedPoiIds.length - 1) {
        return state;
      }
      return { currentPoiId: state.orderedPoiIds[currentIndex + 1] };
    });
  },
  goToPreviousPoi() {
    set((state) => {
      const currentIndex = state.orderedPoiIds.indexOf(state.currentPoiId);
      if (currentIndex <= 0) {
        return state;
      }
      return { currentPoiId: state.orderedPoiIds[currentIndex - 1] };
    });
  },
  exitTour() {
    set({
      activeTourId: null,
      orderedPoiIds: [],
      visitedPoiIds: [],
      currentPoiId: null,
      journeyStarted: false,
    });
  },
  setCurrentPoiId(currentPoiId) {
    set({ currentPoiId });
  },
  markVisited(poiId) {
    set((state) => ({
      visitedPoiIds: state.visitedPoiIds.includes(poiId)
        ? state.visitedPoiIds
        : [...state.visitedPoiIds, poiId],
    }));
  },
  reset() {
    set({
      activeTourId: null,
      orderedPoiIds: [],
      visitedPoiIds: [],
      currentPoiId: null,
      journeyStarted: false,
    });
  },
}));
