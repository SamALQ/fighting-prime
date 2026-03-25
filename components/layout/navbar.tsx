"use client";

import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Container } from "./container";
import {
  LogOut,
  User,
  ChevronRight,
  Play,
  LayoutDashboard,
  CreditCard,
  Settings,
  BarChart3,
  Shield,
  Menu,
  X,
} from "lucide-react";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { NotificationBell } from "@/components/ui/notification-bell";
import { GlobalSearch } from "@/components/ui/global-search";
import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import type { Course } from "@/data/courses";
import { cn } from "@/lib/utils";
import Image from "next/image";

export function NavBar() {
  const { user, isLoggedIn, isLoading, logout, userEmail, role } = useAuth();
  const [isCoursesHovered, setIsCoursesHovered] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [featuredCourses, setFeaturedCourses] = useState<Course[]>([]);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    fetch("/api/courses")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setFeaturedCourses(data.slice(0, 3));
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  const handleMouseEnter = () => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    setIsCoursesHovered(true);
  };

  const handleMouseLeave = () => {
    hoverTimeoutRef.current = setTimeout(() => {
      setIsCoursesHovered(false);
    }, 150);
  };

  const handleLogout = async () => {
    setMobileOpen(false);
    await logout();
    window.location.href = "/";
  };

  const closeMobile = () => setMobileOpen(false);

  const navLinks = [
    { href: "/", label: "Home", always: true },
    { href: "/dashboard", label: "Dashboard", auth: true },
    { href: "/courses", label: "Courses", always: true },
    { href: "/breakdowns", label: "Breakdowns", always: true },
    { href: "/community", label: "Community", always: true },
    { href: "/training", label: "Training", auth: true },
    { href: "/pricing", label: "Pricing", always: true },
    { href: "/about", label: "About", always: true },
  ];

  const navElement = (
    <nav className="bg-background/90 backdrop-blur-xl supports-[backdrop-filter]:bg-background/70 sticky top-0 z-50 border-b border-foreground/[0.06]">
      <Container>
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-xl font-bold text-primary">FPA</span>
            <span className="hidden sm:inline text-sm text-muted-foreground">
              Fighting Prime Academy
            </span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden lg:flex items-center gap-6">
            <Link
              href="/"
              className="text-sm font-medium text-foreground/80 hover:text-foreground transition-colors"
            >
              Home
            </Link>

            {isLoggedIn && (
              <Link
                href="/dashboard"
                className="text-sm font-medium text-foreground/80 hover:text-foreground transition-colors"
              >
                Dashboard
              </Link>
            )}

            <div
              className="relative"
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
            >
              <Link
                href="/courses"
                className={cn(
                  "text-sm font-medium transition-colors flex items-center gap-1 h-16",
                  isCoursesHovered ? "text-primary" : "text-foreground/80 hover:text-foreground"
                )}
              >
                Courses
              </Link>

              <div
                className={cn(
                  "absolute top-[calc(100%-1px)] left-1/2 -translate-x-1/2 w-[600px] bg-background border border-border rounded-b-2xl shadow-2xl transition-all duration-300 origin-top z-50 overflow-hidden",
                  isCoursesHovered
                    ? "opacity-100 scale-y-100 pointer-events-auto"
                    : "opacity-0 scale-y-95 pointer-events-none"
                )}
              >
                <div className="p-6 grid grid-cols-3 gap-4">
                  <div className="col-span-3 flex items-center justify-between mb-2">
                    <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                      Featured Courses
                    </h3>
                    <Link
                      href="/courses"
                      className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
                    >
                      View All <ChevronRight className="h-3 w-3" />
                    </Link>
                  </div>
                  {featuredCourses.map((course) => (
                    <Link
                      key={course.id}
                      href={`/courses/${course.slug}`}
                      className="group block space-y-3"
                    >
                      <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-muted">
                        <Image
                          src={course.teaserPortraitImage || course.posterImage || course.coverImage}
                          alt={course.title}
                          fill
                          className="object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center shadow-lg transform scale-0 group-hover:scale-100 transition-transform duration-300">
                            <Play className="h-4 w-4 fill-current text-white" />
                          </div>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <h4 className="text-sm font-bold leading-tight group-hover:text-primary transition-colors">
                          {course.title}
                        </h4>
                        <p className="text-[10px] text-muted-foreground line-clamp-1 capitalize">
                          {course.difficulty} &bull; {course.durationWeeks} Weeks
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
                <div className="bg-muted/30 p-4 flex justify-center border-t border-border">
                  <p className="text-[11px] text-muted-foreground">
                    Unlock elite Muay Thai training with Fighting Prime Academy
                  </p>
                </div>
              </div>
            </div>

            <Link
              href="/breakdowns"
              className="text-sm font-medium text-foreground/80 hover:text-foreground transition-colors"
            >
              Breakdowns
            </Link>
            <Link
              href="/community"
              className="text-sm font-medium text-foreground/80 hover:text-foreground transition-colors"
            >
              Community
            </Link>
            {isLoggedIn && (
              <Link
                href="/training"
                className="text-sm font-medium text-foreground/80 hover:text-foreground transition-colors"
              >
                Training
              </Link>
            )}
            <Link
              href="/pricing"
              className="text-sm font-medium text-foreground/80 hover:text-foreground transition-colors"
            >
              Pricing
            </Link>
            <Link
              href="/about"
              className="text-sm font-medium text-foreground/80 hover:text-foreground transition-colors"
            >
              About
            </Link>

            <GlobalSearch />
            <NotificationBell />
            <ThemeToggle />

            <div className="w-8 h-8 flex items-center justify-center">
              {isLoading ? (
                <div className="h-8 w-8 rounded-full bg-muted animate-pulse" />
              ) : isLoggedIn ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-8 w-8 rounded-full p-0">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-primary text-primary-foreground">
                          <User className="h-4 w-4" />
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    {userEmail && (
                      <>
                        <DropdownMenuLabel className="font-normal">
                          <p className="text-sm font-medium">{userEmail}</p>
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                      </>
                    )}
                    <DropdownMenuItem asChild>
                      <Link href="/dashboard">
                        <LayoutDashboard className="mr-2 h-4 w-4" />
                        <span>Dashboard</span>
                      </Link>
                    </DropdownMenuItem>
                    {user && (
                      <DropdownMenuItem asChild>
                        <Link href={`/profile/${user.id}`}>
                          <User className="mr-2 h-4 w-4" />
                          <span>My Profile</span>
                        </Link>
                      </DropdownMenuItem>
                    )}
                    {(role === "instructor" || role === "admin") && (
                      <DropdownMenuItem asChild>
                        <Link href="/instructor">
                          <BarChart3 className="mr-2 h-4 w-4" />
                          <span>Instructor Portal</span>
                        </Link>
                      </DropdownMenuItem>
                    )}
                    {role === "admin" && (
                      <DropdownMenuItem asChild>
                        <Link href="/admin">
                          <Shield className="mr-2 h-4 w-4" />
                          <span>Admin</span>
                        </Link>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/account">
                        <Settings className="mr-2 h-4 w-4" />
                        <span>Account Settings</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/pricing">
                        <CreditCard className="mr-2 h-4 w-4" />
                        <span>Subscription</span>
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
                      <span>Logout</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Link href="/login">
                  <Button size="sm">Login</Button>
                </Link>
              )}
            </div>
          </div>

          {/* Mobile: theme toggle + hamburger */}
          <div className="flex lg:hidden items-center gap-2">
            <ThemeToggle />
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="h-9 w-9 flex items-center justify-center rounded-md hover:bg-muted transition-colors"
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </Container>

    </nav>
  );

  const mobileDrawer = (
    <div
      className={cn(
        "fixed inset-0 top-16 z-[9999] lg:hidden transition-all duration-300",
        mobileOpen
          ? "opacity-100 pointer-events-auto"
          : "opacity-0 pointer-events-none"
      )}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60"
        onClick={closeMobile}
      />

      {/* Drawer panel */}
      <div
        className={cn(
          "absolute top-0 right-0 w-72 h-full bg-background border-l border-border shadow-2xl transition-transform duration-300 flex flex-col",
          mobileOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        <div className="flex-1 overflow-y-auto py-4 px-4">
          {/* Nav links */}
          <div className="space-y-1">
            {navLinks.map((link) => {
              if (link.auth && !isLoggedIn) return null;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={closeMobile}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-foreground/80 hover:text-foreground hover:bg-muted/50 transition-colors"
                >
                  {link.label}
                </Link>
              );
            })}
          </div>

          {/* Auth section */}
          {!isLoading && (
            <>
              <div className="my-4 border-t border-border" />

              {isLoggedIn ? (
                <div className="space-y-1">
                  {userEmail && (
                    <div className="px-3 py-2 text-xs text-muted-foreground truncate">
                      {userEmail}
                    </div>
                  )}
                  {user && (
                    <Link
                      href={`/profile/${user.id}`}
                      onClick={closeMobile}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-foreground/80 hover:text-foreground hover:bg-muted/50 transition-colors"
                    >
                      <User className="h-4 w-4" />
                      My Profile
                    </Link>
                  )}
                  {(role === "instructor" || role === "admin") && (
                    <Link
                      href="/instructor"
                      onClick={closeMobile}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-foreground/80 hover:text-foreground hover:bg-muted/50 transition-colors"
                    >
                      <BarChart3 className="h-4 w-4" />
                      Instructor Portal
                    </Link>
                  )}
                  {role === "admin" && (
                    <Link
                      href="/admin"
                      onClick={closeMobile}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-foreground/80 hover:text-foreground hover:bg-muted/50 transition-colors"
                    >
                      <Shield className="h-4 w-4" />
                      Admin
                    </Link>
                  )}
                  <Link
                    href="/account"
                    onClick={closeMobile}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-foreground/80 hover:text-foreground hover:bg-muted/50 transition-colors"
                  >
                    <Settings className="h-4 w-4" />
                    Account Settings
                  </Link>
                  <Link
                    href="/pricing"
                    onClick={closeMobile}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-foreground/80 hover:text-foreground hover:bg-muted/50 transition-colors"
                  >
                    <CreditCard className="h-4 w-4" />
                    Subscription
                  </Link>

                  <div className="my-3 border-t border-border" />

                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors w-full text-left"
                  >
                    <LogOut className="h-4 w-4" />
                    Logout
                  </button>
                </div>
              ) : (
                <div className="px-3 space-y-2">
                  <Link href="/login" onClick={closeMobile}>
                    <Button className="w-full">Login</Button>
                  </Link>
                  <Link href="/signup" onClick={closeMobile}>
                    <Button variant="outline" className="w-full">
                      Sign Up
                    </Button>
                  </Link>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <>
      {navElement}
      {mounted && createPortal(mobileDrawer, document.body)}
    </>
  );
}
