import { Coordinates, MissionParameters, Waypoint, ValidationResult, DroneModel } from '@/types/mission';
import { DRONE_MODELS } from '@/data/drones';

export function calculateOrbitWaypoints(params: MissionParameters): Waypoint[] {
  if (!params.center) return [];

  const waypoints: Waypoint[] = [];
  const totalRotations = params.rotations;
  const totalAngle = totalRotations * 2 * Math.PI;
  const startAngle = (params.startAngle || 0) * Math.PI / 180;
  
  // Calcular el número de waypoints basado en la distancia especificada
  // Estimación más precisa de la longitud de la espiral
  const radiusDiff = params.finalRadius - params.initialRadius;
  const avgRadius = (params.initialRadius + params.finalRadius) / 2;
  
  // Longitud de la espiral usando fórmula más precisa
  let totalDistance = 0;
  const steps = 100;
  for (let i = 0; i < steps; i++) {
    const progress = i / steps;
    const radius = params.initialRadius + radiusDiff * progress;
    const angle = totalAngle * progress;
    const nextProgress = (i + 1) / steps;
    const nextRadius = params.initialRadius + radiusDiff * nextProgress;
    const nextAngle = totalAngle * nextProgress;
    
    // Calcular distancia diferencial
    const dr = nextRadius - radius;
    const dTheta = nextAngle - angle;
    const ds = Math.sqrt(dr * dr + (radius * dTheta) * (radius * dTheta));
    totalDistance += ds;
  }
  
  // Find selected drone for waypoint limit
  const drone = DRONE_MODELS.find(d => d.id === params.selectedDrone);
  const maxWaypoints = drone ? drone.maxWaypoints : 99;
  
  // Calculate optimal waypoint distance to not exceed drone limit
  const optimalWaypointDistance = Math.ceil(totalDistance / maxWaypoints);
  // Solo aplicar restricción mínima, permitir valores superiores al recomendado
  const actualWaypointDistance = Math.max(params.waypointDistance, optimalWaypointDistance);
  const actualWaypoints = Math.min(Math.max(2, Math.floor(totalDistance / actualWaypointDistance)), maxWaypoints);
  
  // Calcular incremento angular
  const angleIncrement = totalAngle / actualWaypoints;
  
  // Coordenadas POI (siempre centro por defecto)
  const poiLat = params.center.lat;
  const poiLng = params.center.lng;
  
  
  // Determinar waypoints que tomarán fotos - distribución más uniforme
  const photoWaypoints = new Set<number>();
  if (params.imageCount > 0 && actualWaypoints > 0) {
    if (params.imageCount >= actualWaypoints) {
      // Si se piden más fotos que waypoints, tomar foto en cada waypoint
      for (let i = 0; i < actualWaypoints; i++) {
        photoWaypoints.add(i);
      }
    } else {
      // Distribuir fotos uniformemente a lo largo del recorrido
      for (let i = 0; i < params.imageCount; i++) {
        const waypointIndex = Math.round((i * (actualWaypoints - 1)) / (params.imageCount - 1));
        photoWaypoints.add(waypointIndex);
      }
    }
  }
  
  for (let i = 0; i <= actualWaypoints; i++) {
    const progress = i / actualWaypoints;
    const angle = startAngle + angleIncrement * i;
    
    // Interpolación lineal para radio y altitud
    const radius = params.initialRadius + (params.finalRadius - params.initialRadius) * progress;
    const altitude = params.initialAltitude + (params.finalAltitude - params.initialAltitude) * progress;
    
    // Convertir coordenadas polares a geográficas
    // Corrección por curvatura de la Tierra y proyección
    const deltaLat = (radius / 111000) * Math.cos(angle);
    const deltaLng = (radius / (111000 * Math.cos(params.center.lat * Math.PI / 180))) * Math.sin(angle);
    
    const lat = params.center.lat + deltaLat;
    const lng = params.center.lng + deltaLng;
    
    // Calcular heading (dirección al siguiente waypoint)
    let heading = 0;
    if (i < actualWaypoints) {
      // Heading hacia el siguiente waypoint
      const nextProgress = (i + 1) / actualWaypoints;
      const nextAngle = startAngle + angleIncrement * (i + 1);
      const nextRadius = params.initialRadius + (params.finalRadius - params.initialRadius) * nextProgress;
      const nextDeltaLat = (nextRadius / 111000) * Math.cos(nextAngle);
      const nextDeltaLng = (nextRadius / (111000 * Math.cos(params.center.lat * Math.PI / 180))) * Math.sin(nextAngle);
      const nextLat = params.center.lat + nextDeltaLat;
      const nextLng = params.center.lng + nextDeltaLng;
      
      heading = Math.atan2(nextLng - lng, nextLat - lat) * 180 / Math.PI;
      if (heading < 0) heading += 360;
    }
    
    // Calcular gimbal pitch basado en altura de objetivo
    let gimbalPitch = 0;
    if (params.targetAltitude !== undefined) {
      const horizontalDistance = radius;
      const verticalDistance = altitude - params.targetAltitude;
      gimbalPitch = -Math.atan2(verticalDistance, horizontalDistance) * 180 / Math.PI;
      // Limitar pitch del gimbal a rangos realistas
      gimbalPitch = Math.max(-90, Math.min(30, gimbalPitch));
    }
    
    // Determinar si este waypoint debe tomar foto
    const takePhoto = photoWaypoints.has(i);
    
    const waypoint: Waypoint = {
      id: i + 1,
      latitude: lat,
      longitude: lng,
      altitude: altitude,
      heading: heading,
      curveSize: 0,
      rotationDir: 0,
      gimbalMode: params.targetAltitude !== undefined ? 2 : 0, // 0=free, 2=focus target
      gimbalPitchAngle: gimbalPitch,
      actionType1: takePhoto ? 1 : 0, // 1=take photo
      actionParam1: takePhoto ? 1 : 0,
      altitudeMode: 0, // 0=above sea level
      speed: params.flightSpeed,
      poiLatitude: poiLat,
      poiLongitude: poiLng,
      poiAltitude: params.targetAltitude || 0,
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
    totalDistance: 0,
    estimatedDuration: 0,
    batteriesRequired: 0,
    automaticGimbalAngle: 0
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

  // Calculate estimated duration (flight time only, in seconds)
  const flightTimeSeconds = result.totalDistance / params.flightSpeed; // seconds
  result.estimatedDuration = flightTimeSeconds / 60; // convert to minutes

  // Calculate batteries required
  result.batteriesRequired = Math.ceil(result.estimatedDuration / drone.batteryLife);

  // Calculate automatic gimbal angle for target altitude mode
  if (params.targetAltitude !== undefined && params.center) {
    const avgRadius = (params.initialRadius + params.finalRadius) / 2;
    const avgAltitude = (params.initialAltitude + params.finalAltitude) / 2;
    const verticalDistance = avgAltitude - params.targetAltitude;
    result.automaticGimbalAngle = -Math.atan2(verticalDistance, avgRadius) * 180 / Math.PI;
    result.automaticGimbalAngle = Math.max(-90, Math.min(30, result.automaticGimbalAngle));
  }
  
  // Validate waypoint count and suggest optimal distance
  if (waypoints.length > drone.maxWaypoints) {
    result.errors.push(`Demasiados waypoints: ${waypoints.length}/${drone.maxWaypoints}`);
    const optimalDistance = Math.ceil(result.totalDistance / drone.maxWaypoints);
    result.suggestions.push(`Aumentar distancia entre waypoints a ${optimalDistance}m para no exceder límite del drone`);
    result.isValid = false;
  } else if (waypoints.length > drone.maxWaypoints * 0.8) {
    const optimalDistance = Math.ceil(result.totalDistance / (drone.maxWaypoints * 0.8));
    result.warnings.push(`Cerca del límite de waypoints. Considere aumentar distancia a ${optimalDistance}m para mejor calidad de vuelo`);
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