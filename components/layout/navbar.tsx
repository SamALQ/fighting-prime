"use client";

import Link from "next/link";
import { useAuth } from "@/lib/hooks/use-auth";
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
import { LogOut, User, ChevronRight, Play } from "lucide-react";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { useState, useRef } from "react";
import { courses } from "@/data/courses";
import { cn } from "@/lib/utils";
import Image from "next/image";

export function NavBar() {
  const { isLoggedIn, isLoading, logout, userEmail } = useAuth();
  const [isCoursesHovered, setIsCoursesHovered] = useState(false);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleMouseEnter = () => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    setIsCoursesHovered(true);
  };

  const handleMouseLeave = () => {
    hoverTimeoutRef.current = setTimeout(() => {
      setIsCoursesHovered(false);
    }, 150);
  };

  const featuredCourses = courses.slice(0, 3); // Show first 3 courses as teasers

  return (
    <nav className="border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <Container>
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-xl font-bold text-primary">FPA</span>
            <span className="hidden sm:inline text-sm text-muted-foreground">
              Fighting Prime Academy
            </span>
          </Link>

          <div className="flex items-center gap-6">
            <Link
              href="/"
              className="text-sm font-medium text-foreground/80 hover:text-foreground transition-colors"
            >
              Home
            </Link>

            {!isLoading && isLoggedIn && (
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

              {/* Mega Dropdown */}
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
                          src={course.posterImage || course.difficultyMeterImage || course.coverImage}
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
                          {course.difficulty} • {course.durationWeeks} Weeks
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

            <ThemeToggle />

            {!isLoading && (
              <>
                {isLoggedIn ? (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="bg-primary text-primary-foreground">
                            <User className="h-4 w-4" />
                          </AvatarFallback>
                        </Avatar>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {userEmail && (
                        <>
                          <DropdownMenuLabel>{userEmail}</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                        </>
                      )}
                      <DropdownMenuItem asChild>
                        <Link href="/dashboard">
                          <User className="mr-2 h-4 w-4" />
                          <span>Dashboard</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={logout}>
                        <LogOut className="mr-2 h-4 w-4" />
                        <span>Logout</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : (
                  <Link href="/login">
                    <Button>Login</Button>
                  </Link>
                )}
              </>
            )}
          </div>
        </div>
      </Container>
    </nav>
  );
}
