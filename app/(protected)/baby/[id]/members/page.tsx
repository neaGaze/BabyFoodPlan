import { getMembers } from "@/lib/actions/babies";
import { createClient } from "@/lib/supabase/server";
import { InviteMemberForm } from "@/components/baby/invite-member-form";
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

  const currentUserRole = members?.find((m) => m.user_id === user?.id)?.role;
  const isOwner = currentUserRole === "owner";

  return (
    <div className="p-4 max-w-2xl mx-auto space-y-6">
      <h2 className="text-lg font-semibold">Members</h2>

      {isOwner && <InviteMemberForm babyId={id} />}

      <MemberList
        members={members ?? []}
        babyId={id}
        currentUserId={user?.id ?? ""}
        isOwner={isOwner}
      />
    </div>
  );
}
