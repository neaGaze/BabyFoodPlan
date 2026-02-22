"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { BabyMemberWithProfile } from "@/lib/types/database";
import { removeMember } from "@/lib/actions/babies";
import { toast } from "sonner";
import { X, Users } from "lucide-react";

export function MemberList({
  members,
  babyId,
  currentUserId,
  isOwner,
}: {
  members: BabyMemberWithProfile[];
  babyId: string;
  currentUserId: string;
  isOwner: boolean;
}) {
  async function handleRemove(userId: string) {
    const result = await removeMember(babyId, userId);
    if (result?.error) toast.error(result.error);
  }

  if (members.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <Users className="h-10 w-10 text-muted-foreground mb-3" />
        <p className="text-muted-foreground">
          No members yet. Invite someone to help track meals!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {members.map((member) => (
        <Card
          key={member.id}
          className="p-3 flex items-center justify-between border-pink-200/40 shadow-sm"
        >
          <div className="flex items-center gap-3">
            <Avatar className="h-8 w-8 bg-pink-100">
              <AvatarFallback className="bg-pink-100 text-pink-700">
                {(member.profiles?.full_name ?? "?")[0].toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <span className="font-medium text-sm">
                {member.profiles?.full_name ?? "Unknown"}
              </span>
              {member.user_id === currentUserId && (
                <span className="text-xs text-muted-foreground ml-1">
                  (you)
                </span>
              )}
            </div>
            <Badge variant="outline" className="text-xs">
              {member.role}
            </Badge>
          </div>
          {isOwner &&
            member.user_id !== currentUserId &&
            member.role !== "owner" && (
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={() => handleRemove(member.user_id)}
              >
                <X className="h-3.5 w-3.5" />
              </Button>
            )}
        </Card>
      ))}
    </div>
  );
}
