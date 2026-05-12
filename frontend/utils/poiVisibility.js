const BLOCKED_POI_NAMES = ["văn miếu quốc tử giám"];

export function isPoiHiddenByName(name) {
  if (!name) return false;
  const normalized = String(name).trim().toLowerCase();
  return BLOCKED_POI_NAMES.includes(normalized);
}

export function isPoiHidden(poi) {
  if (!poi) return false;
  return isPoiHiddenByName(poi.name);
}
