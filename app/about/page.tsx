import { MainLayout } from "@/components/layout/main-layout";
import { Section } from "@/components/layout/section";
import { Container } from "@/components/layout/container";

export default function AboutPage() {
  return (
    <MainLayout>
      <Section className="relative overflow-hidden">
        <div className="absolute -top-32 right-0 w-[500px] h-[500px] rounded-full bg-primary/[0.04] blur-[120px]" />
        <Container>
          <div className="relative z-10 max-w-3xl mx-auto space-y-12">
            <div>
              <span className="text-xs font-bold tracking-[0.3em] text-primary/80 uppercase mb-4 block">
                Our Story
              </span>
              <h1 className="text-4xl md:text-5xl font-bold mb-4">About Fighting Prime Academy</h1>
              <p className="text-lg text-foreground/50">
                Elite Muay Thai instruction from ONE Championship athlete Jake Peacock
              </p>
            </div>

            <div className="h-px bg-gradient-to-r from-transparent via-primary/15 to-transparent" />

            <div className="space-y-10">
              <div>
                <h2 className="text-2xl font-bold mb-4">Meet Jake Peacock</h2>
                <p className="text-foreground/60 leading-relaxed">
                  Jake Peacock is a professional Muay Thai fighter competing in ONE Championship, 
                  one of the world&apos;s premier martial arts organizations. With years of experience 
                  training and competing at the highest level, Jake brings elite-level instruction 
                  directly to your screen.
                </p>
                <p className="text-foreground/60 leading-relaxed mt-4">
                  His systematic approach to teaching breaks down complex techniques into 
                  digestible lessons, making professional-level training accessible to martial 
                  artists worldwide&mdash;whether you&apos;re a hobbyist looking to improve or an aspiring 
                  fighter preparing for competition.
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-bold mb-4">Our Mission</h2>
                <p className="text-foreground/60 leading-relaxed">
                  Fighting Prime Academy exists to democratize elite martial arts instruction. 
                  We believe that world-class training shouldn&apos;t be limited by geography or gym 
                  access. Through structured courses, cinematic production, and gamified learning, 
                  we help martial artists of all levels achieve their goals.
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-bold mb-4">The System</h2>
                <p className="text-foreground/60 leading-relaxed">
                  Our courses are built on a foundation of structured progression. Each course 
                  is broken down into episodes that build upon one another, ensuring you master 
                  fundamentals before advancing. With drills, assignments, and progress tracking, 
                  you&apos;ll see measurable improvement with every session.
                </p>
              </div>

              <div className="rounded-2xl border border-foreground/[0.06] bg-foreground/[0.02] p-8">
                <h3 className="text-xl font-bold mb-3">Train like a pro. Learn the system. Earn your prime.</h3>
                <p className="text-foreground/50">
                  This is more than a tagline&mdash;it&apos;s our commitment to you. Train with the 
                  intensity of a professional, follow a proven system, and earn your place 
                  among the best.
                </p>
              </div>
            </div>
          </div>
        </Container>
      </Section>
    </MainLayout>
  );
}
