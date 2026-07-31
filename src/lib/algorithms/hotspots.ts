import { distanceInMetres } from "./geo";

export interface GeoPoint {
  id: string;
  latitude?: number | null;
  longitude?: number | null;
  category?: string | null;
  ward_number?: number | null;
}

export interface Hotspot {
  centre: { lat: number; lng: number };
  count: number;
  ids: string[];
  dominantCategory: string;
  wardNumber: number | null;
  intensity: number;
}

/**
 * Grid-free greedy spatial clustering (DBSCAN-lite). Groups complaints that sit
 * within `radius` metres of each other and ranks clusters by density.
 */
export function detectHotspots(
  points: GeoPoint[],
  options: { radiusMetres?: number; minPoints?: number } = {},
): Hotspot[] {
  const radius = options.radiusMetres ?? 700;
  const minPoints = options.minPoints ?? 2;
  const valid = points.filter((p) => p.latitude != null && p.longitude != null);
  const visited = new Set<string>();
  const clusters: Hotspot[] = [];

  for (const point of valid) {
    if (visited.has(point.id)) continue;
    const origin = { lat: Number(point.latitude), lng: Number(point.longitude) };
    const members = valid.filter(
      (p) =>
        !visited.has(p.id) &&
        distanceInMetres(origin, { lat: Number(p.latitude), lng: Number(p.longitude) }) <= radius,
    );
    members.forEach((m) => visited.add(m.id));
    if (members.length < minPoints) continue;

    const lat = members.reduce((s, m) => s + Number(m.latitude), 0) / members.length;
    const lng = members.reduce((s, m) => s + Number(m.longitude), 0) / members.length;
    const counts = new Map<string, number>();
    members.forEach((m) => {
      const key = m.category ?? "Other";
      counts.set(key, (counts.get(key) ?? 0) + 1);
    });
    const dominantCategory = [...counts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? "Other";

    clusters.push({
      centre: { lat, lng },
      count: members.length,
      ids: members.map((m) => m.id),
      dominantCategory,
      wardNumber: members[0].ward_number ?? null,
      intensity: Math.min(100, members.length * 18),
    });
  }

  return clusters.sort((a, b) => b.count - a.count);
}
