import React, { useState, useEffect, useRef } from 'react';
import Loading from '../common/Loading';
import dynamic from 'next/dynamic';
import { useLanguage } from '../../utils/i18n/LanguageContext';

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

const DynamicCircleMarker = dynamic(
  () => import('react-leaflet').then(mod => mod.CircleMarker),
  { ssr: false }
);

// Custom number icon for POI with visual states.
const createPOIIcon = (number, { selected = false, dimmed = false } = {}) => {
  if (typeof window === 'undefined') return null;
  const L = require('leaflet');
  const size = selected ? 54 : dimmed ? 34 : 40;
  const fontSize = selected ? 20 : dimmed ? 15 : 18;
  const gradient = selected
    ? 'linear-gradient(135deg, #FFD700, #FFA500)'
    : 'linear-gradient(135deg, #333333, #444444)';
  const textColor = selected ? '#212121' : 'white';
  const border = selected ? '4px solid white' : '3px solid #DDDDDD';
  const opacity = dimmed ? 0.45 : 1;
  const shadow = selected
    ? '0 0 20px rgba(255, 215, 0, 0.8), 0 10px 18px rgba(0, 0, 0, 0.45)'
    : '0 4px 12px rgba(0, 0, 0, 0.3)';

  return L.divIcon({
    className: 'custom-poi-marker',
    html: `<div style="
      background: ${gradient};
      color: ${textColor};
      width: ${size}px;
      height: ${size}px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: bold;
      font-size: ${fontSize}px;
      box-shadow: ${shadow};
      border: ${border};
      opacity: ${opacity};
      transform: scale(${selected ? 1.28 : dimmed ? 0.9 : 1});
      transition: all 220ms ease;
    ">${number}</div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -size / 2],
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
    "><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" xmlns="http://www.w3.org/2000/svg"><path d="M12 21s7-5.5 7-11a7 7 0 1 0-14 0c0 5.5 7 11 7 11Z"/><circle cx="12" cy="10" r="2.5"/></svg></div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -16],
  });
};

// Map component that uses Leaflet
export default function MapComponent({
  onPOISelect,
  pois = [],
  loading = false,
  userLocation = null,
  route = [],
  currentPOIIndex = 0,
  highlightedPOI = null,
  selectedPOIId = null,
  dimNonSelected = false,
  routeTarget = null,
  externalRouteCoords = null,
  destinationPOI = null,
  isRouteAnimating = false,
  initialCenter = null,
  disableAutoLocate = false,
  showUserMarker = true,
  editableLocation = false,
  locationPin = null,
  onLocationPinChange = null,
}) {
  const { t } = useLanguage();
  const [mapCenter, setMapCenter] = useState(initialCenter || { lat: 10.796, lng: 106.749 }); // Vĩnh Khánh, Vietnam
  const [userPos, setUserPos] = useState(null);
  const [routeCoords, setRouteCoords] = useState([]); // Actual route coordinates from OSRM
  const mapRef = useRef(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (initialCenter) {
      setMapCenter(initialCenter);
    }
  }, [initialCenter]);

  useEffect(() => {
    // Keep editor map focused on the current pin so click/drag updates are always visible.
    if (editableLocation && locationPin?.lat && locationPin?.lng) {
      setMapCenter({ lat: locationPin.lat, lng: locationPin.lng });
    }
  }, [editableLocation, locationPin]);

  useEffect(() => {
    if (!userLocation) return;
    setUserPos(userLocation);
    if (!disableAutoLocate) {
      setMapCenter(userLocation);
    }
  }, [userLocation, disableAutoLocate]);

  // Get user location
  useEffect(() => {
    if (disableAutoLocate) {
      if (userLocation) setUserPos(userLocation);
      return;
    }

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
  }, [disableAutoLocate, userLocation]);

  // Backward compatibility: fetch route from OSRM when routeTarget is provided.
  useEffect(() => {
    if (routeTarget && userPos) {
      fetchRouteFromUserToPOI(userPos, routeTarget);
    } else {
      setRouteCoords([]);
    }
  }, [routeTarget, userPos]);

  const activeRouteCoords = externalRouteCoords && externalRouteCoords.length > 1
    ? externalRouteCoords
    : routeCoords;

  const activeDestination = destinationPOI || routeTarget;

  // Fetch route from OSRM (Open Source Routing Machine)
  const fetchRouteFromUserToPOI = async (fromPos, targetPOI) => {
    try {
      // Build coordinates string for OSRM: user(lng,lat);poi(lng,lat)
      const coordinates = `${fromPos.lng},${fromPos.lat};${targetPOI.location.lng},${targetPOI.location.lat}`;

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
      const fallbackCoords = [
        [fromPos.lat, fromPos.lng],
        [targetPOI.location.lat, targetPOI.location.lng],
      ];
      setRouteCoords(fallbackCoords);
    }
  };

  if (loading) return <Loading fullScreen text={t('home_map_loading')} />;

  // Fallback for non-client rendering
  if (!isClient) {
    return (
      <div className="w-full h-full bg-gray-200 flex items-center justify-center rounded-lg">
        <p className="text-gray-500">{t('home_map_loading')}</p>
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
        eventHandlers={
          editableLocation
            ? {
                click: (event) => {
                  const { lat, lng } = event.latlng;
                  onLocationPinChange && onLocationPinChange({ lat, lng });
                },
              }
            : undefined
        }
      >
        <DynamicTileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Route layer */}
        {activeRouteCoords.length > 1 && (
          <DynamicPolyline
            positions={activeRouteCoords}
            pathOptions={{
              color: '#111111',
              weight: 6,
              opacity: 0.95,
              lineCap: 'round',
              lineJoin: 'round',
              className: isRouteAnimating ? 'route-polyline route-polyline-animated' : 'route-polyline',
            }}
          />
        )}

        {activeDestination?.location && (
          <DynamicCircleMarker
            center={[activeDestination.location.lat, activeDestination.location.lng]}
            radius={16}
            pathOptions={{
              color: '#DC3545',
              weight: 3,
              fillColor: '#DC3545',
              fillOpacity: 0.2,
              className: 'route-destination-pulse',
            }}
          />
        )}

        {/* User location marker */}
        {showUserMarker && userPos && (
          <DynamicMarker position={[userPos.lat, userPos.lng]} icon={createUserIcon()}>
            <DynamicPopup>
              <div className="text-center">
                <p className="font-bold">{t('map_your_location')}</p>
              </div>
            </DynamicPopup>
          </DynamicMarker>
        )}

        {/* POI markers */}
        {pois.length > 0 &&
          pois.map((poi, index) => {
            const activePOIId = selectedPOIId || highlightedPOI?.id;
            const isHighlighted = !!activePOIId && activePOIId === poi.id;
            const shouldDim = dimNonSelected && !!activePOIId && activePOIId !== poi.id;
            return (
              <DynamicMarker
                key={`${poi.id}-${isHighlighted ? 'highlighted' : shouldDim ? 'dimmed' : 'default'}`}
                position={[poi.location.lat, poi.location.lng]}
                icon={createPOIIcon(index + 1, { selected: isHighlighted, dimmed: shouldDim })}
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
            );
          })}

        {/* Location picker marker for admin/moderator POI form */}
        {editableLocation && locationPin && (
          <DynamicMarker
            position={[locationPin.lat, locationPin.lng]}
            draggable
            eventHandlers={{
              dragend: (event) => {
                const marker = event.target;
                const next = marker.getLatLng();
                onLocationPinChange && onLocationPinChange({ lat: next.lat, lng: next.lng });
              },
            }}
          >
            <DynamicPopup>
              <div className="text-center">
                <p className="font-bold">Vi tri quan</p>
                <p className="text-sm text-gray-600">Keo marker hoac click map de doi vi tri</p>
              </div>
            </DynamicPopup>
          </DynamicMarker>
        )}

        <DynamicZoomControl position="bottomright" />
      </DynamicMapContainer>
    </div>
  );
}
