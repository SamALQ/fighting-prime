import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { listObjects, getPresignedUploadUrl, deleteObject, headObject } from "@/lib/s3";

async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") return { error: "Forbidden" };

  return { error: null };
}

export async function GET(request: NextRequest) {
  const { error } = await requireAdmin();
  if (error) return NextResponse.json({ error }, { status: 401 });

  const prefix = request.nextUrl.searchParams.get("prefix") ?? "";
  const action = request.nextUrl.searchParams.get("action");

  if (action === "head") {
    const key = request.nextUrl.searchParams.get("key");
    if (!key) return NextResponse.json({ error: "key required" }, { status: 400 });
    try {
      const meta = await headObject(key);
      return NextResponse.json(meta);
    } catch {
      return NextResponse.json({ error: "Object not found" }, { status: 404 });
    }
  }

  try {
    const result = await listObjects(prefix);
    return NextResponse.json(result);
  } catch (err) {
    console.error("S3 list error:", err);
    return NextResponse.json(
      { error: "Failed to list objects" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const { error } = await requireAdmin();
  if (error) return NextResponse.json({ error }, { status: 401 });

  const body = await request.json();
  const { key, contentType } = body;

  if (!key || !contentType) {
    return NextResponse.json(
      { error: "key and contentType required" },
      { status: 400 }
    );
  }

  try {
    const uploadUrl = await getPresignedUploadUrl(key, contentType);
    return NextResponse.json({ uploadUrl, key });
  } catch (err) {
    console.error("S3 presigned upload error:", err);
    return NextResponse.json(
      { error: "Failed to generate upload URL" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  const { error } = await requireAdmin();
  if (error) return NextResponse.json({ error }, { status: 401 });

  const body = await request.json();
  const { key } = body;

  if (!key) {
    return NextResponse.json({ error: "key required" }, { status: 400 });
  }

  try {
    await deleteObject(key);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("S3 delete error:", err);
    return NextResponse.json(
      { error: "Failed to delete object" },
      { status: 500 }
    );
  }
}
