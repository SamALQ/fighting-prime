"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { useState } from "react";
import {
  LayoutDashboard,
  BarChart3,
  Film,
  MessageSquare,
  DollarSign,
  Settings,
  User,
  LogOut,
  Home,
  Menu,
  X,
  ChevronLeft,
  Crown,
  ClipboardCheck,
} from "lucide-react";

const NAV_ITEMS = [
  { href: "/instructor", label: "Overview", icon: LayoutDashboard, exact: true },
  { href: "/instructor/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/instructor/content", label: "My Content", icon: Film },
  { href: "/instructor/submissions", label: "Elite Submissions", icon: Crown },
  { href: "/instructor/assignments", label: "Assignments", icon: ClipboardCheck },
  { href: "/instructor/community", label: "Community", icon: MessageSquare },
  { href: "/instructor/earnings", label: "Earnings", icon: DollarSign },
  { href: "/instructor/settings", label: "Settings", icon: Settings },
];

export default function InstructorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { userEmail, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    window.location.href = "/";
  };

  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname.startsWith(href);

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/30 dark:bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed lg:static inset-y-0 left-0 z-50 w-64 bg-foreground/[0.02] border-r border-foreground/[0.06] flex flex-col transition-transform duration-200 lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Sidebar header */}
        <div className="h-14 flex items-center justify-between px-4 border-b border-foreground/[0.06] flex-shrink-0">
          <Link href="/instructor" className="flex items-center gap-2">
            <span className="text-lg font-bold text-primary">FPA</span>
            <span className="text-xs font-medium text-foreground/40">
              Instructor
            </span>
          </Link>
          <button
            className="lg:hidden h-8 w-8 flex items-center justify-center rounded-md hover:bg-foreground/[0.04]"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Nav items */}
        <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map((item) => {
            const active = isActive(item.href, item.exact);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                  active
                    ? "bg-primary/10 text-primary"
                    : "text-foreground/40 hover:text-foreground hover:bg-foreground/[0.04]"
                )}
              >
                <item.icon className="h-4 w-4 flex-shrink-0" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Sidebar footer */}
        <div className="p-3 border-t border-foreground/[0.06] flex-shrink-0">
          <Link
            href="/dashboard"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-foreground/40 hover:text-foreground hover:bg-foreground/[0.04] transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
            Back to Dashboard
          </Link>
        </div>
      </aside>

      {/* Main content area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="h-14 border-b border-foreground/[0.06] bg-background/90 backdrop-blur-xl flex items-center justify-between px-4 flex-shrink-0">
          <div className="flex items-center gap-3">
            <button
              className="lg:hidden h-8 w-8 flex items-center justify-center rounded-md hover:bg-foreground/[0.04]"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="h-4 w-4" />
            </button>
            <Link
              href="/"
              className="text-sm text-foreground/40 hover:text-foreground transition-colors flex items-center gap-1"
            >
              <Home className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Main Site</span>
            </Link>
          </div>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="relative h-8 w-8 rounded-full p-0"
                >
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      <User className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                {userEmail && (
                  <div className="px-2 py-1.5 text-xs text-foreground/40 truncate">
                    {userEmail}
                  </div>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/dashboard">
                    <LayoutDashboard className="mr-2 h-4 w-4" />
                    Dashboard
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/account">
                    <Settings className="mr-2 h-4 w-4" />
                    Account
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onSelect={(e) => {
                    e.preventDefault();
                    handleLogout();
                  }}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
