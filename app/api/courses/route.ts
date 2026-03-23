import { NextResponse } from "next/server";
import { fetchCourses } from "@/lib/db";

export async function GET() {
  const courses = await fetchCourses();
  return NextResponse.json(courses);
}
