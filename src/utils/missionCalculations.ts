import { Coordinates, MissionParameters, Waypoint, ValidationResult, DroneModel } from '@/types/mission';
import { DRONE_MODELS } from '@/data/drones';

export function calculateOrbitWaypoints(params: MissionParameters): Waypoint[] {
  if (!params.center) return [];

  const waypoints: Waypoint[] = [];
  const totalRotations = params.rotations;
  const totalAngle = totalRotations * 2 * Math.PI;
  
  // Calculate total arc length of the spiral
  const avgRadius = (params.initialRadius + params.finalRadius) / 2;
  const approximateDistance = totalAngle * avgRadius;
  
  // Calculate number of waypoints based on distance
  const estimatedWaypoints = Math.floor(approximateDistance / params.waypointDistance);
  const actualWaypoints = Math.min(estimatedWaypoints, 99); // DJI limit
  
  // Calculate angular increment
  const angleIncrement = totalAngle / actualWaypoints;
  
  // POI coordinates (default to center if not custom)
  const poiLat = params.customPOI && params.poiLocation ? params.poiLocation.lat : params.center.lat;
  const poiLng = params.customPOI && params.poiLocation ? params.poiLocation.lng : params.center.lng;
  
  for (let i = 0; i <= actualWaypoints; i++) {
    const progress = i / actualWaypoints;
    const angle = angleIncrement * i;
    
    // Linear interpolation for radius and altitude
    const radius = params.initialRadius + (params.finalRadius - params.initialRadius) * progress;
    const altitude = params.initialAltitude + (params.finalAltitude - params.initialAltitude) * progress;
    
    // Calculate position using polar coordinates
    const lat = params.center.lat + (radius / 111000) * Math.cos(angle); // Rough conversion: 1 degree ≈ 111km
    const lng = params.center.lng + (radius / (111000 * Math.cos(params.center.lat * Math.PI / 180))) * Math.sin(angle);
    
    // Calculate heading (direction to next waypoint or POI)
    let heading = 0;
    if (params.gimbalMode === 'frontal' && i < actualWaypoints) {
      // Calculate heading to next waypoint
      const nextAngle = angleIncrement * (i + 1);
      const nextRadius = params.initialRadius + (params.finalRadius - params.initialRadius) * ((i + 1) / actualWaypoints);
      const nextLat = params.center.lat + (nextRadius / 111000) * Math.cos(nextAngle);
      const nextLng = params.center.lng + (nextRadius / (111000 * Math.cos(params.center.lat * Math.PI / 180))) * Math.sin(nextAngle);
      
      heading = Math.atan2(nextLng - lng, nextLat - lat) * 180 / Math.PI;
      if (heading < 0) heading += 360;
    } else if (params.gimbalMode === 'poi') {
      // Calculate heading towards POI
      heading = Math.atan2(poiLng - lng, poiLat - lat) * 180 / Math.PI;
      if (heading < 0) heading += 360;
    }
    
    // Calculate gimbal pitch for POI mode
    let gimbalPitch = 0;
    if (params.gimbalMode === 'poi') {
      const poiAltitude = params.customPOI 
        ? params.poiInitialAltitude + (params.poiFinalAltitude - params.poiInitialAltitude) * progress
        : altitude; // If POI is at center, use same altitude
      
      const horizontalDistance = radius;
      const verticalDistance = altitude - poiAltitude;
      gimbalPitch = -Math.atan2(verticalDistance, horizontalDistance) * 180 / Math.PI;
    }
    
    // Determine if this waypoint should take a photo
    const takePhoto = params.imageCount > 0 && i % Math.max(1, Math.floor(actualWaypoints / params.imageCount)) === 0;
    
    const waypoint: Waypoint = {
      id: i + 1,
      latitude: lat,
      longitude: lng,
      altitude: altitude,
      heading: heading,
      curveSize: 0,
      rotationDir: 0,
      gimbalMode: params.gimbalMode === 'poi' ? 2 : 0, // 0=free, 2=focus POI
      gimbalPitchAngle: gimbalPitch,
      actionType1: takePhoto ? 1 : 0, // 1=take photo
      actionParam1: takePhoto ? 1 : 0,
      altitudeMode: 0, // 0=above sea level
      speed: 5, // Default speed, configured in Litchi
      poiLatitude: poiLat,
      poiLongitude: poiLng,
      poiAltitude: params.customPOI 
        ? params.poiInitialAltitude + (params.poiFinalAltitude - params.poiInitialAltitude) * progress
        : altitude,
      poiAltitudeMode: 0,
      photoTimeInterval: 0,
      photoDistInterval: 0,
      takePhoto: takePhoto
    };
    
    waypoints.push(waypoint);
  }
  
  return waypoints;
}

export function validateMission(params: MissionParameters, waypoints: Waypoint[]): ValidationResult {
  const result: ValidationResult = {
    isValid: true,
    warnings: [],
    errors: [],
    suggestions: [],
    waypointCount: waypoints.length,
    totalDistance: 0
  };
  
  // Find selected drone
  const drone = DRONE_MODELS.find(d => d.id === params.selectedDrone);
  if (!drone) {
    result.errors.push('No hay drone seleccionado');
    result.isValid = false;
    return result;
  }
  
  // Calculate total distance
  for (let i = 0; i < waypoints.length - 1; i++) {
    const dist = calculateDistance(
      waypoints[i].latitude, waypoints[i].longitude,
      waypoints[i + 1].latitude, waypoints[i + 1].longitude
    );
    result.totalDistance += dist;
  }
  
  // Validate waypoint count
  if (waypoints.length > drone.maxWaypoints) {
    result.errors.push(`Demasiados waypoints: ${waypoints.length}/${drone.maxWaypoints}`);
    result.suggestions.push(`Aumentar distancia entre waypoints a ${Math.ceil(params.waypointDistance * 1.5)}m`);
    result.isValid = false;
  }
  
  // Validate total distance
  if (result.totalDistance > drone.maxDistance) {
    result.errors.push(`Distancia total excede el límite: ${(result.totalDistance/1000).toFixed(1)}km/${drone.maxDistance/1000}km`);
    result.isValid = false;
  }
  
  // Validate waypoint distances
  for (let i = 0; i < waypoints.length - 1; i++) {
    const dist = calculateDistance(
      waypoints[i].latitude, waypoints[i].longitude,
      waypoints[i + 1].latitude, waypoints[i + 1].longitude
    );
    
    if (dist < drone.minWaypointDistance) {
      result.warnings.push(`Distancia entre waypoints muy pequeña: ${dist.toFixed(1)}m (min: ${drone.minWaypointDistance}m)`);
    }
    
    if (dist > drone.maxWaypointDistance) {
      result.errors.push(`Distancia entre waypoints muy grande: ${dist.toFixed(1)}m (max: ${drone.maxWaypointDistance}m)`);
      result.isValid = false;
    }
  }
  
  // Validate altitudes
  waypoints.forEach((wp, index) => {
    if (wp.altitude < drone.altitudeRange.min || wp.altitude > drone.altitudeRange.max) {
      result.errors.push(`Altitud fuera de rango en waypoint ${index + 1}: ${wp.altitude}m (rango: ${drone.altitudeRange.min}-${drone.altitudeRange.max}m)`);
      result.isValid = false;
    }
  });
  
  // Add helpful suggestions
  if (waypoints.length > 80) {
    result.warnings.push('Cerca del límite de waypoints. Considere aumentar la distancia entre waypoints.');
  }
  
  if (result.totalDistance > 25000) {
    result.warnings.push('Misión muy larga. Considere dividir en múltiples misiones.');
  }
  
  return result;
}

export function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371000; // Earth's radius in meters
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLng/2) * Math.sin(dLng/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

export function exportToLitchiCSV(waypoints: Waypoint[]): string {
  const headers = [
    'latitude', 'longitude', 'altitude(m)', 'heading(deg)', 'curvesize(m)',
    'rotationdir', 'gimbalmode', 'gimbalpitchangle', 'actiontype1', 'actionparam1',
    'actiontype2', 'actionparam2', 'actiontype3', 'actionparam3', 'actiontype4', 'actionparam4',
    'actiontype5', 'actionparam5', 'actiontype6', 'actionparam6', 'actiontype7', 'actionparam7',
    'actiontype8', 'actionparam8', 'actiontype9', 'actionparam9', 'actiontype10', 'actionparam10',
    'actiontype11', 'actionparam11', 'actiontype12', 'actionparam12', 'actiontype13', 'actionparam13',
    'actiontype14', 'actionparam14', 'actiontype15', 'actionparam15', 'altitudemode', 'speed(m/s)',
    'poi_latitude', 'poi_longitude', 'poi_altitude(m)', 'poi_altitudemode',
    'photo_timeinterval', 'photo_distinterval'
  ];
  
  let csv = headers.join(',') + '\n';
  
  waypoints.forEach(wp => {
    const row = [
      wp.latitude.toFixed(8),
      wp.longitude.toFixed(8),
      wp.altitude.toFixed(1),
      wp.heading.toFixed(1),
      wp.curveSize,
      wp.rotationDir,
      wp.gimbalMode,
      wp.gimbalPitchAngle.toFixed(1),
      wp.actionType1,
      wp.actionParam1,
      0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, // Empty actions 2-15
      wp.altitudeMode,
      wp.speed,
      wp.poiLatitude.toFixed(8),
      wp.poiLongitude.toFixed(8),
      wp.poiAltitude.toFixed(1),
      wp.poiAltitudeMode,
      wp.photoTimeInterval,
      wp.photoDistInterval
    ];
    csv += row.join(',') + '\n';
  });
  
  return csv;
}