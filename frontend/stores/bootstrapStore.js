import { create } from "zustand";

const initialState = {
  loaded: false,
  site: null,
  pois: [],
  translations: [],
  tours: [],
  appConfig: null,
  publishedAt: null,
  bootstrapVersion: null,
};

export const useBootstrapStore = create((set) => ({
  ...initialState,
  hydrate(payload) {
    set({
      loaded: true,
      site: payload.site,
      pois: payload.pois || [],
      translations: payload.translations || [],
      tours: payload.tours || [],
      appConfig: payload.app_config || null,
      publishedAt: payload.published_at || null,
      bootstrapVersion: payload.bootstrap_version || null,
    });
  },
  reset() {
    set(initialState);
  },
}));
