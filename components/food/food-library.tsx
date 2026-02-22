"use client";

import { useState } from "react";
import { FoodItemCard } from "./food-item-card";
import { AddFoodDialog } from "./add-food-dialog";
import { LogFoodDialog } from "./log-food-dialog";
import { FoodCategory, FoodItemWithDaysSince, ALL_FOOD_CATEGORIES } from "@/lib/types/database";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { normalizeCategory } from "@/lib/utils";

const categoryLabels: Record<FoodCategory, string> = {
  fruit: "Fruit",
  veggie: "Veggie",
  grain: "Grain",
  protein: "Protein",
  dairy: "Dairy",
  snack: "Snack",
  other: "Other",
};

export function FoodLibrary({
  foods,
  babyId,
}: {
  foods: FoodItemWithDaysSince[];
  babyId: string;
}) {
  const [filter, setFilter] = useState<FoodCategory | "all">("all");
  const [search, setSearch] = useState("");
  const [selectedFood, setSelectedFood] =
    useState<FoodItemWithDaysSince | null>(null);
  const [logOpen, setLogOpen] = useState(false);

  const filtered = foods.filter((f) => {
    const matchesCategory = filter === "all" || normalizeCategory(f.category).includes(filter);
    const matchesSearch = !search || f.name.toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
  });

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

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search foods..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      <div className="flex gap-1 flex-wrap">
        <Button
          variant={filter === "all" ? "default" : "outline"}
          size="sm"
          onClick={() => setFilter("all")}
        >
          All
        </Button>
        {ALL_FOOD_CATEGORIES.map((cat) => (
          <Button
            key={cat}
            variant={filter === cat ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter(cat)}
          >
            {categoryLabels[cat]}
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
