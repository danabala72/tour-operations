"use client";

import type { ElementType } from "react";

function cn(
  ...classes: Array<string | false | undefined | null>
) {
  return classes.filter(Boolean).join(" ");
}

const colorMap: Record<string, string> = {
  blue: "bg-blue-50 text-blue-600",
  sky: "bg-sky-50 text-sky-600",
  emerald: "bg-emerald-50 text-emerald-600",
  green: "bg-green-50 text-green-600",
  red: "bg-red-50 text-red-600",
  amber: "bg-amber-50 text-amber-600",
};

const StatCard = ({
  label,
  value,
  icon: Icon,
  color,
}: {
  label: string;
  value: string | number;
  icon: ElementType;
  color?: string;
}) => {
  return (
    <div className="rounded-2xl bg-white p-5 shadow-[0_2px_12px_rgba(15,23,42,0.04)] ring-1 ring-slate-100">
      <div className="flex items-center gap-3">
        <div
          className={cn(
            "flex size-9 shrink-0 items-center justify-center rounded-xl",
            colorMap[color ?? "blue"] ?? colorMap.blue
          )}
        >
          <Icon size={18} strokeWidth={1.9} />
        </div>

        <div className="min-w-0">
          <div className="text-xs font-medium uppercase tracking-wide text-slate-500">
            {label}
          </div>

          <div className="mt-1 text-2xl font-semibold text-slate-900">
            {value}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatCard;
