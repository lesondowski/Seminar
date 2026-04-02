import React, { useState, useEffect, useRef } from 'react';
import Loading from '../common/Loading';
import dynamic from 'next/dynamic';

// Dynamically import Leaflet components to avoid SSR issues
const DynamicMapContainer = dynamic(
  () => import('react-leaflet').then(mod => mod.MapContainer),
  { ssr: false }
);

const DynamicTileLayer = dynamic(
  () => import('react-leaflet').then(mod => mod.TileLayer),
  { ssr: false }
);

const DynamicMarker = dynamic(
  () => import('react-leaflet').then(mod => mod.Marker),
  { ssr: false }
);

const DynamicPopup = dynamic(
  () => import('react-leaflet').then(mod => mod.Popup),
  { ssr: false }
);

const DynamicZoomControl = dynamic(
  () => import('react-leaflet').then(mod => mod.ZoomControl),
  { ssr: false }
);

const DynamicPolyline = dynamic(
  () => import('react-leaflet').then(mod => mod.Polyline),
  { ssr: false }
);

// Custom number icon for POI
const createNumberIcon = (number) => {
  if (typeof window === 'undefined') return null;
  const L = require('leaflet');
  return L.divIcon({
    className: 'custom-poi-marker',
    html: `<div style="
      background: linear-gradient(135deg, #333333, #444444);
      color: white;
      width: 40px;
      height: 40px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: bold;
      font-size: 18px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
      border: 3px solid #DDDDDD;
    ">${number}</div>`,
    iconSize: [40, 40],
    iconAnchor: [20, 20],
    popupAnchor: [0, -20],
  });
};

// User location icon
const createUserIcon = () => {
  if (typeof window === 'undefined') return null;
  const L = require('leaflet');
  return L.divIcon({
    className: 'custom-user-marker',
    html: `<div style="
      background: linear-gradient(135deg, #212121, #333333);
      color: white;
      width: 32px;
      height: 32px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: bold;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
      border: 3px solid #DDDDDD;
    ">📍</div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -16],
  });
};

// Map component that uses Leaflet
export default function MapComponent({ onPOISelect, pois = [], loading = false, userLocation = null, route = [], currentPOIIndex = 0 }) {
  const [mapCenter, setMapCenter] = useState({ lat: 10.796, lng: 106.749 }); // Vĩnh Khánh, Vietnam
  const [userPos, setUserPos] = useState(null);
  const [routeCoords, setRouteCoords] = useState([]); // Actual route coordinates from OSRM
  const mapRef = useRef(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Get user location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const pos = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          setUserPos(pos);
          setMapCenter(pos);
        },
        (error) => {
          console.log('Geolocation error:', error);
          setMapCenter(userLocation || { lat: 10.796, lng: 106.749 });
        }
      );
    }
  }, []);

  // Fetch actual route from OSRM when route changes
  useEffect(() => {
    if (route.length > 1) {
      fetchActualRoute(route);
    }
  }, [route]);

  // Fetch route from OSRM (Open Source Routing Machine)
  const fetchActualRoute = async (routePOIs) => {
    try {
      // Build coordinates string for OSRM: lng,lat;lng,lat;...
      const coordinates = routePOIs
        .map(poi => `${poi.location.lng},${poi.location.lat}`)
        .join(';');

      // Call OSRM API
      const response = await fetch(
        `https://router.project-osrm.org/route/v1/car/${coordinates}?overview=full&geometries=geojson`
      );

      if (!response.ok) throw new Error('OSRM API error');

      const data = await response.json();

      if (data.routes && data.routes.length > 0) {
        // Extract coordinates from GeoJSON geometry
        const coords = data.routes[0].geometry.coordinates.map(coord => [coord[1], coord[0]]);
        setRouteCoords(coords);
      }
    } catch (error) {
      console.error('Error fetching route:', error);
      // Fallback to straight line if OSRM fails
      const fallbackCoords = routePOIs.map(poi => [poi.location.lat, poi.location.lng]);
      setRouteCoords(fallbackCoords);
    }
  };

  if (loading) return <Loading fullScreen text="Đang tải bản đồ..." />;

  // Fallback for non-client rendering
  if (!isClient) {
    return (
      <div className="w-full h-full bg-gray-200 flex items-center justify-center rounded-lg">
        <p className="text-gray-500">Đang tải bản đồ...</p>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full rounded-lg overflow-hidden">
      <DynamicMapContainer
        center={[mapCenter.lat, mapCenter.lng]}
        zoom={15}
        style={{ height: '100%', width: '100%' }}
        ref={mapRef}
      >
        <DynamicTileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Actual route polyline - following real roads */}
        {routeCoords.length > 1 && (
          <DynamicPolyline
            positions={routeCoords}
            color="#333333"
            weight={4}
            opacity={0.85}
            dashArray="8, 4"
          />
        )}

        {/* User location marker */}
        {userPos && (
          <DynamicMarker position={[userPos.lat, userPos.lng]} icon={createUserIcon()}>
            <DynamicPopup>
              <div className="text-center">
                <p className="font-bold">📍 Vị trí của bạn</p>
              </div>
            </DynamicPopup>
          </DynamicMarker>
        )}

        {/* POI markers */}
        {pois.length > 0 &&
          pois.map((poi, index) => (
            <DynamicMarker
              key={poi.id}
              position={[poi.location.lat, poi.location.lng]}
              icon={createNumberIcon(index + 1)}
              eventHandlers={{
                click: () => {
                  onPOISelect && onPOISelect(poi);
                },
              }}
            >
              <DynamicPopup>
                <div className="text-center">
                  <p className="font-bold">{index + 1}. {poi.name}</p>
                  <p className="text-sm text-gray-600">{poi.category}</p>
                </div>
              </DynamicPopup>
            </DynamicMarker>
          ))}

        <DynamicZoomControl position="bottomright" />
      </DynamicMapContainer>
    </div>
  );
}
