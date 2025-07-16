import { useState, useEffect } from 'react';
import { PromoBanner } from '@/components/PromoBanner';
import { ControlPanel } from '@/components/ControlPanel';
import { MapboxMissionMap } from '@/components/MapboxMissionMap';
import { MissionParameters, Coordinates, Waypoint, ValidationResult } from '@/types/mission';
import { calculateOrbitWaypoints, calculateCorridorWaypoints, validateMission } from '@/utils/missionCalculations';
import { exportToKMZ } from '@/utils/kmzExport';
import { exportToLitchiCSV } from '@/utils/csvExport';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { ProjectManager } from '@/components/ProjectManager';
import { Project } from '@/hooks/useProjects';

// Componente de mapa simple sin Leaflet
function SimpleMap({ parameters, waypoints, onCenterChange }: {
  parameters: MissionParameters;
  waypoints: Waypoint[];
  onCenterChange: (center: Coordinates) => void;
}) {
  const handleMapClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (parameters.center) return; // Solo permitir un click
    
    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    // Convertir coordenadas de pantalla a lat/lng simuladas
    const lat = 40.4168 + (y - rect.height/2) * -0.001;
    const lng = -3.7038 + (x - rect.width/2) * 0.001;
    
    onCenterChange({ lat, lng });
  };

  return (
    <div 
      className="relative w-full h-full bg-blue-50 rounded-lg overflow-hidden cursor-crosshair border-2 border-dashed border-blue-300"
      onClick={handleMapClick}
    >
      {/* Fondo de mapa simulado */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-100 to-green-100">
        <div className="absolute inset-0 opacity-20">
          {/* Simular calles */}
          <div className="absolute top-1/4 left-0 right-0 h-0.5 bg-gray-400"></div>
          <div className="absolute top-2/4 left-0 right-0 h-0.5 bg-gray-400"></div>
          <div className="absolute top-3/4 left-0 right-0 h-0.5 bg-gray-400"></div>
          <div className="absolute top-0 bottom-0 left-1/4 w-0.5 bg-gray-400"></div>
          <div className="absolute top-0 bottom-0 left-2/4 w-0.5 bg-gray-400"></div>
          <div className="absolute top-0 bottom-0 left-3/4 w-0.5 bg-gray-400"></div>
        </div>
      </div>

      {/* Centro de órbita */}
      {parameters.center && (
        <div 
          className="absolute w-4 h-4 bg-blue-500 rounded-full border-2 border-white shadow-lg transform -translate-x-1/2 -translate-y-1/2"
          style={{ 
            left: '50%', 
            top: '50%'
          }}
        >
          <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-xs bg-white px-1 rounded border">
            Centro
          </div>
        </div>
      )}

      {/* Waypoints */}
      {waypoints.slice(0, 10).map((waypoint, index) => {
        const angle = (index / waypoints.length) * 2 * Math.PI;
        const radius = 80 + index * 2; // Simular espiral
        const x = 50 + Math.cos(angle) * (radius / 400) * 50;
        const y = 50 + Math.sin(angle) * (radius / 400) * 50;
        
        return (
          <div
            key={waypoint.id}
            className={`absolute w-2 h-2 rounded-full border border-white shadow transform -translate-x-1/2 -translate-y-1/2 ${
              waypoint.takePhoto ? 'bg-purple-500' : 'bg-green-500'
            }`}
            style={{ 
              left: `${x}%`, 
              top: `${y}%`
            }}
          />
        );
      })}

      {/* Instrucciones */}
      {!parameters.center && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="bg-white/90 rounded-lg p-4 shadow-lg text-center">
            <p className="font-medium text-gray-700">📍 Haz clic para establecer el centro de órbita</p>
            <p className="text-sm text-gray-500 mt-1">Simulación de mapa - Madrid, España</p>
          </div>
        </div>
      )}

      {/* Leyenda */}
      <div className="absolute bottom-4 left-4 bg-white/90 rounded-lg p-3 shadow-lg text-xs">
        <div className="font-semibold mb-2">Leyenda</div>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-500 rounded-full border border-white"></div>
            <span>Centro</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full border border-white"></div>
            <span>Waypoint</span>
          </div>
        </div>
        <div className="mt-2 pt-2 border-t border-gray-200">
          <div>Waypoints: {waypoints.length}</div>
        </div>
      </div>
    </div>
  );
}

const Index = () => {
  const { user, canExport } = useAuth();
  const navigate = useNavigate();
  const [selectedMissionType, setSelectedMissionType] = useState<string | null>(null);
  const [parameters, setParameters] = useState<MissionParameters>({
    center: null,
    initialRadius: 50,
    finalRadius: 100,
    initialAltitude: 50,
    finalAltitude: 80,
    rotations: 2,
    waypointDistance: 10,
    flightSpeed: 5,
    orbitStartLocation: null,
    targetAltitude: undefined,
    selectedDrone: 'mavic-3-enterprise',
    // Parámetros para Corredor Inteligente
    corridorPoints: [],
    corridorWidth: 50,
    frontOverlap: 80,
    sideOverlap: 60,
    corridorAltitude: 50,
  });

  const [waypoints, setWaypoints] = useState<Waypoint[]>([]);
  const [validation, setValidation] = useState<ValidationResult>({
    isValid: false,
    warnings: [],
    errors: [],
    suggestions: [],
    waypointCount: 0,
    totalDistance: 0,
    estimatedDuration: 0,
    batteriesRequired: 0,
    automaticGimbalAngle: 0
  });

  const handleParametersChange = (newParams: Partial<MissionParameters>) => {
    setParameters(prev => ({ ...prev, ...newParams }));
  };

  const handleCenterChange = (center: Coordinates) => {
    setParameters(prev => ({ ...prev, center }));
    toast.success('Centro de órbita establecido');
  };

  const handleOrbitStartChange = (location: Coordinates) => {
    setParameters(prev => ({ ...prev, orbitStartLocation: location }));
    toast.success('Punto de inicio orbital establecido');
  };

  const handleCorridorPointAdd = (point: Coordinates) => {
    setParameters(prev => ({ 
      ...prev, 
      corridorPoints: [...prev.corridorPoints, point] 
    }));
    toast.success(`Vértice ${parameters.corridorPoints.length + 1} añadido al eje`);
  };

  const handleCorridorPointUpdate = (index: number, point: Coordinates) => {
    setParameters(prev => {
      const newCorridorPoints = [...prev.corridorPoints];
      newCorridorPoints[index] = point;
      return {
        ...prev,
        corridorPoints: newCorridorPoints
      };
    });
  };

  const handleCorridorPointInsert = (index: number, point: Coordinates) => {
    setParameters(prev => {
      const newCorridorPoints = [...prev.corridorPoints];
      newCorridorPoints.splice(index, 0, point);
      return {
        ...prev,
        corridorPoints: newCorridorPoints
      };
    });
    toast.success('Nuevo vértice insertado');
  };

  const generateMission = () => {
    if (!parameters.center) {
      toast.error('Establece primero el centro de la órbita');
      return;
    }

    const newWaypoints = calculateOrbitWaypoints(parameters);
    setWaypoints(newWaypoints);
    
    if (newWaypoints.length > 0) {
      toast.success(`Misión generada con ${newWaypoints.length} waypoints`);
    } else {
      toast.error('Error al generar la misión');
    }
  };

  const exportMissionKMZ = async () => {
    if (!user) {
      navigate('/auth');
      return;
    }

    if (waypoints.length === 0) {
      toast.error('Genera primero una misión');
      return;
    }

    if (!canExport) {
      toast.error('Has alcanzado el límite de exportaciones gratuitas. Se cobrará $0.25 por esta exportación.');
      // TODO: Implementar lógica de pago
      return;
    }

    try {
      const kmzBlob = await exportToKMZ(waypoints, parameters);
      const link = document.createElement('a');
      const url = URL.createObjectURL(kmzBlob);
      
      link.setAttribute('href', url);
      link.setAttribute('download', `viizor_mission_${Date.now()}.kmz`);
      link.style.visibility = 'hidden';
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success('Misión KMZ exportada para Google Earth Pro');
      // TODO: Incrementar contador de exportaciones
    } catch (error) {
      console.error('Error exporting mission:', error);
      toast.error('Error al exportar la misión');
    }
  };


  const exportMissionLitchi = () => {
    if (!user) {
      navigate('/auth');
      return;
    }

    if (waypoints.length === 0) {
      toast.error("No hay waypoints para exportar");
      return;
    }

    if (!canExport) {
      toast.error('Has alcanzado el límite de exportaciones gratuitas. Se cobrará $0.25 por esta exportación.');
      // TODO: Implementar lógica de pago
      return;
    }

    try {
      const csvBlob = exportToLitchiCSV(waypoints, parameters);
      const url = URL.createObjectURL(csvBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `litchi_${selectedMissionType || 'mission'}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      toast.success("Misión exportada para Litchi exitosamente");
      // TODO: Incrementar contador de exportaciones
    } catch (error) {
      console.error('Error exporting to Litchi CSV:', error);
      toast.error("Error al exportar la misión");
    }
  };

  const handleLoadProject = (project: Project) => {
    setSelectedMissionType(project.mission_type);
    setParameters(project.parameters);
    toast.success(`Proyecto "${project.name}" cargado correctamente`);
  };

  // Auto-generate mission when parameters change
  useEffect(() => {
    if (selectedMissionType === 'orbita-inteligente' && parameters.center) {
      const newWaypoints = calculateOrbitWaypoints(parameters);
      setWaypoints(newWaypoints);
    } else if (selectedMissionType === 'corredor-inteligente' && parameters.corridorPoints.length >= 2 && parameters.corridorAltitude) {
      // Solo generar waypoints cuando el eje esté completo Y se haya definido la altura
      const newWaypoints = calculateCorridorWaypoints(parameters);
      setWaypoints(newWaypoints);
    } else if (selectedMissionType === 'corredor-inteligente' && (parameters.corridorPoints.length < 2 || !parameters.corridorAltitude)) {
      // Limpiar waypoints mientras se dibuja el eje o faltan parámetros
      setWaypoints([]);
    }
  }, [parameters, selectedMissionType]);

  // Validate mission when waypoints change
  useEffect(() => {
    const newValidation = validateMission(parameters, waypoints);
    setValidation(newValidation);
  }, [parameters, waypoints]);

  return (
    <div className="h-screen flex flex-col bg-gradient-sky">
      <PromoBanner 
        onExportKMZ={exportMissionKMZ}
        onExportLitchi={exportMissionLitchi}
        canExport={validation.isValid && waypoints.length > 0 && canExport}
      />
      <div className="flex-1 flex overflow-hidden">
        <div className="space-y-4">
          <ProjectManager
            currentMissionType={selectedMissionType}
            currentParameters={parameters}
            onLoadProject={handleLoadProject}
          />
          <ControlPanel
            parameters={parameters}
            onParametersChange={handleParametersChange}
            validation={validation}
            selectedMissionType={selectedMissionType}
            onMissionTypeSelect={setSelectedMissionType}
            waypoints={waypoints}
          />
        </div>
        
        <div className="flex-1 p-4">
          <div className="h-full rounded-lg overflow-hidden shadow-mission">
            {selectedMissionType ? (
              <MapboxMissionMap
                parameters={parameters}
                waypoints={waypoints}
                onCenterChange={handleCenterChange}
                onOrbitStartChange={handleOrbitStartChange}
                onCorridorPointAdd={handleCorridorPointAdd}
                onCorridorPointUpdate={handleCorridorPointUpdate}
                onCorridorPointInsert={handleCorridorPointInsert}
                selectedMissionType={selectedMissionType}
              />
            ) : (
              <div className="h-full relative rounded-lg overflow-hidden">
                {/* Mapa de fondo */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-100 to-green-100">
                  <div className="absolute inset-0 opacity-20">
                    {/* Simular calles */}
                    <div className="absolute top-1/4 left-0 right-0 h-0.5 bg-gray-400"></div>
                    <div className="absolute top-2/4 left-0 right-0 h-0.5 bg-gray-400"></div>
                    <div className="absolute top-3/4 left-0 right-0 h-0.5 bg-gray-400"></div>
                    <div className="absolute top-0 bottom-0 left-1/4 w-0.5 bg-gray-400"></div>
                    <div className="absolute top-0 bottom-0 left-2/4 w-0.5 bg-gray-400"></div>
                    <div className="absolute top-0 bottom-0 left-3/4 w-0.5 bg-gray-400"></div>
                  </div>
                  
                  {/* Elementos decorativos del mapa */}
                  <div className="absolute top-1/3 left-1/3 w-2 h-2 bg-green-600 rounded-full opacity-60"></div>
                  <div className="absolute top-2/3 right-1/3 w-3 h-3 bg-blue-600 rounded-full opacity-60"></div>
                  <div className="absolute bottom-1/4 left-1/4 w-1 h-1 bg-yellow-600 rounded-full opacity-60"></div>
                  
                  {/* Overlay con texto de bienvenida */}
                  <div className="absolute inset-0 flex items-center justify-center bg-black/10">
                    <div className="text-center bg-white/95 backdrop-blur-sm rounded-xl p-8 shadow-xl max-w-md">
                      <div className="mb-4">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-primary mb-4">
                          <span className="text-white text-2xl">🛸</span>
                        </div>
                      </div>
                      <h1 className="text-2xl font-bold text-foreground mb-3">
                        Bienvenido a Planner-Viizor
                      </h1>
                      <p className="text-lg text-muted-foreground mb-6">
                        ¡Vuele en el campo y planifique en su escritorio!
                      </p>
                      <div className="text-sm text-muted-foreground">
                        Selecciona un tipo de misión en el panel izquierdo para comenzar
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;