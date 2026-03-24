import { createClient } from "@/lib/supabase/server";

interface CreateNotificationParams {
  userId: string;
  type: string;
  title: string;
  body?: string;
  link?: string;
  metadata?: Record<string, unknown>;
}

export async function createNotification(params: CreateNotificationParams) {
  const supabase = await createClient();
  const { error } = await supabase.from("notifications").insert({
    user_id: params.userId,
    type: params.type,
    title: params.title,
    body: params.body ?? "",
    link: params.link ?? null,
    metadata: params.metadata ?? {},
  });

  if (error) {
    console.error("[notifications] Failed to create:", error.message);
  }
}

export async function createBulkNotifications(
  items: CreateNotificationParams[]
) {
  if (items.length === 0) return;
  const supabase = await createClient();
  const { error } = await supabase.from("notifications").insert(
    items.map((p) => ({
      user_id: p.userId,
      type: p.type,
      title: p.title,
      body: p.body ?? "",
      link: p.link ?? null,
      metadata: p.metadata ?? {},
    }))
  );

  if (error) {
    console.error("[notifications] Bulk insert failed:", error.message);
  }
}
