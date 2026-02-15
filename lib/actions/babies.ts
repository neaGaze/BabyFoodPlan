"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function createBaby(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const name = formData.get("name") as string;
  const dateOfBirth = formData.get("dateOfBirth") as string;

  const { data, error } = await supabase
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
  const { data, error } = await supabase
    .from("babies")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) return { error: error.message, data: null };
  return { data };
}

export async function getBaby(id: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("babies")
    .select("*")
    .eq("id", id)
    .single();

  if (error) return { error: error.message, data: null };
  return { data };
}

export async function deleteBaby(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("babies").delete().eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/dashboard");
}

export async function inviteMember(babyId: string, email: string) {
  const supabase = await createClient();

  // Look up user by email via profiles — we need a different approach
  // since we can't query auth.users directly. We'll use the admin API
  // or look up by email in a custom way. For now, use RPC or a workaround.
  // Actually, let's query auth.users via supabase admin or use a function.
  // Simplest: store email in profiles and look up there.
  // For MVP: the invited user must already have an account.

  const { data: users, error: lookupError } = await supabase
    .rpc("get_user_id_by_email", { p_email: email });

  if (lookupError || !users) {
    return { error: "User not found. They must register first." };
  }

  const userId = users as unknown as string;

  const { error } = await supabase
    .from("baby_members")
    .insert({ baby_id: babyId, user_id: userId, role: "member" });

  if (error) {
    if (error.code === "23505") return { error: "User already a member" };
    return { error: error.message };
  }

  revalidatePath(`/baby/${babyId}/members`);
}

export async function getMembers(babyId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("baby_members")
    .select("*, profiles(full_name, avatar_url)")
    .eq("baby_id", babyId);

  if (error) return { error: error.message, data: null };
  return { data };
}

export async function removeMember(babyId: string, userId: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("baby_members")
    .delete()
    .eq("baby_id", babyId)
    .eq("user_id", userId);

  if (error) return { error: error.message };
  revalidatePath(`/baby/${babyId}/members`);
}
