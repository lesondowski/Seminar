import { create } from "zustand";

export const useChatStore = create((set) => ({
  isOpen: false,
  messages: [],
  pending: false,
  contextPoiId: null,
  contextTourId: null,
  rateLimited: false,
  inputLocked: false,
  setIsOpen(isOpen) {
    set({ isOpen });
  },
  setPending(pending) {
    set({ pending });
  },
  setInputLocked(inputLocked) {
    set({ inputLocked });
  },
  pushMessage(message) {
    set((state) => ({ messages: [...state.messages, message] }));
  },
  setRateLimited(rateLimited) {
    set({ rateLimited });
  },
  reset() {
    set({
      isOpen: false,
      messages: [],
      pending: false,
      contextPoiId: null,
      contextTourId: null,
      rateLimited: false,
      inputLocked: false,
    });
  },
}));
