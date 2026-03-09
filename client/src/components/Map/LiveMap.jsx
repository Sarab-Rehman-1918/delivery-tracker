// src/components/LiveMap.jsx

import { useEffect, useRef } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'

// Fix broken default marker icons in Leaflet + Vite
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl:       'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl:     'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

// Custom driver icon (truck emoji style)
const driverIcon = new L.DivIcon({
  html: '🚗',
  className: '',
  iconSize: [30, 30],
  iconAnchor: [15, 15],
})

const pickupIcon = new L.DivIcon({
  html: '📦',
  className: '',
  iconSize: [30, 30],
  iconAnchor: [15, 15],
})

const dropIcon = new L.DivIcon({
  html: '🏠',
  className: '',
  iconSize: [30, 30],
  iconAnchor: [15, 15],
})

// Auto-pan map when driver moves
function MapPanner({ position }) {
  const map = useMap()
  useEffect(() => {
    if (position) {
      map.panTo([position.lat, position.lng], { animate: true })
    }
  }, [position])
  return null
}

function LiveMap({ driverLocation, pickupLocation, dropLocation }) {
  // Default center: use driver location or pickup or fallback
  const center = driverLocation
    ? [driverLocation.lat, driverLocation.lng]
    : pickupLocation
    ? [pickupLocation.lat, pickupLocation.lng]
    : [31.5204, 74.3587] // Lahore default

  return (
    <MapContainer
      center={center}
      zoom={14}
      style={{ height: '400px', width: '100%', borderRadius: '10px' }}
    >
      <TileLayer
        attribution='&copy; OpenStreetMap contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {/* Auto-pan to driver */}
      {driverLocation && <MapPanner position={driverLocation} />}

      {/* Driver Marker */}
      {driverLocation && (
        <Marker position={[driverLocation.lat, driverLocation.lng]} icon={driverIcon}>
          <Popup>🚗 Driver is here</Popup>
        </Marker>
      )}

      {/* Pickup Marker */}
      {pickupLocation && (
        <Marker position={[pickupLocation.lat, pickupLocation.lng]} icon={pickupIcon}>
          <Popup>📦 Pickup: {pickupLocation.address}</Popup>
        </Marker>
      )}

      {/* Drop Marker */}
      {dropLocation && (
        <Marker position={[dropLocation.lat, dropLocation.lng]} icon={dropIcon}>
          <Popup>🏠 Drop: {dropLocation.address}</Popup>
        </Marker>
      )}

    </MapContainer>
  )
}

export default LiveMap