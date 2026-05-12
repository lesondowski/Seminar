import { create } from "zustand";

export const useUiStore = create((set) => ({
  activeSurface: "map",
  suggestionCard: null,
  coachmarkVisible: false,
  language: "vi",
  mapCenter: [21.0287, 105.8357],
  mapZoom: 16,
  blockingError: null,
  openSurface(activeSurface) {
    set({ activeSurface });
  },
  setSuggestionCard(suggestionCard) {
    set({ suggestionCard });
  },
  setLanguage(language) {
    set({ language });
  },
  setBlockingError(blockingError) {
    set({ blockingError });
  },
}));
