"use server";

import { createClient } from "@/lib/supabase/server";
import { getAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";
import { FoodCategory, FoodItemWithDaysSince } from "@/lib/types/database";

export async function createFood(
  babyId: string,
  name: string,
  category: FoodCategory
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { data, error } = await getAdminClient()
    .from("food_items")
    .insert({ baby_id: babyId, name, category, created_by: user.id })
    .select()
    .single();

  if (error) return { error: error.message };
  revalidatePath(`/baby/${babyId}/foods`);
  return { data };
}

export async function getFoodLibrary(
  babyId: string
): Promise<{ data: FoodItemWithDaysSince[] | null; error?: string }> {
  const admin = getAdminClient();

  // Get all food items for this baby
  const { data: foods, error } = await admin
    .from("food_items")
    .select("*")
    .eq("baby_id", babyId)
    .order("name");

  if (error) return { error: error.message, data: null };
  if (!foods?.length) return { data: [] };

  // Get latest food log for each food item
  const { data: logs } = await admin
    .from("food_logs")
    .select("food_item_id, fed_at")
    .eq("baby_id", babyId)
    .order("fed_at", { ascending: false });

  const now = new Date();
  const foodsWithDays: FoodItemWithDaysSince[] = foods.map((food) => {
    const latestLog = logs?.find((l) => l.food_item_id === food.id);
    if (!latestLog) {
      return { ...food, days_since_last_fed: null, last_fed_at: null };
    }
    const fedDate = new Date(latestLog.fed_at);
    const diffMs = now.getTime() - fedDate.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    return {
      ...food,
      days_since_last_fed: diffDays,
      last_fed_at: latestLog.fed_at,
    };
  });

  return { data: foodsWithDays };
}

export async function deleteFood(babyId: string, foodId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { error } = await getAdminClient()
    .from("food_items")
    .delete()
    .eq("id", foodId)
    .eq("baby_id", babyId);

  if (error) return { error: error.message };
  revalidatePath(`/baby/${babyId}/foods`);
}
