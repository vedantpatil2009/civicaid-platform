import { distanceInMetres } from "./geo";

export interface DuplicateCandidate {
  id: string;
  reference_code?: string | null;
  title: string;
  description?: string | null;
  category: string;
  latitude?: number | null;
  longitude?: number | null;
  created_at: string;
}

export interface DuplicateMatch {
  candidate: DuplicateCandidate;
  similarity: number;
  distance: number | null;
}

const STOP_WORDS = new Set([
  "the","a","an","is","are","in","on","at","of","for","to","and","near","this","that","with","has","have","been","from",
]);

export function tokenize(text: string): Set<string> {
  return new Set(
    text
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, " ")
      .split(/\s+/)
      .filter((w) => w.length > 2 && !STOP_WORDS.has(w)),
  );
}

/** Jaccard similarity between two token sets (0-1). */
export function jaccard(a: Set<string>, b: Set<string>): number {
  if (!a.size || !b.size) return 0;
  let intersection = 0;
  a.forEach((t) => {
    if (b.has(t)) intersection += 1;
  });
  return intersection / (a.size + b.size - intersection);
}

/**
 * Flags likely duplicates using text similarity, category match and geo
 * proximity within the last 30 days.
 */
export function findDuplicateComplaints(
  incoming: { title: string; description: string; category: string; latitude?: number | null; longitude?: number | null },
  existing: DuplicateCandidate[],
  options: { radiusMetres?: number; threshold?: number; windowDays?: number } = {},
): DuplicateMatch[] {
  const radius = options.radiusMetres ?? 300;
  const threshold = options.threshold ?? 0.34;
  const windowMs = (options.windowDays ?? 30) * 86_400_000;
  const incomingTokens = tokenize(`${incoming.title} ${incoming.description}`);
  const now = Date.now();

  return existing
    .filter((c) => now - new Date(c.created_at).getTime() <= windowMs)
    .map<DuplicateMatch>((candidate) => {
      const textScore = jaccard(
        incomingTokens,
        tokenize(`${candidate.title} ${candidate.description ?? ""}`),
      );
      const categoryScore = candidate.category === incoming.category ? 0.2 : 0;

      let distance: number | null = null;
      let geoScore = 0;
      if (
        incoming.latitude != null &&
        incoming.longitude != null &&
        candidate.latitude != null &&
        candidate.longitude != null
      ) {
        distance = distanceInMetres(
          { lat: incoming.latitude, lng: incoming.longitude },
          { lat: Number(candidate.latitude), lng: Number(candidate.longitude) },
        );
        geoScore = distance <= radius ? 0.3 * (1 - distance / radius) : 0;
      }

      return {
        candidate,
        distance,
        similarity: Math.min(1, textScore * 0.6 + categoryScore + geoScore),
      };
    })
    .filter((m) => m.similarity >= threshold)
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, 5);
}