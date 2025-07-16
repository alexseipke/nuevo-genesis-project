import { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import { LatLngTuple } from 'leaflet';
import { Coordinates, MissionParameters, Waypoint } from '@/types/mission';
import L from 'leaflet';

// Arreglar iconos de Leaflet
const createCustomIcon = (color: string) => {
  return L.divIcon({
    html: `<div style="width: 12px; height: 12px; background-color: ${color}; border: 2px solid white; border-radius: 50%; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>`,
    className: 'custom-marker',
    iconSize: [12, 12],
    iconAnchor: [6, 6],
  });
};

const centerIcon = createCustomIcon('#3b82f6');
const waypointIcon = createCustomIcon('#10b981');

interface SimpleMissionMapProps {
  parameters: MissionParameters;
  waypoints: Waypoint[];
  onCenterChange: (center: Coordinates) => void;
}

function MapClickHandler({ onCenterChange, hasCenterSet }: {
  onCenterChange: (center: Coordinates) => void;
  hasCenterSet: boolean;
}) {
  useMapEvents({
    click: (e) => {
      const { lat, lng } = e.latlng;
      if (!hasCenterSet) {
        onCenterChange({ lat, lng });
      }
    },
  });
  return null;
}

export function SimpleMissionMap({ parameters, waypoints, onCenterChange }: SimpleMissionMapProps) {
  const defaultCenter: LatLngTuple = [40.4168, -3.7038]; // Madrid
  const center = parameters.center ? [parameters.center.lat, parameters.center.lng] as LatLngTuple : defaultCenter;

  return (
    <div className="relative w-full h-full bg-gray-100 rounded-lg overflow-hidden">
      <MapContainer
        center={center}
        zoom={15}
        className="w-full h-full"
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        <MapClickHandler 
          onCenterChange={onCenterChange}
          hasCenterSet={!!parameters.center}
        />
        
        {/* Centro de órbita */}
        {parameters.center && (
          <Marker position={[parameters.center.lat, parameters.center.lng]} icon={centerIcon}>
            <Popup>
              <div>
                <strong>Centro de Órbita</strong><br />
                Lat: {parameters.center.lat.toFixed(6)}<br />
                Lng: {parameters.center.lng.toFixed(6)}
              </div>
            </Popup>
          </Marker>
        )}
        
        {/* Waypoints */}
        {waypoints.slice(0, 20).map((waypoint) => (
          <Marker
            key={waypoint.id}
            position={[waypoint.latitude, waypoint.longitude]}
            icon={waypointIcon}
          >
            <Popup>
              <div>
                <strong>Waypoint {waypoint.id}</strong><br />
                Alt: {waypoint.altitude.toFixed(1)}m<br />
                {waypoint.takePhoto && '📷 Foto'}
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
      
      {/* Instrucciones */}
      {!parameters.center && (
        <div className="absolute top-4 left-4 right-4 bg-white/90 rounded-lg p-3 shadow-lg">
          <p className="text-sm font-medium">
            📍 Haz clic en el mapa para establecer el centro de la órbita
          </p>
        </div>
      )}
      
      {/* Contador de waypoints */}
      <div className="absolute bottom-4 left-4 bg-white/90 rounded-lg p-2 shadow-lg">
        <div className="text-xs">
          <div className="font-semibold">Waypoints: {waypoints.length}</div>
          <div className="text-blue-600">🔵 Centro</div>
          <div className="text-green-600">🟢 Waypoints</div>
        </div>
      </div>
    </div>
  );
}