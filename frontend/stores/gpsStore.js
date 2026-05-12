import { create } from "zustand";

export const useGpsStore = create((set) => ({
  permission: "unknown",
  currentPosition: null,
  nearestPoiId: null,
  insideTriggerPoiIds: [],
  lastTriggeredPoiId: null,
  warningMessage: "",
  setPermission(permission) {
    set({ permission });
  },
  setCurrentPosition(currentPosition) {
    set({ currentPosition });
  },
  setNearestPoiId(nearestPoiId) {
    set({ nearestPoiId });
  },
  setInsideTriggerPoiIds(insideTriggerPoiIds) {
    set({ insideTriggerPoiIds });
  },
  setLastTriggeredPoiId(lastTriggeredPoiId) {
    set({ lastTriggeredPoiId });
  },
  setWarningMessage(warningMessage) {
    set({ warningMessage });
  },
  reset() {
    set({
      permission: "unknown",
      currentPosition: null,
      nearestPoiId: null,
      insideTriggerPoiIds: [],
      lastTriggeredPoiId: null,
      warningMessage: "",
    });
  },
}));
