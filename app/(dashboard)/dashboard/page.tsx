"use client";

import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import {
  BookOpen,
  CheckCircle2,
  DollarSign,
  Users,
  XCircle,
} from "lucide-react";

import BarChart from "@/app/components/charts/BarChart";
import LineChart from "@/app/components/charts/LineChart";
import DateFilter from "@/app/components/dashboard/DateFilter";
import StatCard from "@/app/components/dashboard/StatCard";
import type { DashboardStats } from "@/app/types/dashboard";
import { channelLogoMap } from "@/app/types/channel";

type ApiResponse =
  | { success: true; data: DashboardStats }
  | { success: false; message?: string };

const KNOWN_CHANNELS: Array<{
  code: string;
  name: string;
  color: string;
}> = [
  { code: "CIVITATIS", name: "Civitatis", color: "text-blue-500" },
  { code: "GYG", name: "GetYourGuide", color: "text-emerald-500" },
  { code: "VIATOR", name: "Viator", color: "text-amber-500" },
];

function formatCount(value: number) {
  return new Intl.NumberFormat("en-US").format(value);
}

function formatCurrency(value: number | string | null | undefined) {
  if (value == null) {
    return "—";
  }

  const number = typeof value === "number" ? value : Number(value);

  if (Number.isNaN(number)) {
    return "—";
  }

  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 2,
  }).format(number);
}

function cn(
  ...classes: Array<string | false | undefined | null>
) {
  return classes.filter(Boolean).join(" ");
}

function ChartCard({
  title,
  children,
  className,
}: {
  title: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-2xl bg-white p-5 shadow-[0_2px_12px_rgba(15,23,42,0.04)] ring-1 ring-slate-100",
        className,
      )}
    >
      <div className="mb-4 text-sm font-medium text-slate-700">
        {title}
      </div>

      {children}
    </div>
  );
}

function StatGrid({
  stats,
  isLoading,
}: {
  stats: DashboardStats | null;
  isLoading: boolean;
}) {
  if (!stats && !isLoading) {
    return null;
  }

  const { summary } = stats ?? {
    summary: {
      totalBookings: 0,
      totalPax: 0,
      totalRevenue: 0,
      completed: 0,
      cancelled: 0,
    },
  };

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
      <StatCard
        label="Total Bookings"
        value={formatCount(summary.totalBookings)}
        icon={BookOpen}
        color="blue"
      />

      <StatCard
        label="Pax"
        value={formatCount(summary.totalPax)}
        icon={Users}
        color="sky"
      />

      <StatCard
        label="Revenue"
        value={formatCurrency(summary.totalRevenue)}
        icon={DollarSign}
        color="emerald"
      />

      <StatCard
        label="Completed"
        value={formatCount(summary.completed)}
        icon={CheckCircle2}
        color="green"
      />

      <StatCard
        label="Cancelled"
        value={formatCount(summary.cancelled)}
        icon={XCircle}
        color="red"
      />
    </div>
  );
}

function ChartSkeleton() {
  return (
    <div className="rounded-2xl bg-white p-5 shadow-[0_2px_12px_rgba(15,23,42,0.04)] ring-1 ring-slate-100">
      <div className="mb-4 h-4 w-40 animate-pulse rounded bg-slate-200" />
      <div className="h-56 w-full animate-pulse rounded bg-slate-100" />
    </div>
  );
}

function Charts({
  stats,
  isLoading,
}: {
  stats: DashboardStats | null;
  isLoading: boolean;
}) {
  if (isLoading || !stats) {
    return (
      <div className="grid gap-6 lg:grid-cols-2">
        <ChartSkeleton />
        <ChartSkeleton />
      </div>
    );
  }

  const byChannelMap = new Map(
    stats.byChannel.map(
      (c) => [c.code, c] as [string | null, typeof c]
    )
  );

  const channelData = KNOWN_CHANNELS.map((ch) => {
    const fromDb = byChannelMap.get(ch.code);

    return {
      label: fromDb?.name ?? ch.name,
      value: fromDb?.count ?? 0,
      color: fromDb?.color ?? ch.color,
      logo: channelLogoMap[ch.code],
    };
  });

  const languageData = stats.byLanguage.map((l) => ({
    label: l.language,
    value: l.count,
    flag: l.language,
  }));

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="overflow-x-auto">
        <ChartCard title="Bookings by Channel" className="min-w-[400px]">
          <BarChart
            data={channelData}
            isLoading={false}
            title="Bookings by channel"
          />
        </ChartCard>
      </div>

      <div className="overflow-x-auto">
        <ChartCard title="Bookings by Language" className="min-w-[400px]">
          <BarChart
            data={languageData}
            isLoading={false}
            title="Bookings by language"
          />
        </ChartCard>
      </div>

      <div className="lg:col-span-2 overflow-x-auto">
        <ChartCard title="Bookings Over Time" className="min-w-[680px]">
          <LineChart
            dates={stats.dates}
            series={stats.series}
            isLoading={false}
            title="Bookings over time"
          />
        </ChartCard>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [range, setRange] = useState<{
    from?: string;
    to?: string;
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [userName, setUserName] = useState<string | null>(null);

  useEffect(() => {
    if (!range) {
      return;
    }

    const { from, to } = range;
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError("");

      try {
        const params = new URLSearchParams();

        if (from) {
          params.set("from", from);
        }

        if (to) {
          params.set("to", to);
        }

        const response = await fetch(
          `/api/dashboard?${params.toString()}`,
          { cache: "no-store" }
        );

        const json = (await response.json()) as ApiResponse;

        if (!response.ok || !json.success) {
          throw new Error(
            json.success ? "Failed to load dashboard." : json.message ?? "Failed to load dashboard."
          );
        }

        if (!cancelled) {
          setStats(json.data);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "Failed to load dashboard."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [range]);

  const greeting = useMemo(() => {
    const hour = new Date().getHours();

    if (hour < 12) {
      return "Good morning";
    }

    if (hour < 18) {
      return "Good afternoon";
    }

    return "Good evening";
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function loadUser() {
      try {
        const response = await fetch("/api/auth/me", {
          cache: "no-store",
        });

        if (!response.ok) {
          return;
        }

        const json = (await response.json()) as {
          success: boolean;
          user?: { name?: string };
        };

        if (!cancelled && json.success && json.user?.name) {
          setUserName(json.user.name);
        }
      } catch {
        // keep greeting as fallback
      }
    }

    loadUser();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          {greeting}, {userName ?? "here's your dashboard"}
        </h1>

        <p className="mt-1 text-sm text-[var(--muted)]">
          Booking and revenue overview for the selected period.
        </p>
      </div>

      {/* Date filter */}
      <div className="rounded-2xl bg-white p-5 shadow-[0_2px_12px_rgba(15,23,42,0.04)] ring-1 ring-slate-100">
        <DateFilter onChange={setRange} />
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      {/* Stats */}
      <StatGrid stats={stats} isLoading={loading} />

      {/* Charts */}
      <Charts stats={stats} isLoading={loading} />
    </div>
  );
}
