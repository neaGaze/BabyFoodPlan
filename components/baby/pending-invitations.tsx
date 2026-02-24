"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { cancelInvitation } from "@/lib/actions/babies";
import { toast } from "sonner";
import { X, Loader2, Mail } from "lucide-react";
import type { BabyInvitation } from "@/lib/types/database";

export function PendingInvitations({
  invitations,
}: {
  invitations: BabyInvitation[];
}) {
  if (invitations.length === 0) return null;

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-medium text-muted-foreground">
        Pending invitations ({invitations.length})
      </h3>
      <div className="space-y-2">
        {invitations.map((inv) => (
          <InvitationRow key={inv.id} invitation={inv} />
        ))}
      </div>
    </div>
  );
}

function InvitationRow({ invitation }: { invitation: BabyInvitation }) {
  const [cancelling, setCancelling] = useState(false);
  const router = useRouter();

  async function handleCancel() {
    setCancelling(true);
    const result = await cancelInvitation(invitation.id);
    if (result.error) {
      toast.error(result.error);
      setCancelling(false);
      return;
    }
    toast.success("Invitation cancelled");
    router.refresh();
  }

  return (
    <div className="flex items-center justify-between rounded-xl border border-pink-100 bg-pink-50/50 px-3 py-2">
      <div className="flex items-center gap-2 text-sm">
        <Mail className="h-4 w-4 text-pink-400" />
        <span className="text-muted-foreground">{invitation.email}</span>
      </div>
      <Button
        variant="ghost"
        size="sm"
        onClick={handleCancel}
        disabled={cancelling}
        className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive"
      >
        {cancelling ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : (
          <X className="h-3.5 w-3.5" />
        )}
      </Button>
    </div>
  );
}
