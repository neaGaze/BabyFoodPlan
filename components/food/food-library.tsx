"use client";

import { useState } from "react";
import { FoodItemCard } from "./food-item-card";
import { AddFoodDialog } from "./add-food-dialog";
import { LogFoodDialog } from "./log-food-dialog";
import { FoodCategory, FoodItemWithDaysSince } from "@/lib/types/database";
import { Button } from "@/components/ui/button";

const categories: { value: FoodCategory | "all"; label: string }[] = [
  { value: "all", label: "All" },
  { value: "fruit", label: "Fruit" },
  { value: "veggie", label: "Veggie" },
  { value: "grain", label: "Grain" },
  { value: "protein", label: "Protein" },
  { value: "dairy", label: "Dairy" },
  { value: "other", label: "Other" },
];

export function FoodLibrary({
  foods,
  babyId,
}: {
  foods: FoodItemWithDaysSince[];
  babyId: string;
}) {
  const [filter, setFilter] = useState<FoodCategory | "all">("all");
  const [selectedFood, setSelectedFood] =
    useState<FoodItemWithDaysSince | null>(null);
  const [logOpen, setLogOpen] = useState(false);

  const filtered =
    filter === "all" ? foods : foods.filter((f) => f.category === filter);

  function handleSelect(food: FoodItemWithDaysSince) {
    setSelectedFood(food);
    setLogOpen(true);
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Food Library</h2>
        <AddFoodDialog babyId={babyId} />
      </div>

      <div className="flex gap-1 flex-wrap">
        {categories.map((c) => (
          <Button
            key={c.value}
            variant={filter === c.value ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter(c.value)}
          >
            {c.label}
          </Button>
        ))}
      </div>

      <div className="grid gap-2">
        {filtered.length === 0 && (
          <p className="text-muted-foreground text-center py-8">
            No foods yet. Add one to get started!
          </p>
        )}
        {filtered.map((food) => (
          <FoodItemCard
            key={food.id}
            food={food}
            babyId={babyId}
            onSelect={handleSelect}
          />
        ))}
      </div>

      <LogFoodDialog
        food={selectedFood}
        babyId={babyId}
        open={logOpen}
        onOpenChange={setLogOpen}
      />
    </div>
  );
}
