"use client";

import { MessageSquare, MessagesSquare, Users, Heart } from "lucide-react";

export default function CommunityPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Community</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Connect with your students and build your community
        </p>
      </div>

      {/* Main coming soon card */}
      <div className="border border-border rounded-xl bg-card p-8 text-center">
        <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-5">
          <MessageSquare className="h-7 w-7 text-primary" />
        </div>
        <h2 className="text-xl font-bold mb-2">Coming Soon</h2>
        <p className="text-muted-foreground text-sm max-w-md mx-auto">
          See and respond to comments on your episodes, engage in course-specific
          discussions, and connect directly with your students.
        </p>
      </div>

      {/* Feature preview cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="border border-dashed border-border rounded-xl p-5 bg-card/50">
          <MessagesSquare className="h-5 w-5 text-muted-foreground mb-3" />
          <h3 className="font-semibold text-sm mb-1">Episode Comments</h3>
          <p className="text-xs text-muted-foreground">
            Students leave feedback and questions on individual episodes. Reply
            directly to keep the conversation going.
          </p>
        </div>

        <div className="border border-dashed border-border rounded-xl p-5 bg-card/50">
          <Users className="h-5 w-5 text-muted-foreground mb-3" />
          <h3 className="font-semibold text-sm mb-1">Course Forums</h3>
          <p className="text-xs text-muted-foreground">
            Dedicated discussion threads for each course. Share drills, answer
            technique questions, and foster a training community.
          </p>
        </div>

        <div className="border border-dashed border-border rounded-xl p-5 bg-card/50">
          <Heart className="h-5 w-5 text-muted-foreground mb-3" />
          <h3 className="font-semibold text-sm mb-1">Student Highlights</h3>
          <p className="text-xs text-muted-foreground">
            See your most engaged students, celebrate their milestones, and build
            lasting relationships with your audience.
          </p>
        </div>
      </div>
    </div>
  );
}
