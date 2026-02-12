"use client";

import * as React from "react";
import { Calendar as CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/components/lib/utils";

function formatDisplay(date: Date): string {
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  const yyyy = date.getFullYear();
  let h = date.getHours();
  const m = date.getMinutes();
  const am = h < 12;
  const h12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
  const min = String(m).padStart(2, "0");
  return `${mm}/${dd}/${yyyy} ${String(h12).padStart(2, "0")}:${min} ${am ? "AM" : "PM"}`;
}

function parseToLocalDate(isoOrLocalString: string): Date {
  const s = isoOrLocalString.length === 16 ? isoOrLocalString + "Z" : isoOrLocalString;
  const d = new Date(s);
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000);
}

function toISOSlice(date: Date): string {
  return date.toISOString().slice(0, 16);
}

const HOURS_12 = [12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
const MINUTES = Array.from({ length: 60 }, (_, i) => i);

export interface DateTimePickerProps {
  value: string; // ISO slice "YYYY-MM-DDTHH:mm" (UTC) or empty
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  id?: string;
  className?: string;
  "aria-label"?: string;
}

export function DateTimePicker({
  value,
  onChange,
  placeholder = "mm/dd/yyyy --:-- --",
  disabled,
  id,
  className,
  "aria-label": ariaLabel,
}: DateTimePickerProps) {
  const [open, setOpen] = React.useState(false);
  const dateFromValue = value ? parseToLocalDate(value) : null;
  const [selectedDate, setSelectedDate] = React.useState<Date | undefined>(
    dateFromValue ?? undefined
  );
  const [hour, setHour] = React.useState(() =>
    dateFromValue ? dateFromValue.getHours() % 12 || 12 : 7
  );
  const [minute, setMinute] = React.useState(() =>
    dateFromValue ? dateFromValue.getMinutes() : 0
  );
  const [am, setAm] = React.useState(() =>
    dateFromValue ? dateFromValue.getHours() < 12 : true
  );

  React.useEffect(() => {
    if (value) {
      const d = parseToLocalDate(value);
      setSelectedDate(d);
      setHour(d.getHours() % 12 || 12);
      setMinute(d.getMinutes());
      setAm(d.getHours() < 12);
    } else {
      setSelectedDate(undefined);
      setHour(7);
      setMinute(0);
      setAm(true);
    }
  }, [value]);

  const buildDate = React.useCallback(() => {
    if (!selectedDate) return null;
    const d = new Date(selectedDate);
    const h24 = am ? (hour === 12 ? 0 : hour) : hour === 12 ? 12 : hour + 12;
    d.setHours(h24, minute, 0, 0);
    return d;
  }, [selectedDate, hour, minute, am]);

  const handleApply = React.useCallback(() => {
    const d = buildDate();
    if (d) onChange(toISOSlice(d));
    setOpen(false);
  }, [buildDate, onChange]);

  const handleClear = React.useCallback(() => {
    onChange("");
    setSelectedDate(undefined);
    setHour(7);
    setMinute(0);
    setAm(true);
    setOpen(false);
  }, [onChange]);

  const handleToday = React.useCallback(() => {
    const today = new Date();
    setSelectedDate(today);
    setHour(today.getHours() % 12 || 12);
    setMinute(today.getMinutes());
    setAm(today.getHours() < 12);
  }, []);

  const displayText = value ? formatDisplay(parseToLocalDate(value)) : "";

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          id={id}
          variant="outline"
          disabled={disabled}
          aria-label={ariaLabel}
          className={cn(
            "w-full justify-start text-left font-normal h-10",
            !displayText && "text-muted-foreground",
            className
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {displayText || placeholder}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <div className="flex">
          {/* Calendar */}
          <div className="flex flex-col border-r p-3">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              initialFocus
              captionLayout="dropdown"
              startMonth={new Date()}
              endMonth={new Date(new Date().getFullYear() + 10, 11)}
            />
            <div className="flex justify-between border-t pt-2 mt-2 gap-2">
              <button
                type="button"
                className="text-sm text-muted-foreground hover:text-foreground"
                onClick={handleClear}
              >
                Clear
              </button>
              <button
                type="button"
                className="text-sm text-muted-foreground hover:text-foreground"
                onClick={handleToday}
              >
                Today
              </button>
            </div>
          </div>
          {/* Time */}
          <div className="flex flex-col p-3 border-l bg-muted/30">
            <div className="text-xs font-medium text-muted-foreground mb-2 text-center">
              Time
            </div>
            <div className="flex gap-1">
              <ScrollArea className="h-[180px] w-12 rounded-md border bg-background">
                <div className="p-1 space-y-0.5">
                  {HOURS_12.map((h) => (
                    <button
                      key={h}
                      type="button"
                      className={cn(
                        "w-full rounded px-2 py-1 text-sm text-center",
                        hour === h
                          ? "bg-primary text-primary-foreground"
                          : "hover:bg-accent"
                      )}
                      onClick={() => setHour(h)}
                    >
                      {String(h).padStart(2, "0")}
                    </button>
                  ))}
                </div>
              </ScrollArea>
              <ScrollArea className="h-[180px] w-12 rounded-md border bg-background">
                <div className="p-1 space-y-0.5">
                  {MINUTES.map((m) => (
                    <button
                      key={m}
                      type="button"
                      className={cn(
                        "w-full rounded px-2 py-1 text-sm text-center",
                        minute === m
                          ? "bg-primary text-primary-foreground"
                          : "hover:bg-accent"
                      )}
                      onClick={() => setMinute(m)}
                    >
                      {String(m).padStart(2, "0")}
                    </button>
                  ))}
                </div>
              </ScrollArea>
              <div className="flex flex-col gap-0.5">
                <button
                  type="button"
                  className={cn(
                    "rounded px-2 py-1 text-sm",
                    am ? "bg-primary text-primary-foreground" : "hover:bg-accent"
                  )}
                  onClick={() => setAm(true)}
                >
                  AM
                </button>
                <button
                  type="button"
                  className={cn(
                    "rounded px-2 py-1 text-sm",
                    !am ? "bg-primary text-primary-foreground" : "hover:bg-accent"
                  )}
                  onClick={() => setAm(false)}
                >
                  PM
                </button>
              </div>
            </div>
            <Button
              type="button"
              size="sm"
              className="mt-3 w-full"
              onClick={handleApply}
              disabled={!selectedDate}
            >
              Apply
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
