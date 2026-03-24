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
} from "lucide-react";
import { createElement } from "react";

export interface AchievementDef {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: "watching" | "streaks" | "assignments" | "community" | "milestones";
}

export const ACHIEVEMENTS: AchievementDef[] = [
  {
    id: "first-blood",
    title: "First Blood",
    description: "Watch your first episode",
    icon: "Eye",
    category: "watching",
  },
  {
    id: "scholar",
    title: "Scholar",
    description: "Complete 10 episodes",
    icon: "BookOpen",
    category: "watching",
  },
  {
    id: "warrior",
    title: "Warrior",
    description: "Complete 25 episodes",
    icon: "Swords",
    category: "watching",
  },
  {
    id: "iron-will",
    title: "Iron Will",
    description: "7-day training streak",
    icon: "Calendar",
    category: "streaks",
  },
  {
    id: "unstoppable",
    title: "Unstoppable",
    description: "30-day training streak",
    icon: "Flame",
    category: "streaks",
  },
  {
    id: "submission-artist",
    title: "Submission Artist",
    description: "Get your first assignment approved",
    icon: "Target",
    category: "assignments",
  },
  {
    id: "drill-sergeant",
    title: "Drill Sergeant",
    description: "Submit 5 assignments",
    icon: "Shield",
    category: "assignments",
  },
  {
    id: "community-voice",
    title: "Community Voice",
    description: "Post in the discussions",
    icon: "MessageSquare",
    category: "community",
  },
  {
    id: "feedback-loop",
    title: "Feedback Loop",
    description: "Get instructor feedback on an Elite submission",
    icon: "Send",
    category: "community",
  },
  {
    id: "dedicated-student",
    title: "Dedicated Student",
    description: "Watch 10 hours of content",
    icon: "Heart",
    category: "milestones",
  },
  {
    id: "centurion",
    title: "Centurion",
    description: "Earn 10,000 points",
    icon: "Star",
    category: "milestones",
  },
  {
    id: "first-steps",
    title: "First Steps",
    description: "Start your first course",
    icon: "Footprints",
    category: "watching",
  },
  {
    id: "ring-warrior",
    title: "Ring Warrior",
    description: "Complete 50 episodes",
    icon: "Trophy",
    category: "watching",
  },
  {
    id: "elite-fighter",
    title: "Elite Fighter",
    description: "Reach level 10",
    icon: "Award",
    category: "milestones",
  },
  {
    id: "power-hour",
    title: "Power Hour",
    description: "Watch 1 hour of content",
    icon: "Zap",
    category: "milestones",
  },
];

const ICON_MAP: Record<string, React.FC<{ className?: string }>> = {
  Eye, Target, Footprints, Calendar, Swords, Zap, Shield, Heart, Flame,
  BookOpen, Star, Award, MessageSquare, Send, Trophy,
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
