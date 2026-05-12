import { create } from "zustand";

export const useAudioStore = create((set) => ({
  currentPoiId: null,
  language: "vi",
  status: "idle",
  collapsed: false,
  queuedPoiId: null,
  narrationText: "",
  currentTime: 0,
  duration: 0,
  autoAudioEnabled: false,
  autoAudioPromptShown: false,
  ttsSupported: true,
  setStatus(status) {
    set({ status });
  },
  setCollapsed(collapsed) {
    set({ collapsed });
  },
  setLanguage(language) {
    set({ language });
  },
  setCurrentPoiId(currentPoiId) {
    set({ currentPoiId });
  },
  setNarrationText(narrationText) {
    set({ narrationText });
  },
  setTtsSupported(ttsSupported) {
    set({ ttsSupported });
  },
  queuePoi(queuedPoiId) {
    set({ queuedPoiId });
  },
  reset() {
    set({
      currentPoiId: null,
      language: "vi",
      status: "idle",
      collapsed: false,
      queuedPoiId: null,
      narrationText: "",
      currentTime: 0,
      duration: 0,
      autoAudioEnabled: false,
      autoAudioPromptShown: false,
      ttsSupported: true,
    });
  },
}));
