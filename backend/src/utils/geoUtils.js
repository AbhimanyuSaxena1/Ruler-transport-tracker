/**
 * Calculates distance between two points in meters using the Haversine formula
 */
export function getDistanceMeters(lat1, lon1, lat2, lon2) {
  const R = 6371000; // Radius of Earth in meters
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}

/**
 * Estimates arrival time in minutes given distance in meters and speed in km/h
 */
export function calculateETAMinutes(distanceMeters, speedKmh = 30) {
  const effectiveSpeed = Math.max(speedKmh, 15); // Fallback to 15 km/h in city traffic
  const speedMetersPerMinute = (effectiveSpeed * 1000) / 60;
  const minutes = Math.ceil(distanceMeters / speedMetersPerMinute);
  return Math.max(minutes, 0);
}
