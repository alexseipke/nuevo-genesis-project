import { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, Polyline, Circle } from 'react-leaflet';
import { LatLngTuple, Map as LeafletMap } from 'leaflet';
import { Coordinates, MissionParameters, Waypoint } from '@/types/mission';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default markers in React Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom icons
const centerIcon = new L.DivIcon({
  html: '<div class="w-4 h-4 bg-mission-blue rounded-full border-2 border-white shadow-lg"></div>',
  className: 'custom-div-icon',
  iconSize: [16, 16],
  iconAnchor: [8, 8],
});

const poiIcon = new L.DivIcon({
  html: '<div class="w-4 h-4 bg-mission-orange rounded-full border-2 border-white shadow-lg"></div>',
  className: 'custom-div-icon',
  iconSize: [16, 16],
  iconAnchor: [8, 8],
});

const waypointIcon = new L.DivIcon({
  html: '<div class="w-2 h-2 bg-mission-green rounded-full border border-white shadow-sm"></div>',
  className: 'custom-div-icon',
  iconSize: [8, 8],
  iconAnchor: [4, 4],
});

const photoWaypointIcon = new L.DivIcon({
  html: '<div class="w-3 h-3 bg-mission-purple rounded-full border border-white shadow-sm relative"><div class="absolute inset-0 bg-mission-purple rounded-full animate-pulse-glow"></div></div>',
  className: 'custom-div-icon',
  iconSize: [12, 12],
  iconAnchor: [6, 6],
});

interface MissionMapProps {
  parameters: MissionParameters;
  waypoints: Waypoint[];
  onCenterChange: (center: Coordinates) => void;
  onPOIChange: (poi: Coordinates) => void;
}

function MapClickHandler({ onCenterChange, onPOIChange, parameters }: {
  onCenterChange: (center: Coordinates) => void;
  onPOIChange: (poi: Coordinates) => void;
  parameters: MissionParameters;
}) {
  useMapEvents({
    click: (e) => {
      const { lat, lng } = e.latlng;
      if (!parameters.center) {
        // First click sets the center
        onCenterChange({ lat, lng });
      } else if (parameters.customPOI && (!parameters.poiLocation || confirm('¿Cambiar la ubicación del POI?'))) {
        // Subsequent clicks set POI if custom POI is enabled
        onPOIChange({ lat, lng });
      }
    },
  });

  return null;
}

export function MissionMap({ parameters, waypoints, onCenterChange, onPOIChange }: MissionMapProps) {
  const mapRef = useRef<LeafletMap>(null);
  const defaultCenter: LatLngTuple = [40.4168, -3.7038]; // Madrid, Spain
  const defaultZoom = 15;

  // Create polyline from waypoints
  const orbitPath: LatLngTuple[] = waypoints.map(wp => [wp.latitude, wp.longitude]);

  // Calculate bounds to fit the mission
  useEffect(() => {
    if (mapRef.current && waypoints.length > 0) {
      const bounds = L.latLngBounds(orbitPath);
      mapRef.current.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [waypoints, orbitPath]);

  return (
    <div className="relative w-full h-full bg-muted rounded-lg overflow-hidden">
      <MapContainer
        ref={mapRef}
        center={parameters.center ? [parameters.center.lat, parameters.center.lng] : defaultCenter}
        zoom={defaultZoom}
        className="w-full h-full"
        zoomControl={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        <MapClickHandler 
          onCenterChange={onCenterChange}
          onPOIChange={onPOIChange}
          parameters={parameters}
        />
        
        {/* Center marker */}
        {parameters.center && (
          <Marker position={[parameters.center.lat, parameters.center.lng]} icon={centerIcon}>
            <Popup>
              <div className="text-sm">
                <strong>Centro de Órbita</strong><br />
                Lat: {parameters.center.lat.toFixed(6)}<br />
                Lng: {parameters.center.lng.toFixed(6)}
              </div>
            </Popup>
          </Marker>
        )}
        
        {/* POI marker */}
        {parameters.customPOI && parameters.poiLocation && (
          <Marker position={[parameters.poiLocation.lat, parameters.poiLocation.lng]} icon={poiIcon}>
            <Popup>
              <div className="text-sm">
                <strong>Point of Interest</strong><br />
                Lat: {parameters.poiLocation.lat.toFixed(6)}<br />
                Lng: {parameters.poiLocation.lng.toFixed(6)}
              </div>
            </Popup>
          </Marker>
        )}
        
        {/* Orbit path */}
        {orbitPath.length > 1 && (
          <Polyline
            positions={orbitPath}
            pathOptions={{
              color: 'hsl(214, 84%, 56%)',
              weight: 3,
              opacity: 0.8,
              dashArray: '5, 5'
            }}
          />
        )}
        
        {/* Initial radius circle */}
        {parameters.center && parameters.initialRadius > 0 && (
          <Circle
            center={[parameters.center.lat, parameters.center.lng]}
            radius={parameters.initialRadius}
            pathOptions={{
              color: 'hsl(214, 84%, 56%)',
              weight: 1,
              opacity: 0.3,
              fillOpacity: 0.05
            }}
          />
        )}
        
        {/* Final radius circle */}
        {parameters.center && parameters.finalRadius > 0 && parameters.finalRadius !== parameters.initialRadius && (
          <Circle
            center={[parameters.center.lat, parameters.center.lng]}
            radius={parameters.finalRadius}
            pathOptions={{
              color: 'hsl(195, 100%, 50%)',
              weight: 1,
              opacity: 0.3,
              fillOpacity: 0.05
            }}
          />
        )}
        
        {/* Waypoint markers */}
        {waypoints.map((waypoint) => (
          <Marker
            key={waypoint.id}
            position={[waypoint.latitude, waypoint.longitude]}
            icon={waypoint.takePhoto ? photoWaypointIcon : waypointIcon}
          >
            <Popup>
              <div className="text-sm">
                <strong>Waypoint {waypoint.id}</strong><br />
                Lat: {waypoint.latitude.toFixed(6)}<br />
                Lng: {waypoint.longitude.toFixed(6)}<br />
                Alt: {waypoint.altitude.toFixed(1)}m<br />
                Heading: {waypoint.heading.toFixed(1)}°<br />
                {waypoint.takePhoto && <span className="text-mission-purple font-semibold">📷 Foto</span>}
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
      
      {/* Map instructions overlay */}
      {!parameters.center && (
        <div className="absolute top-4 left-4 right-4 bg-card/95 backdrop-blur-sm rounded-lg p-4 shadow-lg border border-border">
          <p className="text-sm text-foreground font-medium">
            📍 Haz clic en el mapa para establecer el centro de la órbita
          </p>
        </div>
      )}
      
      {parameters.center && parameters.customPOI && !parameters.poiLocation && (
        <div className="absolute top-4 left-4 right-4 bg-card/95 backdrop-blur-sm rounded-lg p-4 shadow-lg border border-border">
          <p className="text-sm text-foreground font-medium">
            🎯 Haz clic en el mapa para establecer el Point of Interest (POI)
          </p>
        </div>
      )}
      
      {/* Legend */}
      <div className="absolute bottom-4 left-4 bg-card/95 backdrop-blur-sm rounded-lg p-3 shadow-lg border border-border">
        <div className="text-xs font-semibold text-foreground mb-2">Leyenda</div>
        <div className="space-y-1 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-mission-blue rounded-full border border-white"></div>
            <span>Centro de órbita</span>
          </div>
          {parameters.customPOI && (
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-mission-orange rounded-full border border-white"></div>
              <span>Point of Interest</span>
            </div>
          )}
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-mission-green rounded-full border border-white"></div>
            <span>Waypoint</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-mission-purple rounded-full border border-white"></div>
            <span>Waypoint con foto</span>
          </div>
        </div>
      </div>
    </div>
  );
}