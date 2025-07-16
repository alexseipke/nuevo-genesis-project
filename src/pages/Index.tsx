import { useState, useEffect } from 'react';
import { Header } from '@/components/Header';
import { ControlPanel } from '@/components/ControlPanel';
import { MissionMap } from '@/components/MissionMap';
import { MissionParameters, Coordinates, Waypoint, ValidationResult } from '@/types/mission';
import { calculateOrbitWaypoints, validateMission, exportToLitchiCSV } from '@/utils/missionCalculations';
import { toast } from 'sonner';

const Index = () => {
  const [parameters, setParameters] = useState<MissionParameters>({
    center: null,
    initialRadius: 50,
    finalRadius: 100,
    initialAltitude: 50,
    finalAltitude: 80,
    rotations: 2,
    imageCount: 20,
    waypointDistance: 10,
    customPOI: false,
    poiLocation: null,
    poiInitialAltitude: 50,
    poiFinalAltitude: 80,
    gimbalMode: 'frontal',
    selectedDrone: 'mavic-3-enterprise'
  });

  const [waypoints, setWaypoints] = useState<Waypoint[]>([]);
  const [validation, setValidation] = useState<ValidationResult>({
    isValid: false,
    warnings: [],
    errors: [],
    suggestions: [],
    waypointCount: 0,
    totalDistance: 0
  });

  const handleParametersChange = (newParams: Partial<MissionParameters>) => {
    setParameters(prev => ({ ...prev, ...newParams }));
  };

  const handleCenterChange = (center: Coordinates) => {
    setParameters(prev => ({ ...prev, center }));
    toast.success('Centro de órbita establecido');
  };

  const handlePOIChange = (poi: Coordinates) => {
    setParameters(prev => ({ ...prev, poiLocation: poi }));
    toast.success('Point of Interest establecido');
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

  const exportMission = () => {
    if (waypoints.length === 0) {
      toast.error('Genera primero una misión');
      return;
    }

    try {
      const csvContent = exportToLitchiCSV(waypoints);
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      
      link.setAttribute('href', url);
      link.setAttribute('download', `viizor_mission_${Date.now()}.csv`);
      link.style.visibility = 'hidden';
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success('Misión exportada exitosamente');
    } catch (error) {
      console.error('Error exporting mission:', error);
      toast.error('Error al exportar la misión');
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
        onExport={exportMission}
        canExport={validation.isValid && waypoints.length > 0}
      />
      
      <div className="flex-1 flex overflow-hidden">
        <ControlPanel
          parameters={parameters}
          onParametersChange={handleParametersChange}
          validation={validation}
          onGenerateMission={generateMission}
        />
        
        <div className="flex-1 p-4">
          <div className="h-full rounded-lg overflow-hidden shadow-mission">
            <MissionMap
              parameters={parameters}
              waypoints={waypoints}
              onCenterChange={handleCenterChange}
              onPOIChange={handlePOIChange}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;