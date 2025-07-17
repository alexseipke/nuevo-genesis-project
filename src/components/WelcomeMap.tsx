import React, { useRef, useEffect, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import { Target } from 'lucide-react';
import 'mapbox-gl/dist/mapbox-gl.css';
import { useMapboxToken } from '@/hooks/useMapboxToken';
import { MapboxTokenInput } from '@/components/MapboxTokenInput';

export function WelcomeMap() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const { token, loading: tokenLoading, error: tokenError, showTokenInput, setManualToken } = useMapboxToken();

  useEffect(() => {
    if (!mapContainer.current || !token) return;

    // Set the Mapbox access token
    mapboxgl.accessToken = token;

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
  }, [token]);

  return (
    <div className="relative w-full h-full">
      {showTokenInput && <MapboxTokenInput onTokenSet={setManualToken} />}
      <div ref={mapContainer} className="absolute inset-0 w-full h-full" />
      
      {/* Overlay con texto de bienvenida */}
      <div className="absolute inset-0 flex items-center justify-center bg-black/30 backdrop-blur-sm">
        <div className="text-center bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-8 shadow-2xl max-w-2xl w-full mx-4 animate-fade-in">
          <div className="flex items-center justify-center gap-8 mb-6">
            <div className="relative inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-primary via-primary-glow to-primary shadow-lg animate-pulse">
              {/* Círculos concéntricos animados */}
              <div className="absolute inset-0 rounded-full border-2 border-white/40 animate-ping"></div>
              <div className="absolute inset-2 rounded-full border-2 border-white/30 animate-ping" style={{ animationDelay: '0.5s' }}></div>
              <div className="absolute inset-4 rounded-full border-2 border-white/20 animate-ping" style={{ animationDelay: '1s' }}></div>
              {/* Icono central - Target con círculos concéntricos */}
              <div className="relative z-10 text-white animate-bounce" style={{ animationDelay: '0.2s' }}>
                <Target size={32} className="animate-pulse" strokeWidth={2.5} />
              </div>
            </div>
            <div className="text-left">
              <h1 className="text-4xl font-bold text-white mb-2 drop-shadow-lg">
                Bienvenido a Planner-Viizor
              </h1>
              <p className="text-xl text-white/90 drop-shadow-md">
                ¡Vuele en el campo y planifique en su escritorio!
              </p>
            </div>
          </div>
          <div className="relative overflow-hidden bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 rounded-lg px-6 py-3 shadow-lg">
            <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 animate-pulse opacity-20"></div>
            <div className="relative z-10 text-base font-semibold text-white">
              ✨ Selecciona un tipo de misión en el panel izquierdo para comenzar ✨
            </div>
            {/* Efecto de brillo que se mueve */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent transform -skew-x-12 animate-[slide_2s_ease-in-out_infinite]" style={{ 
              animation: 'slide 2s ease-in-out infinite',
              animationDelay: '1s'
            }}></div>
          </div>
        </div>
      </div>
      
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
    </div>
  );
}