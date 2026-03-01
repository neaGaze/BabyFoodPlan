"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { FoodLogWithItem } from "@/lib/types/database";
import { formatTime, normalizeCategory } from "@/lib/utils";
import { X } from "lucide-react";
import { deleteFoodLog } from "@/lib/actions/food-logs";
import { toast } from "sonner";
import { EditFoodLogDialog } from "./edit-food-log-dialog";

const reactionEmoji: Record<string, string> = {
  loved: "\ud83d\ude0d",
  okay: "\ud83d\ude10",
  disliked: "\ud83d\ude23",
};

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
  compact = false,
  onUpdate,
}: {
  log: FoodLogWithItem;
  babyId: string;
  showTime?: boolean;
  compact?: boolean;
  onUpdate?: () => void;
}) {
  const [confirming, setConfirming] = useState(false);
  const [editOpen, setEditOpen] = useState(false);

  async function handleDelete(e: React.MouseEvent) {
    e.stopPropagation();
    if (!confirming) {
      setConfirming(true);
      // auto-reset after 3s
      setTimeout(() => setConfirming(false), 3000);
      return;
    }
    setConfirming(false);
    const result = await deleteFoodLog(babyId, log.id);
    if (result?.error) {
      toast.error(result.error);
    } else {
      onUpdate?.();
    }
  }

  function handleBadgeClick(e: React.MouseEvent) {
    e.stopPropagation();
    setEditOpen(true);
  }

  if (compact) {
    return (
      <div onClick={(e) => e.stopPropagation()} className="group/entry min-w-0">
        <div className="flex items-center gap-0.5 min-w-0">
          {showTime && (
            <span className="text-[10px] leading-tight text-muted-foreground shrink-0">
              {formatTime(log.fed_at)}
            </span>
          )}
          <Badge
            variant="secondary"
            className={`${categoryColor[normalizeCategory(log.food_items.category)[0]] || categoryColor.other} text-[10px] leading-tight px-1 py-0 cursor-pointer max-w-full truncate shrink min-w-0`}
            onClick={handleBadgeClick}
          >
            <span className="truncate">{log.food_items.name}</span>
            {log.reaction && (
              <span className="ml-0.5 shrink-0">{reactionEmoji[log.reaction]}</span>
            )}
          </Badge>
          <button
            onClick={handleDelete}
            aria-label={confirming ? "Confirm delete" : "Delete food log"}
            className={`min-h-[20px] min-w-[20px] shrink-0 flex items-center justify-center rounded transition-all ${
              confirming
                ? "opacity-100 bg-red-100 text-red-600"
                : "opacity-0 group-hover/entry:opacity-40 hover:!opacity-100"
            }`}
          >
            {confirming ? (
              <span className="text-[9px] font-medium text-red-600 px-0.5">
                del?
              </span>
            ) : (
              <X className="h-2.5 w-2.5 text-muted-foreground hover:text-destructive" />
            )}
          </button>
        </div>
        <EditFoodLogDialog
          log={log}
          babyId={babyId}
          open={editOpen}
          onOpenChange={setEditOpen}
          onUpdate={onUpdate}
        />
      </div>
    );
  }

  return (
    <div onClick={(e) => e.stopPropagation()}>
      <div className="flex items-center gap-1.5">
        {showTime && (
          <span className="text-xs text-muted-foreground w-14 shrink-0">
            {formatTime(log.fed_at)}
          </span>
        )}
        <Badge
          variant="secondary"
          className={`${categoryColor[normalizeCategory(log.food_items.category)[0]] || categoryColor.other} text-xs cursor-pointer`}
          onClick={handleBadgeClick}
        >
          {log.food_items.name}
          {log.reaction && (
            <span className="ml-1">{reactionEmoji[log.reaction]}</span>
          )}
        </Badge>
        <button
          onClick={handleDelete}
          aria-label={confirming ? "Confirm delete" : "Delete food log"}
          className={`min-h-[28px] min-w-[28px] flex items-center justify-center rounded transition-all ${
            confirming
              ? "opacity-100 bg-red-100 text-red-600"
              : "opacity-40 hover:opacity-100"
          }`}
        >
          {confirming ? (
            <span className="text-[10px] font-medium text-red-600 px-1">
              confirm?
            </span>
          ) : (
            <X className="h-3 w-3 text-muted-foreground hover:text-destructive" />
          )}
        </button>
      </div>
      <EditFoodLogDialog
        log={log}
        babyId={babyId}
        open={editOpen}
        onOpenChange={setEditOpen}
        onUpdate={onUpdate}
      />
    </div>
  );
}
