"use server";

import { createClient } from "@/lib/supabase/server";
import { getAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";
import { sendInviteEmail } from "@/lib/email";
import { headers } from "next/headers";

export async function createBaby(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const name = formData.get("name") as string;
  const dateOfBirth = formData.get("dateOfBirth") as string;

  const { data, error } = await getAdminClient()
    .from("babies")
    .insert({ name, date_of_birth: dateOfBirth, created_by: user.id })
    .select()
    .single();

  if (error) return { error: error.message };
  revalidatePath("/dashboard");
  return { data };
}

export async function getBabies() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated", data: null };

  // Get baby IDs where user is a member
  const { data: memberships } = await getAdminClient()
    .from("baby_members")
    .select("baby_id")
    .eq("user_id", user.id);
  const memberBabyIds = memberships?.map((m) => m.baby_id) ?? [];

  const { data, error } = await getAdminClient()
    .from("babies")
    .select("*")
    .or(`created_by.eq.${user.id}${memberBabyIds.length ? `,id.in.(${memberBabyIds.join(",")})` : ""}`)
    .order("created_at", { ascending: false });

  if (error) return { error: error.message, data: null };
  return { data };
}

export async function getBaby(id: string) {
  const { data, error } = await getAdminClient()
    .from("babies")
    .select("*")
    .eq("id", id)
    .single();

  if (error) return { error: error.message, data: null };
  return { data };
}

export async function deleteBaby(id: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { error } = await getAdminClient().from("babies").delete().eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/dashboard");
}

export async function inviteMember(babyId: string, email: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  // Check if already a member
  const { data: existingMember } = await getAdminClient()
    .from("baby_members")
    .select("id")
    .eq("baby_id", babyId)
    .eq("user_id", (await getAdminClient().rpc("get_user_id_by_email", { p_email: email })).data ?? "")
    .maybeSingle();

  if (existingMember) return { error: "This person is already a member" };

  // Create invitation
  const { data: invitation, error } = await getAdminClient()
    .from("baby_invitations")
    .insert({ baby_id: babyId, email, invited_by: user.id })
    .select("token")
    .single();

  if (error) {
    if (error.code === "23505") return { error: "An invitation is already pending for this email" };
    return { error: error.message };
  }

  // Get baby name for email
  const { data: baby } = await getAdminClient()
    .from("babies")
    .select("name")
    .eq("id", babyId)
    .single();

  // Build accept URL
  const headersList = await headers();
  const host = headersList.get("host") || "localhost:3000";
  const protocol = headersList.get("x-forwarded-proto") || "http";
  const acceptUrl = `${protocol}://${host}/invite/accept?token=${invitation.token}`;

  let emailSent = false;
  try {
    await sendInviteEmail(email, baby?.name ?? "your baby", acceptUrl);
    emailSent = true;
  } catch (err) {
    console.error("Failed to send invite email:", err);
  }

  revalidatePath(`/baby/${babyId}/members`);
  return {
    success: true,
    emailSent,
    acceptUrl: !emailSent ? acceptUrl : undefined,
  };
}

export async function getPendingInvitations(babyId: string) {
  const { data, error } = await getAdminClient()
    .from("baby_invitations")
    .select("*")
    .eq("baby_id", babyId)
    .eq("status", "pending")
    .order("created_at", { ascending: false });

  if (error) return { error: error.message, data: null };
  return { data };
}

export async function cancelInvitation(invitationId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { data: invitation } = await getAdminClient()
    .from("baby_invitations")
    .select("baby_id")
    .eq("id", invitationId)
    .single();

  if (!invitation) return { error: "Invitation not found" };

  const { error } = await getAdminClient()
    .from("baby_invitations")
    .update({ status: "cancelled" })
    .eq("id", invitationId)
    .eq("status", "pending");

  if (error) return { error: error.message };
  revalidatePath(`/baby/${invitation.baby_id}/members`);
  return { success: true };
}

export async function acceptInvitation(token: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { data: invitation, error: fetchErr } = await getAdminClient()
    .from("baby_invitations")
    .select("*")
    .eq("token", token)
    .eq("status", "pending")
    .single();

  if (fetchErr || !invitation) return { error: "Invalid or expired invitation" };

  if (new Date(invitation.expires_at) < new Date()) {
    await getAdminClient()
      .from("baby_invitations")
      .update({ status: "expired" })
      .eq("id", invitation.id);
    return { error: "This invitation has expired" };
  }

  // Add as member
  const { error: memberErr, data: memberData } = await getAdminClient()
    .from("baby_members")
    .insert({ baby_id: invitation.baby_id, user_id: user.id, role: "member" })
    .select()
    .single();

  if (memberErr) {
    console.error("Failed to add member:", memberErr);
    if (memberErr.code === "23505") {
      // Already a member, just mark invitation accepted
      await getAdminClient()
        .from("baby_invitations")
        .update({ status: "accepted" })
        .eq("id", invitation.id);
      return { success: true, babyId: invitation.baby_id };
    }
    return { error: memberErr.message };
  }

  console.log("Member added:", memberData);

  await getAdminClient()
    .from("baby_invitations")
    .update({ status: "accepted" })
    .eq("id", invitation.id);

  revalidatePath(`/baby/${invitation.baby_id}/members`);
  return { success: true, babyId: invitation.baby_id };
}

export async function getMembers(babyId: string) {
  const { data, error } = await getAdminClient()
    .from("baby_members")
    .select("*, profiles(full_name, avatar_url)")
    .eq("baby_id", babyId);

  if (error) return { error: error.message, data: null };
  return { data };
}

export async function removeMember(babyId: string, userId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { error } = await getAdminClient()
    .from("baby_members")
    .delete()
    .eq("baby_id", babyId)
    .eq("user_id", userId);

  if (error) return { error: error.message };
  revalidatePath(`/baby/${babyId}/members`);
  return { success: true };
}
