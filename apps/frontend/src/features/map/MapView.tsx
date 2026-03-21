import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import { usePOIs } from '../poi/usePOI'
import { POIDetail } from '../poi/POIDetail'
import 'leaflet/dist/leaflet.css'

export const MapView = () => {
  const { pois } = usePOIs()
  return (
    <MapContainer center={[16.47, 107.6]} zoom={13} style={{ height: '100vh' }}>
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      {pois.map(poi => (
        <Marker key={poi.id} position={[poi.latitude, poi.longitude]}>
          <Popup>
            <POIDetail id={poi.id} />
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  )
}