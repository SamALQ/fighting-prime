"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Calendar, Clock, Flame, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface Session {
  id: string;
  date: string;
  duration_minutes: number;
  notes: string;
  intensity: number;
  type: string;
  created_at: string;
}

export function TrainingLog() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split("T")[0],
    duration_minutes: 30,
    notes: "",
    intensity: 3,
    type: "general",
  });

  const fetchSessions = useCallback(async () => {
    try {
      const res = await fetch("/api/training-sessions");
      if (res.ok) {
        const data = await res.json();
        setSessions(data.sessions ?? []);
      }
    } catch { /* silent */ }
    setLoading(false);
  }, []);

  useEffect(() => { fetchSessions(); }, [fetchSessions]);

  const createSession = async () => {
    const res = await fetch("/api/training-sessions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });
    if (res.ok) {
      setShowForm(false);
      setFormData({ date: new Date().toISOString().split("T")[0], duration_minutes: 30, notes: "", intensity: 3, type: "general" });
      fetchSessions();
    }
  };

  const deleteSession = async (id: string) => {
    await fetch(`/api/training-sessions?id=${id}`, { method: "DELETE" });
    setSessions((prev) => prev.filter((s) => s.id !== id));
  };

  const TYPES = ["general", "technique", "sparring", "conditioning", "drills"];
  const weekTotal = sessions
    .filter((s) => {
      const d = new Date(s.date);
      const now = new Date();
      const weekAgo = new Date(now.getTime() - 7 * 86400000);
      return d >= weekAgo;
    })
    .reduce((sum, s) => sum + s.duration_minutes, 0);

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <div className="rounded-xl border border-foreground/[0.06] bg-foreground/[0.02] p-4 text-center">
          <div className="text-2xl font-bold">{sessions.length}</div>
          <div className="text-xs text-foreground/40 mt-1">Total Sessions</div>
        </div>
        <div className="rounded-xl border border-foreground/[0.06] bg-foreground/[0.02] p-4 text-center">
          <div className="text-2xl font-bold">{weekTotal}m</div>
          <div className="text-xs text-foreground/40 mt-1">This Week</div>
        </div>
        <div className="rounded-xl border border-foreground/[0.06] bg-foreground/[0.02] p-4 text-center">
          <div className="text-2xl font-bold">
            {sessions.length > 0 ? (sessions.reduce((s, x) => s + x.intensity, 0) / sessions.length).toFixed(1) : "—"}
          </div>
          <div className="text-xs text-foreground/40 mt-1">Avg Intensity</div>
        </div>
      </div>

      {/* Add button */}
      <Button onClick={() => setShowForm(!showForm)} variant={showForm ? "outline" : "default"} className="gap-2">
        <Plus className="h-4 w-4" />
        {showForm ? "Cancel" : "Log Session"}
      </Button>

      {/* Form */}
      {showForm && (
        <div className="rounded-xl border border-foreground/[0.06] bg-foreground/[0.02] p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-foreground/40 block mb-1">Date</label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData((f) => ({ ...f, date: e.target.value }))}
                className="w-full h-9 px-3 rounded-lg border border-foreground/[0.08] bg-transparent text-sm"
              />
            </div>
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-foreground/40 block mb-1">Duration (min)</label>
              <input
                type="number"
                min={1}
                max={300}
                value={formData.duration_minutes}
                onChange={(e) => setFormData((f) => ({ ...f, duration_minutes: parseInt(e.target.value) || 0 }))}
                className="w-full h-9 px-3 rounded-lg border border-foreground/[0.08] bg-transparent text-sm"
              />
            </div>
          </div>
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-foreground/40 block mb-1">Type</label>
            <div className="flex flex-wrap gap-2">
              {TYPES.map((t) => (
                <button
                  key={t}
                  onClick={() => setFormData((f) => ({ ...f, type: t }))}
                  className={cn(
                    "px-3 py-1 text-xs rounded-full border transition-all capitalize",
                    formData.type === t ? "border-primary bg-primary/10 text-primary" : "border-foreground/[0.08] text-foreground/50 hover:border-foreground/20"
                  )}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-foreground/40 block mb-1">Intensity (1-5)</label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <button
                  key={i}
                  onClick={() => setFormData((f) => ({ ...f, intensity: i }))}
                  className={cn(
                    "h-9 w-9 rounded-lg border flex items-center justify-center text-sm font-bold transition-all",
                    formData.intensity >= i ? "border-primary bg-primary/10 text-primary" : "border-foreground/[0.08] text-foreground/30"
                  )}
                >
                  {i}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-foreground/40 block mb-1">Notes</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData((f) => ({ ...f, notes: e.target.value }))}
              placeholder="What did you work on?"
              rows={3}
              className="w-full px-3 py-2 rounded-lg border border-foreground/[0.08] bg-transparent text-sm resize-none"
            />
          </div>
          <Button onClick={createSession} className="w-full">Save Session</Button>
        </div>
      )}

      {/* Sessions list */}
      {loading ? (
        <div className="text-center text-foreground/30 py-8">Loading...</div>
      ) : sessions.length === 0 ? (
        <div className="text-center text-foreground/30 py-12">
          No sessions logged yet. Start training and log your first session!
        </div>
      ) : (
        <div className="space-y-3">
          {sessions.map((s) => (
            <div key={s.id} className="rounded-xl border border-foreground/[0.06] bg-foreground/[0.02] p-4 flex items-start gap-4 group">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-1">
                  <Calendar className="h-3.5 w-3.5 text-foreground/30" />
                  <span className="text-sm font-medium">{new Date(s.date).toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" })}</span>
                  <span className="text-xs capitalize px-2 py-0.5 rounded-full border border-foreground/[0.08] text-foreground/50">{s.type}</span>
                </div>
                <div className="flex items-center gap-4 text-xs text-foreground/40 mt-1">
                  <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {s.duration_minutes}m</span>
                  <span className="flex items-center gap-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Flame key={i} className={cn("h-3 w-3", i < s.intensity ? "text-primary" : "text-foreground/10")} />
                    ))}
                  </span>
                </div>
                {s.notes && <p className="text-xs text-foreground/50 mt-2 line-clamp-2">{s.notes}</p>}
              </div>
              <button
                onClick={() => deleteSession(s.id)}
                className="opacity-0 group-hover:opacity-100 transition-opacity text-foreground/30 hover:text-red-400"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
