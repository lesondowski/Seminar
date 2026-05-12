import { useEffect } from "react";
import { useBootstrapStore } from "@/stores/bootstrapStore";
import { useGpsStore } from "@/stores/gpsStore";
import { useAudioStore } from "@/stores/audioStore";
import { useUiStore } from "@/stores/uiStore";
import { useTourStore } from "@/stores/tourStore";
import { isPoiHiddenByName } from "@/utils/poiVisibility";

const DEFAULT_INTERVAL = 5;
const TRIGGER_DEBOUNCE_MS = 1500;

let lastTriggerTime = {};

export function useGPSRuntime(enabled) {
  const { pois, appConfig } = useBootstrapStore();
  const { setPermission, setCurrentPosition, setNearestPoiId, setInsideTriggerPoiIds, setLastTriggeredPoiId } = useGpsStore();
  const { autoAudioEnabled, setCurrentPoiId: setAudioPoi, setStatus: setAudioStatus } = useAudioStore();
  const { setSuggestionCard, activeSurface } = useUiStore();
  const { activeTourId, markVisited } = useTourStore();

  const intervalSec = appConfig?.gps_poll_interval_seconds || DEFAULT_INTERVAL;

  useEffect(() => {
    if (!enabled || typeof navigator === "undefined") return;

    if (!navigator.geolocation) {
      setPermission("denied");
      return;
    }

    let watchId;
    let debounceTimer;

    function processPosition(position) {
      const { latitude: lat, longitude: lng } = position.coords;
      setPermission("granted");
      setCurrentPosition({ lat, lng });

      if (!pois || pois.length === 0) return;

      const visiblePois = pois.filter((poi) => {
        const translation = poi.translations?.find((t) => t.language === "vi") || poi.translations?.[0];
        return !isPoiHiddenByName(translation?.name || `POI #${poi.id}`);
      });

      const nearby = visiblePois.filter((poi) => {
        const dist = getDistanceMeters(lat, lng, poi.lat, poi.lng);
        return dist <= (poi.trigger_radius || 5);
      });

      const ids = nearby.map((p) => p.id);
      setInsideTriggerPoiIds(ids);

      if (ids.length > 0) {
        setNearestPoiId(ids[0]);
      }

      for (const poi of nearby) {
        const now = Date.now();
        if ((now - (lastTriggerTime[poi.id] || 0)) < TRIGGER_DEBOUNCE_MS * 10) continue;

        lastTriggerTime[poi.id] = now;
        setLastTriggeredPoiId(poi.id);

        if (activeSurface !== "chat" && activeSurface !== "poi") {
          const dist = getDistanceMeters(lat, lng, poi.lat, poi.lng);
          const translation = poi.translations?.find((t) => t.language === "vi") || poi.translations?.[0];
          if (translation) {
            setSuggestionCard({ poiId: poi.id, poiName: translation.name, distance: dist });
          }
        }

        if (autoAudioEnabled) {
          setAudioPoi(poi.id);
          setAudioStatus("playing");
        }

        if (activeTourId) {
          markVisited(poi.id);
        }
      }
    }

    watchId = navigator.geolocation.watchPosition(
      processPosition,
      (err) => {
        if (err.code === 1) setPermission("denied");
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );

    return () => {
      navigator.geolocation.clearWatch(watchId);
    };
  }, [enabled, pois, autoAudioEnabled, activeSurface, activeTourId]);
}

function getDistanceMeters(lat1, lng1, lat2, lng2) {
  const R = 6371000;
  const toRad = (d) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}
