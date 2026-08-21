"use client";

import { useEffect, useRef, useState } from "react";
import { CalendarIcon, LoaderCircle, RefreshCcw } from "lucide-react";
import SectionCard from "./SectionCard";
import { formatDateOnly } from "@/lib/format";

type UpdateResult = {
  ok: boolean;
  message?: string;
};

function cn(
  ...classes: Array<string | false | undefined | null>
) {
  return classes.filter(Boolean).join(" ");
}

const RescheduleCard = ({
  tourDate,
  rescheduledFrom,
  status,
  onReschedule,
}: {
  tourDate: string | null;
  rescheduledFrom: string | null;
  status: string;
  onReschedule: (date: string) => Promise<UpdateResult>;
}) => {
  const [targetDate, setTargetDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!message) {
      return;
    }

    const timer = window.setTimeout(() => {
      setMessage("");
      setIsError(false);
    }, 3000);

    return () => {
      window.clearTimeout(timer);
    };
  }, [message]);

  async function handleSubmit() {
    if (!targetDate || loading) {
      return;
    }

    setLoading(true);
    setMessage("");

    const result = await onReschedule(targetDate);

    setMessage(result.message ?? "");
    setIsError(!result.ok);
    setLoading(false);
  }

  const today = new Date();
  const minDate = formatDateOnly(
    new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()))
  );

  if (status === "DONE" || status === "CANCELLED") {
    return null;
  }

  return (
    <SectionCard
      title="Reschedule"
      icon={RefreshCcw}
    >
      <div className="flex flex-col gap-2">
        {message && (
          <div
            className={cn(
              "rounded-lg px-3 py-2 text-xs",
              isError
                ? "border border-red-100 bg-red-50 text-red-600"
                : "border border-emerald-100 bg-emerald-50 text-emerald-700"
            )}
          >
            {message}
          </div>
        )}

        {rescheduledFrom && (
          <div className="rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-600">
            Previously scheduled on{" "}
            <span className="font-medium">{rescheduledFrom}</span>
            {" → "}
            <span className="font-medium">{tourDate}</span>
          </div>
        )}

        <div className="flex items-end gap-2">
          <div className="relative w-full max-w-[220px]">
            <input
              ref={inputRef}
              type="date"
              value={targetDate}
              min={minDate}
              onChange={(event) => setTargetDate(event.target.value)}
              className="w-full rounded-lg border border-[var(--border)] bg-white px-3 py-1.5 pr-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />

            
          </div>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading || !targetDate}
            className={cn(
              "inline-flex shrink-0 items-center justify-center gap-1.5 rounded-lg border border-blue-600 bg-blue-600 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60",
              loading && "cursor-wait"
            )}
          >
            {loading ? (
              <LoaderCircle
                size={12}
                strokeWidth={2}
                className="animate-spin"
              />
            ) : (
              <RefreshCcw size={12} strokeWidth={2} />
            )}

            <span>Reschedule</span>
          </button>
        </div>
      </div>
    </SectionCard>
  );
};

export default RescheduleCard;
