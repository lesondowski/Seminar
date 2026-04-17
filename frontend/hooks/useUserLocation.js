import { useCallback, useEffect, useRef, useState } from 'react';

const DEFAULT_LOCATION = { lat: 10.796, lng: 106.749 };

function toRadians(value) {
  return (value * Math.PI) / 180;
}

function distanceInMeters(from, to) {
  if (!from || !to) return 0;

  const earthRadius = 6371000;
  const dLat = toRadians(to.lat - from.lat);
  const dLng = toRadians(to.lng - from.lng);
  const lat1 = toRadians(from.lat);
  const lat2 = toRadians(to.lat);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) * Math.sin(dLng / 2);

  return 2 * earthRadius * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export default function useUserLocation({
  watch = true,
  enableHighAccuracy = true,
  maximumAge = 5000,
  timeout = 10000,
  minDistanceMeters = 20,
  fallbackLocation = DEFAULT_LOCATION,
} = {}) {
  const [location, setLocation] = useState(null);
  const [locationError, setLocationError] = useState('');
  const [isLoadingLocation, setIsLoadingLocation] = useState(true);
  const watchIdRef = useRef(null);
  const lastLocationRef = useRef(null);

  const updateLocation = useCallback(
    (coords, force = false) => {
      const nextLocation = {
        lat: coords.latitude,
        lng: coords.longitude,
      };

      if (!force && lastLocationRef.current) {
        const moved = distanceInMeters(lastLocationRef.current, nextLocation);
        if (moved < minDistanceMeters) return;
      }

      lastLocationRef.current = nextLocation;
      setLocation(nextLocation);
      setLocationError('');
      setIsLoadingLocation(false);
    },
    [minDistanceMeters]
  );

  const handleGeoError = useCallback(
    (error) => {
      let message = 'Không thể lấy vị trí hiện tại.';

      if (error?.code === 1) {
        message = 'GPS đang tắt hoặc bạn chưa cấp quyền truy cập vị trí.';
      } else if (error?.code === 2) {
        message = 'Không xác định được vị trí hiện tại.';
      } else if (error?.code === 3) {
        message = 'Hết thời gian lấy vị trí. Vui lòng thử lại.';
      }

      setLocationError(message);
      setIsLoadingLocation(false);
      if (!location) {
        setLocation(fallbackLocation);
      }
    },
    [fallbackLocation, location]
  );

  const requestCurrentLocation = useCallback(() => {
    if (typeof window === 'undefined') return;

    if (!navigator.geolocation) {
      setLocationError('Trình duyệt hiện tại không hỗ trợ GPS.');
      setIsLoadingLocation(false);
      setLocation(fallbackLocation);
      return;
    }

    setIsLoadingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (position) => updateLocation(position.coords, true),
      handleGeoError,
      {
        enableHighAccuracy,
        maximumAge,
        timeout,
      }
    );
  }, [enableHighAccuracy, fallbackLocation, handleGeoError, maximumAge, timeout, updateLocation]);

  useEffect(() => {
    requestCurrentLocation();
  }, [requestCurrentLocation]);

  useEffect(() => {
    if (!watch) return undefined;
    if (typeof window === 'undefined' || !navigator.geolocation) return undefined;

    watchIdRef.current = navigator.geolocation.watchPosition(
      (position) => updateLocation(position.coords),
      handleGeoError,
      {
        enableHighAccuracy,
        maximumAge,
        timeout,
      }
    );

    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
    };
  }, [watch, enableHighAccuracy, maximumAge, timeout, updateLocation, handleGeoError]);

  return {
    location,
    locationError,
    isLoadingLocation,
    refreshLocation: requestCurrentLocation,
  };
}
