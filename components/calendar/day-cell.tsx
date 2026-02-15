"use client";

import { FoodLogWithItem } from "@/lib/types/database";
import { FoodEntry } from "./food-entry";
import { isSameDay } from "@/lib/utils";
import { cn } from "@/lib/utils";

// Group logs that are within 30 minutes of each other
function groupByTime(logs: FoodLogWithItem[]): FoodLogWithItem[][] {
  if (logs.length === 0) return [];
  const sorted = [...logs].sort(
    (a, b) => new Date(a.fed_at).getTime() - new Date(b.fed_at).getTime()
  );
  const groups: FoodLogWithItem[][] = [[sorted[0]]];
  for (let i = 1; i < sorted.length; i++) {
    const prev = new Date(sorted[i - 1].fed_at).getTime();
    const curr = new Date(sorted[i].fed_at).getTime();
    if (curr - prev <= 30 * 60 * 1000) {
      groups[groups.length - 1].push(sorted[i]);
    } else {
      groups.push([sorted[i]]);
    }
  }
  return groups;
}

export function DayCell({
  date,
  logs,
  babyId,
  isCompact = false,
  onClick,
}: {
  date: Date;
  logs: FoodLogWithItem[];
  babyId: string;
  isCompact?: boolean;
  onClick?: () => void;
}) {
  const today = new Date();
  const isToday = isSameDay(date, today);
  const dayLogs = logs.filter((l) => isSameDay(new Date(l.fed_at), date));
  const groups = groupByTime(dayLogs);

  if (isCompact) {
    return (
      <div
        onClick={onClick}
        className={cn(
          "p-1 border rounded min-h-[60px] cursor-pointer hover:bg-muted/30 transition-colors",
          isToday && "ring-2 ring-primary"
        )}
      >
        <div
          className={cn(
            "text-xs font-medium mb-0.5",
            isToday && "text-primary",
            date.getMonth() !== today.getMonth() && "text-muted-foreground"
          )}
        >
          {date.getDate()}
        </div>
        {dayLogs.length > 0 && (
          <div className="flex flex-wrap gap-0.5">
            {dayLogs.slice(0, 3).map((l) => (
              <div
                key={l.id}
                className="h-1.5 w-1.5 rounded-full bg-primary"
              />
            ))}
            {dayLogs.length > 3 && (
              <span className="text-[10px] text-muted-foreground">
                +{dayLogs.length - 3}
              </span>
            )}
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      onClick={onClick}
      className={cn(
        "p-2 border rounded min-h-[100px] cursor-pointer hover:bg-muted/30 transition-colors",
        isToday && "ring-2 ring-primary"
      )}
    >
      <div
        className={cn(
          "text-xs font-semibold mb-1",
          isToday && "text-primary"
        )}
      >
        {date.toLocaleDateString(undefined, { weekday: "short" })}{" "}
        {date.getDate()}
      </div>
      <div className="space-y-1.5">
        {groups.map((group, gi) => (
          <div key={gi} className="space-y-0.5">
            {group.map((log) => (
              <FoodEntry key={log.id} log={log} babyId={babyId} />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
