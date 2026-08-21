"use client";

import { useEffect, useMemo, useState } from "react";
import { formatDateOnly } from "@/lib/format";

function startOfWeek(today: Date) {
  const d = new Date(today);
  const day = (d.getDay() + 6) % 7;

  d.setDate(d.getDate() - day);
  d.setHours(0, 0, 0, 0);

  return d;
}

function endOfWeek(today: Date) {
  const d = startOfWeek(today);
  d.setDate(d.getDate() + 6);

  return d;
}

function dayOffset(today: Date, offset: number) {
  const d = new Date(today);
  d.setDate(d.getDate() + offset);
  d.setHours(0, 0, 0, 0);

  return d;
}

type Preset =
  | "today"
  | "week"
  | "month"
  | "7d"
  | "30d"
  | "custom";

const presets: {
  value: Preset;
  label: string;
}[] = [
  { value: "today", label: "Today" },
  { value: "week", label: "This Week" },
  { value: "month", label: "This Month" },
  { value: "7d", label: "Last 7 Days" },
  { value: "30d", label: "Last 30 Days" },
  { value: "custom", label: "Custom" },
];

const DateFilter = ({
  onChange,
}: {
  onChange: (range: {
    from?: string;
    to?: string;
  }) => void;
}) => {
  const [preset, setPreset] = useState<Preset>("week");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  const today = useMemo(() => new Date(), []);

  const range = useMemo(() => {
    const t = today;

    switch (preset) {
      case "today":
        return { from: formatDateOnly(t), to: formatDateOnly(t) };

      case "week":
        return {
          from: formatDateOnly(startOfWeek(t)),
          to: formatDateOnly(endOfWeek(t)),
        };

      case "month": {
        const first = new Date(
          t.getFullYear(),
          t.getMonth(),
          1
        );

        const last = new Date(
          t.getFullYear(),
          t.getMonth() + 1,
          0
        );

        return {
          from: formatDateOnly(first),
          to: formatDateOnly(last),
        };
      }

      case "7d":
        return {
          from: formatDateOnly(dayOffset(t, -6)),
          to: formatDateOnly(t),
        };

      case "30d":
        return {
          from: formatDateOnly(dayOffset(t, -29)),
          to: formatDateOnly(t),
        };

      case "custom":
        return {
          from: from || undefined,
          to: to || undefined,
        };

      default:
        return {};
    }
  }, [preset, today, from, to]);

  useEffect(() => {
    onChange(range);
  }, [range, onChange]);

  const showCustom = preset === "custom";

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2">
        {presets.map((item) => {
          const active = preset === item.value;

          return (
            <button
              key={item.value}
              type="button"
              onClick={() => setPreset(item.value)}
              className={
                active
                  ? "rounded-lg border border-blue-600 bg-blue-50 px-3 py-1.5 text-xs font-medium text-blue-700"
                  : "rounded-lg border border-[var(--border)] bg-white px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:bg-slate-50"
              }
            >
              {item.label}
            </button>
          );
        })}
      </div>

      {showCustom && (
        <div className="flex flex-wrap items-end gap-3">
          <div className="flex flex-col gap-1">
            <label className="text-xs text-slate-500">
              From
            </label>

            <input
              type="date"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              className="w-full rounded-lg border border-[var(--border)] px-2.5 py-1.5 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs text-slate-500">
              To
            </label>

            <input
              type="date"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              className="w-full rounded-lg border border-[var(--border)] px-2.5 py-1.5 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default DateFilter;
