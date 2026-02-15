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
import { FoodItemWithDaysSince } from "@/lib/types/database";
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
  const [pending, setPending] = useState(false);

  useEffect(() => {
    if (food) setSelectedFoodId(food.id);
  }, [food]);

  useEffect(() => {
    if (defaultDate) setDate(defaultDate);
    if (defaultTime) setTime(defaultTime);
  }, [defaultDate, defaultTime]);

  const resolvedFood =
    food ?? foods?.find((f) => f.id === selectedFoodId) ?? null;
  const showPicker = !food && foods && foods.length > 0;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!resolvedFood) return;
    setPending(true);
    const fedAt = new Date(`${date}T${time}`).toISOString();
    const result = await logFood(
      babyId,
      resolvedFood.id,
      fedAt,
      notes || undefined
    );
    setPending(false);
    if (result?.error) {
      toast.error(result.error);
      return;
    }
    toast.success(`Logged ${resolvedFood.name}`);
    setNotes("");
    onOpenChange(false);
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
          {showPicker && (
            <div className="space-y-2">
              <Label>Food</Label>
              <Select value={selectedFoodId} onValueChange={setSelectedFoodId}>
                <SelectTrigger>
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
              placeholder="e.g. liked it, mixed with..."
            />
          </div>
          <Button
            type="submit"
            className="w-full"
            disabled={pending || !resolvedFood}
          >
            {pending ? "Logging..." : "Log feeding"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
