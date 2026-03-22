export interface EliteBreakdown {
  id: string;
  title: string;
  date: string;
  duration: string;
  description: string;
  points: number;
  videoUrl?: string;
  thumbnail?: string;
  status: "completed" | "pending";
}

export const eliteBreakdowns: EliteBreakdown[] = [
  {
    id: "1",
    title: "Sparring Session #47 - Counter-Attack Analysis",
    date: "March 8, 2024",
    duration: "12:34",
    description: "Great improvement in your defensive positioning. Focus on faster transitions and keeping your guard high during the exit of combinations.",
    points: 100,
    status: "completed",
    thumbnail: "https://cdn.prod.website-files.com/6808d6bc1b6e8ba63b703680/68db7d2efc971c528c03bd10_Still%202025-09-30%20004650_1.16.1.jpeg"
  },
  {
    id: "2",
    title: "Heavy Bag Flow - Power Generation",
    date: "February 15, 2024",
    duration: "08:42",
    description: "Analyzing your weight transfer on the low kicks. You're losing power by leaning back too far.",
    points: 100,
    status: "completed",
    thumbnail: "https://cdn.prod.website-files.com/6808d6bc1b6e8ba63b703680/68d8324c544f90351dbc4e5a_Still%202025-09-27%20125111_3.1.1.jpeg"
  },
  {
    id: "3",
    title: "Pad Work - Stance Switches",
    date: "January 22, 2024",
    duration: "15:18",
    description: "Good rhythm, but your switch is too wide. Keep it tight to stay balanced.",
    points: 100,
    status: "completed",
    thumbnail: "https://cdn.prod.website-files.com/6808d6bc1b6e8ba63b703680/68d81608259b4ed4651fa249_Still%202025-09-27%20103245_4.1.1-2.jpg"
  },
  {
    id: "4",
    title: "Sparring Session #42 - Defense & Timing",
    date: "December 18, 2023",
    duration: "11:55",
    description: "Focus on your head movement. You're static after throwing the cross.",
    points: 100,
    status: "completed",
    thumbnail: "https://cdn.prod.website-files.com/6808d6bc1b6e8ba63b703680/688e5b8193d0d395bedd7357_Missing%20Link%20Thumb.jpg"
  }
];




