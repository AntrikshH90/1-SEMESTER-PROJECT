export interface Coordinates {
  latitude: number;
  longitude: number;
  altitude: number | null;
  altitudeAccuracy: number | null;
}

export interface Zone {
  id: string;
  name: string;
  subject: string;
  radius: number;
  coordinates: Coordinates;
  useAltitude: boolean;
  heightTolerance: number; // in meters (e.g., +/- 4m for a floor)
}

// Haversine formula to calculate 2D distance in meters
export const calculateDistance = (coord1: Coordinates, coord2: Coordinates): number => {
  const R = 6371e3; // Earth radius in meters
  const lat1 = (coord1.latitude * Math.PI) / 180;
  const lat2 = (coord2.latitude * Math.PI) / 180;
  const deltaLat = ((coord2.latitude - coord1.latitude) * Math.PI) / 180;
  const deltaLon = ((coord2.longitude - coord1.longitude) * Math.PI) / 180;

  const a =
    Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
    Math.cos(lat1) * Math.cos(lat2) *
    Math.sin(deltaLon / 2) * Math.sin(deltaLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // Distance in meters
};

export const isLocationInZone = (current: Coordinates, zone: Zone): boolean => {
  // 1. Check Horizontal Distance
  const distance = calculateDistance(current, zone.coordinates);
  if (distance > zone.radius) {
    return false;
  }

  // 2. Check Vertical Distance (If enabled and data exists)
  if (zone.useAltitude && current.altitude !== null && zone.coordinates.altitude !== null) {
    const verticalDiff = Math.abs(current.altitude - zone.coordinates.altitude);
    if (verticalDiff > zone.heightTolerance) {
      return false; // Wrong floor
    }
  }

  return true;
};