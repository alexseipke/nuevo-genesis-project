import { Waypoint, MissionParameters } from '@/types/mission';


export function exportToLitchiCSV(waypoints: Waypoint[], parameters: MissionParameters): Blob {
  // Formato específico para Litchi - todas las columnas requeridas
  const headers = [
    'latitude', 'longitude', 'altitude(m)', 'heading', 'curvesize', 
    'rotationdir', 'gimbalpitchmode', 'gimbalpitchangle', 'actiontype', 'actionparam',
    'altitudemode', 'speed(m/s)', 'poi_latitude', 'poi_longitude', 'poi_altitude(m)',
    'poi_altitudemode', 'photo_timeinterval', 'photo_distinterval'
  ];
  
  const rows = [headers.join(',')];
  
  waypoints.forEach((waypoint) => {
    const row = [
      waypoint.latitude.toFixed(7),
      waypoint.longitude.toFixed(7),
      waypoint.altitude.toFixed(1),
      waypoint.heading.toFixed(1),
      waypoint.curveSize.toString(),
      waypoint.rotationDir.toString(),
      waypoint.gimbalMode.toString(),
      waypoint.gimbalPitchAngle.toString(),
      waypoint.actionType1.toString(),
      waypoint.actionParam1.toString(),
      waypoint.altitudeMode.toString(),
      waypoint.speed.toFixed(1),
      waypoint.poiLatitude.toFixed(7),
      waypoint.poiLongitude.toFixed(7),
      waypoint.poiAltitude.toFixed(1),
      waypoint.poiAltitudeMode.toString(),
      waypoint.photoTimeInterval.toString(),
      waypoint.photoDistInterval.toString()
    ];
    rows.push(row.join(','));
  });
  
  const csvContent = rows.join('\n');
  return new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
}