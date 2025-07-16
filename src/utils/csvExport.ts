import { Waypoint, MissionParameters } from '@/types/mission';

export function exportToCSV(waypoints: Waypoint[], parameters: MissionParameters): Blob {
  const headers = ['Index', 'Latitude', 'Longitude', 'Altitude', 'Heading', 'Speed', 'TakePhoto'];
  const rows = [headers.join(',')];
  
  waypoints.forEach((waypoint, index) => {
    const row = [
      index + 1,
      waypoint.latitude.toFixed(7),
      waypoint.longitude.toFixed(7),
      waypoint.altitude.toFixed(1),
      waypoint.heading.toFixed(1),
      waypoint.speed.toFixed(1),
      waypoint.takePhoto ? 'YES' : 'NO'
    ];
    rows.push(row.join(','));
  });
  
  const csvContent = rows.join('\n');
  return new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
}

export function exportToLitchiCSV(waypoints: Waypoint[], parameters: MissionParameters): Blob {
  // Formato específico para Litchi
  const headers = [
    'latitude', 'longitude', 'altitude(m)', 'heading(deg)', 'curvesize(m)', 
    'rotationdir', 'gimbalmode', 'gimbalpitchangle', 'actiontype1', 'actionparam1',
    'actiontype2', 'actionparam2', 'actiontype3', 'actionparam3', 'actiontype4',
    'actionparam4', 'actiontype5', 'actionparam5', 'actiontype6', 'actionparam6',
    'actiontype7', 'actionparam7', 'actiontype8', 'actionparam8', 'actiontype9',
    'actionparam9', 'actiontype10', 'actionparam10', 'actiontype11', 'actionparam11',
    'actiontype12', 'actionparam12', 'actiontype13', 'actionparam13', 'actiontype14',
    'actionparam14', 'actiontype15', 'actionparam15'
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
      '0', // gimbalmode
      '-90', // gimbalpitchangle (hacia abajo para fotos cenitales)
      waypoint.takePhoto ? '1' : '-1', // actiontype1 (1 = take photo, -1 = none)
      waypoint.takePhoto ? '0' : '0', // actionparam1
      // Rellenar el resto con valores vacíos
      ...Array(30).fill('')
    ];
    rows.push(row.join(','));
  });
  
  const csvContent = rows.join('\n');
  return new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
}