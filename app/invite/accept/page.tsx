import { getAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { AcceptInviteClient } from "@/components/baby/accept-invite-client";

export default async function AcceptInvitePage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;
  if (!token) return <InvalidInvite />;

  const { data: invitation } = await getAdminClient()
    .from("baby_invitations")
    .select("*, babies(name)")
    .eq("token", token)
    .eq("status", "pending")
    .single();

  if (!invitation) return <InvalidInvite />;

  if (new Date(invitation.expires_at) < new Date()) {
    await getAdminClient()
      .from("baby_invitations")
      .update({ status: "expired" })
      .eq("id", invitation.id);
    return <InvalidInvite message="This invitation has expired." />;
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const babyName = (invitation as Record<string, unknown> & { babies: { name: string } | null }).babies?.name ?? "a baby";
  const acceptUrl = `/invite/accept?token=${token}`;

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="w-full max-w-md text-center space-y-6">
          <div className="space-y-2">
            <h1 className="text-2xl font-bold">You&apos;re invited!</h1>
            <p className="text-muted-foreground">
              You&apos;ve been invited to help track <strong>{babyName}</strong>&apos;s meals.
            </p>
          </div>
          <div className="space-y-3">
            <a
              href={`/login?next=${encodeURIComponent(acceptUrl)}`}
              className="block w-full rounded-xl bg-pink-500 hover:bg-pink-600 text-white py-2.5 text-center font-medium"
            >
              Sign in to accept
            </a>
            <a
              href={`/register?next=${encodeURIComponent(acceptUrl)}`}
              className="block w-full rounded-xl border border-pink-200 text-pink-600 hover:bg-pink-50 py-2.5 text-center font-medium"
            >
              Create an account
            </a>
          </div>
        </div>
      </div>
    );
  }

  // User is logged in — show accept button
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-md text-center space-y-6">
        <div className="space-y-2">
          <h1 className="text-2xl font-bold">You&apos;re invited!</h1>
          <p className="text-muted-foreground">
            Accept to help track <strong>{babyName}</strong>&apos;s meals.
          </p>
        </div>
        <AcceptInviteClient token={token} />
      </div>
    </div>
  );
}

function InvalidInvite({ message }: { message?: string }) {
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold">Invalid invitation</h1>
        <p className="text-muted-foreground">{message || "This invitation link is invalid or has already been used."}</p>
      </div>
    </div>
  );
}
