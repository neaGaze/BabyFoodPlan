"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { inviteMember } from "@/lib/actions/babies";
import { toast } from "sonner";

export function InviteMemberForm({ babyId }: { babyId: string }) {
  const [email, setEmail] = useState("");
  const [pending, setPending] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    const result = await inviteMember(babyId, email);
    setPending(false);
    if (result?.error) {
      toast.error(result.error);
      return;
    }
    toast.success("Member added");
    setEmail("");
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <div className="flex-1">
        <Label htmlFor="memberEmail" className="sr-only">
          Email
        </Label>
        <Input
          id="memberEmail"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter email to invite..."
          required
        />
      </div>
      <Button type="submit" disabled={pending}>
        {pending ? "Inviting..." : "Invite"}
      </Button>
    </form>
  );
}
