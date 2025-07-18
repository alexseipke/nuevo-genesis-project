import { Coordinates, MissionParameters, Waypoint, ValidationResult, DroneModel } from '@/types/mission';
import { DRONE_MODELS } from '@/data/drones';

// Función para calcular waypoints del corredor inteligente
export function calculateCorridorWaypoints(params: MissionParameters): Waypoint[] {
  if (params.corridorPoints.length < 2) return [];
  
  const waypoints: Waypoint[] = [];
  const { corridorPoints, corridorWidth = 100, frontOverlap = 80, sideOverlap = 60, corridorAltitude = 50, flightSpeed } = params;
  
  // Encontrar el drone seleccionado para obtener datos de cámara
  const drone = DRONE_MODELS.find(d => d.id === params.selectedDrone);
  if (!drone) return [];
  
  // Usar FOV real del drone para calcular cobertura en el suelo
  const fovHorizontal = drone.fovHorizontal * (Math.PI / 180); // convertir a radianes
  const fovVertical = drone.fovVertical * (Math.PI / 180);
  
  // Calcular cobertura en el suelo usando FOV y altura
  const groundCoverageWidth = 2 * corridorAltitude * Math.tan(fovHorizontal / 2);
  const groundCoverageLength = 2 * corridorAltitude * Math.tan(fovVertical / 2);
  
  // Calcular distancias efectivas considerando overlaps
  const effectiveStripWidth = groundCoverageWidth * (1 - sideOverlap / 100);
  const effectivePhotoDistance = groundCoverageLength * (1 - frontOverlap / 100);
  
  // Calcular número de bandas necesarias para cubrir el ancho del corredor
  const numStrips = Math.ceil(corridorWidth / effectiveStripWidth);
  
  // Crear bandas paralelas al eje del corredor con waypoints solo en quiebres
  const strips: Coordinates[][] = [];
  
  for (let stripIndex = 0; stripIndex < numStrips; stripIndex++) {
    // Calcular offset desde el centro del corredor
    const offsetFromCenter = (stripIndex - (numStrips - 1) / 2) * effectiveStripWidth;
    
    // Crear puntos para esta banda - solo en los vértices del corredor
    const stripPoints: Coordinates[] = [];
    
    // Agregar waypoints solo en los puntos de quiebre (vértices del corredor)
    for (let i = 0; i < corridorPoints.length; i++) {
      const point = corridorPoints[i];
      
      // Calcular el bearing promedio para este punto
      let bearing = 0;
      if (i === 0 && corridorPoints.length > 1) {
        // Primer punto: usar bearing hacia el siguiente
        bearing = calculateBearing(point.lat, point.lng, corridorPoints[i + 1].lat, corridorPoints[i + 1].lng);
      } else if (i === corridorPoints.length - 1 && corridorPoints.length > 1) {
        // Último punto: usar bearing del anterior
        bearing = calculateBearing(corridorPoints[i - 1].lat, corridorPoints[i - 1].lng, point.lat, point.lng);
      } else if (corridorPoints.length > 2) {
        // Punto intermedio: promedio de bearing entrante y saliente
        const bearingIn = calculateBearing(corridorPoints[i - 1].lat, corridorPoints[i - 1].lng, point.lat, point.lng);
        const bearingOut = calculateBearing(point.lat, point.lng, corridorPoints[i + 1].lat, corridorPoints[i + 1].lng);
        bearing = (bearingIn + bearingOut) / 2;
      }
      
      const perpendicularBearing = (bearing + 90) % 360;
      
      // Calcular punto con offset perpendicular
      const offsetPoint = moveCoordinate(point.lat, point.lng, perpendicularBearing, offsetFromCenter);
      stripPoints.push(offsetPoint);
    }
    
    strips.push(stripPoints);
  }
  
  // Crear waypoints con patrón serpentine optimizado
  for (let stripIndex = 0; stripIndex < strips.length; stripIndex++) {
    const strip = strips[stripIndex];
    const isEvenStrip = stripIndex % 2 === 0;
    
    // Invertir dirección en bandas impares para crear patrón serpentine
    const orderedPoints = isEvenStrip ? strip : [...strip].reverse();
    
    // Agregar waypoints de conexión entre bandas si es necesario
    if (stripIndex > 0 && waypoints.length > 0) {
      const lastWaypoint = waypoints[waypoints.length - 1];
      const firstPointOfStrip = orderedPoints[0];
      
      // Calcular heading hacia el primer punto de la nueva banda
      const connectionHeading = calculateBearing(
        lastWaypoint.latitude, lastWaypoint.longitude,
        firstPointOfStrip.lat, firstPointOfStrip.lng
      );
      
      // Agregar waypoint de conexión
      const connectionWaypoint: Waypoint = {
        id: waypoints.length + 1,
        latitude: firstPointOfStrip.lat,
        longitude: firstPointOfStrip.lng,
        altitude: corridorAltitude,
        heading: connectionHeading,
        curveSize: 0,
        rotationDir: 0,
        gimbalMode: 0,
        gimbalPitchAngle: -90,
        actionType1: 0, // No tomar foto en conexiones
        actionParam1: 0,
        altitudeMode: 0,
        speed: flightSpeed,
        poiLatitude: firstPointOfStrip.lat,
        poiLongitude: firstPointOfStrip.lng,
        poiAltitude: 0,
        poiAltitudeMode: 0,
        photoTimeInterval: 0,
        photoDistInterval: 0,
        takePhoto: false
      };
      
      waypoints.push(connectionWaypoint);
      
      // Remover el primer punto de orderedPoints ya que lo agregamos como conexión
      orderedPoints.shift();
    }
    
    // Agregar waypoints de la banda actual
    orderedPoints.forEach((point, pointIndex) => {
      // Calcular heading hacia el siguiente punto
      let heading = 0;
      if (pointIndex < orderedPoints.length - 1) {
        const nextPoint = orderedPoints[pointIndex + 1];
        heading = calculateBearing(point.lat, point.lng, nextPoint.lat, nextPoint.lng);
      } else if (stripIndex < strips.length - 1) {
        // Si hay más bandas, calcular heading hacia la próxima banda
        const nextStrip = strips[stripIndex + 1];
        const nextStripOrdered = (stripIndex + 1) % 2 === 0 ? nextStrip : [...nextStrip].reverse();
        if (nextStripOrdered.length > 0) {
          heading = calculateBearing(point.lat, point.lng, nextStripOrdered[0].lat, nextStripOrdered[0].lng);
        }
      } else if (pointIndex > 0) {
        // Para el último punto de la última banda, usar el heading anterior
        const prevPoint = orderedPoints[pointIndex - 1];
        heading = calculateBearing(prevPoint.lat, prevPoint.lng, point.lat, point.lng);
      }
      
      const waypoint: Waypoint = {
        id: waypoints.length + 1,
        latitude: point.lat,
        longitude: point.lng,
        altitude: corridorAltitude,
        heading: heading,
        curveSize: 0,
        rotationDir: 0,
        gimbalMode: 0,
        gimbalPitchAngle: -90, // Cámara hacia abajo
        actionType1: 1, // Tomar foto
        actionParam1: 1,
        altitudeMode: 0,
        speed: flightSpeed,
        poiLatitude: point.lat,
        poiLongitude: point.lng,
        poiAltitude: 0,
        poiAltitudeMode: 0,
        photoTimeInterval: 0,
        photoDistInterval: effectivePhotoDistance,
        takePhoto: true
      };
      
      waypoints.push(waypoint);
    });
  }
  
  return waypoints;
}

// Función para calcular el bearing entre dos puntos
function calculateBearing(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const lat1Rad = lat1 * Math.PI / 180;
  const lat2Rad = lat2 * Math.PI / 180;
  
  const y = Math.sin(dLng) * Math.cos(lat2Rad);
  const x = Math.cos(lat1Rad) * Math.sin(lat2Rad) - Math.sin(lat1Rad) * Math.cos(lat2Rad) * Math.cos(dLng);
  
  let bearing = Math.atan2(y, x) * 180 / Math.PI;
  return (bearing + 360) % 360;
}

// Función para mover una coordenada en una dirección y distancia específica
function moveCoordinate(lat: number, lng: number, bearing: number, distance: number): Coordinates {
  const R = 6371000; // Radio de la Tierra en metros
  const bearingRad = bearing * Math.PI / 180;
  const latRad = lat * Math.PI / 180;
  const lngRad = lng * Math.PI / 180;
  
  const newLatRad = Math.asin(
    Math.sin(latRad) * Math.cos(distance / R) +
    Math.cos(latRad) * Math.sin(distance / R) * Math.cos(bearingRad)
  );
  
  const newLngRad = lngRad + Math.atan2(
    Math.sin(bearingRad) * Math.sin(distance / R) * Math.cos(latRad),
    Math.cos(distance / R) - Math.sin(latRad) * Math.sin(newLatRad)
  );
  
  return {
    lat: newLatRad * 180 / Math.PI,
    lng: newLngRad * 180 / Math.PI
  };
}

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
  
  
  // Ya no manejamos fotos, solo waypoints
  const photoWaypoints = new Set<number>();
  
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
    
    // Ya no tomamos fotos automáticamente
    const takePhoto = false;
    
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