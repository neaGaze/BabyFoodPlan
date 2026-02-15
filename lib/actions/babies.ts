"use server";

import { createClient } from "@/lib/supabase/server";
import { getAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";

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
  const { error } = await getAdminClient().from("babies").delete().eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/dashboard");
}

export async function inviteMember(babyId: string, email: string) {

  const { data: users, error: lookupError } = await getAdminClient()
    .rpc("get_user_id_by_email", { p_email: email });

  if (lookupError || !users) {
    return { error: "User not found. They must register first." };
  }

  const userId = users as unknown as string;

  const { error } = await getAdminClient()
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
  const { error } = await getAdminClient()
    .from("baby_members")
    .delete()
    .eq("baby_id", babyId)
    .eq("user_id", userId);

  if (error) return { error: error.message };
  revalidatePath(`/baby/${babyId}/members`);
}
