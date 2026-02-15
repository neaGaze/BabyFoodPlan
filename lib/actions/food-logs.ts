"use server";

import { createClient } from "@/lib/supabase/server";
import { getAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";

export async function logFood(
  babyId: string,
  foodItemId: string,
  fedAt: string,
  notes?: string
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { error } = await getAdminClient().from("food_logs").insert({
    baby_id: babyId,
    food_item_id: foodItemId,
    fed_at: fedAt,
    logged_by: user.id,
    notes: notes || null,
  });

  if (error) return { error: error.message };
  revalidatePath(`/baby/${babyId}`);
}

export async function deleteFoodLog(babyId: string, logId: string) {
  const { error } = await getAdminClient()
    .from("food_logs")
    .delete()
    .eq("id", logId)
    .eq("baby_id", babyId);

  if (error) return { error: error.message };
  revalidatePath(`/baby/${babyId}`);
}

export async function getFoodLogsByDateRange(
  babyId: string,
  startDate: string,
  endDate: string
) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("food_logs")
    .select("*, food_items(name, category)")
    .eq("baby_id", babyId)
    .gte("fed_at", startDate)
    .lte("fed_at", endDate)
    .order("fed_at", { ascending: true });

  if (error) return { error: error.message, data: null };
  return { data };
}
