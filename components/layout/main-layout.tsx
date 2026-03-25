import { NavBar } from "./navbar";
import { Footer } from "./footer";
import { HudPill } from "@/components/ui/hud/hud-pill";

export function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <NavBar />
      <main className="flex-1">{children}</main>
      <Footer />
      <HudPill />
    </div>
  );
}
