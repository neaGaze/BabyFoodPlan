"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { inviteMember } from "@/lib/actions/babies";
import { toast } from "sonner";
import { UserPlus, Loader2, CheckCircle2 } from "lucide-react";

export function InviteMemberForm({ babyId }: { babyId: string }) {
  const [email, setEmail] = useState("");
  const [pending, setPending] = useState(false);
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    setSuccess(false);
    const result = await inviteMember(babyId, email);
    setPending(false);
    if (result?.error) {
      toast.error(result.error);
      return;
    }
    toast.success("Member added successfully!");
    setEmail("");
    setSuccess(true);
    router.refresh();
    setTimeout(() => setSuccess(false), 3000);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Label htmlFor="memberEmail" className="sr-only">
            Email
          </Label>
          <UserPlus className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            id="memberEmail"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter email address"
            required
            className="pl-9 rounded-xl border-pink-200 focus-visible:ring-pink-300"
          />
        </div>
        <Button
          type="submit"
          disabled={pending}
          className="rounded-xl bg-pink-500 hover:bg-pink-600 text-white"
        >
          {pending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            "Invite"
          )}
        </Button>
      </div>
      <p className="text-xs text-muted-foreground">
        The person must have an account already
      </p>
      {success && (
        <div className="flex items-center gap-1.5 text-xs text-emerald-600">
          <CheckCircle2 className="h-3.5 w-3.5" />
          <span>Invitation sent successfully</span>
        </div>
      )}
    </form>
  );
}
