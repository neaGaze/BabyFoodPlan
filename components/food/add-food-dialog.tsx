"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createFood } from "@/lib/actions/foods";
import { FoodCategory, ALL_FOOD_CATEGORIES } from "@/lib/types/database";
import { toast } from "sonner";
import { Plus } from "lucide-react";

const categoryLabels: Record<FoodCategory, string> = {
  fruit: "Fruit",
  veggie: "Veggie",
  grain: "Grain",
  protein: "Protein",
  dairy: "Dairy",
  snack: "Snack",
  other: "Other",
};

export function AddFoodDialog({ babyId }: { babyId: string }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [categories, setCategories] = useState<FoodCategory[]>(["other"]);
  const [pending, setPending] = useState(false);

  function toggleCategory(cat: FoodCategory) {
    setCategories((prev) => {
      if (prev.includes(cat)) {
        const next = prev.filter((c) => c !== cat);
        return next.length === 0 ? prev : next;
      }
      return [...prev, cat];
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    const result = await createFood(babyId, name, categories);
    setPending(false);
    if (result?.error) {
      toast.error(result.error);
      return;
    }
    toast.success("Food added");
    setName("");
    setCategories(["other"]);
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus className="h-4 w-4 mr-1" /> Add food
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add new food</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="foodName">Name</Label>
            <Input
              id="foodName"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="e.g. Sweet potato"
            />
          </div>
          <div className="space-y-2">
            <Label>Categories</Label>
            <div className="flex gap-1.5 flex-wrap">
              {ALL_FOOD_CATEGORIES.map((cat) => (
                <Button
                  key={cat}
                  type="button"
                  size="sm"
                  variant={categories.includes(cat) ? "default" : "outline"}
                  onClick={() => toggleCategory(cat)}
                >
                  {categoryLabels[cat]}
                </Button>
              ))}
            </div>
          </div>
          <Button type="submit" className="w-full" disabled={pending}>
            {pending ? "Adding..." : "Add food"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
