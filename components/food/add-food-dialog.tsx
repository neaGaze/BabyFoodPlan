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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createFood } from "@/lib/actions/foods";
import { FoodCategory } from "@/lib/types/database";
import { toast } from "sonner";
import { Plus } from "lucide-react";

const categories: { value: FoodCategory; label: string }[] = [
  { value: "fruit", label: "Fruit" },
  { value: "veggie", label: "Veggie" },
  { value: "grain", label: "Grain" },
  { value: "protein", label: "Protein" },
  { value: "dairy", label: "Dairy" },
  { value: "other", label: "Other" },
];

export function AddFoodDialog({ babyId }: { babyId: string }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [category, setCategory] = useState<FoodCategory>("other");
  const [pending, setPending] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    const result = await createFood(babyId, name, category);
    setPending(false);
    if (result?.error) {
      toast.error(result.error);
      return;
    }
    toast.success("Food added");
    setName("");
    setCategory("other");
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
            <Label>Category</Label>
            <Select
              value={category}
              onValueChange={(v) => setCategory(v as FoodCategory)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {categories.map((c) => (
                  <SelectItem key={c.value} value={c.value}>
                    {c.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button type="submit" className="w-full" disabled={pending}>
            {pending ? "Adding..." : "Add food"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
