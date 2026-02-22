"use client";

import { Badge } from "@/components/ui/badge";
import { FoodLogWithItem } from "@/lib/types/database";
import { formatTime, normalizeCategory } from "@/lib/utils";
import { X } from "lucide-react";
import { deleteFoodLog } from "@/lib/actions/food-logs";
import { toast } from "sonner";

const categoryColor: Record<string, string> = {
  fruit: "bg-pink-100 text-pink-700 hover:bg-pink-100",
  veggie: "bg-emerald-100 text-emerald-700 hover:bg-emerald-100",
  grain: "bg-amber-100 text-amber-700 hover:bg-amber-100",
  protein: "bg-orange-100 text-orange-700 hover:bg-orange-100",
  dairy: "bg-blue-100 text-blue-700 hover:bg-blue-100",
  snack: "bg-purple-100 text-purple-700 hover:bg-purple-100",
  other: "bg-gray-100 text-gray-700 hover:bg-gray-100",
};

export function FoodEntry({
  log,
  babyId,
  showTime = true,
}: {
  log: FoodLogWithItem;
  babyId: string;
  showTime?: boolean;
}) {
  async function handleDelete(e: React.MouseEvent) {
    e.stopPropagation();
    const result = await deleteFoodLog(babyId, log.id);
    if (result?.error) toast.error(result.error);
  }

  return (
    <div className="flex items-center gap-1.5 group">
      {showTime && (
        <span className="text-xs text-muted-foreground w-14 shrink-0">
          {formatTime(log.fed_at)}
        </span>
      )}
      <Badge
        variant="secondary"
        className={`${categoryColor[normalizeCategory(log.food_items.category)[0]] || categoryColor.other} text-xs`}
      >
        {log.food_items.name}
      </Badge>
      <button
        onClick={handleDelete}
        className="opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <X className="h-3 w-3 text-muted-foreground hover:text-destructive" />
      </button>
    </div>
  );
}
