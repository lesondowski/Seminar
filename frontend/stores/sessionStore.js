import { create } from "zustand";

const initialState = {
  accessToken: null,
  sessionId: null,
  siteId: null,
  sessionState: "idle",
  bootstrapVersion: null,
  requiresPayment: false,
};

export const useSessionStore = create((set) => ({
  ...initialState,
  setSession(payload) {
    set({
      accessToken: payload.access_token,
      sessionId: payload.session_id,
      siteId: payload.site_id,
      sessionState: payload.session_state,
      requiresPayment: payload.requires_payment,
    });
  },
  setAccessToken(accessToken) {
    set({ accessToken });
  },
  setBootstrapVersion(bootstrapVersion) {
    set({ bootstrapVersion });
  },
  clearSession() {
    set(initialState);
  },
}));
