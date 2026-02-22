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
import { updateFoodLog } from "@/lib/actions/food-logs";
import { FoodLogWithItem, FoodReaction } from "@/lib/types/database";
import { toast } from "sonner";

export function EditFoodLogDialog({
  log,
  babyId,
  open,
  onOpenChange,
  onUpdate,
}: {
  log: FoodLogWithItem;
  babyId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate?: () => void;
}) {
  const fedAt = new Date(log.fed_at);
  const [date, setDate] = useState(fedAt.toISOString().slice(0, 10));
  const [time, setTime] = useState(
    fedAt.toTimeString().slice(0, 5)
  );
  const [notes, setNotes] = useState(log.notes ?? "");
  const [reaction, setReaction] = useState<FoodReaction | null>(
    (log.reaction as FoodReaction) ?? null
  );
  const [pending, setPending] = useState(false);

  // Reset state when dialog opens with new log data
  useEffect(() => {
    if (!open) return;
    const fedAt = new Date(log.fed_at);
    setDate(fedAt.toISOString().slice(0, 10));
    setTime(fedAt.toTimeString().slice(0, 5));
    setNotes(log.notes ?? "");
    setReaction((log.reaction as FoodReaction) ?? null);
    setPending(false);
  }, [open, log]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    try {
      const fedAt = new Date(`${date}T${time}`).toISOString();
      const result = await updateFoodLog(babyId, log.id, {
        fed_at: fedAt,
        notes: notes || null,
        reaction: reaction || null,
      });
      if (result?.error) {
        toast.error(result.error);
        return;
      }
      toast.success(`Updated ${log.food_items.name}`);
      onOpenChange(false);
      onUpdate?.();
    } catch (err) {
      toast.error("Failed to update food log");
      console.error("[EditFoodLogDialog] submit error:", err);
    } finally {
      setPending(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit {log.food_items.name}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="editDate">Date</Label>
              <Input
                id="editDate"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="editTime">Time</Label>
              <Input
                id="editTime"
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                required
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="editNotes">Notes (optional)</Label>
            <Input
              id="editNotes"
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
            disabled={pending}
          >
            {pending ? "Saving..." : "Save changes"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
