import { useState, useEffect } from 'react';
import { MapPin, Target, Camera, Navigation } from 'lucide-react';
import { Coordinates, MissionParameters, Waypoint } from '@/types/mission';

interface WorkingMissionMapProps {
  parameters: MissionParameters;
  waypoints: Waypoint[];
  onCenterChange: (center: Coordinates) => void;
  onPOIChange: (poi: Coordinates) => void;
}

export function WorkingMissionMap({ parameters, waypoints, onCenterChange, onPOIChange }: WorkingMissionMapProps) {
  const [mapCenter, setMapCenter] = useState({ x: 50, y: 50 });
  const [zoom, setZoom] = useState(1);

  const handleMapClick = (event: React.MouseEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;
    
    // Convertir coordenadas de pantalla a lat/lng simuladas (Madrid como centro)
    const lat = 40.4168 + (y - 50) * -0.01; // Invertir Y para lat
    const lng = -3.7038 + (x - 50) * 0.01;
    
    if (!parameters.center) {
      // Primer click establece el centro
      onCenterChange({ lat, lng });
      setMapCenter({ x, y });
    } else if (parameters.customPOI && (!parameters.poiLocation || confirm('¿Cambiar ubicación del POI?'))) {
      // Clicks posteriores establecen POI
      onPOIChange({ lat, lng });
    }
  };

  // Función para convertir lat/lng a coordenadas de pantalla
  const coordsToScreen = (lat: number, lng: number) => {
    const x = 50 + (lng - (-3.7038)) * 100; // Madrid center lng
    const y = 50 - (lat - 40.4168) * 100;   // Madrid center lat, invertir Y
    return { x: Math.max(0, Math.min(100, x)), y: Math.max(0, Math.min(100, y)) };
  };

  // Generar puntos de la espiral en coordenadas de pantalla
  const generateSpiralPath = () => {
    if (!parameters.center || waypoints.length === 0) return [];
    
    return waypoints.map(wp => {
      const screen = coordsToScreen(wp.latitude, wp.longitude);
      return { ...wp, screenX: screen.x, screenY: screen.y };
    });
  };

  const spiralPoints = generateSpiralPath();

  return (
    <div className="relative w-full h-full bg-gradient-to-br from-blue-100 via-green-50 to-blue-50 rounded-lg overflow-hidden border-2 border-blue-200">
      {/* Fondo de mapa estilizado */}
      <div className="absolute inset-0">
        {/* Grid de calles */}
        <svg className="absolute inset-0 w-full h-full opacity-20">
          {[...Array(10)].map((_, i) => (
            <g key={i}>
              <line
                x1={`${i * 10}%`}
                y1="0%"
                x2={`${i * 10}%`}
                y2="100%"
                stroke="#64748b"
                strokeWidth="1"
              />
              <line
                x1="0%"
                y1={`${i * 10}%`}
                x2="100%"
                y2={`${i * 10}%`}
                stroke="#64748b"
                strokeWidth="1"
              />
            </g>
          ))}
        </svg>

        {/* Áreas verdes simuladas */}
        <div className="absolute top-20 left-10 w-20 h-16 bg-green-200 rounded opacity-40"></div>
        <div className="absolute bottom-16 right-12 w-24 h-20 bg-green-200 rounded opacity-40"></div>
        
        {/* Área urbana simulada */}
        <div className="absolute top-1/3 left-1/3 right-1/4 bottom-1/3 bg-gray-200 opacity-30 rounded"></div>
      </div>

      {/* Área clickeable para establecer centro/POI */}
      <div 
        className="absolute inset-0 cursor-crosshair z-10"
        onClick={handleMapClick}
      />

      {/* Círculos de radio si hay centro establecido */}
      {parameters.center && spiralPoints.length > 0 && (
        <svg className="absolute inset-0 w-full h-full pointer-events-none z-20">
          {/* Radio inicial */}
          <circle
            cx={`${mapCenter.x}%`}
            cy={`${mapCenter.y}%`}
            r={`${parameters.initialRadius / 10}%`}
            fill="none"
            stroke="#3b82f6"
            strokeWidth="2"
            strokeOpacity="0.5"
            strokeDasharray="5,5"
          />
          
          {/* Radio final */}
          {parameters.finalRadius !== parameters.initialRadius && (
            <circle
              cx={`${mapCenter.x}%`}
              cy={`${mapCenter.y}%`}
              r={`${parameters.finalRadius / 10}%`}
              fill="none"
              stroke="#06b6d4"
              strokeWidth="2"
              strokeOpacity="0.5"
              strokeDasharray="5,5"
            />
          )}

          {/* Línea de la órbita */}
          {spiralPoints.length > 1 && (
            <polyline
              points={spiralPoints.map(p => `${p.screenX},${p.screenY}`).join(' ')}
              fill="none"
              stroke="#3b82f6"
              strokeWidth="3"
              strokeOpacity="0.8"
              strokeDasharray="8,4"
            />
          )}
        </svg>
      )}

      {/* Centro de órbita */}
      {parameters.center && (
        <div 
          className="absolute w-5 h-5 bg-blue-500 rounded-full border-3 border-white shadow-lg transform -translate-x-1/2 -translate-y-1/2 z-30 flex items-center justify-center"
          style={{ left: `${mapCenter.x}%`, top: `${mapCenter.y}%` }}
        >
          <MapPin className="w-3 h-3 text-white" />
          <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-xs bg-white px-2 py-1 rounded border shadow font-semibold text-blue-700">
            Centro
          </div>
        </div>
      )}

      {/* POI */}
      {parameters.customPOI && parameters.poiLocation && (
        <div 
          className="absolute w-4 h-4 bg-orange-500 rounded-full border-2 border-white shadow-lg transform -translate-x-1/2 -translate-y-1/2 z-30 flex items-center justify-center"
          style={{ 
            left: `${coordsToScreen(parameters.poiLocation.lat, parameters.poiLocation.lng).x}%`, 
            top: `${coordsToScreen(parameters.poiLocation.lat, parameters.poiLocation.lng).y}%` 
          }}
        >
          <Target className="w-2 h-2 text-white" />
          <div className="absolute -bottom-7 left-1/2 transform -translate-x-1/2 text-xs bg-white px-1 py-0.5 rounded border shadow font-semibold text-orange-700">
            POI
          </div>
        </div>
      )}

      {/* Waypoints */}
      {spiralPoints.slice(0, 50).map((point, index) => (
        <div
          key={point.id}
          className={`absolute transform -translate-x-1/2 -translate-y-1/2 z-25 ${
            point.takePhoto 
              ? 'w-3 h-3 bg-purple-500 border-2 border-white rounded-full shadow animate-pulse-glow' 
              : 'w-2 h-2 bg-emerald-500 border border-white rounded-full shadow'
          }`}
          style={{ 
            left: `${point.screenX}%`, 
            top: `${point.screenY}%` 
          }}
          title={`Waypoint ${point.id} - Alt: ${point.altitude.toFixed(1)}m${point.takePhoto ? ' 📷' : ''}`}
        >
          {point.takePhoto && (
            <Camera className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-1.5 h-1.5 text-white" />
          )}
        </div>
      ))}

      {/* Instrucciones overlay */}
      {!parameters.center && (
        <div className="absolute inset-4 flex items-center justify-center z-40">
          <div className="bg-white/95 backdrop-blur-sm rounded-lg p-6 shadow-xl border border-blue-200 text-center max-w-sm">
            <MapPin className="w-8 h-8 text-blue-500 mx-auto mb-3" />
            <h3 className="font-bold text-gray-800 mb-2">Establecer Centro de Órbita</h3>
            <p className="text-sm text-gray-600">
              Haz clic en cualquier punto del mapa para establecer el centro de la órbita del drone
            </p>
            <div className="mt-3 text-xs text-gray-500">
              📍 Madrid, España (simulado)
            </div>
          </div>
        </div>
      )}

      {parameters.center && parameters.customPOI && !parameters.poiLocation && (
        <div className="absolute top-4 left-4 right-4 z-40">
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 shadow-lg">
            <div className="flex items-center gap-2 text-orange-800">
              <Target className="w-4 h-4" />
              <p className="text-sm font-medium">
                Haz clic en el mapa para establecer el Point of Interest (POI)
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Leyenda mejorada */}
      <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur-sm rounded-lg p-4 shadow-xl border border-gray-200 z-40">
        <div className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-2">
          <Navigation className="w-4 h-4" />
          Leyenda
        </div>
        <div className="space-y-2 text-xs">
          <div className="flex items-center gap-3">
            <div className="w-4 h-4 bg-blue-500 rounded-full border-2 border-white shadow"></div>
            <span className="text-gray-700">Centro de órbita</span>
          </div>
          {parameters.customPOI && (
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-orange-500 rounded-full border border-white shadow"></div>
              <span className="text-gray-700">Point of Interest</span>
            </div>
          )}
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 bg-emerald-500 rounded-full border border-white shadow"></div>
            <span className="text-gray-700">Waypoint normal</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 bg-purple-500 rounded-full border border-white shadow"></div>
            <span className="text-gray-700">Waypoint con foto</span>
          </div>
        </div>
        <div className="mt-3 pt-3 border-t border-gray-200 text-xs">
          <div className="font-semibold text-gray-800">
            Waypoints generados: <span className="text-blue-600">{waypoints.length}</span>
          </div>
          {waypoints.length > 50 && (
            <div className="text-orange-600 mt-1">
              (Mostrando primeros 50)
            </div>
          )}
          {waypoints.length > 0 && (
            <div className="text-gray-600 mt-1">
              Fotos: {waypoints.filter(w => w.takePhoto).length}
            </div>
          )}
        </div>
      </div>

      {/* Indicador de zoom y coordenadas */}
      {parameters.center && (
        <div className="absolute top-4 right-4 bg-white/90 rounded-lg p-2 shadow-lg text-xs z-40">
          <div className="font-semibold text-gray-800">Coordenadas</div>
          <div className="text-gray-600">
            Lat: {parameters.center.lat.toFixed(6)}
          </div>
          <div className="text-gray-600">
            Lng: {parameters.center.lng.toFixed(6)}
          </div>
        </div>
      )}
    </div>
  );
}