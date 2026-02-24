"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { acceptInvitation } from "@/lib/actions/babies";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export function AcceptInviteClient({ token }: { token: string }) {
  const [pending, setPending] = useState(false);
  const router = useRouter();

  async function handleAccept() {
    setPending(true);
    const result = await acceptInvitation(token);
    if (result.error) {
      toast.error(result.error);
      setPending(false);
      return;
    }
    toast.success("Invitation accepted!");
    router.push(`/baby/${result.babyId}`);
  }

  return (
    <Button
      onClick={handleAccept}
      disabled={pending}
      className="w-full rounded-xl bg-pink-500 hover:bg-pink-600 text-white"
    >
      {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Accept Invitation"}
    </Button>
  );
}
