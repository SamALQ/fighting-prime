"use client";

import { MainLayout } from "@/components/layout/main-layout";
import { Section } from "@/components/layout/section";
import { Container } from "@/components/layout/container";
import { eliteBreakdowns, EliteBreakdown } from "@/data/elite-breakdowns";
import { useState } from "react";
import { 
  Upload, 
  Play, 
  Calendar, 
  Clock, 
  Trophy, 
  CheckCircle2, 
  Crown,
  History,
  Info,
  ChevronRight,
  ArrowUpCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import { useSubscription } from "@/lib/hooks/use-subscription";

export default function FighterEliteDashboard() {
  const [latestBreakdown] = useState<EliteBreakdown>(eliteBreakdowns[0]);
  const [isDragging, setIsDragging] = useState(false);
  const { isElite, isActive, isLoading } = useSubscription();

  if (isLoading) {
    return (
      <MainLayout>
        <Section className="pb-24 pt-12">
          <Container>
            <div className="h-96 bg-foreground/[0.03] animate-pulse rounded-2xl border border-foreground/[0.06]" />
          </Container>
        </Section>
      </MainLayout>
    );
  }

  if (!isElite) {
    return (
      <MainLayout>
        <Section className="pb-24 pt-12">
          <Container>
            <div className="max-w-2xl mx-auto text-center space-y-6">
              <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                <Crown className="h-10 w-10 text-primary" />
              </div>
              <h1 className="text-4xl md:text-5xl font-bold">Fighter Elite +</h1>
              <p className="text-xl text-foreground/50">
                {isActive
                  ? "Upgrade to Fighter Elite+ to unlock personalized video breakdowns from Jake Peacock."
                  : "Subscribe to Fighter Elite+ to get personalized coaching and video analysis."}
              </p>
              <Link href="/pricing">
                <Button className="h-12 px-8 text-base font-bold bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20">
                  {isActive ? "Upgrade Plan" : "View Plans"}
                </Button>
              </Link>
            </div>
          </Container>
        </Section>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <Section className="pb-24 pt-12">
        <Container>
          {/* Header */}
          <div className="flex flex-col gap-6 mb-12">
            <div className="flex items-center gap-3">
              <Badge className="bg-primary/20 text-primary border-primary/30 py-1 px-3 flex gap-2 items-center">
                <Crown className="h-3.5 w-3.5" />
                Fighter Elite +
              </Badge>
            </div>
            <div>
              <h1 className="text-4xl md:text-6xl font-bold mb-4 tracking-tight">Your Elite Dashboard</h1>
              <p className="text-xl text-foreground/50 max-w-3xl leading-relaxed">
                Welcome to your personalized training center. Upload your sparring or training footage for high-level analysis and feedback from the Fighting Prime coaching team.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            {/* Main Column */}
            <div className="lg:col-span-8 space-y-10">
              
              {/* Latest Breakdown Card */}
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-primary/50 to-purple-500/50 rounded-3xl blur opacity-25 group-hover:opacity-40 transition duration-1000 group-hover:duration-200" />
                <div className="relative bg-foreground/[0.02] border border-foreground/[0.06] rounded-3xl overflow-hidden shadow-2xl backdrop-blur-sm">
                  <div className="p-8">
                    <div className="flex items-center gap-2 mb-6 text-primary">
                      <Play className="h-5 w-5 fill-current" />
                      <h2 className="text-xl font-bold uppercase tracking-widest">Latest Breakdown</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
                      <div className="md:col-span-5 relative aspect-video bg-black rounded-2xl overflow-hidden group/video border border-foreground/[0.08] shadow-inner">
                        {latestBreakdown.thumbnail ? (
                          <Image 
                            src={latestBreakdown.thumbnail} 
                            alt={latestBreakdown.title}
                            fill
                            className="object-cover opacity-60 group-hover/video:scale-105 transition-transform duration-700"
                            unoptimized
                          />
                        ) : (
                          <div className="absolute inset-0 bg-gradient-to-br from-muted to-background" />
                        )}
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="h-16 w-16 rounded-full bg-primary flex items-center justify-center shadow-xl shadow-primary/20 transform group-hover/video:scale-110 transition-transform">
                            <Play className="h-6 w-6 fill-current text-white ml-1" />
                          </div>
                        </div>
                        <div className="absolute bottom-3 right-3 bg-black/80 px-2 py-1 rounded text-[10px] font-bold text-white flex items-center gap-1 border border-white/10">
                          <Clock className="h-3 w-3" />
                          {latestBreakdown.duration}
                        </div>
                      </div>

                      <div className="md:col-span-7 space-y-4">
                        <div className="flex justify-between items-start gap-4">
                          <h3 className="text-2xl font-bold leading-tight">{latestBreakdown.title}</h3>
                          <Badge className="bg-green-500/10 text-green-500 border-green-500/20 whitespace-nowrap">
                            +{latestBreakdown.points} pts
                          </Badge>
                        </div>
                        
                        <div className="flex items-center gap-4 text-sm text-foreground/40">
                          <div className="flex items-center gap-1.5">
                            <Calendar className="h-4 w-4 text-primary" />
                            {latestBreakdown.date}
                          </div>
                        </div>

                        <p className="text-foreground/50 leading-relaxed">
                          {latestBreakdown.description}
                        </p>

                        <div className="pt-4">
                          <Button className="w-full h-12 text-base font-bold bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 gap-2">
                            Watch Full Breakdown
                            <ChevronRight className="h-5 w-5" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Upload Section */}
              <div className="rounded-3xl border border-foreground/[0.06] bg-foreground/[0.02] p-8 space-y-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-center gap-2 text-primary">
                    <ArrowUpCircle className="h-5 w-5" />
                    <h2 className="text-xl font-bold uppercase tracking-widest">Upload Sparring Video</h2>
                  </div>
                  <div className="flex items-center gap-4 text-sm font-medium">
                    <span className="text-foreground/40">Monthly Uploads</span>
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-32 bg-foreground/[0.06] rounded-full overflow-hidden">
                        <div className="h-full bg-primary w-0" />
                      </div>
                      <span className="text-primary">1 of 1 remaining</span>
                    </div>
                  </div>
                </div>

                <div 
                  className={cn(
                    "relative aspect-[21/9] rounded-2xl border-2 border-dashed transition-all duration-300 flex flex-col items-center justify-center gap-4 group cursor-pointer",
                    isDragging 
                      ? "border-primary bg-primary/5 scale-[0.99]" 
                      : "border-foreground/[0.08] hover:border-primary/30 hover:bg-foreground/[0.03]"
                  )}
                  onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={(e) => { e.preventDefault(); setIsDragging(false); }}
                >
                  <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Upload className="h-10 w-10 text-primary" />
                  </div>
                  <div className="text-center">
                    <h3 className="text-lg font-bold mb-1">Upload Your Sparring Video</h3>
                    <p className="text-sm text-foreground/40">
                      Drag and drop your footage here or <span className="text-primary font-bold">click to browse</span>
                    </p>
                  </div>
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 text-[10px] text-foreground/30 bg-background/50 px-3 py-1 rounded-full border border-foreground/[0.08]">
                    <Info className="h-3 w-3" />
                    Recommended: 1080p, Max 500MB
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar Column */}
            <div className="lg:col-span-4 space-y-6">
              <div className="rounded-3xl border border-foreground/[0.06] bg-foreground/[0.02] p-6 flex flex-col h-full">
                <div className="flex items-center gap-2 mb-8 text-primary">
                  <History className="h-5 w-5" />
                  <h2 className="text-xl font-bold uppercase tracking-widest">Breakdown History</h2>
                </div>

                <div className="space-y-4 flex-1">
                  {eliteBreakdowns.map((item) => (
                    <div 
                      key={item.id}
                      className="group p-4 rounded-2xl border border-foreground/[0.06] hover:border-primary/30 hover:bg-primary/5 transition-all cursor-pointer relative overflow-hidden"
                    >
                      <div className="flex items-start gap-4 relative z-10">
                        <div className="h-10 w-10 rounded-lg bg-foreground/[0.04] flex items-center justify-center shrink-0 border border-foreground/[0.06] group-hover:bg-primary/10 group-hover:border-primary/30 transition-colors">
                          <Play className="h-5 w-5 text-foreground/30 group-hover:text-primary fill-current transition-colors" />
                        </div>
                        <div className="space-y-1 flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <h4 className="font-bold text-sm truncate group-hover:text-primary transition-colors">
                              {item.title}
                            </h4>
                            <Badge className="text-[9px] h-4 px-1.5 bg-primary/10 text-primary border-primary/20">
                              +100
                            </Badge>
                          </div>
                          <div className="flex items-center gap-3 text-[10px] text-foreground/30">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {item.date}
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {item.duration}
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="absolute right-2 bottom-1/2 translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <ChevronRight className="h-4 w-4 text-primary" />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-8 p-4 rounded-2xl bg-foreground/[0.02] border border-foreground/[0.06]">
                  <p className="text-[11px] text-foreground/30 text-center">
                    Analyze your training history to spot long-term patterns and technical growth.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </Section>
    </MainLayout>
  );
}




