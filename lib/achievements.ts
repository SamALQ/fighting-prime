import {
  Target,
  Footprints,
  Calendar,
  Swords,
  Zap,
  Shield,
  Heart,
  Flame,
  BookOpen,
  Star,
  Award,
  MessageSquare,
  Send,
  Trophy,
  Eye,
  Gem,
  Crown,
  Sparkles,
} from "lucide-react";
import { createElement } from "react";

export interface AchievementDef {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: "watching" | "streaks" | "assignments" | "community" | "milestones";
  /** Border/glow accent color — tailwind-compatible hsl or hex */
  accent: string;
}

export const ACHIEVEMENTS: AchievementDef[] = [
  {
    id: "first-blood",
    title: "First Blood",
    description: "Watch your first episode",
    icon: "Eye",
    category: "watching",
    accent: "#D71212",
  },
  {
    id: "first-steps",
    title: "First Steps",
    description: "Start your first course",
    icon: "Footprints",
    category: "watching",
    accent: "#F59E0B",
  },
  {
    id: "scholar",
    title: "Scholar",
    description: "Complete 10 episodes",
    icon: "BookOpen",
    category: "watching",
    accent: "#3B82F6",
  },
  {
    id: "warrior",
    title: "Warrior",
    description: "Complete 25 episodes",
    icon: "Swords",
    category: "watching",
    accent: "#10B981",
  },
  {
    id: "ring-warrior",
    title: "Ring Warrior",
    description: "Complete 50 episodes",
    icon: "Trophy",
    category: "watching",
    accent: "#8B5CF6",
  },
  {
    id: "iron-will",
    title: "Iron Will",
    description: "7-day training streak",
    icon: "Calendar",
    category: "streaks",
    accent: "#F97316",
  },
  {
    id: "unstoppable",
    title: "Unstoppable",
    description: "30-day training streak",
    icon: "Flame",
    category: "streaks",
    accent: "#EF4444",
  },
  {
    id: "submission-artist",
    title: "Submission Artist",
    description: "Get your first assignment approved",
    icon: "Target",
    category: "assignments",
    accent: "#06B6D4",
  },
  {
    id: "drill-sergeant",
    title: "Drill Sergeant",
    description: "Submit 5 assignments",
    icon: "Shield",
    category: "assignments",
    accent: "#14B8A6",
  },
  {
    id: "community-voice",
    title: "Community Voice",
    description: "Post in the discussions",
    icon: "MessageSquare",
    category: "community",
    accent: "#22C55E",
  },
  {
    id: "feedback-loop",
    title: "Feedback Loop",
    description: "Get instructor feedback on an Elite submission",
    icon: "Send",
    category: "community",
    accent: "#A78BFA",
  },
  {
    id: "power-hour",
    title: "Power Hour",
    description: "Watch 1 hour of content",
    icon: "Zap",
    category: "milestones",
    accent: "#FBBF24",
  },
  {
    id: "dedicated-student",
    title: "Dedicated Student",
    description: "Watch 10 hours of content",
    icon: "Heart",
    category: "milestones",
    accent: "#EC4899",
  },
  {
    id: "centurion",
    title: "Centurion",
    description: "Earn 10,000 points",
    icon: "Star",
    category: "milestones",
    accent: "#F59E0B",
  },
  {
    id: "elite-fighter",
    title: "Elite Fighter",
    description: "Reach level 10",
    icon: "Award",
    category: "milestones",
    accent: "#D71212",
  },
  {
    id: "tier-silver",
    title: "Silver Tier",
    description: "Reach the Silver tier (Level 10)",
    icon: "Gem",
    category: "milestones",
    accent: "#d9f6ff",
  },
  {
    id: "tier-gold",
    title: "Gold Tier",
    description: "Reach the Gold tier (Level 50)",
    icon: "Crown",
    category: "milestones",
    accent: "#ffa90a",
  },
  {
    id: "tier-platinum",
    title: "Platinum Tier",
    description: "Reach the Platinum tier (Level 100)",
    icon: "Gem",
    category: "milestones",
    accent: "#cac0ff",
  },
  {
    id: "tier-diamond",
    title: "Diamond Tier",
    description: "Reach the Diamond tier (Level 130)",
    icon: "Gem",
    category: "milestones",
    accent: "#a7cdff",
  },
  {
    id: "tier-lightning",
    title: "Lightning Tier",
    description: "Reach the Lightning tier (Level 165)",
    icon: "Zap",
    category: "milestones",
    accent: "#ffa03b",
  },
  {
    id: "tier-obsidian",
    title: "Obsidian Tier",
    description: "Reach the Obsidian tier (Level 200)",
    icon: "Gem",
    category: "milestones",
    accent: "#660fc3",
  },
  {
    id: "tier-meteorite",
    title: "Meteorite Tier",
    description: "Reach the Meteorite tier (Level 230)",
    icon: "Sparkles",
    category: "milestones",
    accent: "#06d65d",
  },
  {
    id: "tier-cosmic",
    title: "Cosmic Tier",
    description: "Reach the legendary Cosmic tier (Level 265)",
    icon: "Sparkles",
    category: "milestones",
    accent: "#ff3366",
  },
];

const ICON_MAP: Record<string, React.FC<{ className?: string }>> = {
  Eye, Target, Footprints, Calendar, Swords, Zap, Shield, Heart, Flame,
  BookOpen, Star, Award, MessageSquare, Send, Trophy, Gem, Crown, Sparkles,
};

export function getAchievementIcon(iconName: string, className = "h-6 w-6") {
  const Icon = ICON_MAP[iconName];
  if (!Icon) return createElement("span", { className }, "?");
  return createElement(Icon, { className });
}

export interface UserProgressSnapshot {
  completedEpisodes: number;
  totalWatchTimeSeconds: number;
  currentStreak: number;
  longestStreak: number;
  assignmentsSubmitted: number;
  assignmentsApproved: number;
  discussionPosts: number;
  eliteFeedbackReceived: number;
  coursesStarted: number;
  totalPoints: number;
  level: number;
}

export function checkAchievements(
  snapshot: UserProgressSnapshot,
  alreadyUnlocked: Set<string>
): string[] {
  const newlyUnlocked: string[] = [];

  const checks: [string, boolean][] = [
    ["first-blood", snapshot.completedEpisodes >= 1 || snapshot.totalWatchTimeSeconds > 60],
    ["first-steps", snapshot.coursesStarted >= 1],
    ["scholar", snapshot.completedEpisodes >= 10],
    ["warrior", snapshot.completedEpisodes >= 25],
    ["ring-warrior", snapshot.completedEpisodes >= 50],
    ["iron-will", snapshot.longestStreak >= 7],
    ["unstoppable", snapshot.longestStreak >= 30],
    ["submission-artist", snapshot.assignmentsApproved >= 1],
    ["drill-sergeant", snapshot.assignmentsSubmitted >= 5],
    ["community-voice", snapshot.discussionPosts >= 1],
    ["feedback-loop", snapshot.eliteFeedbackReceived >= 1],
    ["dedicated-student", snapshot.totalWatchTimeSeconds >= 36000],
    ["centurion", snapshot.totalPoints >= 10000],
    ["elite-fighter", snapshot.level >= 10],
    ["power-hour", snapshot.totalWatchTimeSeconds >= 3600],
    ["tier-silver", snapshot.level >= 10],
    ["tier-gold", snapshot.level >= 50],
    ["tier-platinum", snapshot.level >= 100],
    ["tier-diamond", snapshot.level >= 130],
    ["tier-lightning", snapshot.level >= 165],
    ["tier-obsidian", snapshot.level >= 200],
    ["tier-meteorite", snapshot.level >= 230],
    ["tier-cosmic", snapshot.level >= 265],
  ];

  for (const [id, condition] of checks) {
    if (condition && !alreadyUnlocked.has(id)) {
      newlyUnlocked.push(id);
    }
  }

  return newlyUnlocked;
}

export const STREAK_MULTIPLIERS = [
  { minDays: 30, multiplier: 2.0 },
  { minDays: 14, multiplier: 1.5 },
  { minDays: 7, multiplier: 1.25 },
  { minDays: 0, multiplier: 1.0 },
];

export function getStreakMultiplier(streakDays: number): number {
  for (const tier of STREAK_MULTIPLIERS) {
    if (streakDays >= tier.minDays) return tier.multiplier;
  }
  return 1.0;
}
