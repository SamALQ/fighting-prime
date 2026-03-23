import { MainLayout } from "@/components/layout/main-layout";
import { Hero } from "@/components/ui/hero";
import { Section } from "@/components/layout/section";
import { Testimonial } from "@/components/ui/testimonial";
import { fetchCourses, fetchTestimonials } from "@/lib/db";
import { Container } from "@/components/layout/container";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Play, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

export default async function Home() {
  const [courses, testimonials] = await Promise.all([
    fetchCourses(),
    fetchTestimonials(),
  ]);

  const featuredCourse = courses.find((c) => c.featured);

  return (
    <MainLayout>
      <Hero
        headline="Train like a pro. Learn the system. Earn your prime."
        subhead="Elite Muay Thai courses led by ONE Championship athlete Jake Peacock."
        primaryCta={{ text: "Start Training", href: "/courses" }}
        secondaryCta={{ text: "See Courses", href: "/courses" }}
      />

      {/* The System */}
      <Section>
        <div className="text-center mb-16">
          <span className="text-xs font-bold tracking-[0.3em] text-primary/80 uppercase mb-4 block">
            The System
          </span>
          <h2 className="text-3xl md:text-5xl font-bold mb-6">How it Works</h2>
          <p className="text-foreground/50 max-w-xl mx-auto text-lg">
            A structured path from fundamentals to advanced techniques
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { step: "01", title: "Watch", desc: "Cinematic training videos with elite instruction" },
            { step: "02", title: "Drill", desc: "Practice techniques with structured progressions" },
            { step: "03", title: "Submit", desc: "Share your progress and get feedback" },
            { step: "04", title: "Level Up", desc: "Earn points, badges, and climb rankings" },
          ].map((item) => (
            <div
              key={item.step}
              className="group relative rounded-2xl border border-foreground/[0.06] bg-foreground/[0.02] p-8 hover:border-primary/30 hover:bg-foreground/[0.04] transition-all duration-300"
            >
              <span className="text-5xl font-bold text-foreground/[0.06] absolute top-4 right-4 group-hover:text-primary/10 transition-colors">
                {item.step}
              </span>
              <div className="relative">
                <h3 className="text-lg font-bold mb-2 uppercase tracking-wide">{item.title}</h3>
                <p className="text-sm text-foreground/50 leading-relaxed">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* Divider */}
      <div className="h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />

      {/* Featured Course */}
      {featuredCourse && (
        <Section className="relative overflow-hidden grain">
          <div className="absolute -top-32 -right-32 w-[600px] h-[600px] rounded-full bg-primary/[0.04] blur-[120px]" />
          <div className="relative grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="text-xs font-bold tracking-[0.3em] text-primary/80 uppercase mb-4 block">
                Featured Course
              </span>
              <h2 className="text-3xl md:text-5xl font-bold mb-4 leading-tight">{featuredCourse.title}</h2>
              <p className="text-foreground/50 text-lg mb-8 leading-relaxed">{featuredCourse.tagline}</p>

              <div className="grid grid-cols-3 gap-4 mb-8">
                {[
                  { label: "Difficulty", value: featuredCourse.difficulty },
                  { label: "Duration", value: `${featuredCourse.durationWeeks} wks` },
                  { label: "Episodes", value: String(featuredCourse.syllabus.length) },
                ].map((stat) => (
                  <div
                    key={stat.label}
                    className="rounded-xl border border-foreground/[0.06] bg-foreground/[0.02] p-4 text-center"
                  >
                    <p className="text-xs text-foreground/40 uppercase tracking-wider mb-1">{stat.label}</p>
                    <p className="text-lg font-bold">{stat.value}</p>
                  </div>
                ))}
              </div>

              <Link href={`/courses/${featuredCourse.slug}`}>
                <Button size="lg" className="h-14 px-10 text-base font-bold shadow-lg shadow-primary/25">
                  <Play className="mr-2 h-4 w-4" />
                  Start Course
                </Button>
              </Link>
            </div>

            <div className="relative group">
              <div className="absolute -inset-4 rounded-3xl bg-primary/[0.06] blur-2xl group-hover:bg-primary/10 transition-all duration-500" />
              <div className="relative aspect-video rounded-2xl overflow-hidden border border-foreground/[0.08] bg-foreground/[0.03]">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="h-20 w-20 rounded-full border-2 border-primary/30 flex items-center justify-center backdrop-blur-sm bg-background/20 group-hover:scale-110 group-hover:border-primary/50 transition-all duration-300">
                    <Play className="h-8 w-8 text-primary ml-1" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Section>
      )}

      {/* Divider */}
      <div className="h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />

      {/* Track Your Progress */}
      <Section>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-8">
            <div className="space-y-4">
              <span className="text-xs font-bold tracking-[0.3em] text-primary/80 uppercase">Gamified Training</span>
              <h2 className="text-4xl md:text-5xl font-bold leading-tight uppercase">Track Your Progress</h2>
              <p className="text-lg text-foreground/50 leading-relaxed">
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
                    <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                    <h4 className="font-bold uppercase text-sm tracking-wide">{benefit.title}</h4>
                  </div>
                  <p className="text-sm text-foreground/40 leading-snug">{benefit.desc}</p>
                </div>
              ))}
            </div>
            <div className="pt-4">
              <Link href="/dashboard">
                <Button size="lg" className="h-14 px-8 text-base font-bold shadow-lg shadow-primary/25">
                  View My Dashboard
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>

          {/* Dashboard mockup */}
          <div className="relative group">
            <div className="absolute -inset-4 bg-primary/[0.06] rounded-3xl blur-2xl group-hover:bg-primary/10 transition-all duration-500" />
            <div className="relative bg-background border border-foreground/[0.08] rounded-2xl shadow-2xl overflow-hidden">
              <div className="p-4 border-b border-foreground/[0.06] flex items-center justify-between">
                <div className="h-4 w-32 bg-foreground/[0.06] rounded-full" />
                <div className="flex gap-2">
                  <div className="h-6 w-6 rounded-full bg-foreground/[0.06]" />
                  <div className="h-6 w-16 bg-foreground/[0.06] rounded-full" />
                </div>
              </div>
              <div className="p-6 space-y-6">
                <div className="grid grid-cols-4 gap-2">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="h-12 bg-foreground/[0.03] rounded-lg border border-foreground/[0.05] flex items-center justify-center p-2">
                      <div className="space-y-1 w-full">
                        <div className="h-1.5 w-1/2 bg-foreground/[0.06] rounded" />
                        <div className="h-2 w-3/4 bg-primary/15 rounded" />
                      </div>
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-12 gap-6">
                  <div className="col-span-8 space-y-6">
                    <div className="border border-foreground/[0.06] rounded-xl p-4 space-y-3 bg-foreground/[0.02]">
                      <div className="flex gap-3">
                        <div className="h-12 w-12 rounded-lg bg-foreground/[0.06] shrink-0" />
                        <div className="space-y-2 flex-1">
                          <div className="h-3 w-3/4 bg-foreground/[0.06] rounded" />
                          <div className="h-2 w-1/4 bg-foreground/[0.04] rounded" />
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <div className="flex justify-between text-[8px] font-bold">
                          <span className="text-foreground/30 uppercase">Progress</span>
                          <span className="text-primary">75%</span>
                        </div>
                        <div className="h-1.5 w-full bg-foreground/[0.06] rounded-full overflow-hidden">
                          <div className="h-full bg-primary w-3/4" />
                        </div>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="h-3 w-24 bg-foreground/[0.06] rounded" />
                      <div className="grid grid-cols-6 gap-2">
                        {[1, 2, 3, 4, 5, 6].map((i) => (
                          <div key={i} className={cn(
                            "aspect-square rounded-md border flex items-center justify-center",
                            i === 1 ? "border-primary/30 bg-primary/5" : "border-foreground/[0.05] bg-foreground/[0.02]"
                          )}>
                            <div className={cn("h-4 w-4 rounded", i === 1 ? "bg-primary/30" : "bg-foreground/[0.06]")} />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="col-span-4 space-y-4">
                    <div className="h-3 w-full bg-foreground/[0.06] rounded" />
                    <div className="space-y-3">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="flex gap-2">
                          <div className="h-2 w-2 rounded-full bg-primary/30 shrink-0 mt-0.5" />
                          <div className="space-y-1.5 flex-1">
                            <div className="h-2 w-full bg-foreground/[0.06] rounded" />
                            <div className="h-1.5 w-1/2 bg-foreground/[0.04] rounded" />
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

      {/* Divider */}
      <div className="h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />

      {/* Breakdowns */}
      <Section>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="order-2 lg:order-1 relative group">
            <div className="absolute -inset-4 bg-primary/[0.06] rounded-3xl blur-2xl group-hover:bg-primary/10 transition-all duration-500" />
            <div className="relative bg-background border border-foreground/[0.08] rounded-2xl shadow-2xl overflow-hidden">
              <div className="p-3 border-b border-foreground/[0.06] flex items-center gap-2">
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-foreground/10" />
                  <div className="w-2.5 h-2.5 rounded-full bg-foreground/10" />
                  <div className="w-2.5 h-2.5 rounded-full bg-foreground/10" />
                </div>
                <div className="h-4 w-32 bg-foreground/[0.06] rounded-full" />
              </div>
              <div className="p-4 grid grid-cols-12 gap-4">
                <div className="col-span-8 space-y-4">
                  <div className="aspect-video bg-foreground/[0.04] rounded-lg relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent" />
                    <Play className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-8 w-8 text-primary/30" />
                  </div>
                  <div className="space-y-2">
                    <div className="h-4 w-3/4 bg-foreground/[0.06] rounded" />
                    <div className="h-3 w-1/2 bg-foreground/[0.04] rounded" />
                  </div>
                  <div className="pt-4 border-t border-foreground/[0.06]">
                    <div className="h-20 bg-foreground/[0.03] rounded-lg" />
                  </div>
                </div>
                <div className="col-span-4 space-y-3">
                  <div className="h-4 w-full bg-foreground/[0.06] rounded mb-4" />
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="space-y-2">
                      <div className="aspect-video bg-foreground/[0.04] rounded-md" />
                      <div className="h-2 w-full bg-foreground/[0.04] rounded" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
          <div className="order-1 lg:order-2 space-y-8">
            <div className="space-y-4">
              <span className="text-xs font-bold tracking-[0.3em] text-primary/80 uppercase">Exclusive Content</span>
              <h2 className="text-4xl md:text-5xl font-bold leading-tight">Monthly Technique Breakdowns</h2>
              <p className="text-lg text-foreground/50 leading-relaxed">
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
                  <div className="h-5 w-5 rounded-full border border-primary/30 flex items-center justify-center">
                    <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                  </div>
                  <span className="font-medium text-foreground/80">{item}</span>
                </li>
              ))}
            </ul>
            <div className="pt-4">
              <Link href="/breakdowns">
                <Button size="lg" className="h-14 px-8 text-base font-bold shadow-lg shadow-primary/25">
                  Explore Breakdowns
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </Section>

      {/* Divider */}
      <div className="h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />

      {/* Testimonials */}
      <Section>
        <div className="text-center mb-16">
          <span className="text-xs font-bold tracking-[0.3em] text-primary/80 uppercase mb-4 block">
            Community
          </span>
          <h2 className="text-3xl md:text-5xl font-bold mb-6">What Students Say</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {testimonials.map((testimonial) => (
            <Testimonial key={testimonial.id} {...testimonial} />
          ))}
        </div>
      </Section>

      {/* CTA Section */}
      <section className="relative py-24 md:py-32 overflow-hidden grain">
        <div className="absolute inset-0 bg-background" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(215,18,18,0.08)_0%,transparent_70%)]" />
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />

        <Container>
          <div className="relative z-10 text-center max-w-2xl mx-auto">
            <h2 className="text-4xl md:text-6xl font-bold mb-6">Ready to Begin?</h2>
            <p className="text-lg text-foreground/50 mb-12 leading-relaxed">
              Join thousands of martial artists training with Fighting Prime Academy
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/pricing">
                <Button size="lg" className="h-14 px-10 text-base font-bold shadow-lg shadow-primary/25">
                  View Pricing
                </Button>
              </Link>
              <Link href="/courses">
                <Button
                  size="lg"
                  variant="outline"
                  className="h-14 px-10 text-base font-bold border-foreground/10 bg-foreground/[0.03] hover:bg-foreground/[0.06] hover:border-foreground/20"
                >
                  Browse Courses
                </Button>
              </Link>
            </div>
          </div>
        </Container>
      </section>
    </MainLayout>
  );
}
