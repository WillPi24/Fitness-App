import type { RunPoint } from '../store/runStore';

const OSRM_MATCH_URL = 'https://router.project-osrm.org/match/v1/foot/';

function haversine(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const toRad = (d: number) => (d * Math.PI) / 180;
  const R = 6371000;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(a)));
}

function totalRouteDistance(route: RunPoint[]): number {
  let dist = 0;
  for (let i = 1; i < route.length; i++) {
    dist += haversine(route[i - 1].latitude, route[i - 1].longitude, route[i].latitude, route[i].longitude);
  }
  return dist;
}

function totalCoordsDistance(coords: [number, number][]): number {
  let dist = 0;
  for (let i = 1; i < coords.length; i++) {
    dist += haversine(coords[i - 1][1], coords[i - 1][0], coords[i][1], coords[i][0]);
  }
  return dist;
}

// OSRM has a 100-coordinate limit per request, so we batch if needed
const MAX_COORDS_PER_REQUEST = 100;

type OSRMMatchResponse = {
  code: string;
  matchings?: Array<{
    geometry: {
      coordinates: [number, number][];
    };
  }>;
};

function chunkArray<T>(arr: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < arr.length; i += size) {
    chunks.push(arr.slice(i, i + size));
  }
  return chunks;
}

async function matchChunk(points: RunPoint[]): Promise<[number, number][] | null> {
  if (points.length < 2) return null;

  const coords = points.map((p) => `${p.longitude},${p.latitude}`).join(';');
  const timestamps = points.map((p) => Math.round(p.timestamp / 1000)).join(';');
  const radiuses = points.map((p) => {
    const acc = p.accuracy ?? 20;
    return Math.max(5, Math.min(50, Math.round(acc)));
  }).join(';');

  const url = `${OSRM_MATCH_URL}${coords}?timestamps=${timestamps}&radiuses=${radiuses}&geometries=geojson&overview=full`;

  const response = await fetch(url, {
    headers: { 'User-Agent': 'Helm Fitness App/1.0' },
  });

  if (!response.ok) return null;

  const data: OSRMMatchResponse = await response.json();
  if (data.code !== 'Ok' || !data.matchings || data.matchings.length === 0) return null;

  // Combine all matching segments
  const allCoords: [number, number][] = [];
  for (const matching of data.matchings) {
    allCoords.push(...matching.geometry.coordinates);
  }

  return allCoords;
}

export async function snapRouteToRoads(route: RunPoint[]): Promise<RunPoint[] | null> {
  if (route.length < 2) return null;

  try {
    // Chunk the route if it exceeds OSRM's limit
    // Use overlapping chunks so the path is continuous
    const overlap = 5;
    const chunks: RunPoint[][] = [];

    if (route.length <= MAX_COORDS_PER_REQUEST) {
      chunks.push(route);
    } else {
      for (let i = 0; i < route.length; i += MAX_COORDS_PER_REQUEST - overlap) {
        const end = Math.min(i + MAX_COORDS_PER_REQUEST, route.length);
        chunks.push(route.slice(i, end));
        if (end === route.length) break;
      }
    }

    const allSnappedCoords: [number, number][] = [];

    for (let i = 0; i < chunks.length; i++) {
      const snapped = await matchChunk(chunks[i]);
      if (!snapped) return null;

      // Skip overlap points from subsequent chunks to avoid duplicates
      const startIdx = i > 0 ? overlap : 0;
      const coords = i > 0 ? snapped.slice(startIdx) : snapped;
      allSnappedCoords.push(...coords);
    }

    if (allSnappedCoords.length < 2) return null;

    // Sanity check: if snapped distance differs too much from original,
    // OSRM probably forced the route onto wrong roads (e.g. off-road run).
    // In that case, keep the original.
    const originalDist = totalRouteDistance(route);
    const snappedDist = totalCoordsDistance(allSnappedCoords);
    if (originalDist > 0) {
      const ratio = snappedDist / originalDist;
      if (ratio < 0.85 || ratio > 1.15) {
        return null;
      }
    }

    // Convert back to RunPoint format
    // We don't have timestamps for interpolated points, so distribute them evenly
    const startTime = route[0].timestamp;
    const endTime = route[route.length - 1].timestamp;
    const totalDuration = endTime - startTime;

    return allSnappedCoords.map((coord, i) => ({
      longitude: coord[0],
      latitude: coord[1],
      altitude: null,
      accuracy: null,
      speed: null,
      timestamp: startTime + (totalDuration * i) / (allSnappedCoords.length - 1),
    }));
  } catch (error) {
    console.warn('Route snapping failed', error);
    return null;
  }
}
