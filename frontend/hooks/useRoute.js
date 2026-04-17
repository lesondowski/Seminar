import { useCallback, useEffect, useMemo, useState } from 'react';

const ROUTE_CACHE_TTL = 15 * 60 * 1000;
const routeCache = new Map();

function toFixedCoordinate(value) {
  return Number(value).toFixed(5);
}

function cacheKey(from, to, profile) {
  return [
    toFixedCoordinate(from.lat),
    toFixedCoordinate(from.lng),
    toFixedCoordinate(to.lat),
    toFixedCoordinate(to.lng),
    profile,
  ].join(':');
}

function normalizeRoutePayload(route, isFallback = false) {
  const coords = route.geometry.coordinates.map((coord) => [coord[1], coord[0]]);
  const distanceMeters = route.distance || 0;
  const durationMinutes = (route.duration || 0) / 60;

  return {
    coords,
    distanceMeters,
    durationMinutes,
    isFallback,
  };
}

function buildFallback(from, to) {
  const distanceMeters = Math.sqrt(
    Math.pow((to.lat - from.lat) * 111000, 2) +
      Math.pow((to.lng - from.lng) * 111000, 2)
  );

  return {
    coords: [
      [from.lat, from.lng],
      [to.lat, to.lng],
    ],
    distanceMeters,
    durationMinutes: distanceMeters / 80,
    isFallback: true,
  };
}

export default function useRoute({
  from,
  to,
  profile = 'foot',
  enabled = true,
} = {}) {
  const [routeCoords, setRouteCoords] = useState([]);
  const [routeInfo, setRouteInfo] = useState(null);
  const [isLoadingRoute, setIsLoadingRoute] = useState(false);
  const [routeError, setRouteError] = useState('');

  const hasValidPoints = useMemo(() => {
    return Boolean(from?.lat && from?.lng && to?.lat && to?.lng);
  }, [from, to]);

  const clearRoute = useCallback(() => {
    setRouteCoords([]);
    setRouteInfo(null);
    setRouteError('');
    setIsLoadingRoute(false);
  }, []);

  const fetchRoute = useCallback(
    async ({ force = false } = {}) => {
      if (!enabled || !hasValidPoints) {
        clearRoute();
        return null;
      }

      const key = cacheKey(from, to, profile);
      const cached = routeCache.get(key);
      const now = Date.now();

      if (!force && cached && now - cached.ts < ROUTE_CACHE_TTL) {
        setRouteCoords(cached.data.coords);
        setRouteInfo({
          distanceMeters: cached.data.distanceMeters,
          durationMinutes: cached.data.durationMinutes,
          isFallback: cached.data.isFallback,
        });
        setRouteError('');
        setIsLoadingRoute(false);
        return cached.data;
      }

      setIsLoadingRoute(true);
      setRouteError('');

      try {
        const coordinates = `${from.lng},${from.lat};${to.lng},${to.lat}`;
        const response = await fetch(
          `https://router.project-osrm.org/route/v1/${profile}/${coordinates}?overview=full&geometries=geojson`
        );

        if (!response.ok) {
          throw new Error('Unable to compute route');
        }

        const payload = await response.json();

        if (!payload?.routes?.length) {
          throw new Error('No route found');
        }

        const normalized = normalizeRoutePayload(payload.routes[0]);
        routeCache.set(key, { ts: now, data: normalized });

        setRouteCoords(normalized.coords);
        setRouteInfo({
          distanceMeters: normalized.distanceMeters,
          durationMinutes: normalized.durationMinutes,
          isFallback: normalized.isFallback,
        });

        return normalized;
      } catch (error) {
        const fallback = buildFallback(from, to);
        setRouteCoords(fallback.coords);
        setRouteInfo({
          distanceMeters: fallback.distanceMeters,
          durationMinutes: fallback.durationMinutes,
          isFallback: true,
        });
        setRouteError('Không tìm được đường phù hợp. Đang hiển thị đường thẳng.');

        routeCache.set(key, { ts: now, data: fallback });
        return fallback;
      } finally {
        setIsLoadingRoute(false);
      }
    },
    [clearRoute, enabled, from, hasValidPoints, profile, to]
  );

  useEffect(() => {
    fetchRoute();
  }, [fetchRoute]);

  return {
    routeCoords,
    routeInfo,
    routeError,
    isLoadingRoute,
    refreshRoute: () => fetchRoute({ force: true }),
    clearRoute,
  };
}
