"use client";

import { useEffect, useState, useCallback } from "react";
import { MainLayout } from "@/components/layout/main-layout";
import { Section } from "@/components/layout/section";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  UserPlus,
  CheckCircle2,
  XCircle,
  Link2,
  Unlink,
  Search,
  ChevronLeft,
} from "lucide-react";
import Link from "next/link";

interface Instructor {
  id: string;
  user_id: string;
  display_name: string;
  bio: string | null;
  avatar_url: string | null;
  approved: boolean;
  payout_email: string | null;
  created_at: string;
  profiles?: { email: string; full_name: string | null };
}

interface CourseRow {
  id: string;
  title: string;
  slug: string;
  instructor_id: string | null;
}

interface UserRow {
  id: string;
  email: string;
  full_name: string | null;
  role: string;
}

export default function AdminInstructorsPage() {
  const [instructors, setInstructors] = useState<Instructor[]>([]);
  const [courses, setCourses] = useState<CourseRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<UserRow[]>([]);
  const [searching, setSearching] = useState(false);
  const [newDisplayName, setNewDisplayName] = useState("");
  const [newPayoutEmail, setNewPayoutEmail] = useState("");
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [assigningCourse, setAssigningCourse] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    const res = await fetch("/api/admin/instructors");
    if (res.ok) {
      const data = await res.json();
      setInstructors(data.instructors);
      setCourses(data.courses);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const searchUsers = async (q: string) => {
    setSearchQuery(q);
    if (q.length < 2) {
      setSearchResults([]);
      return;
    }
    setSearching(true);
    const res = await fetch(`/api/admin/users?q=${encodeURIComponent(q)}`);
    if (res.ok) {
      const data = await res.json();
      const existingUserIds = new Set(instructors.map((i) => i.user_id));
      setSearchResults(data.users.filter((u: UserRow) => !existingUserIds.has(u.id)));
    }
    setSearching(false);
  };

  const createInstructor = async () => {
    if (!selectedUserId || !newDisplayName) return;
    const res = await fetch("/api/admin/instructors", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: selectedUserId,
        displayName: newDisplayName,
        payoutEmail: newPayoutEmail || undefined,
      }),
    });
    if (res.ok) {
      setShowCreate(false);
      setSelectedUserId(null);
      setNewDisplayName("");
      setNewPayoutEmail("");
      setSearchQuery("");
      setSearchResults([]);
      fetchData();
    }
  };

  const toggleApproval = async (instructor: Instructor) => {
    await fetch("/api/admin/instructors", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: instructor.id, approved: !instructor.approved }),
    });
    fetchData();
  };

  const assignCourse = async (courseId: string, instructorId: string) => {
    await fetch("/api/admin/instructors", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: instructorId, courseId, action: "assign-course" }),
    });
    setAssigningCourse(null);
    fetchData();
  };

  const unassignCourse = async (courseId: string) => {
    await fetch("/api/admin/instructors", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ courseId, action: "unassign-course" }),
    });
    fetchData();
  };

  if (loading) {
    return (
      <MainLayout>
        <Section>
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-muted rounded w-64" />
            <div className="h-32 bg-muted rounded" />
          </div>
        </Section>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <Section className="pb-24">
        <div className="mb-8">
          <Link
            href="/admin"
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4"
          >
            <ChevronLeft className="h-4 w-4" />
            Admin
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Manage Instructors</h1>
              <p className="text-muted-foreground mt-1">
                Create instructor accounts and assign them to courses
              </p>
            </div>
            <Button onClick={() => setShowCreate(true)} className="gap-2">
              <UserPlus className="h-4 w-4" />
              Add Instructor
            </Button>
          </div>
        </div>

        {/* Create instructor panel */}
        {showCreate && (
          <div className="border border-border rounded-lg p-6 mb-8 bg-card space-y-4">
            <h2 className="text-lg font-semibold">New Instructor</h2>

            <div>
              <label className="text-sm font-medium text-muted-foreground block mb-1.5">
                Search for a user
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search by email or name..."
                  value={searchQuery}
                  onChange={(e) => searchUsers(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 rounded-md border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>
              {searching && (
                <p className="text-xs text-muted-foreground mt-1">Searching...</p>
              )}
              {searchResults.length > 0 && (
                <div className="mt-2 border border-border rounded-md divide-y divide-border max-h-40 overflow-y-auto">
                  {searchResults.map((u) => (
                    <button
                      key={u.id}
                      onClick={() => {
                        setSelectedUserId(u.id);
                        setNewDisplayName(u.full_name || u.email.split("@")[0]);
                        setNewPayoutEmail(u.email);
                        setSearchResults([]);
                        setSearchQuery(u.email);
                      }}
                      className={cn(
                        "w-full text-left px-3 py-2 text-sm hover:bg-muted/50 transition-colors",
                        selectedUserId === u.id && "bg-primary/10"
                      )}
                    >
                      <span className="font-medium">{u.full_name || "—"}</span>
                      <span className="text-muted-foreground ml-2">{u.email}</span>
                      <span className="text-xs text-muted-foreground ml-2">({u.role})</span>
                    </button>
                  ))}
                </div>
              )}
              {selectedUserId && (
                <p className="text-xs text-green-500 mt-1">
                  User selected: {searchQuery}
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground block mb-1.5">
                  Display Name
                </label>
                <input
                  type="text"
                  value={newDisplayName}
                  onChange={(e) => setNewDisplayName(e.target.value)}
                  className="w-full px-3 py-2 rounded-md border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground block mb-1.5">
                  Payout Email
                </label>
                <input
                  type="email"
                  value={newPayoutEmail}
                  onChange={(e) => setNewPayoutEmail(e.target.value)}
                  className="w-full px-3 py-2 rounded-md border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>
            </div>

            <div className="flex gap-3">
              <Button onClick={createInstructor} disabled={!selectedUserId || !newDisplayName}>
                Create Instructor
              </Button>
              <Button variant="outline" onClick={() => setShowCreate(false)}>
                Cancel
              </Button>
            </div>
          </div>
        )}

        {/* Instructors list */}
        <div className="space-y-4 mb-12">
          <h2 className="text-lg font-semibold">
            Instructors ({instructors.length})
          </h2>
          {instructors.length === 0 ? (
            <p className="text-muted-foreground text-sm">No instructors yet.</p>
          ) : (
            <div className="divide-y divide-border border border-border rounded-lg overflow-hidden">
              {instructors.map((inst) => {
                const assignedCourses = courses.filter(
                  (c) => c.instructor_id === inst.id
                );
                return (
                  <div key={inst.id} className="p-4 bg-card">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold">{inst.display_name}</span>
                          {inst.approved ? (
                            <span className="text-xs px-2 py-0.5 rounded-full bg-green-500/10 text-green-500 font-medium">
                              Approved
                            </span>
                          ) : (
                            <span className="text-xs px-2 py-0.5 rounded-full bg-yellow-500/10 text-yellow-500 font-medium">
                              Pending
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {inst.profiles?.email ?? "—"}
                        </p>
                        {inst.payout_email && (
                          <p className="text-xs text-muted-foreground">
                            Payout: {inst.payout_email}
                          </p>
                        )}
                        {assignedCourses.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mt-2">
                            {assignedCourses.map((c) => (
                              <span
                                key={c.id}
                                className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-md bg-primary/10 text-primary"
                              >
                                {c.title}
                                <button
                                  onClick={() => unassignCourse(c.id)}
                                  className="hover:text-destructive"
                                >
                                  <Unlink className="h-3 w-3" />
                                </button>
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="flex gap-2 flex-shrink-0">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => toggleApproval(inst)}
                          className="gap-1"
                        >
                          {inst.approved ? (
                            <>
                              <XCircle className="h-3.5 w-3.5" />
                              Revoke
                            </>
                          ) : (
                            <>
                              <CheckCircle2 className="h-3.5 w-3.5" />
                              Approve
                            </>
                          )}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            setAssigningCourse(
                              assigningCourse === inst.id ? null : inst.id
                            )
                          }
                          className="gap-1"
                        >
                          <Link2 className="h-3.5 w-3.5" />
                          Assign Course
                        </Button>
                      </div>
                    </div>

                    {assigningCourse === inst.id && (
                      <div className="mt-3 pt-3 border-t border-border">
                        <p className="text-sm font-medium mb-2">
                          Select a course to assign:
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {courses
                            .filter((c) => !c.instructor_id)
                            .map((c) => (
                              <Button
                                key={c.id}
                                variant="outline"
                                size="sm"
                                onClick={() => assignCourse(c.id, inst.id)}
                              >
                                {c.title}
                              </Button>
                            ))}
                          {courses.filter((c) => !c.instructor_id).length === 0 && (
                            <p className="text-sm text-muted-foreground">
                              All courses are already assigned.
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Courses assignment overview */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Course Assignments</h2>
          <div className="divide-y divide-border border border-border rounded-lg overflow-hidden">
            {courses.map((course) => {
              const instructor = instructors.find(
                (i) => i.id === course.instructor_id
              );
              return (
                <div
                  key={course.id}
                  className="flex items-center justify-between p-3 bg-card"
                >
                  <span className="font-medium text-sm">{course.title}</span>
                  {instructor ? (
                    <span className="text-sm text-muted-foreground">
                      {instructor.display_name}
                    </span>
                  ) : (
                    <span className="text-sm text-yellow-500">Unassigned</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </Section>
    </MainLayout>
  );
}
