import React, { useRef, useEffect, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

// API key de Mapbox (mismo que en MapboxMissionMap)
mapboxgl.accessToken = 'pk.eyJ1IjoiYWxleHNlaXBrZSIsImEiOiJjbWQ0dTZucWowa21hMmpxbmt5OTBhdGk3In0.T8W8UWhu81kBytK72KxJ3w';

export function WelcomeMap() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  useEffect(() => {
    if (!mapContainer.current) return;

    // Obtener ubicación del usuario o usar Madrid por defecto
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
        zoom: 12,
        pitch: 45,
        bearing: 0
      });

      // Configurar eventos del mapa
      map.current!.on('load', () => {
        setMapLoaded(true);
        
        // Añadir controles de navegación
        map.current?.addControl(new mapboxgl.NavigationControl(), 'top-right');
        
        // Deshabilitar interacciones para que solo sea visual
        map.current?.scrollZoom.disable();
        map.current?.boxZoom.disable();
        map.current?.dragRotate.disable();
        map.current?.dragPan.disable();
        map.current?.keyboard.disable();
        map.current?.doubleClickZoom.disable();
        map.current?.touchZoomRotate.disable();
        
        // Animación suave de rotación
        const rotateCamera = () => {
          if (!map.current) return;
          
          map.current.rotateTo(map.current.getBearing() + 0.2, {
            duration: 1000,
            easing: (t) => t
          });
        };
        
        // Rotación continua cada segundo
        const rotationInterval = setInterval(rotateCamera, 1000);
        
        // Limpiar intervalo al desmontar
        return () => {
          clearInterval(rotationInterval);
        };
      });
    }

    return () => {
      map.current?.remove();
    };
  }, []);

  return (
    <div className="relative w-full h-full">
      <div ref={mapContainer} className="absolute inset-0 w-full h-full" />
      
      {/* Overlay con texto de bienvenida */}
      <div className="absolute inset-0 flex items-center justify-center bg-black/30 backdrop-blur-sm">
        <div className="text-center bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-8 shadow-2xl max-w-md animate-fade-in">
          <div className="mb-6">
            <div className="relative inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-primary via-primary-glow to-primary mb-4 shadow-lg animate-pulse">
              {/* Círculos concéntricos animados */}
              <div className="absolute inset-0 rounded-full border-2 border-white/40 animate-ping"></div>
              <div className="absolute inset-2 rounded-full border-2 border-white/30 animate-ping" style={{ animationDelay: '0.5s' }}></div>
              <div className="absolute inset-4 rounded-full border-2 border-white/20 animate-ping" style={{ animationDelay: '1s' }}></div>
              {/* Icono central */}
              <div className="relative z-10 text-white text-3xl animate-bounce" style={{ animationDelay: '0.2s' }}>
                🛸
              </div>
            </div>
          </div>
          <h1 className="text-3xl font-bold text-white mb-4 drop-shadow-lg">
            Bienvenido a Planner-Viizor
          </h1>
          <p className="text-xl text-white/90 mb-6 drop-shadow-md">
            ¡Vuele en el campo y planifique en su escritorio!
          </p>
          <div className="text-sm text-white/80 bg-black/20 rounded-lg px-4 py-2 backdrop-blur-sm">
            Selecciona un tipo de misión en el panel izquierdo para comenzar
          </div>
        </div>
      </div>
      
      {/* Loading indicator */}
      {!mapLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted/50">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
            <p className="text-sm text-muted-foreground">Cargando mapa...</p>
          </div>
        </div>
      )}
    </div>
  );
}