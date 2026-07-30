import { clamp } from "./geo";

export type PriorityLevel = "low" | "medium" | "high" | "critical";

export interface PriorityInput {
  category: string;
  description: string;
  upvotes?: number;
  ageHours?: number;
  nearbySimilarCount?: number;
  hasPhoto?: boolean;
}

/** Category base weights (0-40). */
const CATEGORY_WEIGHT: Record<string, number> = {
  "Water Logging": 38,
  "Water & Sewerage": 32,
  Traffic: 28,
  "Roads & Potholes": 26,
  "Street Lighting": 20,
  "Garbage & Sanitation": 22,
  "Health & Sanitation": 30,
  "Air Pollution": 24,
  Other: 16,
};

const URGENT_KEYWORDS = [
  "accident",
  "fire",
  "collapse",
  "electrocution",
  "live wire",
  "sewage",
  "overflow",
  "flood",
  "injury",
  "injured",
  "child",
  "hospital",
  "danger",
  "emergency",
  "blocked",
  "leak",
];

export interface PriorityResult {
  score: number;
  level: PriorityLevel;
  factors: string[];
}

/**
 * Weighted scoring model: category severity + keyword urgency + civic support
 * (upvotes) + ageing + clustering of similar nearby reports.
 */
export function calculateComplaintPriority(input: PriorityInput): PriorityResult {
  const factors: string[] = [];
  let score = CATEGORY_WEIGHT[input.category] ?? CATEGORY_WEIGHT.Other;
  factors.push(`Category weight ${score}`);

  const text = input.description.toLowerCase();
  const hits = URGENT_KEYWORDS.filter((k) => text.includes(k));
  if (hits.length) {
    const bonus = Math.min(20, hits.length * 7);
    score += bonus;
    factors.push(`Urgency keywords (+${bonus})`);
  }

  const upvotes = input.upvotes ?? 0;
  if (upvotes > 0) {
    const bonus = Math.min(18, Math.round(Math.log2(upvotes + 1) * 4));
    score += bonus;
    factors.push(`Citizen support (+${bonus})`);
  }

  const ageHours = input.ageHours ?? 0;
  if (ageHours > 24) {
    const bonus = Math.min(12, Math.round((ageHours - 24) / 24) * 3);
    score += bonus;
    factors.push(`Ageing SLA (+${bonus})`);
  }

  if (input.nearbySimilarCount && input.nearbySimilarCount > 1) {
    const bonus = Math.min(12, input.nearbySimilarCount * 3);
    score += bonus;
    factors.push(`Repeat area reports (+${bonus})`);
  }

  if (input.hasPhoto) {
    score += 4;
    factors.push("Photo evidence (+4)");
  }

  const final = clamp(Math.round(score));
  return { score: final, level: toLevel(final), factors };
}

export function toLevel(score: number): PriorityLevel {
  if (score >= 75) return "critical";
  if (score >= 55) return "high";
  if (score >= 35) return "medium";
  return "low";
}