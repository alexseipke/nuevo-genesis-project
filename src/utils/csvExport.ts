import { Waypoint, MissionParameters } from '@/types/mission';


export function exportToLitchiCSV(waypoints: Waypoint[], parameters: MissionParameters): Blob {
  // Formato específico para Litchi - exactamente 10 columnas
  const headers = [
    'latitude', 'longitude', 'altitude(m)', 'heading', 'curvesize', 
    'rotationdir', 'gimbalpitchmode', 'gimbalpitchangle', 'actiontype', 'actionparam'
  ];
  
  const rows = [headers.join(',')];
  
  waypoints.forEach((waypoint) => {
    const row = [
      waypoint.latitude.toFixed(7),
      waypoint.longitude.toFixed(7),
      waypoint.altitude.toFixed(1),
      waypoint.heading.toFixed(1),
      '0', // curvesize
      '0', // rotationdir
      '0', // gimbalpitchmode
      '-90', // gimbalpitchangle (hacia abajo para fotos cenitales)
      waypoint.takePhoto ? '1' : '-1', // actiontype (1 = take photo, -1 = none)
      waypoint.takePhoto ? '0' : '0', // actionparam
    ];
    rows.push(row.join(','));
  });
  
  const csvContent = rows.join('\n');
  return new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
}