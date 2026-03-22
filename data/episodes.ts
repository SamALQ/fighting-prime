// Helper function to parse duration from "MM:SS" or "H:MM:SS" format to seconds
function parseDuration(durationStr: string): number {
  if (!durationStr) return 0;
  
  const parts = durationStr.split(":").map(Number);
  if (parts.length === 2) {
    // MM:SS format
    return parts[0] * 60 + parts[1];
  } else if (parts.length === 3) {
    // H:MM:SS format
    return parts[0] * 3600 + parts[1] * 60 + parts[2];
  }
  return 0;
}

// Helper function to extract key takeaways from description
function extractKeyTakeaways(description: string): string[] {
  if (!description) return [];
  
  // Remove HTML tags and extract meaningful sentences
  const text = description
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/g, " ")
    .trim();
  
  // Split by sentences and take first 3 meaningful ones
  const sentences = text
    .split(/[.!?]\s+/)
    .filter(s => s.length > 20)
    .slice(0, 3);
  
  return sentences.length > 0 ? sentences : ["Learn essential techniques and strategies"];
}

export interface Episode {
  slug: string;
  courseId: string;
  title: string;
  order: number;
  isFree: boolean;
  premium: boolean;
  videoUrl: string;
  durationSeconds: number;
  keyTakeaways: string[];
  releaseDate: string;
  hasAssignment?: boolean;
  assignmentPoints?: number;
  thumbnail?: string;
}

export const episodes: Episode[] = [
  // Muay Thai Foundations episodes
  {
    slug: "into-the-box",
    courseId: "1",
    title: "Introduction: Into The Box",
    order: 1,
    isFree: true,
    premium: false,
    videoUrl: "https://fp-course-content.s3.us-east-1.amazonaws.com/Muay+Thai+Foundations/Intro%3A+Into+The+Box/MTF+-+Into+the+box+1080+h265+3000+kbs.mov",
    durationSeconds: parseDuration("2:51"),
    keyTakeaways: [
      "Every great martial artist was once in 'the' box",
      "Reinforce your foundations and build them if you didn't have them before",
      "Create strong foundations so you can execute even the trickiest techniques",
    ],
    releaseDate: "2025-06-01",
    thumbnail: "https://cdn.prod.website-files.com/6808d6bc1b6e8ba63b703680/680fe5b12ecebd681e8c9daf_Still%202025-04-28%20051718_1.2.1.jpeg",
  },
  {
    slug: "the-system",
    courseId: "1",
    title: "The System",
    order: 2,
    isFree: true,
    premium: false,
    videoUrl: "https://fp-course-content.s3.us-east-1.amazonaws.com/Muay+Thai+Foundations/The+System/MTF-The+System+1080+h265+3000+kbs.mp4",
    durationSeconds: parseDuration("6:06"),
    keyTakeaways: [
      "A 5-step framework that transforms any technique from concept to real fight application",
      "Progress methodically: Address, Shadow Boxing, Bag Work, Partner Drills, Sparring",
      "Mastery is built step-by-step with video feedback and accountability",
    ],
    releaseDate: "2025-06-01",
    hasAssignment: true,
    assignmentPoints: 30,
    thumbnail: "https://cdn.prod.website-files.com/6808d6bc1b6e8ba63b703680/688e8b4cdb6ff6c6f3670662_The%20system%20thumb.jpg",
  },
  {
    slug: "goals",
    courseId: "1",
    title: "Goals & Intentions",
    order: 3,
    isFree: true,
    premium: false,
    videoUrl: "https://fp-course-content.s3.us-east-1.amazonaws.com/Muay+Thai+Foundations/Goals+And+Intentions/MTF-Goals+And+Intentions+1080+h265+3000+kbs.mp4",
    durationSeconds: parseDuration("3:01"),
    keyTakeaways: [
      "Without establishing your goals and intentions, you'll be estranged from development",
      "Be intentional and purposeful in your training",
      "Avoid training aimlessly without direction and focus",
    ],
    releaseDate: "2025-06-01",
  },
  {
    slug: "training-plan",
    courseId: "1",
    title: "Preparation: Training Plan",
    order: 4,
    isFree: false,
    premium: true,
    videoUrl: "",
    durationSeconds: parseDuration("11:00"),
    keyTakeaways: [
      "Learn how to spot and eliminate bad habits",
      "Train smarter—not harder—with strategies that boost technique",
      "Prevent needless injury and help you progress like a pro",
    ],
    releaseDate: "2025-06-01",
    hasAssignment: true,
  },
  {
    slug: "professional-hand-wraps",
    courseId: "1",
    title: "Professional Hand Wraps",
    order: 5,
    isFree: true,
    premium: false,
    videoUrl: "https://fp-course-content.s3.us-east-1.amazonaws.com/Muay+Thai+Foundations/Professional+Handwraps/MTF-Hadwraps+1080+h265+3000+kbs.mp4",
    durationSeconds: parseDuration("4:56"),
    keyTakeaways: [
      "Your hands are your most delicate weapon in Muay Thai",
      "Protect the small bones that make up your clenched fist",
      "Details matter and can save you from missing training due to injury",
    ],
    releaseDate: "2025-06-01",
  },
  {
    slug: "stance",
    courseId: "1",
    title: "Stance Fundamentals",
    order: 6,
    isFree: true,
    premium: false,
    videoUrl: "https://fp-course-content.s3.us-east-1.amazonaws.com/Muay+Thai+Foundations/Stance/Stance+1080+h265+3000+kbs.mp4",
    durationSeconds: parseDuration("5:52"),
    keyTakeaways: [
      "Your stance is the foundation of your entire Muay Thai game",
      "Position your feet, align your hips, and distribute weight for optimal balance",
      "A strong stance allows you to move efficiently and set up every technique with confidence",
    ],
    releaseDate: "2025-06-01",
  },
  {
    slug: "shadowboxing",
    courseId: "1",
    title: "Shadowboxing",
    order: 7,
    isFree: true,
    premium: false,
    videoUrl: "https://fp-course-content.s3.us-east-1.amazonaws.com/Muay+Thai+Foundations/Shadowboxing/MTF-Shadowboxing+1080+h265+3000+kbs.mp4",
    durationSeconds: parseDuration("6:30"),
    keyTakeaways: [
      "Shadowboxing can often be the most under utilized tool that we have",
      "It's about refinement, visualization, awareness, and tactical development",
      "You can't shadowbox enough",
    ],
    releaseDate: "2025-06-01",
  },
  {
    slug: "the-6-punches",
    courseId: "1",
    title: "The 6 Punches",
    order: 8,
    isFree: false,
    premium: true,
    videoUrl: "",
    durationSeconds: parseDuration("8:11"),
    keyTakeaways: [
      "Maximize power and speed by perfecting your technique",
      "Learn the six basic punches of Muay Thai",
      "Master proper form for each punch",
    ],
    releaseDate: "2025-06-01",
  },
  {
    slug: "dynamic-guard",
    courseId: "1",
    title: "Foundational Guard",
    order: 9,
    isFree: true,
    premium: false,
    videoUrl: "https://fp-course-content.s3.us-east-1.amazonaws.com/Muay+Thai+Foundations/Foundational+Gaurd/MTF-Foundational+Gaurd+1080+h265+3000+kbs.mp4",
    durationSeconds: parseDuration("7:39"),
    keyTakeaways: [
      "Sometimes 'defence is your best offence'",
      "Learn the most basic foundational guard for Muay Thai",
      "Essential for all combat sports",
    ],
    releaseDate: "2025-06-01",
  },
  {
    slug: "where-do-you-look",
    courseId: "1",
    title: "Where Do You Look?",
    order: 10,
    isFree: true,
    premium: false,
    videoUrl: "https://fp-course-content.s3.us-east-1.amazonaws.com/Muay+Thai+Foundations/Where+Do+You+Look%3F/MTF+-+Where+Do+You+Look+1080+h265+3000+kbs.mov",
    durationSeconds: parseDuration("1:41"),
    keyTakeaways: [
      "It's easy to get tricked when focusing on specific body parts",
      "Learn where to focus your attention during combat",
      "Simple but crucial for effective fighting",
    ],
    releaseDate: "2025-06-01",
  },
  {
    slug: "elbow-mentality",
    courseId: "1",
    title: "Elbow Mentality",
    order: 11,
    isFree: false,
    premium: true,
    videoUrl: "",
    durationSeconds: parseDuration("10:13"),
    keyTakeaways: [
      "One of the defining techniques that separates Muay Thai from other martial arts",
      "Learn the technique and essence of the elbows",
      "Master devastating elbow strikes",
    ],
    releaseDate: "2025-06-01",
    hasAssignment: true,
  },
  {
    slug: "sting-like-a-knee",
    courseId: "1",
    title: "Sting Like A Knee",
    order: 12,
    isFree: true,
    premium: false,
    videoUrl: "https://fp-course-content.s3.us-east-1.amazonaws.com/Muay+Thai+Foundations/Knees/Knees+1080+h265+3000+kbs.mp4",
    durationSeconds: parseDuration("8:03"),
    keyTakeaways: [
      "The most powerful weapon when executed properly",
      "Is your technique allowing you to reach your knees full potential?",
      "Detailed breakdown addressing common mistakes and perfect execution",
    ],
    releaseDate: "2025-06-01",
  },
  {
    slug: "the-roundhouse-kick",
    courseId: "1",
    title: "The Roundhouse Kick",
    order: 13,
    isFree: true,
    premium: false,
    videoUrl: "https://fp-course-content.s3.us-east-1.amazonaws.com/Muay+Thai+Foundations/Roundhouse+Dynamics/Roundhouse+Dynamics+1080+h265+3000+kbs.mp4",
    durationSeconds: parseDuration("8:29"),
    keyTakeaways: [
      "Unlock the mechanics behind a powerful roundhouse kick",
      "Generate force with your hips, timing, and posture",
      "A devastating roundhouse isn't about brute strength—it's about timing, balance, and flow",
    ],
    releaseDate: "2025-06-01",
    hasAssignment: true,
    assignmentPoints: 20,
  },
  {
    slug: "gaurd-for-kicks",
    courseId: "1",
    title: "Checking & Gaurd for Kicks",
    order: 14,
    isFree: true,
    premium: false,
    videoUrl: "https://fp-course-content.s3.us-east-1.amazonaws.com/Muay+Thai+Foundations/Checking+Kicks/MTF-Checking+Kicks+1080+h265+3000+kbs.mp4",
    durationSeconds: parseDuration("7:44"),
    keyTakeaways: [
      "The biggest scorer in Muay Thai is the body kick",
      "Learn how to competently defend it",
      "Breakdown on the basic check and defence for the body kick",
    ],
    releaseDate: "2025-06-01",
  },
  {
    slug: "skeleton-frame",
    courseId: "1",
    title: "Skeleton Frame",
    order: 15,
    isFree: false,
    premium: true,
    videoUrl: "",
    durationSeconds: 0,
    keyTakeaways: [
      "Strength and conditioning has its place",
      "But technique is KING",
      "This secret will have you hitting like a truck",
    ],
    releaseDate: "2025-06-01",
  },
  {
    slug: "basics-of-the-teep",
    courseId: "1",
    title: "Basics Of The Teep",
    order: 16,
    isFree: true,
    premium: false,
    videoUrl: "https://fp-course-content.s3.us-east-1.amazonaws.com/Muay+Thai+Foundations/Teeps/MTF+-+Teeps+1080+h265+3000+kbs.mp4",
    durationSeconds: parseDuration("8:42"),
    keyTakeaways: [
      "With multiple different applications, the teep can become your greatest weapon",
      "Learn to throw your teep defensively, offensively, to create space or to keep space",
      "Master the versatile teep technique",
    ],
    releaseDate: "2025-06-01",
  },
  {
    slug: "your-missing-link",
    courseId: "1",
    title: "Your Missing Link",
    order: 17,
    isFree: true,
    premium: false,
    videoUrl: "https://fp-course-content.s3.us-east-1.amazonaws.com/Muay+Thai+Foundations/Missing+Link/MTF-Missing+Link+1080+h265+3000+kbs.mp4",
    durationSeconds: parseDuration("7:40"),
    keyTakeaways: [
      "We all have one, I turned mine into the greatest catalyst for development",
      "Learn how to find yours and turn it into a strength too",
      "Transform weaknesses into strengths",
    ],
    releaseDate: "2025-06-01",
    hasAssignment: true,
    assignmentPoints: 10,
  },
  {
    slug: "bag-work-details-xafmc",
    courseId: "1",
    title: "Bag Work Details",
    order: 18,
    isFree: true,
    premium: false,
    videoUrl: "https://fp-course-content.s3.us-east-1.amazonaws.com/Muay+Thai+Foundations/Bag+Work/MTF+-+Bag+Work+1080+h265+3000+kbs.mov",
    durationSeconds: parseDuration("4:21"),
    keyTakeaways: [
      "Master proper bag work techniques",
      "Develop power and precision",
      "Essential training for Muay Thai development",
    ],
    releaseDate: "2025-06-01",
    hasAssignment: true,
  },
  {
    slug: "conclusion-out-of-the-box",
    courseId: "1",
    title: "Conclusion: Out Of The Box",
    order: 19,
    isFree: false,
    premium: true,
    videoUrl: "",
    durationSeconds: parseDuration("2:23"),
    keyTakeaways: [
      "Congrats on completing the course",
      "With strong foundations, you can add all kinds of tricky techniques",
      "Now let's start to develop your own unique style",
    ],
    releaseDate: "2025-06-01",
  },
  
  // Low Kick Sharpshooter episodes
  {
    slug: "introduction",
    courseId: "2",
    title: "Introduction",
    order: 1,
    isFree: true,
    premium: false,
    videoUrl: "https://fp-course-content.s3.us-east-1.amazonaws.com/Low+Kick+Sharpshooter/Trailer-Intro/LKS+Trailer+1080+3000kbs+h265.mp4",
    durationSeconds: parseDuration("1:20"),
    keyTakeaways: [
      "Master the low kick: angles, setups, timing and 'puppeteering' feints",
      "Increase leg-kick volume, finish fights with precision, weaponize pain",
      "Ready to start sniping? Lets GO!!!",
    ],
    releaseDate: "2025-09-27",
    thumbnail: "https://cdn.prod.website-files.com/6808d6bc1b6e8ba63b703680/68d8157689e1be722ac9c168_Still%202025-09-27%20104724_1.1.1-2.jpg",
  },
  {
    slug: "points-of-contact",
    courseId: "2",
    title: "Points Of Contact",
    order: 2,
    isFree: true,
    premium: false,
    videoUrl: "https://fp-course-content.s3.us-east-1.amazonaws.com/Low+Kick+Sharpshooter/Points+of+Connection/LKS+-+Points+of+Connection.mp4",
    durationSeconds: parseDuration("3:54"),
    keyTakeaways: [
      "Three low-kick weapons: Whip, Baseball Bat, Axe",
      "Learn where to connect, how hinging from the knee vs hip creates different kinds of power",
      "How to choose the right strike",
    ],
    releaseDate: "2025-09-27",
  },
  {
    slug: "maximizing-force",
    courseId: "2",
    title: "Maximizing Force",
    order: 3,
    isFree: true,
    premium: false,
    videoUrl: "https://fp-course-content.s3.us-east-1.amazonaws.com/Low+Kick+Sharpshooter/Maximizing+Force/LKS+-+Maximizing+Force.mp4",
    durationSeconds: parseDuration("3:14"),
    keyTakeaways: [
      "Power doesn't come from raw strength",
      "When you kick, the angle of your hips, and the placement of your toes and heel on the back foot should do most of the work",
      "Master the mechanics of power generation",
    ],
    releaseDate: "2025-09-27",
  },
  {
    slug: "angles-of-attack",
    courseId: "2",
    title: "Angles Of Attack",
    order: 4,
    isFree: false,
    premium: true,
    videoUrl: "https://fp-course-content.s3.us-east-1.amazonaws.com/Low+Kick+Sharpshooter/Angles+Of+Attack/Angles+Of+Attact+unfinished+-+1080.mp4",
    durationSeconds: parseDuration("8:11"),
    keyTakeaways: [
      "3 angles - 3 ways to destroy your opponents lead leg",
      "Invest in these shots throughout the fight, and you'll start cashing out quick",
      "Perfect them, and your opponent wont make it to round 3",
    ],
    releaseDate: "2025-09-27",
  },
  {
    slug: "defence",
    courseId: "2",
    title: "Defence",
    order: 5,
    isFree: false,
    premium: true,
    videoUrl: "https://fp-course-content.s3.us-east-1.amazonaws.com/Low+Kick+Sharpshooter/Defence/LKS+-+Defence+1080+h265.mov",
    durationSeconds: parseDuration("2:31"),
    keyTakeaways: [
      "Don't get clipped when you kick your opponents legs!",
      "This simple defence will protect your chin when you get within striking distance",
      "Essential defensive technique for low kick attacks",
    ],
    releaseDate: "2025-09-27",
  },
  {
    slug: "weight-manipulation",
    courseId: "2",
    title: "Weight Manipulation",
    order: 6,
    isFree: true,
    premium: false,
    videoUrl: "https://fp-course-content.s3.us-east-1.amazonaws.com/Low+Kick+Sharpshooter/Weight+Manipulation/LKS+-+Manipulation+1080.mp4",
    durationSeconds: parseDuration("2:50"),
    keyTakeaways: [
      "Want to get 100% land rate on your leg kicks?",
      "Pay attention. If you master this, you'll blast 'em every time",
      "Master weight manipulation for perfect accuracy",
    ],
    releaseDate: "2025-09-27",
  },
  {
    slug: "jedi-mind-tricks",
    courseId: "2",
    title: "Jedi Mind Tricks",
    order: 7,
    isFree: false,
    premium: true,
    videoUrl: "",
    durationSeconds: 0,
    keyTakeaways: [
      "Advanced psychological techniques for low kicks",
      "Master the mental game",
      "Outthink your opponents",
    ],
    releaseDate: "2025-09-27",
  },
];

export function getEpisodesByCourseId(courseId: string): Episode[] {
  return episodes
    .filter((episode) => episode.courseId === courseId)
    .sort((a, b) => a.order - b.order);
}

export function getEpisodeBySlug(slug: string): Episode | undefined {
  return episodes.find((episode) => episode.slug === slug);
}
