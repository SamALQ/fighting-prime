/**
 * Single source of truth for the FPA leveling / tier / gamification system.
 *
 * Every UI surface imports from here — never duplicate tier names, colors,
 * or level math anywhere else in the codebase.
 */

/* ------------------------------------------------------------------ */
/*  Level Lookup Table                                                 */
/*  Levels 0-200 from the original Airtable design.                    */
/*  Beyond 200 the cost stays flat at 1000 pts/level.                  */
/* ------------------------------------------------------------------ */

interface LevelEntry {
  level: number;
  pointsToLevel: number;
  totalPoints: number;
}

const LEVEL_TABLE: LevelEntry[] = [
  { level: 0, pointsToLevel: 0, totalPoints: 0 },
  { level: 1, pointsToLevel: 10, totalPoints: 10 },
  { level: 2, pointsToLevel: 10, totalPoints: 20 },
  { level: 3, pointsToLevel: 11, totalPoints: 31 },
  { level: 4, pointsToLevel: 11, totalPoints: 42 },
  { level: 5, pointsToLevel: 12, totalPoints: 54 },
  { level: 6, pointsToLevel: 13, totalPoints: 67 },
  { level: 7, pointsToLevel: 13, totalPoints: 80 },
  { level: 8, pointsToLevel: 14, totalPoints: 94 },
  { level: 9, pointsToLevel: 15, totalPoints: 109 },
  { level: 10, pointsToLevel: 15, totalPoints: 124 },
  { level: 11, pointsToLevel: 16, totalPoints: 140 },
  { level: 12, pointsToLevel: 17, totalPoints: 157 },
  { level: 13, pointsToLevel: 17, totalPoints: 174 },
  { level: 14, pointsToLevel: 18, totalPoints: 192 },
  { level: 15, pointsToLevel: 19, totalPoints: 211 },
  { level: 16, pointsToLevel: 20, totalPoints: 231 },
  { level: 17, pointsToLevel: 21, totalPoints: 252 },
  { level: 18, pointsToLevel: 22, totalPoints: 274 },
  { level: 19, pointsToLevel: 23, totalPoints: 297 },
  { level: 20, pointsToLevel: 24, totalPoints: 321 },
  { level: 21, pointsToLevel: 25, totalPoints: 346 },
  { level: 22, pointsToLevel: 27, totalPoints: 373 },
  { level: 23, pointsToLevel: 28, totalPoints: 401 },
  { level: 24, pointsToLevel: 29, totalPoints: 430 },
  { level: 25, pointsToLevel: 31, totalPoints: 461 },
  { level: 26, pointsToLevel: 32, totalPoints: 493 },
  { level: 27, pointsToLevel: 34, totalPoints: 527 },
  { level: 28, pointsToLevel: 35, totalPoints: 562 },
  { level: 29, pointsToLevel: 37, totalPoints: 599 },
  { level: 30, pointsToLevel: 39, totalPoints: 638 },
  { level: 31, pointsToLevel: 40, totalPoints: 678 },
  { level: 32, pointsToLevel: 42, totalPoints: 720 },
  { level: 33, pointsToLevel: 44, totalPoints: 764 },
  { level: 34, pointsToLevel: 46, totalPoints: 810 },
  { level: 35, pointsToLevel: 49, totalPoints: 859 },
  { level: 36, pointsToLevel: 51, totalPoints: 910 },
  { level: 37, pointsToLevel: 53, totalPoints: 963 },
  { level: 38, pointsToLevel: 56, totalPoints: 1019 },
  { level: 39, pointsToLevel: 59, totalPoints: 1078 },
  { level: 40, pointsToLevel: 61, totalPoints: 1139 },
  { level: 41, pointsToLevel: 64, totalPoints: 1203 },
  { level: 42, pointsToLevel: 67, totalPoints: 1270 },
  { level: 43, pointsToLevel: 71, totalPoints: 1341 },
  { level: 44, pointsToLevel: 74, totalPoints: 1415 },
  { level: 45, pointsToLevel: 77, totalPoints: 1492 },
  { level: 46, pointsToLevel: 81, totalPoints: 1573 },
  { level: 47, pointsToLevel: 85, totalPoints: 1658 },
  { level: 48, pointsToLevel: 89, totalPoints: 1747 },
  { level: 49, pointsToLevel: 93, totalPoints: 1840 },
  { level: 50, pointsToLevel: 98, totalPoints: 1938 },
  { level: 51, pointsToLevel: 102, totalPoints: 2040 },
  { level: 52, pointsToLevel: 107, totalPoints: 2147 },
  { level: 53, pointsToLevel: 112, totalPoints: 2259 },
  { level: 54, pointsToLevel: 118, totalPoints: 2377 },
  { level: 55, pointsToLevel: 123, totalPoints: 2500 },
  { level: 56, pointsToLevel: 129, totalPoints: 2629 },
  { level: 57, pointsToLevel: 135, totalPoints: 2764 },
  { level: 58, pointsToLevel: 142, totalPoints: 2906 },
  { level: 59, pointsToLevel: 148, totalPoints: 3054 },
  { level: 60, pointsToLevel: 156, totalPoints: 3210 },
  { level: 61, pointsToLevel: 163, totalPoints: 3373 },
  { level: 62, pointsToLevel: 171, totalPoints: 3544 },
  { level: 63, pointsToLevel: 179, totalPoints: 3723 },
  { level: 64, pointsToLevel: 187, totalPoints: 3910 },
  { level: 65, pointsToLevel: 196, totalPoints: 4106 },
  { level: 66, pointsToLevel: 206, totalPoints: 4312 },
  { level: 67, pointsToLevel: 215, totalPoints: 4527 },
  { level: 68, pointsToLevel: 226, totalPoints: 4753 },
  { level: 69, pointsToLevel: 236, totalPoints: 4989 },
  { level: 70, pointsToLevel: 248, totalPoints: 5237 },
  { level: 71, pointsToLevel: 260, totalPoints: 5497 },
  { level: 72, pointsToLevel: 272, totalPoints: 5769 },
  { level: 73, pointsToLevel: 285, totalPoints: 6054 },
  { level: 74, pointsToLevel: 298, totalPoints: 6352 },
  { level: 75, pointsToLevel: 313, totalPoints: 6665 },
  { level: 76, pointsToLevel: 327, totalPoints: 6992 },
  { level: 77, pointsToLevel: 343, totalPoints: 7335 },
  { level: 78, pointsToLevel: 359, totalPoints: 7694 },
  { level: 79, pointsToLevel: 376, totalPoints: 8070 },
  { level: 80, pointsToLevel: 394, totalPoints: 8464 },
  { level: 81, pointsToLevel: 413, totalPoints: 8877 },
  { level: 82, pointsToLevel: 433, totalPoints: 9310 },
  { level: 83, pointsToLevel: 453, totalPoints: 9763 },
  { level: 84, pointsToLevel: 475, totalPoints: 10238 },
  { level: 85, pointsToLevel: 498, totalPoints: 10736 },
  { level: 86, pointsToLevel: 521, totalPoints: 11257 },
  { level: 87, pointsToLevel: 546, totalPoints: 11803 },
  { level: 88, pointsToLevel: 572, totalPoints: 12375 },
  { level: 89, pointsToLevel: 599, totalPoints: 12974 },
  { level: 90, pointsToLevel: 628, totalPoints: 13602 },
  { level: 91, pointsToLevel: 658, totalPoints: 14260 },
  { level: 92, pointsToLevel: 689, totalPoints: 14949 },
  { level: 93, pointsToLevel: 722, totalPoints: 15671 },
  { level: 94, pointsToLevel: 756, totalPoints: 16427 },
  { level: 95, pointsToLevel: 792, totalPoints: 17219 },
  { level: 96, pointsToLevel: 830, totalPoints: 18049 },
  { level: 97, pointsToLevel: 870, totalPoints: 18919 },
  { level: 98, pointsToLevel: 911, totalPoints: 19830 },
  { level: 99, pointsToLevel: 955, totalPoints: 20785 },
  { level: 100, pointsToLevel: 1000, totalPoints: 21785 },
];

const POST_TABLE_LEVEL = 100;
const POST_TABLE_TOTAL = 21785;
const POST_TABLE_COST = 1000;

/* ------------------------------------------------------------------ */
/*  Tier Definitions                                                   */
/* ------------------------------------------------------------------ */

export interface Tier {
  name: string;
  slug: string;
  minLevel: number;
  color: string;
  bgColor: string;
  rewardDescription: string;
}

export const TIERS: Tier[] = [
  { name: "Iron",      slug: "iron",      minLevel: 0,   color: "#ababab", bgColor: "hsla(0,0%,17%,1)",                     rewardDescription: "Welcome to Fighting Prime. Begin your journey." },
  { name: "Silver",    slug: "silver",    minLevel: 10,  color: "#d9f6ff", bgColor: "hsla(194,12%,38%,1)",                  rewardDescription: "Silver badge on your profile. Access to exclusive discussions." },
  { name: "Gold",      slug: "gold",      minLevel: 50,  color: "#ffa90a", bgColor: "hsla(45,83%,10%,1)",                   rewardDescription: "Gold badge. Free month of Athlete Pro." },
  { name: "Platinum",  slug: "platinum",  minLevel: 100, color: "#cac0ff", bgColor: "hsla(250,18%,33%,1)",                  rewardDescription: "Platinum badge. Priority access to new course releases." },
  { name: "Diamond",   slug: "diamond",   minLevel: 130, color: "#a7cdff", bgColor: "hsla(182,100%,24%,1)",                 rewardDescription: "Diamond badge. Free Fighter Elite analysis from a chosen instructor." },
  { name: "Lightning", slug: "lightning", minLevel: 165, color: "#ffa03b", bgColor: "hsla(216,100%,15%,1)",                 rewardDescription: "Lightning badge. Exclusive live session access." },
  { name: "Obsidian",  slug: "obsidian",  minLevel: 200, color: "#660fc3", bgColor: "hsla(269,100%,8%,1)",                  rewardDescription: "Obsidian badge. One-on-one session with an instructor." },
  { name: "Meteorite", slug: "meteorite", minLevel: 230, color: "#06d65d", bgColor: "hsla(145,100%,6%,1)",                  rewardDescription: "Meteorite badge. Hall of Fame status. Custom training regimen." },
  { name: "Cosmic",    slug: "cosmic",    minLevel: 265, color: "#ff3366", bgColor: "hsla(345,100%,5%,1)",                  rewardDescription: "Cosmic badge. Legendary status. Lifetime perks unlocked." },
];

/* ------------------------------------------------------------------ */
/*  Level Helpers                                                      */
/* ------------------------------------------------------------------ */

/** Given total points, return the current level (0+). Uses binary search on the table. */
export function getLevelFromPoints(totalPoints: number): number {
  if (totalPoints <= 0) return 0;

  if (totalPoints >= POST_TABLE_TOTAL) {
    return POST_TABLE_LEVEL + Math.floor((totalPoints - POST_TABLE_TOTAL) / POST_TABLE_COST);
  }

  let lo = 0;
  let hi = LEVEL_TABLE.length - 1;
  while (lo < hi) {
    const mid = (lo + hi + 1) >> 1;
    if (LEVEL_TABLE[mid].totalPoints <= totalPoints) lo = mid;
    else hi = mid - 1;
  }
  return LEVEL_TABLE[lo].level;
}

/** Total points required to reach a given level. */
export function getPointsForLevel(level: number): number {
  if (level <= 0) return 0;
  if (level < LEVEL_TABLE.length) return LEVEL_TABLE[level].totalPoints;
  return POST_TABLE_TOTAL + (level - POST_TABLE_LEVEL) * POST_TABLE_COST;
}

/** Points remaining until the next level. */
export function getPointsToNextLevel(totalPoints: number): number {
  const currentLevel = getLevelFromPoints(totalPoints);
  const nextLevelPts = getPointsForLevel(currentLevel + 1);
  return Math.max(0, nextLevelPts - totalPoints);
}

/** 0-100 percentage progress within the current level. */
export function getXpProgress(totalPoints: number): number {
  const level = getLevelFromPoints(totalPoints);
  const currentLevelPts = getPointsForLevel(level);
  const nextLevelPts = getPointsForLevel(level + 1);
  const range = nextLevelPts - currentLevelPts;
  if (range <= 0) return 100;
  return Math.min(100, ((totalPoints - currentLevelPts) / range) * 100);
}

/* ------------------------------------------------------------------ */
/*  Tier Helpers                                                       */
/* ------------------------------------------------------------------ */

/** Return the tier for a given level. Searches TIERS in reverse to find the highest qualifying tier. */
export function getTier(level: number): Tier {
  for (let i = TIERS.length - 1; i >= 0; i--) {
    if (level >= TIERS[i].minLevel) return TIERS[i];
  }
  return TIERS[0];
}

/** Return the next tier after the current one, or null if at the highest. */
export function getNextTier(level: number): Tier | null {
  const current = getTier(level);
  const idx = TIERS.indexOf(current);
  return idx < TIERS.length - 1 ? TIERS[idx + 1] : null;
}

/** Levels remaining until the next tier boundary, or null if already at the top. */
export function getLevelsToNextTier(level: number): number | null {
  const next = getNextTier(level);
  if (!next) return null;
  return next.minLevel - level;
}

/* ------------------------------------------------------------------ */
/*  Streak Multipliers (re-exported for convenience)                   */
/* ------------------------------------------------------------------ */

export { getStreakMultiplier, STREAK_MULTIPLIERS } from "./achievements";

/* ------------------------------------------------------------------ */
/*  Points Constants                                                   */
/* ------------------------------------------------------------------ */

export const POINTS_PER_SECOND = 0.5;
export const POINTS_PER_COMPLETION = 100;
