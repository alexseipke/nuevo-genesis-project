import { useState, useEffect } from 'react';
import { Header } from '@/components/Header';
import { ControlPanel } from '@/components/ControlPanel';
import { MapboxMissionMap } from '@/components/MapboxMissionMap';
import { MissionParameters, Coordinates, Waypoint, ValidationResult } from '@/types/mission';
import { calculateOrbitWaypoints, validateMission } from '@/utils/missionCalculations';
import { exportToKMZ } from '@/utils/kmzExport';
import { exportToLitchiCSV } from '@/utils/csvExport';
import { toast } from 'sonner';

const OrbitaInteligente = () => {
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
    selectedDrone: 'mavic-3-enterprise'
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
    if (waypoints.length === 0) {
      toast.error('Genera primero una misión');
      return;
    }

    try {
      const kmzBlob = await exportToKMZ(waypoints, parameters);
      const link = document.createElement('a');
      const url = URL.createObjectURL(kmzBlob);
      
      link.setAttribute('href', url);
      link.setAttribute('download', `viizor_orbita_${Date.now()}.kmz`);
      link.style.visibility = 'hidden';
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success('Misión KMZ exportada para Google Earth Pro');
    } catch (error) {
      console.error('Error exporting mission:', error);
      toast.error('Error al exportar la misión');
    }
  };

  const exportMissionLitchi = () => {
    if (waypoints.length === 0) {
      toast.error("No hay waypoints para exportar");
      return;
    }

    try {
      const csvBlob = exportToLitchiCSV(waypoints, parameters);
      const url = URL.createObjectURL(csvBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'litchi_orbita_mission.csv';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      toast.success("Misión exportada para Litchi exitosamente");
    } catch (error) {
      console.error('Error exporting to Litchi CSV:', error);
      toast.error("Error al exportar la misión");
    }
  };

  // Auto-generate mission when parameters change (if center is set)
  useEffect(() => {
    if (parameters.center) {
      const newWaypoints = calculateOrbitWaypoints(parameters);
      setWaypoints(newWaypoints);
    }
  }, [parameters]);

  // Validate mission when waypoints change
  useEffect(() => {
    const newValidation = validateMission(parameters, waypoints);
    setValidation(newValidation);
  }, [parameters, waypoints]);

  return (
    <div className="h-screen flex flex-col bg-gradient-sky">
        <Header 
          onExportKMZ={exportMissionKMZ}
          onExportLitchi={exportMissionLitchi}
          canExport={validation.isValid && waypoints.length > 0}
          missionType="Órbita Inteligente"
        />
      
      <div className="flex-1 flex overflow-hidden">
        <ControlPanel
          parameters={parameters}
          onParametersChange={handleParametersChange}
          validation={validation}
        />
        
        <div className="flex-1 p-4">
          <div className="h-full rounded-lg overflow-hidden shadow-mission">
            <MapboxMissionMap
              parameters={parameters}
              waypoints={waypoints}
              onCenterChange={handleCenterChange}
              onOrbitStartChange={handleOrbitStartChange}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrbitaInteligente;