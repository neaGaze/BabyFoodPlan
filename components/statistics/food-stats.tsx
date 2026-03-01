"use client";

import { useState } from "react";
import { FoodItemWithStats, FoodReaction } from "@/lib/types/database";
import { Button } from "@/components/ui/button";
import { StatFoodCard } from "./stat-food-card";

type ReactionFilter = FoodReaction | "none";
const ALL_FILTERS: ReactionFilter[] = ["loved", "okay", "disliked", "none"];

const filterLabels: Record<ReactionFilter, string> = {
  loved: "Loved 😍",
  okay: "Okay 😐",
  disliked: "Disliked 😢",
  none: "No reaction ❓",
};

export function FoodStats({
  foods,
  babyId,
}: {
  foods: FoodItemWithStats[];
  babyId: string;
}) {
  const [selected, setSelected] = useState<Set<ReactionFilter>>(
    new Set(ALL_FILTERS)
  );
  const [showDismissed, setShowDismissed] = useState(false);

  function toggleAll() {
    setSelected(
      selected.size === ALL_FILTERS.length ? new Set() : new Set(ALL_FILTERS)
    );
  }

  function toggle(f: ReactionFilter) {
    const next = new Set(selected);
    if (next.has(f)) next.delete(f);
    else next.add(f);
    setSelected(next);
  }

  const filtered = foods.filter((f) => {
    const key: ReactionFilter = f.last_reaction ?? "none";
    if (!selected.has(key)) return false;
    if (!showDismissed && f.stats_dismissed) return false;
    return true;
  });

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Statistics</h2>

      <div className="flex gap-1 flex-wrap">
        <Button
          variant={selected.size === ALL_FILTERS.length ? "default" : "outline"}
          size="sm"
          onClick={toggleAll}
        >
          All
        </Button>
        {ALL_FILTERS.map((f) => (
          <Button
            key={f}
            variant={selected.has(f) ? "default" : "outline"}
            size="sm"
            onClick={() => toggle(f)}
          >
            {filterLabels[f]}
          </Button>
        ))}
        <Button
          variant={showDismissed ? "default" : "outline"}
          size="sm"
          onClick={() => setShowDismissed(!showDismissed)}
        >
          Dismissed 🚫
        </Button>
      </div>

      <div className="grid gap-2">
        {filtered.length === 0 && (
          <p className="text-muted-foreground text-center py-8">
            No foods match your filters
          </p>
        )}
        {filtered.map((food) => (
          <StatFoodCard key={food.id} food={food} babyId={babyId} />
        ))}
      </div>
    </div>
  );
}
