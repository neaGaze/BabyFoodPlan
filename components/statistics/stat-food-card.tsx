"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FoodItemWithStats, FoodReaction } from "@/lib/types/database";
import { normalizeCategory } from "@/lib/utils";
import { toggleStatsDismissed } from "@/lib/actions/foods";
import { toast } from "sonner";
import { X, RotateCcw } from "lucide-react";

const categoryEmoji: Record<string, string> = {
  fruit: "🍎",
  veggie: "🥦",
  grain: "🌾",
  protein: "🍗",
  dairy: "🧀",
  snack: "🍪",
  other: "🍽️",
};

const reactionEmoji: Record<FoodReaction, string> = {
  loved: "😍",
  okay: "😐",
  disliked: "😢",
};

function getDaysBadge(days: number | null) {
  if (days === null)
    return { label: "Never fed", className: "bg-gray-100 text-gray-600 hover:bg-gray-100" };
  if (days === 0)
    return { label: "Fed today", className: "bg-red-100 text-red-700 hover:bg-red-100" };
  if (days <= 3)
    return { label: `${days}d ago`, className: "bg-yellow-100 text-yellow-700 hover:bg-yellow-100" };
  return { label: `${days}d ago`, className: "bg-green-100 text-green-700 hover:bg-green-100" };
}

export function StatFoodCard({
  food,
  babyId,
}: {
  food: FoodItemWithStats;
  babyId: string;
}) {
  const badge = getDaysBadge(food.days_since_last_fed);

  async function handleToggleDismiss() {
    const result = await toggleStatsDismissed(babyId, food.id, !food.stats_dismissed);
    if (result?.error) toast.error(result.error);
  }

  return (
    <Card className={`p-3 flex items-center justify-between rounded-xl shadow-sm ${food.stats_dismissed ? "opacity-50" : ""}`}>
      <div className="flex items-center gap-2 min-w-0">
        <span className="text-lg">
          {normalizeCategory(food.category).map((c) => categoryEmoji[c]).join("")}
        </span>
        <span className="font-medium truncate">{food.name}</span>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <Badge variant="secondary" className={badge.className}>
          {badge.label}
        </Badge>
        {food.last_reaction ? (
          <span className="text-lg" title={food.last_reaction}>
            {reactionEmoji[food.last_reaction]}
          </span>
        ) : (
          <span className="text-lg" title="No reaction">❓</span>
        )}
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 text-muted-foreground hover:text-destructive"
          onClick={handleToggleDismiss}
          title={food.stats_dismissed ? "Restore" : "Dismiss"}
        >
          {food.stats_dismissed ? (
            <RotateCcw className="h-3.5 w-3.5" />
          ) : (
            <X className="h-3.5 w-3.5" />
          )}
        </Button>
      </div>
    </Card>
  );
}
