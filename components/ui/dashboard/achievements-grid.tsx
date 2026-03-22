import { 
  Target, 
  Footprints, 
  Calendar, 
  Swords, 
  Zap, 
  Activity, 
  Shield, 
  Heart,
  Flame,
  BookOpen,
  BicepsFlexed,
  Star,
  Award,
  Box
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Achievement {
  id: string;
  title: string;
  icon: React.ReactNode;
  unlocked: boolean;
}

const ACHIEVEMENTS: Achievement[] = [
  { id: "into-the-box", title: "Into the Box", icon: <Target className="h-6 w-6" />, unlocked: true },
  { id: "first-steps", title: "First Steps", icon: <Footprints className="h-6 w-6" />, unlocked: false },
  { id: "dedication", title: "Dedication", icon: <Calendar className="h-6 w-6" />, unlocked: false },
  { id: "combo-master", title: "Combo Master", icon: <Swords className="h-6 w-6" />, unlocked: false },
  { id: "power-puncher", title: "Power Puncher", icon: <Zap className="h-6 w-6" />, unlocked: false },
  { id: "leg-legend", title: "Leg Legend", icon: <Activity className="h-6 w-6" />, unlocked: false },
  { id: "defense-guru", title: "Defense Guru", icon: <Shield className="h-6 w-6" />, unlocked: false },
  { id: "endurance-beast", title: "Endurance Beast", icon: <Heart className="h-6 w-6" />, unlocked: false },
  { id: "sparring-ready", title: "Sparring Ready", icon: <Flame className="h-6 w-6" />, unlocked: false },
  { id: "technique-scholar", title: "Technique Scholar", icon: <BookOpen className="h-6 w-6" />, unlocked: false },
  { id: "chainsaw", title: "Chainsaw", icon: <Zap className="h-4 w-4" />, unlocked: false },
  { id: "ring-warrior", title: "Ring Warrior", icon: <Star className="h-6 w-6" />, unlocked: false },
  { id: "fight-camp-veteran", title: "Fight Camp", icon: <Award className="h-6 w-6" />, unlocked: false },
  { id: "elite-fighter", title: "Elite Fighter", icon: <Box className="h-6 w-6" />, unlocked: false },
  { id: "out-of-the-box", title: "Out of the Box", icon: <Target className="h-6 w-6" />, unlocked: false },
];

export function AchievementsGrid({ unlockedIds = ["into-the-box"] }: { unlockedIds?: string[] }) {
  const unlockedCount = ACHIEVEMENTS.filter(a => unlockedIds.includes(a.id)).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold">Achievements</h3>
        <span className="text-xs text-muted-foreground">{unlockedCount}/{ACHIEVEMENTS.length}</span>
      </div>
      <div className="grid grid-cols-4 md:grid-cols-8 lg:grid-cols-8 gap-3">
        {ACHIEVEMENTS.map((achievement) => {
          const isUnlocked = unlockedIds.includes(achievement.id);
          return (
            <div
              key={achievement.id}
              className={cn(
                "aspect-square rounded-xl border flex flex-col items-center justify-center gap-2 p-2 transition-all group relative",
                isUnlocked 
                  ? "border-primary bg-primary/5 ring-1 ring-primary" 
                  : "border-border bg-card grayscale opacity-40 hover:opacity-60"
              )}
            >
              <div className={cn(
                "p-2 rounded-lg transition-colors",
                isUnlocked ? "text-primary" : "text-muted-foreground"
              )}>
                {achievement.icon}
              </div>
              <span className="text-[8px] font-bold text-center leading-tight uppercase tracking-wider hidden md:block">
                {achievement.title}
              </span>
              
              {/* Tooltip */}
              <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-popover text-popover-foreground text-[10px] py-1 px-2 rounded border border-border opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                {achievement.title}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}




