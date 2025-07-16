export interface Coordinates {
  lat: number;
  lng: number;
}

export interface MissionParameters {
  center: Coordinates | null;
  initialRadius: number;
  finalRadius: number;
  initialAltitude: number;
  finalAltitude: number;
  rotations: number;
  startAngle?: number;
  waypointDistance: number;
  flightSpeed: number;
  orbitStartLocation: Coordinates | null;
  targetAltitude?: number;
  selectedDrone: string;
  // Parámetros para Corredor Inteligente
  corridorPoints: Coordinates[];
  corridorWidth?: number;
  frontOverlap?: number;
  sideOverlap?: number;
  corridorAltitude?: number;
}

export interface Waypoint {
  id: number;
  latitude: number;
  longitude: number;
  altitude: number;
  heading: number;
  curveSize: number;
  rotationDir: number;
  gimbalMode: number;
  gimbalPitchAngle: number;
  actionType1: number;
  actionParam1: number;
  altitudeMode: number;
  speed: number;
  poiLatitude: number;
  poiLongitude: number;
  poiAltitude: number;
  poiAltitudeMode: number;
  photoTimeInterval: number;
  photoDistInterval: number;
  takePhoto: boolean;
}

export interface DroneModel {
  id: string;
  name: string;
  maxWaypoints: number;
  maxDistance: number;
  minWaypointDistance: number;
  maxWaypointDistance: number;
  altitudeRange: {
    min: number;
    max: number;
  };
  batteryLife: number; // minutes
  weight: number; // grams
  maxSpeed: number; // m/s
  // FOV datos de cámara
  fovHorizontal: number; // degrees
  fovVertical: number; // degrees
  imageWidth: number; // pixels
  imageHeight: number; // pixels
}

export interface ValidationResult {
  isValid: boolean;
  warnings: string[];
  errors: string[];
  suggestions: string[];
  waypointCount: number;
  totalDistance: number;
  estimatedDuration: number; // minutes
  batteriesRequired: number;
  automaticGimbalAngle: number;
}