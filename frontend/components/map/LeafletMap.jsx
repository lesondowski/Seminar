import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, useMap, CircleMarker, Polyline, Tooltip } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix default marker icons in webpack/Next.js
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

function buildIcon(color, symbol = "P", active = false) {
  const size = active ? { w: 28, h: 40 } : { w: 24, h: 36 };
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size.w}" height="${size.h}" viewBox="0 0 24 36"><path fill="${color}" stroke="#fff" stroke-width="1.5" d="M12 0C5.4 0 0 5.4 0 12c0 8.5 12 24 12 24S24 20.5 24 12C24 5.4 18.6 0 12 0z"/><circle cx="12" cy="12" r="5" fill="#fff"/><text x="12" y="14.5" text-anchor="middle" font-size="6" font-weight="700" fill="${color}">${symbol}</text></svg>`;
  return L.icon({
    iconUrl: `data:image/svg+xml;base64,${btoa(svg)}`,
    iconSize: [size.w, size.h],
    iconAnchor: [size.w / 2, size.h],
    popupAnchor: [0, -size.h],
  });
}

const VISUAL_STYLE = {
  cafe: { color: "#0F766E", symbol: "C" },
  food: { color: "#B45309", symbol: "F" },
  landmark: { color: "#1D4ED8", symbol: "L" },
};

function MapViewportController({ position, recenterSignal, focusedPoi }) {
  const map = useMap();

  useEffect(() => {
    if (position) {
      map.setView([position.lat, position.lng]);
    }
  }, [position]);

  useEffect(() => {
    if (position && typeof recenterSignal === "number") {
      map.flyTo([position.lat, position.lng], Math.max(map.getZoom(), 17), {
        duration: 0.45,
      });
    }
  }, [recenterSignal, position, map]);

  useEffect(() => {
    if (focusedPoi) {
      map.flyTo([focusedPoi.lat, focusedPoi.lng], Math.max(map.getZoom(), 17), {
        duration: 0.4,
      });
    }
  }, [focusedPoi, map]);

  return null;
}

export default function LeafletMap({
  pois,
  allPois,
  currentPosition,
  currentPoiId,
  onSelectPoi,
  routePoiIds = [],
  visitorRoutePath = [],
  recenterSignal = 0,
  focusedPoiId = null,
}) {
  const sourcePois = allPois?.length ? allPois : pois;

  const defaultCenter = sourcePois.length > 0
    ? [sourcePois[0].lat, sourcePois[0].lng]
    : [21.0285, 105.8542];

  const routePoints = (routePoiIds || [])
    .map((poiId) => sourcePois.find((poi) => poi.id === poiId))
    .filter(Boolean)
    .map((poi) => [poi.lat, poi.lng]);

  const focusedPoi = focusedPoiId
    ? sourcePois.find((poi) => poi.id === focusedPoiId) || null
    : null;

  return (
    <MapContainer
      center={defaultCenter}
      zoom={17}
      className="leaflet-visitor-map"
      style={{ height: "100%", width: "100%" }}
      scrollWheelZoom
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
      />

      <MapViewportController
        position={currentPosition}
        recenterSignal={recenterSignal}
        focusedPoi={focusedPoi}
      />

      {currentPosition && (
        <CircleMarker
          center={[currentPosition.lat, currentPosition.lng]}
          radius={8}
          pathOptions={{ color: "#2563EB", fillColor: "#3B82F6", fillOpacity: 0.9, weight: 2 }}
        />
      )}

      {pois.map((poi) => {
        const name = poi.name || `POI #${poi.id}`;
        const markerStyle = VISUAL_STYLE[poi.visualType] || VISUAL_STYLE.landmark;
        const icon = buildIcon(
          currentPoiId === poi.id ? "#D97706" : markerStyle.color,
          markerStyle.symbol,
          currentPoiId === poi.id
        );

        return (
          <Marker
            key={poi.id}
            position={[poi.lat, poi.lng]}
            icon={icon}
            eventHandlers={{ click: () => onSelectPoi && onSelectPoi(poi.id) }}
          >
            <Tooltip
              permanent
              direction="bottom"
              offset={[0, 14]}
              className={`poi-label-bubble ${currentPoiId === poi.id ? "poi-label-bubble--active" : ""}`}
            >
              {name}
            </Tooltip>
          </Marker>
        );
      })}

      {routePoints.length >= 2 && (
        <Polyline
          positions={routePoints}
          pathOptions={{ color: "#0F766E", weight: 5, opacity: 0.85 }}
        />
      )}

      {visitorRoutePath.length >= 2 && (
        <Polyline
          positions={visitorRoutePath}
          pathOptions={{ color: "#F59E0B", weight: 6, opacity: 0.95, dashArray: "6 8" }}
        />
      )}
    </MapContainer>
  );
}
