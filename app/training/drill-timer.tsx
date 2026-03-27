"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Play, Pause, RotateCcw, Plus, Minus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

function GlowNumber({ value }: { value: number }) {
  const [flash, setFlash] = useState(0);
  const prevRef = useRef(value);

  useEffect(() => {
    if (prevRef.current !== value) {
      setFlash((f) => f + 1);
      prevRef.current = value;
    }
  }, [value]);

  return (
    <span
      key={flash}
      className="text-2xl font-bold tabular-nums w-16 text-center inline-block"
      style={flash > 0 ? { animation: "number-glow 0.4s ease-out" } : undefined}
    >
      {value}
    </span>
  );
}

const PRESETS = [
  { name: "Quick Drill", rounds: 3, work: 60, rest: 30 },
  { name: "Standard", rounds: 5, work: 180, rest: 60 },
  { name: "Endurance", rounds: 8, work: 180, rest: 30 },
  { name: "Tabata", rounds: 8, work: 20, rest: 10 },
];

type Phase = "idle" | "work" | "rest" | "done";

export function DrillTimer() {
  const [rounds, setRounds] = useState(5);
  const [workSeconds, setWorkSeconds] = useState(180);
  const [restSeconds, setRestSeconds] = useState(60);
  const [currentRound, setCurrentRound] = useState(0);
  const [phase, setPhase] = useState<Phase>("idle");
  const [timeLeft, setTimeLeft] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval>>(undefined);
  const audioRef = useRef<AudioContext | null>(null);

  const playBeep = useCallback((freq: number, duration: number) => {
    try {
      if (!audioRef.current) audioRef.current = new AudioContext();
      const ctx = audioRef.current;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = freq;
      gain.gain.value = 0.3;
      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch { /* audio not supported */ }
  }, []);

  const startTimer = useCallback(() => {
    setPhase("work");
    setCurrentRound(1);
    setTimeLeft(workSeconds);
    setIsRunning(true);
    playBeep(800, 0.3);
  }, [workSeconds, playBeep]);

  const reset = useCallback(() => {
    setPhase("idle");
    setCurrentRound(0);
    setTimeLeft(0);
    setIsRunning(false);
    if (intervalRef.current) clearInterval(intervalRef.current);
  }, []);

  const togglePause = useCallback(() => {
    setIsRunning((r) => !r);
  }, []);

  useEffect(() => {
    if (!isRunning || phase === "idle" || phase === "done") {
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }

    intervalRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          if (phase === "work") {
            if (currentRound >= rounds) {
              setPhase("done");
              setIsRunning(false);
              playBeep(440, 1);
              return 0;
            }
            setPhase("rest");
            playBeep(400, 0.5);
            return restSeconds;
          } else {
            setCurrentRound((r) => r + 1);
            setPhase("work");
            playBeep(800, 0.3);
            return workSeconds;
          }
        }
        if (prev <= 4 && prev > 1) playBeep(600, 0.1);
        return prev - 1;
      });
    }, 1000);

    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [isRunning, phase, currentRound, rounds, workSeconds, restSeconds, playBeep]);

  const formatTimer = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}`;
  };

  const totalTime = rounds * (workSeconds + restSeconds) - restSeconds;
  const elapsed = phase === "done" ? totalTime :
    phase === "idle" ? 0 :
    (currentRound - 1) * (workSeconds + restSeconds) + (phase === "work" ? workSeconds - timeLeft : workSeconds + restSeconds - timeLeft);
  const overallPercent = totalTime > 0 ? Math.min(100, (elapsed / totalTime) * 100) : 0;

  return (
    <div className="max-w-lg mx-auto space-y-8">
      {/* Presets */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {PRESETS.map((p) => (
          <button
            key={p.name}
            onClick={() => { setRounds(p.rounds); setWorkSeconds(p.work); setRestSeconds(p.rest); reset(); }}
            className="px-3 py-2 text-xs font-medium rounded-lg border border-foreground/[0.08] bg-foreground/[0.02] hover:border-primary/30 hover:bg-primary/5 transition-all text-center"
          >
            {p.name}
          </button>
        ))}
      </div>

      {/* Config */}
      {phase === "idle" && (
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "Rounds", value: rounds, set: setRounds, min: 1, max: 20 },
            { label: "Work (sec)", value: workSeconds, set: setWorkSeconds, min: 10, max: 600 },
            { label: "Rest (sec)", value: restSeconds, set: setRestSeconds, min: 5, max: 300 },
          ].map(({ label, value, set, min, max }) => (
            <div key={label} className="text-center space-y-2">
              <div className="text-xs font-bold uppercase tracking-wider text-foreground/40">{label}</div>
              <div className="flex items-center justify-center gap-2">
                <button onClick={() => set(Math.max(min, value - (label === "Rounds" ? 1 : 10)))} className="h-8 w-8 rounded-lg border border-foreground/[0.08] flex items-center justify-center hover:bg-foreground/[0.04]">
                  <Minus className="h-3 w-3" />
                </button>
                <GlowNumber value={value} />
                <button onClick={() => set(Math.min(max, value + (label === "Rounds" ? 1 : 10)))} className="h-8 w-8 rounded-lg border border-foreground/[0.08] flex items-center justify-center hover:bg-foreground/[0.04]">
                  <Plus className="h-3 w-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Timer display */}
      <div className="text-center space-y-4">
        <div className={cn(
          "text-8xl font-black tabular-nums transition-colors",
          phase === "work" && "text-primary",
          phase === "rest" && "text-blue-400",
          phase === "done" && "text-green-400",
        )}>
          {phase === "idle" ? formatTimer(workSeconds) : formatTimer(timeLeft)}
        </div>
        <div className="text-sm font-bold uppercase tracking-wider text-foreground/40">
          {phase === "idle" && "Ready"}
          {phase === "work" && `Round ${currentRound}/${rounds} — Work`}
          {phase === "rest" && `Round ${currentRound}/${rounds} — Rest`}
          {phase === "done" && "Complete!"}
        </div>

        {/* Progress bar */}
        {phase !== "idle" && (
          <div className="h-2 bg-foreground/[0.06] rounded-full overflow-hidden">
            <div
              className={cn(
                "h-full transition-all duration-1000 rounded-full",
                phase === "work" ? "bg-primary" : phase === "rest" ? "bg-blue-400" : "bg-green-400"
              )}
              style={{ width: `${overallPercent}%` }}
            />
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-4">
        {phase === "idle" && (
          <Button onClick={startTimer} size="lg" className="gap-2 px-8">
            <Play className="h-5 w-5" fill="currentColor" />
            Start
          </Button>
        )}
        {(phase === "work" || phase === "rest") && (
          <>
            <Button onClick={togglePause} variant="outline" size="lg" className="gap-2">
              {isRunning ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" fill="currentColor" />}
              {isRunning ? "Pause" : "Resume"}
            </Button>
            <Button onClick={reset} variant="ghost" size="lg" className="gap-2">
              <RotateCcw className="h-4 w-4" />
              Reset
            </Button>
          </>
        )}
        {phase === "done" && (
          <Button onClick={reset} size="lg" className="gap-2 px-8">
            <RotateCcw className="h-4 w-4" />
            New Drill
          </Button>
        )}
      </div>
    </div>
  );
}
