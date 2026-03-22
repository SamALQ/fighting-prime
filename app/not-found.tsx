import Link from "next/link";
import { MainLayout } from "@/components/layout/main-layout";
import { Section } from "@/components/layout/section";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/layout/container";

export default function NotFound() {
  return (
    <MainLayout>
      <Section>
        <Container>
          <div className="text-center max-w-2xl mx-auto py-20">
            <h1 className="text-6xl font-bold mb-4 text-primary">404</h1>
            <h2 className="text-3xl font-semibold mb-4">Page Not Found</h2>
            <p className="text-muted-foreground mb-8">
              The page you're looking for doesn't exist or has been moved.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/">
                <Button size="lg">Return Home</Button>
              </Link>
              <Link href="/courses">
                <Button size="lg" variant="outline">Browse Courses</Button>
              </Link>
            </div>
          </div>
        </Container>
      </Section>
    </MainLayout>
  );
}
