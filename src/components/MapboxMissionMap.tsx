import React, { useRef, useEffect, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import MapboxGeocoder from '@mapbox/mapbox-gl-geocoder';
import 'mapbox-gl/dist/mapbox-gl.css';
import '@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css';
import { Coordinates, MissionParameters, Waypoint } from '@/types/mission';
import { useMapboxToken } from '@/hooks/useMapboxToken';
import { MapboxTokenInput } from '@/components/MapboxTokenInput';

interface MapboxMissionMapProps {
  parameters: MissionParameters;
  waypoints: Waypoint[];
  onCenterChange: (center: Coordinates) => void;
  onOrbitStartChange: (location: Coordinates) => void;
  onCorridorPointAdd?: (point: Coordinates) => void;
  onCorridorPointUpdate?: (index: number, point: Coordinates) => void;
  onCorridorPointInsert?: (index: number, point: Coordinates) => void;
  selectedMissionType?: string;
}

export function MapboxMissionMap({ parameters, waypoints, onCenterChange, onOrbitStartChange, onCorridorPointAdd, onCorridorPointUpdate, onCorridorPointInsert, selectedMissionType }: MapboxMissionMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const { token, loading: tokenLoading, error: tokenError, showTokenInput, setManualToken } = useMapboxToken();
  

  useEffect(() => {
    if (!mapContainer.current || !token) return;

    // Set the Mapbox access token
    mapboxgl.accessToken = token;

    // Get user location or default to Madrid
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        initializeMap([longitude, latitude]);
      },
      (error) => {
        console.warn('Could not get user location:', error);
        initializeMap([-3.7038, 40.4168]); // Madrid fallback
      }
    );

    function initializeMap(center: [number, number]) {
      // Inicializar el mapa
      map.current = new mapboxgl.Map({
        container: mapContainer.current!,
        style: 'mapbox://styles/mapbox/satellite-streets-v12',
        center: center,
        zoom: 15,
        pitch: 0,
        bearing: 0
      });

      // Configurar eventos del mapa
      map.current!.on('load', () => {
        setMapLoaded(true);
        
        // Añadir controles de navegación
        map.current?.addControl(new mapboxgl.NavigationControl(), 'top-right');
        
        // Add geocoder for location search with larger size
        const geocoder = new MapboxGeocoder({
          accessToken: mapboxgl.accessToken,
          mapboxgl: mapboxgl,
          placeholder: 'Buscar ubicación...',
          language: 'es'
        });
        
        // Style the geocoder to be larger
        const geocoderContainer = geocoder.onAdd(map.current);
        geocoderContainer.style.width = '300px';
        geocoderContainer.querySelector('.mapboxgl-ctrl-geocoder--input').style.height = '44px';
        geocoderContainer.querySelector('.mapboxgl-ctrl-geocoder--input').style.fontSize = '14px';
        
        map.current?.addControl(geocoder, 'top-left');
        
        // Event listener para clicks en el mapa
        map.current?.on('click', (e) => {
          const { lng, lat } = e.lngLat;
          
          if (selectedMissionType === 'orbita-inteligente') {
            if (!parameters.center) {
              // Primer click establece el centro
              onCenterChange({ lat, lng });
            }
          } else if (selectedMissionType === 'corredor-inteligente' && onCorridorPointAdd) {
            // Para corredor inteligente, cada click agrega un vértice al eje
            const newPoint = { lat, lng };
            onCorridorPointAdd(newPoint);
          }
        });

        // Event listener para clic derecho (salir del modo de edición)
        map.current?.on('contextmenu', (e) => {
          e.preventDefault();
          if (selectedMissionType === 'corredor-inteligente') {
            // Aquí podrías emitir un evento para indicar que se terminó la edición del eje
            console.log('Finalizando edición del eje del corredor');
          }
        });
      });
    }

    return () => {
      map.current?.remove();
    };
  }, [token]);

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

    // Marcadores de puntos del corredor (vértices del eje)
    if (selectedMissionType === 'corredor-inteligente' && parameters.corridorPoints) {
      parameters.corridorPoints.forEach((point, index) => {
        const vertexEl = document.createElement('div');
        vertexEl.className = 'mapbox-marker corridor-vertex';
        
        vertexEl.innerHTML = `
          <div style="
            width: 14px; 
            height: 14px; 
            background-color: #10b981; 
            border: 2px solid white; 
            border-radius: 50%; 
            box-shadow: 0 2px 4px rgba(0,0,0,0.3);
            cursor: grab;
          "></div>
        `;

        const marker = new mapboxgl.Marker(vertexEl, { draggable: true })
          .setLngLat([point.lng, point.lat])
          .setPopup(new mapboxgl.Popup({ offset: 15 }).setHTML(`
            <div style="font-size: 12px;">
              <strong>Vértice ${index + 1}</strong><br/>
              Lat: ${point.lat.toFixed(6)}<br/>
              Lng: ${point.lng.toFixed(6)}
            </div>
          `))
          .addTo(map.current);

        // Handle drag events
        marker.on('dragend', () => {
          const lngLat = marker.getLngLat();
          if (onCorridorPointUpdate) {
            onCorridorPointUpdate(index, { lat: lngLat.lat, lng: lngLat.lng });
          }
        });

        // Add midpoint markers for inserting new vertices
        if (index < parameters.corridorPoints.length - 1) {
          const nextPoint = parameters.corridorPoints[index + 1];
          const midLat = (point.lat + nextPoint.lat) / 2;
          const midLng = (point.lng + nextPoint.lng) / 2;

          const midPointEl = document.createElement('div');
          midPointEl.className = 'mapbox-marker corridor-midpoint';
          midPointEl.innerHTML = `
            <div style="
              width: 8px; 
              height: 8px; 
              background-color: #6b7280; 
              border: 1px solid white; 
              border-radius: 50%; 
              box-shadow: 0 1px 2px rgba(0,0,0,0.3);
              cursor: pointer;
              opacity: 0.7;
            ">
              <div style="
                position: absolute;
                top: -2px;
                left: -2px;
                width: 12px;
                height: 12px;
                background-color: transparent;
                border: 1px dashed #6b7280;
                border-radius: 50%;
              "></div>
            </div>
          `;

          const midMarker = new mapboxgl.Marker(midPointEl)
            .setLngLat([midLng, midLat])
            .addTo(map.current);

          midPointEl.addEventListener('click', (e) => {
            e.stopPropagation();
            if (onCorridorPointInsert) {
              onCorridorPointInsert(index + 1, { lat: midLat, lng: midLng });
            }
          });
        }
      });
    }

    // Marcadores de waypoints (para órbita inteligente)
    if (selectedMissionType === 'orbita-inteligente') {
      waypoints.forEach((waypoint, index) => {
        const waypointEl = document.createElement('div');
        waypointEl.className = 'mapbox-marker';
        
        waypointEl.innerHTML = `
          <div style="
            width: 12px; 
            height: 12px; 
            background-color: #8b5cf6; 
            border: 2px solid white; 
            border-radius: 50%; 
            box-shadow: 0 2px 4px rgba(0,0,0,0.3);
          "></div>
        `;

        new mapboxgl.Marker(waypointEl)
          .setLngLat([waypoint.longitude, waypoint.latitude])
          .setPopup(new mapboxgl.Popup({ offset: 15 }).setHTML(`
            <div style="font-size: 12px;">
              <strong>Waypoint ${index + 1}</strong><br/>
              Lat: ${waypoint.latitude.toFixed(6)}<br/>
              Lng: ${waypoint.longitude.toFixed(6)}<br/>
              Alt: ${waypoint.altitude.toFixed(1)}m<br/>
              Heading: ${waypoint.heading.toFixed(1)}°
            </div>
          `))
          .addTo(map.current);
      });
    }

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


  return (
    <div className="relative w-full h-full">
      {showTokenInput && <MapboxTokenInput onTokenSet={setManualToken} />}
      <div ref={mapContainer} className="w-full h-full" />
      
      {/* Loading indicator */}
      {(tokenLoading || !mapLoaded) && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted/50">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
            <p className="text-sm text-muted-foreground">
              {tokenLoading ? 'Cargando configuración...' : 'Cargando mapa...'}
            </p>
          </div>
        </div>
      )}
      
      {/* Error indicator */}
      {tokenError && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted/50">
          <div className="text-center">
            <p className="text-sm text-destructive mb-2">Error al cargar el mapa</p>
            <p className="text-xs text-muted-foreground">{tokenError}</p>
          </div>
        </div>
      )}
      
      
      {/* Instrucciones overlay - compacto y al lado del geocoder */}
      {selectedMissionType === 'orbita-inteligente' && !parameters.center && (
        <div className="absolute top-4 left-80 bg-white/95 backdrop-blur-sm rounded-lg px-3 py-2 shadow-lg border border-gray-200">
          <p className="text-xs font-medium text-gray-800">
            📍 Haz clic para establecer el centro de la órbita
          </p>
        </div>
      )}
      
      {selectedMissionType === 'corredor-inteligente' && (
        <div className="absolute top-4 left-80 bg-white/95 backdrop-blur-sm rounded-lg p-3 shadow-lg border border-gray-200 max-w-xs">
          <p className="text-xs font-medium text-gray-800">
            📍 Haz clic para definir el eje del corredor inteligente
          </p>
          <p className="text-xs text-gray-600 mt-1">
            Clic derecho para finalizar • Arrastra los vértices para editarlos
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
            <div className="w-3 h-3 bg-violet-500 rounded-full border border-white"></div>
            <span>Waypoint</span>
          </div>
        </div>
        <div className="mt-2 pt-2 border-t border-gray-200 text-xs">
          <div>Waypoints: {waypoints.length}</div>
        </div>
      </div>
    </div>
  );
}