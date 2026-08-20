"use client";

import type { ElementType } from "react";
import {
  Check,
  ChevronDown,
  Clock3,
  LoaderCircle,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import SectionCard from "./SectionCard";
import { statusFilters } from "@/app/types/style";

type UpdateResult = {
  ok: boolean;
  message?: string;
};

function cn(
  ...classes: Array<string | false | undefined | null>
) {
  return classes.filter(Boolean).join(" ");
}

type StatusOption = {
  value: string;
  label: string;
  Icon: ElementType;
  color: string;
};

const StatusUpdateCard = ({
  currentStatus,
  onUpdate,
}: {
  currentStatus: string;
  onUpdate: (
    status: string
  ) => Promise<UpdateResult>;
}) => {
  const options: StatusOption[] = statusFilters
    .filter((item) => item.value)
    .map((item) => ({
      value: item.value,
      label: item.label,
      Icon: item.icon as ElementType,
      color: item.color,
    }));

  const currentOption =
    options.find((o) => o.value === currentStatus) ??
    options[0];

  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) {
      return;
    }

    function onDocument(
      event: MouseEvent
    ) {
      if (
        containerRef.current &&
        !containerRef.current.contains(
          event.target as Node
        )
      ) {
        setOpen(false);
      }
    }

    document.addEventListener(
      "mousedown",
      onDocument
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        onDocument
      );
    };
  }, [open]);

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

  async function handleSelect(next: string) {
    if (next === currentStatus || loading) {
      return;
    }

    setOpen(false);
    setLoading(true);
    setMessage("");

    const result = await onUpdate(next);

    setMessage(result.message ?? "");
    setIsError(!result.ok);
    setLoading(false);
  }

  return (
    <SectionCard
      title="Update Status"
      icon={Clock3}
    >
      <div className="flex flex-col gap-3">
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

          <div
            className="relative inline-block min-w-[140px] self-start"
            ref={containerRef}
          >
          <button
            type="button"
            aria-haspopup="listbox"
            aria-expanded={open}
            aria-label={`Status: ${currentOption.label}. Click to change`}
            onClick={() => setOpen((o) => !o)}
            disabled={loading}
            className={cn(
              "flex w-full items-center justify-between gap-2 rounded-lg border border-[var(--border)] bg-white px-3 py-1.5 text-left text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100",
              loading
                ? "cursor-wait opacity-60"
                : "hover:bg-slate-50"
            )}
          >
            <span className="flex min-w-0 items-center gap-1.5">
              <currentOption.Icon
                size={14}
                strokeWidth={2}
                className={cn("shrink-0", currentOption.color)}
              />

              <span
                className={cn("truncate", currentOption.color)}
              >
                {currentOption.label}
              </span>
            </span>

            {loading ? (
              <LoaderCircle
                size={14}
                strokeWidth={2}
                className="animate-spin text-slate-500"
              />
            ) : (
              <ChevronDown
                size={14}
                strokeWidth={2}
                className={cn(
                  "text-slate-400 transition-transform",
                  open && "rotate-180"
                )}
              />
            )}
          </button>

          {open && (
            <div
              className={cn(
                "absolute top-full z-20 mt-1 w-full max-h-56 overflow-y-auto rounded-lg border border-[var(--border)] bg-white shadow-lg ring-1 ring-slate-200"
              )}
              role="listbox"
            >
              {options.map((item) => {
                const Icon = item.Icon;
                const isActive =
                  item.value === currentStatus;

                return (
                  <button
                    key={item.value}
                    type="button"
                    role="option"
                    aria-selected={isActive}
                    onClick={() =>
                      handleSelect(item.value)
                    }
                    className={cn(
                      "flex w-full items-center gap-2 px-3 py-1.5 text-left",
                      "transition-colors",
                      isActive
                        ? "bg-blue-50 font-medium text-blue-700"
                        : "text-slate-700 hover:bg-slate-50"
                    )}
                  >
                    <Icon
                      size={14}
                      strokeWidth={2}
                      className={cn("shrink-0", item.color)}
                    />

                    <span className="truncate">
                      {item.label}
                    </span>

                    {isActive && (
                      <Check
                        size={12}
                        strokeWidth={3}
                        className="ml-auto text-slate-400"
                      />
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </SectionCard>
  );
};

export default StatusUpdateCard;
