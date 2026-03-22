import { CheckCircle2, Trophy, PlayCircle, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";

interface Activity {
  id: string;
  type: "completion" | "assignment" | "level" | "comment";
  title: string;
  subtitle: string;
  time: string;
  points?: number;
}

const MOCK_ACTIVITIES: Activity[] = [
  {
    id: "1",
    type: "completion",
    title: "Completed episode: Knee Techniques",
    subtitle: "Muay Thai Fundamentals",
    time: "2 hours ago",
    points: 50,
  },
  {
    id: "2",
    type: "assignment",
    title: "Submitted assignment: Basic Combination Drill",
    subtitle: "Muay Thai Fundamentals",
    time: "1 day ago",
    points: 100,
  },
  {
    id: "3",
    type: "level",
    title: "Reached Silver Tier (Level 23)",
    subtitle: "New achievements unlocked",
    time: "3 days ago",
  },
];

const icons = {
  completion: <PlayCircle className="h-4 w-4 text-blue-500" />,
  assignment: <CheckCircle2 className="h-4 w-4 text-green-500" />,
  level: <Trophy className="h-4 w-4 text-yellow-500" />,
  comment: <MessageSquare className="h-4 w-4 text-purple-500" />,
};

export function RecentActivity() {
  return (
    <div className="bg-card border border-border rounded-2xl p-6">
      <h3 className="text-lg font-bold mb-6">Recent Activity</h3>
      <div className="space-y-6">
        {MOCK_ACTIVITIES.map((activity, idx) => (
          <div key={activity.id} className="relative flex gap-4">
            {idx !== MOCK_ACTIVITIES.length - 1 && (
              <div className="absolute left-[7px] top-6 bottom-[-24px] w-[2px] bg-border" />
            )}
            <div className="relative z-10 mt-1">
              <div className="h-4 w-4 rounded-full bg-background flex items-center justify-center">
                {icons[activity.type]}
              </div>
            </div>
            <div className="flex-1 space-y-1">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold leading-none">{activity.title}</p>
                {activity.points && (
                  <span className="text-[10px] font-bold text-primary">+{activity.points} pts</span>
                )}
              </div>
              <p className="text-xs text-muted-foreground">{activity.subtitle}</p>
              <p className="text-[10px] text-muted-foreground/60">{activity.time}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}




