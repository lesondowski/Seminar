export function buildPoiPath(poiId) {
  const id = Number(poiId);
  if (!Number.isFinite(id) || id <= 0) return "/app";
  return `/app/poi/${id}`;
}

export function buildPoiCanonicalUrl(poiId, origin) {
  const path = buildPoiPath(poiId);
  if (!origin) return path;
  return `${origin}${path}`;
}

export function parsePoiId(value) {
  const id = Number(value);
  if (!Number.isFinite(id) || id <= 0) return null;
  return id;
}
