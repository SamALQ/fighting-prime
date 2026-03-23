import Link from "next/link";
import { Container } from "./container";

export function Footer() {
  return (
    <footer className="relative bg-background">
      <div className="h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />

      <Container>
        <div className="py-16">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-primary tracking-wider">FPA</h3>
              <p className="text-sm text-foreground/40 leading-relaxed">
                Train like a pro. Learn the system. Earn your prime.
              </p>
            </div>

            <div>
              <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-foreground/60 mb-5">Learn</h4>
              <ul className="space-y-3 text-sm">
                <li>
                  <Link href="/courses" className="text-foreground/40 hover:text-foreground transition-colors">
                    All Courses
                  </Link>
                </li>
                <li>
                  <Link href="/pricing" className="text-foreground/40 hover:text-foreground transition-colors">
                    Pricing
                  </Link>
                </li>
                <li>
                  <Link href="/faq" className="text-foreground/40 hover:text-foreground transition-colors">
                    FAQ
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-foreground/60 mb-5">About</h4>
              <ul className="space-y-3 text-sm">
                <li>
                  <Link href="/about" className="text-foreground/40 hover:text-foreground transition-colors">
                    About Us
                  </Link>
                </li>
                <li>
                  <a href="#" className="text-foreground/40 hover:text-foreground transition-colors">
                    Contact
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-foreground/60 mb-5">Connect</h4>
              <ul className="space-y-3 text-sm">
                <li>
                  <a href="#" className="text-foreground/40 hover:text-foreground transition-colors">
                    Instagram
                  </a>
                </li>
                <li>
                  <a href="#" className="text-foreground/40 hover:text-foreground transition-colors">
                    Twitter
                  </a>
                </li>
                <li>
                  <a href="#" className="text-foreground/40 hover:text-foreground transition-colors">
                    YouTube
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-12 pt-8">
            <div className="h-px bg-gradient-to-r from-transparent via-foreground/[0.06] to-transparent mb-8" />
            <p className="text-xs text-foreground/30 text-center tracking-wider">
              &copy; {new Date().getFullYear()} Fighting Prime Academy. All rights reserved.
            </p>
          </div>
        </div>
      </Container>
    </footer>
  );
}
