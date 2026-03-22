"use client";

import { useState } from "react";
import { Button } from "./button";
import { Avatar, AvatarFallback } from "./avatar";
import { MessageSquare, Send } from "lucide-react";
import { Input } from "./input";

interface Comment {
  id: string;
  user: string;
  text: string;
  date: string;
}

export function CommentSection() {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    const comment: Comment = {
      id: Date.now().toString(),
      user: "You",
      text: newComment,
      date: "Just now",
    };

    setComments([comment, ...comments]);
    setNewComment("");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 border-b border-border pb-4">
        <MessageSquare className="h-5 w-5 text-primary" />
        <h3 className="text-xl font-bold">Discussion ({comments.length})</h3>
      </div>

      <form onSubmit={handleSubmit} className="flex gap-4">
        <Avatar className="h-10 w-10 border border-border">
          <AvatarFallback className="bg-primary/10 text-primary">YU</AvatarFallback>
        </Avatar>
        <div className="flex-1 flex gap-2">
          <Input
            placeholder="Share your thoughts on this breakdown..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            className="bg-muted/50 border-border"
          />
          <Button type="submit" size="icon" className="shrink-0">
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </form>

      <div className="space-y-6">
        {comments.map((comment) => (
          <div key={comment.id} className="flex gap-4">
            <Avatar className="h-10 w-10 border border-border">
              <AvatarFallback className="bg-primary/10 text-primary">
                {comment.user.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-sm">{comment.user}</span>
                <span className="text-xs text-muted-foreground">{comment.date}</span>
              </div>
              <p className="text-sm text-muted-foreground">{comment.text}</p>
            </div>
          </div>
        ))}
        {comments.length === 0 && (
          <div className="text-center py-12 border border-dashed border-border rounded-xl">
            <p className="text-muted-foreground">No comments yet. Be the first to start the discussion!</p>
          </div>
        )}
      </div>
    </div>
  );
}




