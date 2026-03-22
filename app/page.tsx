import { MainLayout } from "@/components/layout/main-layout";
import { Hero } from "@/components/ui/hero";
import { Section } from "@/components/layout/section";
import { CourseCard } from "@/components/ui/course-card";
import { Testimonial } from "@/components/ui/testimonial";
import { courses } from "@/data/courses";
import { testimonials } from "@/data/testimonials";
import { Container } from "@/components/layout/container";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Play } from "lucide-react";
import { cn } from "@/lib/utils";

export default function Home() {
  const featuredCourse = courses.find((c) => c.featured);

  return (
    <MainLayout>
      <Hero
        headline="Train like a pro. Learn the system. Earn your prime."
        subhead="Elite Muay Thai courses led by ONE Championship athlete Jake Peacock."
        primaryCta={{ text: "Start Training", href: "/courses" }}
        secondaryCta={{ text: "See Courses", href: "/courses" }}
      />

      {/* How it Works */}
      <Section>
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">How it Works</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            A structured path from fundamentals to advanced techniques
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {[
            { step: "1", title: "Watch", desc: "Cinematic training videos with elite instruction" },
            { step: "2", title: "Drill", desc: "Practice techniques with structured progressions" },
            { step: "3", title: "Submit", desc: "Share your progress and get feedback" },
            { step: "4", title: "Level Up", desc: "Earn points, badges, and climb rankings" },
          ].map((item) => (
            <div key={item.step} className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/20 text-primary font-bold text-xl mb-4">
                {item.step}
              </div>
              <h3 className="font-semibold mb-2">{item.title}</h3>
              <p className="text-sm text-muted-foreground">{item.desc}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* Featured Course */}
      {featuredCourse && (
        <Section className="bg-card">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-4">Featured Course</h2>
              <h3 className="text-2xl font-semibold text-primary mb-4">{featuredCourse.title}</h3>
              <p className="text-muted-foreground mb-6">{featuredCourse.tagline}</p>
              <div className="space-y-4">
                <div className="flex items-center gap-4 text-sm">
                  <span className="text-muted-foreground">Difficulty:</span>
                  <span className="font-semibold">{featuredCourse.difficulty}</span>
                </div>
                <div className="flex items-center gap-4 text-sm">
                  <span className="text-muted-foreground">Duration:</span>
                  <span className="font-semibold">{featuredCourse.durationWeeks} weeks</span>
                </div>
                <div className="flex items-center gap-4 text-sm">
                  <span className="text-muted-foreground">Episodes:</span>
                  <span className="font-semibold">{featuredCourse.syllabus.length}</span>
                </div>
              </div>
              <div className="mt-8">
                <Link href={`/courses/${featuredCourse.slug}`}>
                  <Button size="lg">
                    <Play className="mr-2 h-4 w-4" />
                    Start Course
                  </Button>
                </Link>
              </div>
            </div>
            <div className="relative aspect-video rounded-xl overflow-hidden bg-gradient-to-br from-primary/20 to-background">
              <div className="absolute inset-0 flex items-center justify-center">
                <Play className="h-16 w-16 text-primary/30" />
              </div>
            </div>
          </div>
        </Section>
      )}

      {/* Track Your Progress (Dashboard) Feature Section */}
      <Section>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-8">
            <div className="space-y-4">
              <span className="text-primary font-bold uppercase tracking-widest text-sm">Gamified Training</span>
              <h2 className="text-4xl md:text-5xl font-bold leading-tight uppercase">Track Your Progress</h2>
              <p className="text-xl text-muted-foreground leading-relaxed">
                Stay motivated with a personalized training dashboard. Earn points for every minute you train, unlock exclusive achievements, and watch your level rise as you master new skills.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {[
                { title: "Real-time Stats", desc: "Track watch time, points, and level progress" },
                { title: "Achievement System", desc: "Unlock 15+ unique Muay Thai badges" },
                { title: "Course Management", desc: "Resume any course right where you left off" },
                { title: "Activity Feed", desc: "See your daily milestones and consistency" },
              ].map((benefit, i) => (
                <div key={i} className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-primary" />
                    <h4 className="font-bold uppercase text-sm tracking-wide">{benefit.title}</h4>
                  </div>
                  <p className="text-sm text-muted-foreground leading-snug">{benefit.desc}</p>
                </div>
              ))}
            </div>
            <div className="pt-4">
              <Link href="/dashboard">
                <Button size="lg" className="h-14 px-8 text-lg font-bold">
                  View My Dashboard
                </Button>
              </Link>
            </div>
          </div>

          <div className="relative group">
            <div className="absolute -inset-4 bg-primary/10 rounded-[2rem] blur-2xl group-hover:bg-primary/20 transition-all duration-500" />
            {/* Minified Dashboard Mock UI */}
            <div className="relative bg-background border border-border rounded-2xl shadow-2xl overflow-hidden transform group-hover:translate-y-2 transition-transform duration-500">
              {/* Header */}
              <div className="p-4 border-b border-border bg-muted/30 flex items-center justify-between">
                <div className="h-4 w-32 bg-muted rounded-full" />
                <div className="flex gap-2">
                  <div className="h-6 w-6 rounded-full bg-muted" />
                  <div className="h-6 w-16 bg-muted rounded-full" />
                </div>
              </div>
              
              <div className="p-6 space-y-6">
                {/* Stats Cards */}
                <div className="grid grid-cols-4 gap-2">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="h-12 bg-muted/50 rounded-lg border border-border/50 flex items-center justify-center p-2">
                      <div className="space-y-1 w-full">
                        <div className="h-1.5 w-1/2 bg-muted rounded" />
                        <div className="h-2 w-3/4 bg-primary/20 rounded" />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-12 gap-6">
                  {/* Main */}
                  <div className="col-span-8 space-y-6">
                    {/* Course Card */}
                    <div className="border border-border rounded-xl p-4 space-y-3 bg-muted/10">
                      <div className="flex gap-3">
                        <div className="h-12 w-12 rounded-lg bg-muted shrink-0" />
                        <div className="space-y-2 flex-1">
                          <div className="h-3 w-3/4 bg-muted rounded" />
                          <div className="h-2 w-1/4 bg-muted/60 rounded" />
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <div className="flex justify-between text-[8px] font-bold">
                          <span className="text-muted-foreground uppercase">Progress</span>
                          <span className="text-primary">75%</span>
                        </div>
                        <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                          <div className="h-full bg-primary w-3/4" />
                        </div>
                      </div>
                    </div>
                    {/* Achievements */}
                    <div className="space-y-3">
                      <div className="h-3 w-24 bg-muted rounded" />
                      <div className="grid grid-cols-6 gap-2">
                        {[1, 2, 3, 4, 5, 6].map((i) => (
                          <div key={i} className={cn(
                            "aspect-square rounded-md border flex items-center justify-center",
                            i === 1 ? "border-primary/50 bg-primary/10" : "border-border bg-muted/20"
                          )}>
                            <div className={cn("h-4 w-4 rounded", i === 1 ? "bg-primary/40" : "bg-muted")} />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  {/* Sidebar */}
                  <div className="col-span-4 space-y-4">
                    <div className="h-3 w-full bg-muted rounded" />
                    <div className="space-y-3">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="flex gap-2">
                          <div className="h-2 w-2 rounded-full bg-primary/40 shrink-0 mt-0.5" />
                          <div className="space-y-1.5 flex-1">
                            <div className="h-2 w-full bg-muted rounded" />
                            <div className="h-1.5 w-1/2 bg-muted/60 rounded" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Section>

      {/* Breakdowns Feature Section */}
      <Section>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="order-2 lg:order-1 relative group">
            <div className="absolute -inset-4 bg-primary/10 rounded-[2rem] blur-2xl group-hover:bg-primary/20 transition-all duration-500" />
            {/* Minified Mock UI */}
            <div className="relative bg-background border border-border rounded-2xl shadow-2xl overflow-hidden transform group-hover:-translate-y-2 transition-transform duration-500">
              <div className="p-3 border-b border-border bg-muted/30 flex items-center gap-2">
                <div className="flex gap-1">
                  <div className="w-2 h-2 rounded-full bg-red-500/50" />
                  <div className="w-2 h-2 rounded-full bg-yellow-500/50" />
                  <div className="w-2 h-2 rounded-full bg-green-500/50" />
                </div>
                <div className="h-4 w-32 bg-muted rounded-full" />
              </div>
              <div className="p-4 grid grid-cols-12 gap-4">
                <div className="col-span-8 space-y-4">
                  <div className="aspect-video bg-muted rounded-lg relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent" />
                    <Play className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-8 w-8 text-primary/40" />
                  </div>
                  <div className="space-y-2">
                    <div className="h-4 w-3/4 bg-muted rounded" />
                    <div className="h-3 w-1/2 bg-muted/60 rounded" />
                  </div>
                  <div className="pt-4 border-t border-border">
                    <div className="h-20 bg-muted/30 rounded-lg" />
                  </div>
                </div>
                <div className="col-span-4 space-y-3">
                  <div className="h-4 w-full bg-muted rounded mb-4" />
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="space-y-2">
                      <div className="aspect-video bg-muted rounded-md" />
                      <div className="h-2 w-full bg-muted/60 rounded" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
          <div className="order-1 lg:order-2 space-y-8">
            <div className="space-y-4">
              <span className="text-primary font-bold uppercase tracking-widest text-sm">Exclusive Content</span>
              <h2 className="text-4xl md:text-5xl font-bold leading-tight">Monthly Technique Breakdowns</h2>
              <p className="text-xl text-muted-foreground leading-relaxed">
                Go beyond the curriculum. Every month, Jake Peacock breaks down real fight footage, student submissions, and world-class techniques in high-definition analysis.
              </p>
            </div>
            <ul className="space-y-4">
              {[
                "Fight intelligence & strategy sessions",
                "Advanced clinch work & sweep analysis",
                "Community discussion & technique Q&A",
                "Exclusive access for Academy members"
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-3">
                  <div className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center">
                    <div className="h-2 w-2 rounded-full bg-primary" />
                  </div>
                  <span className="font-medium">{item}</span>
                </li>
              ))}
            </ul>
            <div className="pt-4">
              <Link href="/breakdowns">
                <Button size="lg" className="h-14 px-8 text-lg font-bold">
                  Explore Breakdowns
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </Section>

      {/* Testimonials */}
      <Section>
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">What Students Say</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {testimonials.map((testimonial) => (
            <Testimonial key={testimonial.id} {...testimonial} />
          ))}
        </div>
      </Section>

      {/* CTA Section */}
      <Section className="bg-primary text-primary-foreground">
        <Container>
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="text-3xl font-bold mb-4">Ready to Begin?</h2>
            <p className="text-lg mb-8 opacity-90">
              Join thousands of martial artists training with Fighting Prime Academy
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/pricing">
                <Button size="lg" variant="secondary">
                  View Pricing
                </Button>
              </Link>
              <Link href="/courses">
                <Button size="lg" variant="outline" className="bg-transparent border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/10">
                  Browse Courses
                </Button>
              </Link>
            </div>
          </div>
        </Container>
      </Section>
    </MainLayout>
  );
}
