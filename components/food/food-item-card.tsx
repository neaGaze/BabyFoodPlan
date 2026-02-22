"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FoodItemWithDaysSince } from "@/lib/types/database";
import { Trash2 } from "lucide-react";
import { deleteFood } from "@/lib/actions/foods";
import { toast } from "sonner";
import { normalizeCategory } from "@/lib/utils";

const categoryEmoji: Record<string, string> = {
  fruit: "🍎",
  veggie: "🥦",
  grain: "🌾",
  protein: "🍗",
  dairy: "🧀",
  snack: "🍪",
  other: "🍽️",
};

function getDaysBadge(days: number | null) {
  if (days === null)
    return { label: "Never fed", className: "bg-gray-100 text-gray-600 hover:bg-gray-100" };
  if (days === 0)
    return { label: "Fed today", className: "bg-red-100 text-red-700 hover:bg-red-100" };
  if (days <= 3)
    return {
      label: `${days}d ago`,
      className: "bg-yellow-100 text-yellow-700 hover:bg-yellow-100",
    };
  return {
    label: `${days}d ago`,
    className: "bg-green-100 text-green-700 hover:bg-green-100",
  };
}

export function FoodItemCard({
  food,
  babyId,
  onSelect,
}: {
  food: FoodItemWithDaysSince;
  babyId: string;
  onSelect?: (food: FoodItemWithDaysSince) => void;
}) {
  const badge = getDaysBadge(food.days_since_last_fed);

  async function handleDelete(e: React.MouseEvent) {
    e.stopPropagation();
    const result = await deleteFood(babyId, food.id);
    if (result?.error) toast.error(result.error);
  }

  return (
    <Card
      className="p-3 flex items-center justify-between cursor-pointer hover:bg-muted/50 transition-colors"
      onClick={() => onSelect?.(food)}
    >
      <div className="flex items-center gap-2 min-w-0">
        <span className="text-lg">{normalizeCategory(food.category).map((c) => categoryEmoji[c]).join("")}</span>
        <span className="font-medium truncate">{food.name}</span>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <Badge variant="secondary" className={badge.className}>
          {badge.label}
        </Badge>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 text-muted-foreground hover:text-destructive"
          onClick={handleDelete}
        >
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </div>
    </Card>
  );
}
