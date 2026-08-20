"use client";

import { LoaderCircle } from "lucide-react";
import { statusFilters } from "@/app/types/style";

const BulkStatusActionBar = ({
  selectedCount,
  value,
  onChange,
  onApply,
  applying,
  onClear,
}: {
  selectedCount: number;
  value: string;
  onChange: (value: string) => void;
  onApply: () => void;
  applying: boolean;
  onClear: () => void;
}) => {
  const statuses = statusFilters.filter(
    (item) => item.value
  );

  const canApply = Boolean(value) && !applying;

  return (
    <div className="flex items-center justify-between rounded-xl border border-[var(--border)] bg-white px-4 py-3 shadow-[0_2px_12px_rgba(15,23,42,0.04)] ring-1 ring-slate-100">
      <span className="text-sm text-slate-700">
        <span className="font-medium">{selectedCount}</span>
        {" "}
        selected
      </span>

      <div className="flex items-center gap-2">
        <select
          value={value}
          onChange={(event) =>
            onChange(event.target.value)
          }
          disabled={applying}
          className="w-auto min-w-[130px] rounded-lg border border-[var(--border)] bg-white px-3 py-1.5 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-wait disabled:opacity-60"
          aria-label="Status"
        >
          <option value="" disabled>
            Select status
          </option>

          {statuses.map((item) => (
            <option
              key={item.value}
              value={item.value}
            >
              {item.label}
            </option>
          ))}

          {value && !statuses.find((s) => s.value === value) && (
            <option value={value}>{value}</option>
          )}
        </select>

        <button
          type="button"
          onClick={onApply}
          disabled={!canApply}
          className={
            canApply
              ? "cursor-pointer rounded-lg bg-blue-600 px-3.5 py-1.5 text-xs font-medium text-white transition hover:bg-blue-700"
              : "cursor-not-allowed rounded-lg bg-slate-300 px-3.5 py-1.5 text-xs font-medium text-white"
          }
        >
          {applying ? (
            <span className="flex items-center gap-1">
              <LoaderCircle
                size={12}
                strokeWidth={2}
                className="animate-spin"
              />
              Applying...
            </span>
          ) : (
            "Apply"
          )}
        </button>

        <button
          type="button"
          onClick={onClear}
          disabled={applying}
          className="cursor-pointer rounded-lg px-2 py-1.5 text-xs font-medium text-slate-500 underline transition hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          Clear
        </button>
      </div>
    </div>
  );
};

export default BulkStatusActionBar;
