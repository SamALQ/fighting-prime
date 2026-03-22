export interface FAQ {
  id: string;
  question: string;
  answer: string;
}

export const faqs: FAQ[] = [
  {
    id: "1",
    question: "Do I need prior martial arts experience?",
    answer: "No, our courses are designed for all levels. We have beginner courses that start from the fundamentals, as well as intermediate and advanced courses for those looking to refine their skills.",
  },
  {
    id: "2",
    question: "Can I cancel my subscription anytime?",
    answer: "Yes, you can cancel your subscription at any time. You'll retain access until the end of your current billing period. No questions asked.",
  },
  {
    id: "3",
    question: "Are the courses self-paced?",
    answer: "Absolutely. All courses are self-paced, allowing you to learn at your own speed. You can revisit lessons anytime and track your progress through our platform.",
  },
  {
    id: "4",
    question: "Do I need training equipment?",
    answer: "Basic courses can be done with minimal equipment. For advanced courses, we recommend having access to a heavy bag, pads, or a training partner. Each course lists recommended equipment in the description.",
  },
  {
    id: "5",
    question: "How does the progress tracking work?",
    answer: "Our platform tracks your video completion, assignment submissions, and time spent training. You earn points and level up as you progress through courses, with leaderboards to compare your progress with the community.",
  },
  {
    id: "6",
    question: "Is there a free trial?",
    answer: "Yes, we offer free episodes in each course so you can experience the quality of instruction before subscribing. Sign up to access free content and see if Fighting Prime is right for you.",
  },
];
