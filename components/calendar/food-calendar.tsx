"use client";

import { useCallback, useEffect, useState } from "react";
import { CalendarNav, CalendarView } from "./calendar-nav";
import { DayCell } from "./day-cell";
import { FoodEntry } from "./food-entry";
import { FoodLogWithItem, FoodItemWithDaysSince } from "@/lib/types/database";
import { LogFoodDialog } from "@/components/food/log-food-dialog";
import { getFoodLogsByDateRange } from "@/lib/actions/food-logs";
import {
  formatDate,
  getWeekDates,
  getMonthDates,
  isSameDay,
} from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

// Group logs by time proximity (30 min)
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

export function FoodCalendar({
  babyId,
  foods,
}: {
  babyId: string;
  foods: FoodItemWithDaysSince[];
}) {
  const [view, setView] = useState<CalendarView>("week");
  const [currentDate, setCurrentDate] = useState(new Date());
  const [logs, setLogs] = useState<FoodLogWithItem[]>([]);
  const [logDialogOpen, setLogDialogOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string | undefined>();
  const [selectedTime, setSelectedTime] = useState<string | undefined>();
  const [selectedFood, setSelectedFood] =
    useState<FoodItemWithDaysSince | null>(null);

  const fetchLogs = useCallback(async () => {
    const { start, end } = getRange(view, currentDate);
    const result = await getFoodLogsByDateRange(
      babyId,
      start.toISOString(),
      end.toISOString()
    );
    if (result.data) setLogs(result.data as FoodLogWithItem[]);
  }, [babyId, view, currentDate]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  function navigate(dir: number) {
    const d = new Date(currentDate);
    if (view === "day") d.setDate(d.getDate() + dir);
    else if (view === "week") d.setDate(d.getDate() + 7 * dir);
    else d.setMonth(d.getMonth() + dir);
    setCurrentDate(d);
  }

  function handleDayClick(date: Date) {
    if (view === "month") {
      setCurrentDate(date);
      setView("day");
      return;
    }
    setSelectedDate(formatDate(date));
    setSelectedTime(new Date().toTimeString().slice(0, 5));
    setSelectedFood(null);
    setLogDialogOpen(true);
  }

  const label = getLabel(view, currentDate);

  return (
    <div className="space-y-4">
      <CalendarNav
        view={view}
        onViewChange={setView}
        label={label}
        onPrev={() => navigate(-1)}
        onNext={() => navigate(1)}
        onToday={() => setCurrentDate(new Date())}
      />

      {view === "week" && (
        <WeekView
          date={currentDate}
          logs={logs}
          babyId={babyId}
          onDayClick={handleDayClick}
          onUpdate={fetchLogs}
        />
      )}
      {view === "day" && (
        <DayView
          date={currentDate}
          logs={logs}
          babyId={babyId}
          onAddClick={() => {
            setSelectedDate(formatDate(currentDate));
            setSelectedTime(new Date().toTimeString().slice(0, 5));
            setSelectedFood(null);
            setLogDialogOpen(true);
          }}
          onUpdate={fetchLogs}
        />
      )}
      {view === "month" && (
        <MonthView
          date={currentDate}
          logs={logs}
          babyId={babyId}
          onDayClick={handleDayClick}
          onUpdate={fetchLogs}
        />
      )}

      <LogFoodDialog
        food={selectedFood}
        foods={foods}
        babyId={babyId}
        open={logDialogOpen}
        onOpenChange={(open) => {
          setLogDialogOpen(open);
          if (!open) fetchLogs();
        }}
        defaultDate={selectedDate}
        defaultTime={selectedTime}
      />
    </div>
  );
}

function WeekView({
  date,
  logs,
  babyId,
  onDayClick,
  onUpdate,
}: {
  date: Date;
  logs: FoodLogWithItem[];
  babyId: string;
  onDayClick: (d: Date) => void;
  onUpdate?: () => void;
}) {
  const days = getWeekDates(date);
  return (
    <div className="grid grid-cols-7 gap-1">
      {days.map((d) => (
        <DayCell
          key={d.toISOString()}
          date={d}
          logs={logs}
          babyId={babyId}
          onClick={() => onDayClick(d)}
          onUpdate={onUpdate}
        />
      ))}
    </div>
  );
}

function DayView({
  date,
  logs,
  babyId,
  onAddClick,
  onUpdate,
}: {
  date: Date;
  logs: FoodLogWithItem[];
  babyId: string;
  onAddClick: () => void;
  onUpdate?: () => void;
}) {
  const dayLogs = logs.filter((l) => isSameDay(new Date(l.fed_at), date));
  const groups = groupByTime(dayLogs);

  return (
    <div className="border rounded-lg p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold">
          {date.toLocaleDateString(undefined, {
            weekday: "long",
            month: "long",
            day: "numeric",
          })}
        </h3>
        <Button size="sm" onClick={onAddClick}>
          <Plus className="h-4 w-4 mr-1" /> Log food
        </Button>
      </div>
      {dayLogs.length === 0 ? (
        <p className="text-muted-foreground text-center py-8">
          No foods logged this day
        </p>
      ) : (
        <div className="space-y-3">
          {groups.map((group, gi) => (
            <div key={gi} className="space-y-1 border-l-2 border-primary/20 pl-3">
              {group.map((log) => (
                <FoodEntry key={log.id} log={log} babyId={babyId} onUpdate={onUpdate} />
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function MonthView({
  date,
  logs,
  babyId,
  onDayClick,
  onUpdate,
}: {
  date: Date;
  logs: FoodLogWithItem[];
  babyId: string;
  onDayClick: (d: Date) => void;
  onUpdate?: () => void;
}) {
  const days = getMonthDates(date.getFullYear(), date.getMonth());
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  return (
    <div>
      <div className="grid grid-cols-7 gap-1 mb-1">
        {dayNames.map((d) => (
          <div key={d} className="text-xs text-center text-muted-foreground font-medium py-1">
            {d}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {days.map((d) => (
          <DayCell
            key={d.toISOString()}
            date={d}
            logs={logs}
            babyId={babyId}
            isCompact
            onClick={() => onDayClick(d)}
            onUpdate={onUpdate}
          />
        ))}
      </div>
    </div>
  );
}

function getRange(view: CalendarView, date: Date) {
  if (view === "day") {
    const start = new Date(date);
    start.setHours(0, 0, 0, 0);
    const end = new Date(date);
    end.setHours(23, 59, 59, 999);
    return { start, end };
  }
  if (view === "week") {
    const days = getWeekDates(date);
    const start = new Date(days[0]);
    start.setHours(0, 0, 0, 0);
    const end = new Date(days[6]);
    end.setHours(23, 59, 59, 999);
    return { start, end };
  }
  // month
  const start = new Date(date.getFullYear(), date.getMonth(), 1);
  const end = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999);
  return { start, end };
}

function getLabel(view: CalendarView, date: Date) {
  if (view === "day") {
    return date.toLocaleDateString(undefined, {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  }
  if (view === "week") {
    const days = getWeekDates(date);
    const s = days[0];
    const e = days[6];
    return `${s.toLocaleDateString(undefined, { month: "short", day: "numeric" })} - ${e.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}`;
  }
  return date.toLocaleDateString(undefined, {
    month: "long",
    year: "numeric",
  });
}
