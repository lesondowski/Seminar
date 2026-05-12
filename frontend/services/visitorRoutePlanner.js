function isValidLatLng(point) {
  return point && Number.isFinite(point.lat) && Number.isFinite(point.lng);
}

function toRadians(value) {
  return (value * Math.PI) / 180;
}

function getDistanceMeters(from, to) {
  const earthRadius = 6371000;
  const dLat = toRadians(to.lat - from.lat);
  const dLng = toRadians(to.lng - from.lng);
  const lat1 = toRadians(from.lat);
  const lat2 = toRadians(to.lat);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2)
    + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) * Math.sin(dLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return earthRadius * c;
}

function estimateWalkMinutes(distanceMeters) {
  const metersPerMinute = 75;
  return Math.max(1, Math.round(distanceMeters / metersPerMinute));
}

function buildDirectRoute(from, to) {
  if (!isValidLatLng(from) || !isValidLatLng(to)) return null;

  return [
    [from.lat, from.lng],
    [to.lat, to.lng],
  ];
}

async function requestOsrmRoute(from, to) {
  const osrmBaseUrl = "https://router.project-osrm.org/route/v1/foot";
  const coords = `${from.lng},${from.lat};${to.lng},${to.lat}`;
  const url = `${osrmBaseUrl}/${coords}?overview=full&geometries=geojson`;

  const response = await fetch(url, {
    method: "GET",
    headers: { Accept: "application/json" },
  });

  if (!response.ok) {
    throw new Error(`OSRM_HTTP_${response.status}`);
  }

  const payload = await response.json();
  const route = payload?.routes?.[0];
  const coordinates = route?.geometry?.coordinates || [];

  if (!route || coordinates.length < 2) {
    throw new Error("OSRM_ROUTE_EMPTY");
  }

  const geometry = coordinates.map(([lng, lat]) => [lat, lng]);
  return {
    geometry,
    distanceMeters: Number(route.distance) || getDistanceMeters(from, to),
    strategy: "osrm-foot",
  };
}

async function resolveRoute({ from, to, provider }) {
  if (provider === "osrm-public") {
    try {
      return await requestOsrmRoute(from, to);
    } catch {
      const fallbackGeometry = buildDirectRoute(from, to);
      return {
        geometry: fallbackGeometry,
        distanceMeters: getDistanceMeters(from, to),
        strategy: "direct-fallback",
      };
    }
  }

  return {
    geometry: buildDirectRoute(from, to),
    distanceMeters: getDistanceMeters(from, to),
    strategy: "direct-fallback",
  };
}

export async function planVisitorRoute({
  permission,
  currentPosition,
  targetPoi,
  allPois = [],
  sourcePosition,
  provider = "osrm-public",
}) {
  if (!targetPoi || !Number.isFinite(targetPoi.id) || !isValidLatLng(targetPoi)) {
    return {
      ok: false,
      code: "POI_INVALID",
      message: "POI không hợp lệ hoặc không tồn tại.",
    };
  }

  if (permission === "denied") {
    return {
      ok: false,
      code: "GPS_DENIED",
      message: "Bạn chưa cấp quyền GPS. Vui lòng bật quyền vị trí để dẫn đường.",
    };
  }

  const sourcePoint = sourcePosition || currentPosition;

  if (!isValidLatLng(sourcePoint)) {
    return {
      ok: false,
      code: "POSITION_UNAVAILABLE",
      message: "Chưa lấy được vị trí hiện tại. Vui lòng thử lại sau vài giây.",
    };
  }

  const routePayload = await resolveRoute({
    from: sourcePoint,
    to: targetPoi,
    provider,
  });

  const geometry = routePayload.geometry;
  if (!geometry || geometry.length < 2) {
    return {
      ok: false,
      code: "ROUTE_NOT_FOUND",
      message: "Không tìm được đường đi phù hợp tới địa điểm này.",
    };
  }

  const distanceMeters = Number(routePayload.distanceMeters) || getDistanceMeters(sourcePoint, targetPoi);
  if (!Number.isFinite(distanceMeters) || distanceMeters < 0) {
    return {
      ok: false,
      code: "ROUTE_NOT_FOUND",
      message: "Không tìm được đường đi phù hợp tới địa điểm này.",
    };
  }

  return {
    ok: true,
    code: "ROUTE_READY",
    message: `Đã hiển thị đường đi tới ${targetPoi.name}.`,
    route: {
      poiId: targetPoi.id,
      poiName: targetPoi.name,
      geometry,
      distanceMeters,
      estimatedMinutes: estimateWalkMinutes(distanceMeters),
      strategy: routePayload.strategy,
      provider,
      candidatePoiCount: allPois.length,
    },
  };
}
