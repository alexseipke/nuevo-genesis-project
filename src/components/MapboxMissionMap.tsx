import React, { useRef, useEffect, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Coordinates, MissionParameters, Waypoint } from '@/types/mission';

// Tu API key de Mapbox
mapboxgl.accessToken = 'pk.eyJ1IjoiYWxleHNlaXBrZSIsImEiOiJjbWQ0dTZucWowa21hMmpxbmt5OTBhdGk3In0.T8W8UWhu81kBytK72KxJ3w';

interface MapboxMissionMapProps {
  parameters: MissionParameters;
  waypoints: Waypoint[];
  onCenterChange: (center: Coordinates) => void;
  onOrbitStartChange: (location: Coordinates) => void;
}

export function MapboxMissionMap({ parameters, waypoints, onCenterChange, onOrbitStartChange }: MapboxMissionMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [is3D, setIs3D] = useState(false);

  useEffect(() => {
    if (!mapContainer.current) return;

    // Inicializar el mapa
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/satellite-streets-v12', // Estilo de satélite para drones
      center: [-3.7038, 40.4168], // Madrid
      zoom: 15,
      pitch: is3D ? 60 : 0,
      bearing: 0
    });

    // Configurar eventos del mapa
    map.current.on('load', () => {
      setMapLoaded(true);
      
      // Añadir controles de navegación
      map.current?.addControl(new mapboxgl.NavigationControl(), 'top-right');
      
      // Event listener para clicks en el mapa
      map.current?.on('click', (e) => {
        const { lng, lat } = e.lngLat;
        
        if (!parameters.center) {
          // Primer click establece el centro
          onCenterChange({ lat, lng });
        } else if (e.originalEvent.ctrlKey || e.originalEvent.metaKey) {
          // Ctrl+Click establece punto de inicio orbital
          onOrbitStartChange({ lat, lng });
        }
      });
    });

    return () => {
      map.current?.remove();
    };
  }, []);

  // Actualizar marcadores cuando cambien los parámetros
  useEffect(() => {
    if (!map.current || !mapLoaded) return;

    // Limpiar marcadores existentes
    const existingMarkers = document.querySelectorAll('.mapbox-marker');
    existingMarkers.forEach(marker => marker.remove());

    // Marcador del centro
    if (parameters.center) {
      const centerEl = document.createElement('div');
      centerEl.className = 'mapbox-marker';
      centerEl.innerHTML = `
        <div style="
          width: 16px; 
          height: 16px; 
          background-color: #3b82f6; 
          border: 3px solid white; 
          border-radius: 50%; 
          box-shadow: 0 2px 4px rgba(0,0,0,0.3);
          cursor: pointer;
        "></div>
      `;

      new mapboxgl.Marker(centerEl)
        .setLngLat([parameters.center.lng, parameters.center.lat])
        .setPopup(new mapboxgl.Popup({ offset: 25 }).setHTML(`
          <div>
            <strong>Centro de Órbita</strong><br/>
            Lat: ${parameters.center.lat.toFixed(6)}<br/>
            Lng: ${parameters.center.lng.toFixed(6)}
          </div>
        `))
        .addTo(map.current);

      // Solo centrar el mapa suavemente la primera vez, manteniendo el zoom actual
      const currentCenter = map.current.getCenter();
      const distance = Math.abs(currentCenter.lng - parameters.center.lng) + Math.abs(currentCenter.lat - parameters.center.lat);
      
      // Solo hacer pan si la distancia es significativa (evitar movimientos innecesarios)
      if (distance > 0.01) {
        map.current.panTo([parameters.center.lng, parameters.center.lat]);
      }
    }

    // Marcador del punto de inicio orbital
    if (parameters.orbitStartLocation) {
      const startEl = document.createElement('div');
      startEl.className = 'mapbox-marker';
      startEl.innerHTML = `
        <div style="
          width: 14px; 
          height: 14px; 
          background-color: #dc2626; 
          border: 2px solid white; 
          border-radius: 50%; 
          box-shadow: 0 2px 4px rgba(0,0,0,0.3);
        "></div>
      `;

      new mapboxgl.Marker(startEl)
        .setLngLat([parameters.orbitStartLocation.lng, parameters.orbitStartLocation.lat])
        .setPopup(new mapboxgl.Popup({ offset: 25 }).setHTML(`
          <div>
            <strong>Punto de Inicio Orbital</strong><br/>
            Lat: ${parameters.orbitStartLocation.lat.toFixed(6)}<br/>
            Lng: ${parameters.orbitStartLocation.lng.toFixed(6)}
          </div>
        `))
        .addTo(map.current);
    }

    // Marcadores de waypoints - mostrar todos
    waypoints.forEach((waypoint, index) => {
      const waypointEl = document.createElement('div');
      waypointEl.className = 'mapbox-marker';
      
      if (waypoint.takePhoto) {
        waypointEl.innerHTML = `
          <div style="
            width: 12px; 
            height: 12px; 
            position: relative;
          ">
            <div style="
              width: 10px; 
              height: 10px; 
              background-color: #a855f7; 
              border: 1px solid white; 
              border-radius: 50%; 
              box-shadow: 0 1px 2px rgba(0,0,0,0.2);
            "></div>
            <div style="
              position: absolute;
              top: -2px;
              left: 50%;
              transform: translateX(-50%);
              width: 0;
              height: 0;
              border-left: 2px solid transparent;
              border-right: 2px solid transparent;
              border-bottom: 4px solid #a855f7;
            "></div>
          </div>
        `;
      } else {
        waypointEl.innerHTML = `
          <div style="
            width: 8px; 
            height: 8px; 
            background-color: #10b981; 
            border: 1px solid white; 
            border-radius: 50%; 
            box-shadow: 0 1px 2px rgba(0,0,0,0.2);
          "></div>
        `;
      }

      new mapboxgl.Marker(waypointEl)
        .setLngLat([waypoint.longitude, waypoint.latitude])
        .setPopup(new mapboxgl.Popup({ offset: 15 }).setHTML(`
          <div style="font-size: 12px;">
            <strong>Waypoint ${waypoint.id}</strong><br/>
            Lat: ${waypoint.latitude.toFixed(6)}<br/>
            Lng: ${waypoint.longitude.toFixed(6)}<br/>
            Alt: ${waypoint.altitude.toFixed(1)}m<br/>
            Heading: ${waypoint.heading.toFixed(1)}°<br/>
            ${waypoint.takePhoto ? '<span style="color: #a855f7;">📷 Foto</span>' : ''}
          </div>
        `))
        .addTo(map.current);
    });

    // Dibujar línea de la órbita
    if (waypoints.length > 1) {
      const coordinates = waypoints.map(wp => [wp.longitude, wp.latitude]);
      
      if (map.current.getSource('orbit-line')) {
        (map.current.getSource('orbit-line') as mapboxgl.GeoJSONSource).setData({
          type: 'Feature',
          properties: {},
          geometry: {
            type: 'LineString',
            coordinates: coordinates
          }
        });
      } else {
        map.current.addSource('orbit-line', {
          type: 'geojson',
          data: {
            type: 'Feature',
            properties: {},
            geometry: {
              type: 'LineString',
              coordinates: coordinates
            }
          }
        });

        map.current.addLayer({
          id: 'orbit-line',
          type: 'line',
          source: 'orbit-line',
          layout: {
            'line-join': 'round',
            'line-cap': 'round'
          },
          paint: {
            'line-color': '#3b82f6',
            'line-width': 3,
            'line-opacity': 0.8,
            'line-dasharray': [2, 2]
          }
        });
      }
    }

  }, [parameters, waypoints, mapLoaded]);

  const toggle3D = () => {
    if (map.current) {
      const newIs3D = !is3D;
      setIs3D(newIs3D);
      
      if (newIs3D) {
        map.current.easeTo({ pitch: 60 });
      } else {
        map.current.easeTo({ pitch: 0 });
      }
    }
  };

  return (
    <div className="relative w-full h-full">
      <div ref={mapContainer} className="w-full h-full" />
      
      {/* Control 3D */}
      <div className="absolute top-4 right-4">
        <button
          onClick={toggle3D}
          className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
            is3D 
              ? 'bg-blue-500 text-white' 
              : 'bg-white text-gray-700 border border-gray-300'
          }`}
        >
          {is3D ? '3D ON' : '3D OFF'}
        </button>
      </div>
      
      {/* Instrucciones overlay */}
      {!parameters.center && (
        <div className="absolute top-4 left-4 right-4 bg-white/95 backdrop-blur-sm rounded-lg p-4 shadow-lg border border-gray-200">
          <p className="text-sm font-medium text-gray-800">
            📍 Haz clic en el mapa para establecer el centro de la órbita
          </p>
        </div>
      )}
      
      {parameters.center && !parameters.orbitStartLocation && (
        <div className="absolute top-4 left-4 right-4 bg-white/95 backdrop-blur-sm rounded-lg p-4 shadow-lg border border-gray-200">
          <p className="text-sm font-medium text-gray-800">
            🎯 Mantén presionado Ctrl + Clic en el mapa para establecer el punto de inicio orbital
          </p>
        </div>
      )}

      {/* Leyenda */}
      <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur-sm rounded-lg p-3 shadow-lg border border-gray-200">
        <div className="text-xs font-semibold text-gray-800 mb-2">Leyenda</div>
        <div className="space-y-1 text-xs text-gray-700">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-500 rounded-full border border-white"></div>
            <span>Centro de Órbita</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-600 rounded-full border border-white"></div>
            <span>Inicio Orbital</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-emerald-500 rounded-full border border-white"></div>
            <span>Waypoint</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <div className="w-2 h-2 bg-purple-500 rounded-full border border-white"></div>
              <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l border-r border-b-2 border-transparent border-b-purple-500"></div>
            </div>
            <span>Foto</span>
          </div>
        </div>
        <div className="mt-2 pt-2 border-t border-gray-200 text-xs">
          <div>Waypoints: {waypoints.length}</div>
        </div>
      </div>
    </div>
  );
}