import { MainLayout } from "@/components/layout/main-layout";
import { Section } from "@/components/layout/section";
import { Container } from "@/components/layout/container";

export default function AboutPage() {
  return (
    <MainLayout>
      <Section>
        <Container>
          <div className="max-w-3xl mx-auto space-y-8">
            <div>
              <h1 className="text-4xl font-bold mb-4">About Fighting Prime Academy</h1>
              <p className="text-xl text-muted-foreground">
                Elite Muay Thai instruction from ONE Championship athlete Jake Peacock
              </p>
            </div>

            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-semibold mb-4">Meet Jake Peacock</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Jake Peacock is a professional Muay Thai fighter competing in ONE Championship, 
                  one of the world's premier martial arts organizations. With years of experience 
                  training and competing at the highest level, Jake brings elite-level instruction 
                  directly to your screen.
                </p>
                <p className="text-muted-foreground leading-relaxed mt-4">
                  His systematic approach to teaching breaks down complex techniques into 
                  digestible lessons, making professional-level training accessible to martial 
                  artists worldwide—whether you're a hobbyist looking to improve or an aspiring 
                  fighter preparing for competition.
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-semibold mb-4">Our Mission</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Fighting Prime Academy exists to democratize elite martial arts instruction. 
                  We believe that world-class training shouldn't be limited by geography or gym 
                  access. Through structured courses, cinematic production, and gamified learning, 
                  we help martial artists of all levels achieve their goals.
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-semibold mb-4">The System</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Our courses are built on a foundation of structured progression. Each course 
                  is broken down into episodes that build upon one another, ensuring you master 
                  fundamentals before advancing. With drills, assignments, and progress tracking, 
                  you'll see measurable improvement with every session.
                </p>
              </div>

              <div className="bg-card border border-border rounded-xl p-6">
                <h3 className="text-xl font-semibold mb-3">Train like a pro. Learn the system. Earn your prime.</h3>
                <p className="text-muted-foreground">
                  This is more than a tagline—it's our commitment to you. Train with the 
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
