"use client";

import { Breakdown } from "@/data/breakdowns";
import { cn } from "@/lib/utils";
import { Calendar, User } from "lucide-react";
import Image from "next/image";

interface BreakdownListProps {
  breakdowns: Breakdown[];
  selectedId: string;
  onSelect: (id: string) => void;
}

export function BreakdownList({ breakdowns, selectedId, onSelect }: BreakdownListProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-bold uppercase tracking-wider mb-6">Past Breakdowns</h3>
      <div className="space-y-3">
        {breakdowns.map((breakdown) => {
          const isSelected = breakdown.id === selectedId;
          return (
            <button
              key={breakdown.id}
              onClick={() => onSelect(breakdown.id)}
              className={cn(
                "w-full text-left group flex flex-col gap-3 p-3 rounded-xl border transition-all overflow-hidden relative",
                isSelected
                  ? "border-primary/40 bg-primary/5 ring-1 ring-primary/30"
                  : "border-foreground/[0.06] bg-foreground/[0.02] hover:border-primary/30"
              )}
            >
              <div className="relative aspect-video w-full rounded-lg overflow-hidden grayscale group-hover:grayscale-0 transition-all duration-500">
                <Image
                  src={breakdown.thumbnail}
                  alt={breakdown.title}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-110"
                  unoptimized
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              </div>
              
              <div className="space-y-2">
                <h4 className={cn(
                  "font-bold text-sm leading-tight transition-colors",
                  isSelected ? "text-primary" : "group-hover:text-primary"
                )}>
                  {breakdown.title}
                </h4>
                <div className="flex items-center gap-3 text-[10px] text-foreground/30">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {new Date(breakdown.releaseDate).toLocaleDateString()}
                  </div>
                  <div className="flex items-center gap-1">
                    <User className="h-3 w-3" />
                    {breakdown.author}
                  </div>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
