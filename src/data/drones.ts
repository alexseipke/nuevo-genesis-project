import { DroneModel } from '@/types/mission';

export const DRONE_MODELS: DroneModel[] = [
  {
    id: 'mavic-3-enterprise',
    name: 'DJI Mavic 3 Enterprise',
    maxWaypoints: 99,
    maxDistance: 30000,
    minWaypointDistance: 0.6,
    maxWaypointDistance: 1999,
    altitudeRange: { min: -200, max: 500 },
    batteryLife: 45,
    weight: 915,
    maxSpeed: 15,
    camera: {
      fovH: 84, // Horizontal FOV en grados
      fovV: 63, // Vertical FOV en grados
      sensorWidth: 6.4, // mm
      sensorHeight: 4.8, // mm
      focalLength: 12, // mm
      imageWidth: 4000, // pixels
      imageHeight: 3000 // pixels
    }
  },
  {
    id: 'matrice-300-rtk',
    name: 'DJI Matrice 300 RTK',
    maxWaypoints: 99,
    maxDistance: 30000,
    minWaypointDistance: 0.6,
    maxWaypointDistance: 1999,
    altitudeRange: { min: -200, max: 500 },
    batteryLife: 55,
    weight: 3440,
    maxSpeed: 23,
    camera: {
      fovH: 84,
      fovV: 63,
      sensorWidth: 6.4,
      sensorHeight: 4.8,
      focalLength: 12,
      imageWidth: 4000,
      imageHeight: 3000
    }
  },
  {
    id: 'phantom-4-rtk',
    name: 'DJI Phantom 4 RTK',
    maxWaypoints: 99,
    maxDistance: 30000,
    minWaypointDistance: 0.6,
    maxWaypointDistance: 1999,
    altitudeRange: { min: -200, max: 500 },
    batteryLife: 30,
    weight: 1391,
    maxSpeed: 14,
    camera: {
      fovH: 84,
      fovV: 63,
      sensorWidth: 6.4,
      sensorHeight: 4.8,
      focalLength: 12,
      imageWidth: 4000,
      imageHeight: 3000
    }
  },
  {
    id: 'matrice-350-rtk',
    name: 'DJI Matrice 350 RTK',
    maxWaypoints: 99,
    maxDistance: 30000,
    minWaypointDistance: 0.6,
    maxWaypointDistance: 1999,
    altitudeRange: { min: -200, max: 500 },
    batteryLife: 55,
    weight: 3500,
    maxSpeed: 23,
    camera: {
      fovH: 84,
      fovV: 63,
      sensorWidth: 6.4,
      sensorHeight: 4.8,
      focalLength: 12,
      imageWidth: 4000,
      imageHeight: 3000
    }
  },
  {
    id: 'inspire-2',
    name: 'DJI Inspire 2',
    maxWaypoints: 99,
    maxDistance: 30000,
    minWaypointDistance: 0.6,
    maxWaypointDistance: 1999,
    altitudeRange: { min: -200, max: 500 },
    batteryLife: 27,
    weight: 3440,
    maxSpeed: 26,
    camera: {
      fovH: 84,
      fovV: 63,
      sensorWidth: 6.4,
      sensorHeight: 4.8,
      focalLength: 12,
      imageWidth: 4000,
      imageHeight: 3000
    }
  },
  {
    id: 'ebee-x',
    name: 'senseFly eBee X',
    maxWaypoints: 99,
    maxDistance: 50000,
    minWaypointDistance: 0.6,
    maxWaypointDistance: 1999,
    altitudeRange: { min: -200, max: 500 },
    batteryLife: 90,
    weight: 1600,
    maxSpeed: 15,
    camera: {
      fovH: 62,
      fovV: 47,
      sensorWidth: 23.6,
      sensorHeight: 15.8,
      focalLength: 20,
      imageWidth: 5472,
      imageHeight: 3648
    }
  },
  {
    id: 'mavic-2-pro',
    name: 'DJI Mavic 2 Pro',
    maxWaypoints: 99,
    maxDistance: 30000,
    minWaypointDistance: 0.6,
    maxWaypointDistance: 1999,
    altitudeRange: { min: -200, max: 500 },
    batteryLife: 31,
    weight: 907,
    maxSpeed: 20,
    camera: {
      fovH: 77,
      fovV: 59,
      sensorWidth: 13.2,
      sensorHeight: 8.8,
      focalLength: 28,
      imageWidth: 5472,
      imageHeight: 3648
    }
  },
  {
    id: 'anafi-ai',
    name: 'Parrot Anafi Ai',
    maxWaypoints: 32,
    maxDistance: 4000,
    minWaypointDistance: 0.6,
    maxWaypointDistance: 1999,
    altitudeRange: { min: -200, max: 500 },
    batteryLife: 32,
    weight: 898,
    maxSpeed: 16,
    camera: {
      fovH: 84,
      fovV: 63,
      sensorWidth: 6.4,
      sensorHeight: 4.8,
      focalLength: 26,
      imageWidth: 4000,
      imageHeight: 3000
    }
  },
  {
    id: 'evo-ii-rtk',
    name: 'Autel EVO II RTK',
    maxWaypoints: 99,
    maxDistance: 30000,
    minWaypointDistance: 0.6,
    maxWaypointDistance: 1999,
    altitudeRange: { min: -200, max: 500 },
    batteryLife: 36,
    weight: 1250,
    maxSpeed: 20,
    camera: {
      fovH: 84,
      fovV: 63,
      sensorWidth: 6.4,
      sensorHeight: 4.8,
      focalLength: 28,
      imageWidth: 4000,
      imageHeight: 3000
    }
  },
  {
    id: 'phantom-4-pro',
    name: 'DJI Phantom 4 Pro',
    maxWaypoints: 99,
    maxDistance: 30000,
    minWaypointDistance: 0.6,
    maxWaypointDistance: 1999,
    altitudeRange: { min: -200, max: 500 },
    batteryLife: 28,
    weight: 1388,
    maxSpeed: 20,
    camera: {
      fovH: 84,
      fovV: 63,
      sensorWidth: 6.4,
      sensorHeight: 4.8,
      focalLength: 20,
      imageWidth: 4000,
      imageHeight: 3000
    }
  }
];