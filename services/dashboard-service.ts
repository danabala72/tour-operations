import { db } from "@/lib/db";
import type {
  DashboardStats,
  ChannelStat,
  LanguageStat,
  Series,
} from "@/app/types/dashboard";

const CHANNEL_COLORS: Record<string, string> = {
  CIVITATIS: "text-blue-500",
  GYG: "text-emerald-500",
  VIATOR: "text-amber-500",
};

function channelColor(code: string | null) {
  return code ? CHANNEL_COLORS[code] ?? "text-slate-500" : "text-slate-500";
}

function toDateId(date: Date) {
  return date.toISOString().slice(0, 10);
}

export async function getStats(filters: {
  from?: string;
  to?: string;
} = {}): Promise<DashboardStats> {
  const today = new Date();

  const fromDate = filters.from
    ? new Date(`${filters.from}T00:00:00Z`)
    : new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

  const toDate = filters.to
    ? new Date(`${filters.to}T23:59:59Z`)
    : today;

  const where = {
    tourDate: {
      gte: fromDate,
      lte: toDate,
    },
  };

  const [
    channels,
    summary,
    byChannelGroup,
    byLanguageGroup,
    statusGroup,
    perDateGroup,
  ] = await Promise.all([
    db.channel.findMany({
      select: { id: true, code: true, name: true },
    }),
    db.reservation.aggregate({
      where,
      _count: { _all: true },
      _sum: { paxTotal: true, salePrice: true },
    }),
    db.reservation.groupBy({
      where,
      by: ["channelId"],
      _count: { _all: true },
    }),
    db.reservation.groupBy({
      where,
      by: ["language"],
      _count: { _all: true },
    }),
    db.reservation.groupBy({
      where,
      by: ["status"],
      _count: { _all: true },
    }),
    db.reservation.groupBy({
      where,
      by: ["tourDate", "channelId"],
      _count: { _all: true },
    }),
  ]);

  const byChannel: ChannelStat[] = channels.map((ch) => {
    const group = byChannelGroup.find(
      (g) => Number(g.channelId) === Number(ch.id)
    );

    return {
      code: ch.code,
      name: ch.name,
      count: group?._count._all ?? 0,
      color: channelColor(ch.code),
    };
  });

  const byLanguage: LanguageStat[] = byLanguageGroup
    .filter((g) => g.language !== null)
    .map((g) => ({
      language: g.language as string,
      count: g._count._all,
    }))
    .sort((a, b) => b.count - a.count);

  const statusMap = new Map(
    statusGroup.map(
      (g) => [g.status, g._count._all] as [string, number]
    )
  );

  const dateSet = new Set<string>();
  const seriesByChannel = new Map<
    number,
    Array<{ date: string; count: number }>
  >();

  for (const group of perDateGroup) {
    const date = toDateId(group.tourDate as unknown as Date);
    const channelId = Number(group.channelId);

    dateSet.add(date);

    if (!seriesByChannel.has(channelId)) {
      seriesByChannel.set(channelId, []);
    }

    seriesByChannel
      .get(channelId)!
      .push({ date, count: group._count._all });
  }

  const dates = [...dateSet].sort();

  const series: Series[] = channels.map((ch) => {
    const points =
      seriesByChannel.get(Number(ch.id)) ?? [];

    return {
      name: ch.code ?? ch.name ?? "Unknown",
      color: channelColor(ch.code),
      points: points.sort((a, b) =>
        a.date.localeCompare(b.date)
      ),
    };
  });

  const totalRevenue = Number(
    summary._sum.salePrice ?? 0
  );

  return {
    summary: {
      totalBookings: summary._count._all,
      totalPax: summary._sum.paxTotal ?? 0,
      totalRevenue,
      completed: statusMap.get("DONE") ?? 0,
      cancelled: statusMap.get("CANCELLED") ?? 0,
    },
    byChannel,
    byLanguage,
    dates,
    series,
  };
}
