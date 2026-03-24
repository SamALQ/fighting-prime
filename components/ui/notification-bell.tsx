"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  Bell,
  CheckCircle2,
  AlertCircle,
  MessageCircle,
  Crown,
  Trophy,
  Flame,
  Check,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth-context";
import Link from "next/link";

interface Notification {
  id: string;
  type: string;
  title: string;
  body: string;
  link: string | null;
  is_read: boolean;
  created_at: string;
}

const TYPE_ICONS: Record<string, typeof Bell> = {
  assignment_approved: CheckCircle2,
  assignment_revision: AlertCircle,
  elite_responded: Crown,
  elite_claimed: Crown,
  discussion_reply: MessageCircle,
  level_up: Trophy,
  streak: Flame,
};

const TYPE_COLORS: Record<string, string> = {
  assignment_approved: "text-green-500 bg-green-500/10",
  assignment_revision: "text-orange-400 bg-orange-400/10",
  elite_responded: "text-primary bg-primary/10",
  elite_claimed: "text-blue-400 bg-blue-400/10",
  discussion_reply: "text-blue-400 bg-blue-400/10",
  level_up: "text-yellow-400 bg-yellow-400/10",
  streak: "text-orange-400 bg-orange-400/10",
};

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "now";
  if (mins < 60) return `${mins}m`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  return `${days}d`;
}

export function NotificationBell() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const fetchNotifications = useCallback(async () => {
    if (!user) return;
    try {
      const res = await fetch("/api/notifications?limit=20");
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.notifications);
        setUnreadCount(data.unreadCount);
      }
    } catch {
      /* ignore */
    }
  }, [user]);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const markRead = async (id: string) => {
    await fetch("/api/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "mark_read", notificationId: id }),
    });
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
    );
    setUnreadCount((c) => Math.max(0, c - 1));
  };

  const markAllRead = async () => {
    setLoading(true);
    await fetch("/api/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "mark_all_read" }),
    });
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    setUnreadCount(0);
    setLoading(false);
  };

  if (!user) return null;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => {
          setIsOpen(!isOpen);
          if (!isOpen) fetchNotifications();
        }}
        className="relative h-9 w-9 rounded-full flex items-center justify-center hover:bg-foreground/[0.06] transition-colors"
      >
        <Bell className="h-4.5 w-4.5 text-foreground/60" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 h-4.5 min-w-[18px] rounded-full bg-primary text-[10px] font-bold text-primary-foreground flex items-center justify-center px-1">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 max-h-[28rem] bg-background border border-foreground/[0.08] rounded-xl shadow-xl overflow-hidden z-50">
          <div className="flex items-center justify-between px-4 py-3 border-b border-foreground/[0.06]">
            <h3 className="font-bold text-sm">Notifications</h3>
            {unreadCount > 0 && (
              <button
                onClick={markAllRead}
                disabled={loading}
                className="text-xs text-primary hover:text-primary/80 font-medium flex items-center gap-1 transition-colors"
              >
                {loading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Check className="h-3 w-3" />}
                Mark all read
              </button>
            )}
          </div>

          <div className="overflow-y-auto max-h-[24rem]">
            {notifications.length === 0 ? (
              <div className="py-12 text-center">
                <Bell className="h-8 w-8 text-foreground/10 mx-auto mb-2" />
                <p className="text-sm text-foreground/30">No notifications yet</p>
              </div>
            ) : (
              notifications.map((n) => {
                const Icon = TYPE_ICONS[n.type] ?? Bell;
                const color = TYPE_COLORS[n.type] ?? "text-foreground/50 bg-foreground/[0.06]";
                const content = (
                  <div
                    className={cn(
                      "flex gap-3 px-4 py-3 transition-colors cursor-pointer",
                      n.is_read
                        ? "opacity-60 hover:bg-foreground/[0.02]"
                        : "bg-primary/[0.03] hover:bg-primary/[0.06]"
                    )}
                    onClick={() => {
                      if (!n.is_read) markRead(n.id);
                      if (n.link) setIsOpen(false);
                    }}
                  >
                    <div className={cn("h-8 w-8 rounded-lg flex items-center justify-center shrink-0", color)}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium leading-snug">{n.title}</p>
                      {n.body && (
                        <p className="text-xs text-foreground/40 mt-0.5 line-clamp-2">{n.body}</p>
                      )}
                      <p className="text-[11px] text-foreground/25 mt-1">{timeAgo(n.created_at)}</p>
                    </div>
                    {!n.is_read && (
                      <div className="h-2 w-2 rounded-full bg-primary shrink-0 mt-1.5" />
                    )}
                  </div>
                );

                return n.link ? (
                  <Link key={n.id} href={n.link}>
                    {content}
                  </Link>
                ) : (
                  <div key={n.id}>{content}</div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
