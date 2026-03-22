export interface Testimonial {
  id: string;
  name: string;
  location: string;
  quote: string;
  rating: number;
}

export const testimonials: Testimonial[] = [
  {
    id: "1",
    name: "Marcus Chen",
    location: "Singapore",
    quote: "Fighting Prime transformed my game. The structured approach and Jake's instruction helped me go from hobbyist to competitive fighter in 6 months.",
    rating: 5,
  },
  {
    id: "2",
    name: "Sarah Martinez",
    location: "Los Angeles, USA",
    quote: "As someone without access to a quality gym, this platform gave me pro-level training at home. The progress tracking keeps me motivated every day.",
    rating: 5,
  },
  {
    id: "3",
    name: "David Kim",
    location: "Seoul, South Korea",
    quote: "The low kick course alone was worth the subscription. I've never had instruction this clear and actionable. My technique improved dramatically.",
    rating: 5,
  },
  {
    id: "4",
    name: "Emma Thompson",
    location: "London, UK",
    quote: "The gamification aspect makes training addictive. I love seeing my progress and competing on the leaderboards. It's like having a coach in my pocket.",
    rating: 5,
  },
];
