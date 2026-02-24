import { getMembers, getBaby, getPendingInvitations } from "@/lib/actions/babies";
import { createClient } from "@/lib/supabase/server";
import { InviteMemberForm } from "@/components/baby/invite-member-form";
import { PendingInvitations } from "@/components/baby/pending-invitations";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MemberList } from "./member-list";

export default async function MembersPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data: members } = await getMembers(id);
  const { data: baby } = await getBaby(id);

  const memberCount = members?.length ?? 0;
  const currentUserRole = members?.find((m) => m.user_id === user?.id)?.role;
  const isOwner = currentUserRole === "owner" || baby?.created_by === user?.id;

  const { data: pendingInvitations } = isOwner
    ? await getPendingInvitations(id)
    : { data: null };

  return (
    <div className="p-4 max-w-2xl mx-auto space-y-6">
      <h2 className="text-lg font-semibold">
        {"👥 Members"}
        {memberCount > 0 && (
          <span className="text-sm font-normal text-muted-foreground ml-2">
            ({memberCount})
          </span>
        )}
      </h2>

      {isOwner && (
        <Card className="border-pink-200/40 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Invite a caregiver</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <InviteMemberForm babyId={id} />
            <PendingInvitations invitations={pendingInvitations ?? []} />
          </CardContent>
        </Card>
      )}

      <MemberList
        members={members ?? []}
        babyId={id}
        currentUserId={user?.id ?? ""}
        isOwner={isOwner}
      />
    </div>
  );
}
