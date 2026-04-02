/**
 * Haversine distance calculation and geo-filtering utilities.
 * No external dependencies -- pure math.
 */

const EARTH_RADIUS_MILES = 3958.8;

function toRad(deg) {
  return (deg * Math.PI) / 180;
}

/**
 * Calculate the great-circle distance between two lat/lon points.
 * @returns distance in miles
 */
export function haversineDistance(lat1, lon1, lat2, lon2) {
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return EARTH_RADIUS_MILES * c;
}

/**
 * Filter events to those within a given radius of a point.
 * Events without lat/lon are excluded.
 * @param {Array} events
 * @param {number} lat - center latitude
 * @param {number} lon - center longitude
 * @param {number} radiusMiles
 * @returns {Array} filtered events, each decorated with `_distanceMiles`
 */
export function haversineFilter(events, lat, lon, radiusMiles) {
  return events
    .filter((e) => e.lat != null && e.lon != null)
    .map((e) => ({
      ...e,
      _distanceMiles: haversineDistance(lat, lon, e.lat, e.lon),
    }))
    .filter((e) => e._distanceMiles <= radiusMiles)
    .sort((a, b) => a._distanceMiles - b._distanceMiles);
}
