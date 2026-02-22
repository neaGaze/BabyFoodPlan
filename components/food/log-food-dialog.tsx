"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
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
import { logFood } from "@/lib/actions/food-logs";
import { FoodItemWithDaysSince, FoodReaction } from "@/lib/types/database";
import { toast } from "sonner";

export function LogFoodDialog({
  food,
  foods,
  babyId,
  open,
  onOpenChange,
  defaultDate,
  defaultTime,
}: {
  food?: FoodItemWithDaysSince | null;
  foods?: FoodItemWithDaysSince[];
  babyId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultDate?: string;
  defaultTime?: string;
}) {
  const now = new Date();
  const [selectedFoodId, setSelectedFoodId] = useState(food?.id ?? "");
  const [date, setDate] = useState(
    defaultDate ?? now.toISOString().slice(0, 10)
  );
  const [time, setTime] = useState(
    defaultTime ?? now.toTimeString().slice(0, 5)
  );
  const [notes, setNotes] = useState("");
  const [reaction, setReaction] = useState<FoodReaction | null>(null);
  const [pending, setPending] = useState(false);

  // Reset state when dialog opens
  useEffect(() => {
    if (!open) return;
    const now = new Date();
    setNotes("");
    setReaction(null);
    setPending(false);
    setDate(defaultDate ?? now.toISOString().slice(0, 10));
    setTime(defaultTime ?? now.toTimeString().slice(0, 5));

    if (food) {
      setSelectedFoodId(food.id);
    } else if (foods?.length) {
      setSelectedFoodId((prev) => {
        if (prev && foods.some((f) => f.id === prev)) return prev;
        return foods[0].id;
      });
    } else {
      setSelectedFoodId("");
    }
  }, [open, food, foods, defaultDate, defaultTime]);

  // Resolve which food to log: prop > selected > first in list
  const resolvedFood = food
    || (foods?.length && selectedFoodId && foods.find((f) => f.id === selectedFoodId))
    || (foods?.length ? foods[0] : null);

  const effectiveFoodId = resolvedFood?.id ?? "";
  const showPicker = !food && foods && foods.length > 0;
  const noFoods = !food && (!foods || foods.length === 0);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!resolvedFood) {
      toast.error("No food selected");
      return;
    }
    setPending(true);
    try {
      const fedAt = new Date(`${date}T${time}`).toISOString();
      const result = await logFood(
        babyId,
        resolvedFood.id,
        fedAt,
        notes || undefined,
        reaction
      );
      if (result?.error) {
        toast.error(result.error);
        return;
      }
      toast.success(`Logged ${resolvedFood.name}`);
      setNotes("");
      setReaction(null);
      onOpenChange(false);
    } catch (err) {
      toast.error("Failed to log food");
      console.error("[LogFoodDialog] submit error:", err);
    } finally {
      setPending(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {resolvedFood ? `Log ${resolvedFood.name}` : "Log food"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {noFoods && (
            <p className="text-sm text-muted-foreground">
              No foods in library. Add a food first from the Foods tab.
            </p>
          )}
          {showPicker && (
            <div className="space-y-2">
              <Label>Food</Label>
              <Select value={effectiveFoodId} onValueChange={setSelectedFoodId}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Pick a food..." />
                </SelectTrigger>
                <SelectContent>
                  {foods.map((f) => (
                    <SelectItem key={f.id} value={f.id}>
                      {f.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="logDate">Date</Label>
              <Input
                id="logDate"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="logTime">Time</Label>
              <Input
                id="logTime"
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                required
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="logNotes">Notes (optional)</Label>
            <Input
              id="logNotes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. mixed with..."
            />
          </div>
          <div className="space-y-2">
            <Label>Reaction (optional)</Label>
            <div className="flex gap-2">
              {(
                [
                  { value: "loved", emoji: "\ud83d\ude0d", label: "Loved it" },
                  { value: "okay", emoji: "\ud83d\ude10", label: "Okay" },
                  { value: "disliked", emoji: "\ud83d\ude23", label: "Didn't like" },
                ] as const
              ).map((opt) => (
                <Button
                  key={opt.value}
                  type="button"
                  size="sm"
                  variant={reaction === opt.value ? "default" : "outline"}
                  onClick={() =>
                    setReaction((prev) =>
                      prev === opt.value ? null : opt.value
                    )
                  }
                  className="flex-1"
                >
                  <span className="mr-1">{opt.emoji}</span> {opt.label}
                </Button>
              ))}
            </div>
          </div>
          <Button
            type="submit"
            className="w-full"
            disabled={pending || noFoods}
          >
            {pending ? "Logging..." : "Log feeding"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
