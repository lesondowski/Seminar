/**
 * ManagerPoiMapPicker.jsx
 *
 * Leaflet map with a draggable pin for selecting POI coordinates.
 * This file must only be loaded via dynamic import with ssr:false.
 * See ManagerPoiEditor.jsx for the wrapper pattern.
 *
 * Props:
 *   lat       {number}
 *   lng       {number}
 *   onChange  {(lat: number, lng: number) => void}
 */
import { useEffect, useRef, useState } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { Navigation } from "lucide-react";

// Fix leaflet default icon paths broken by webpack
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

// Inner component that listens to map click events
function ClickHandler({ onChange }) {
  useMapEvents({
    click(e) {
      onChange(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

// Controlled draggable marker
function DraggableMarker({ lat, lng, onChange }) {
  const markerRef = useRef(null);

  function handleDragEnd() {
    const m = markerRef.current;
    if (m) {
      const { lat: newLat, lng: newLng } = m.getLatLng();
      onChange(newLat, newLng);
    }
  }

  return (
    <Marker
      ref={markerRef}
      position={[lat, lng]}
      draggable
      eventHandlers={{ dragend: handleDragEnd }}
    />
  );
}

export default function ManagerPoiMapPicker({ lat, lng, onChange }) {
  const DEFAULT_LAT = lat || 10.7769;
  const DEFAULT_LNG = lng || 106.7009;

  const [coords, setCoords] = useState({ lat: DEFAULT_LAT, lng: DEFAULT_LNG });
  const mapRef = useRef(null);

  // Sync external props → local state
  useEffect(() => {
    if (lat != null && lng != null) {
      setCoords({ lat, lng });
    }
  }, [lat, lng]);

  function handleChange(newLat, newLng) {
    const rounded = { lat: Math.round(newLat * 1e6) / 1e6, lng: Math.round(newLng * 1e6) / 1e6 };
    setCoords(rounded);
    onChange(rounded.lat, rounded.lng);
  }

  function handleLocateMe() {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        handleChange(latitude, longitude);
        if (mapRef.current) {
          mapRef.current.setView([latitude, longitude], 16);
        }
      },
      () => {},
    );
  }

  return (
    <div className="mgr-map-wrapper">
      {/* Coordinate badge */}
      <div className="mgr-coord-badge">
        <span>
          Tọa độ đã chọn:{" "}
          <strong>
            {coords.lat.toFixed(4)}° N,{" "}
            {coords.lng.toFixed(4)}° E
          </strong>
        </span>
      </div>

      <MapContainer
        center={[coords.lat, coords.lng]}
        zoom={15}
        className="mgr-map-container"
        ref={mapRef}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <ClickHandler onChange={handleChange} />
        <DraggableMarker lat={coords.lat} lng={coords.lng} onChange={handleChange} />
      </MapContainer>

      {/* Locate-me button */}
      <button
        type="button"
        className="mgr-map-locate-btn"
        onClick={handleLocateMe}
        title="Vị trí của tôi"
      >
        <Navigation size={16} />
      </button>

      {/* Search nearby button */}
      <button
        type="button"
        className="mgr-map-nearby-btn"
      >
        Tìm quanh khu vực này
      </button>
    </div>
  );
}
