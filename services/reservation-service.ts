import { db } from "@/lib/db";
import type { ReservationWhereInput } from "@/lib/generated/prisma/models/Reservation";
import type { ReservationStatus } from "@/lib/generated/prisma/enums";
import { formatDateOnly } from "@/lib/format";
import { getBusinessDate } from "@/lib/business-time";

export type ReservationFilters = {
  date?: string;
  from?: string;
  to?: string;
  status?: ReservationStatus;
  channel?: string;
  search?: string;
  jobFilter?: "TODAY" | "UPCOMING";
  dateFilter?: "ALL" | "TODAY" | "TOMORROW" | "THIS_WEEK" | "PREVIOUS";
  page?: number;
  limit?: number;
};

export async function getReservations(
  filters: ReservationFilters = {}
) {
  const page = Math.max(
    1,
    Number(filters.page ?? 1)
  );

  const limit = Math.min(
    500,
    Math.max(
      1,
      Number(filters.limit ?? 20)
    )
  );

  const where = buildReservationWhere(filters);

  const [data, total] =
    await Promise.all([
      db.reservation.findMany({
        where,
        select: {
          id: true,
          supplierBookingId: true,
          supplierReference: true,
          tourName: true,
          tourOption: true,
          tourDate: true,
          tourTime: true,
          customerName: true,
          customerEmail: true,
          customerPhone: true,
          paxTotal: true,
          language: true,
          pickupTime: true,
          pickupAddress: true,
          customerNote: true,
          salePrice: true,
          netPrice: true,
          currency: true,
          status: true,
          rescheduleDate: true,
          rescheduledFrom: true,
          channel: {
            select: {
              id: true,
              code: true,
              name: true,
            },
          },
        },
        orderBy: [
          { tourDate: "asc" },
          { tourTime: "asc" },
          { id: "asc" },
        ],
        skip: (page - 1) * limit,
        take: limit,
      }),
      db.reservation.count({ where }),
    ]);

  const channelCounts = await getChannelCounts(filters);

  return {
    data: data.map((item) => ({
      ...item,
      tourTime: item.tourTime
        ? `${String(item.tourTime.getUTCHours()).padStart(2, "0")}:${String(item.tourTime.getUTCMinutes()).padStart(2, "0")}`
        : null,
      pickupTime: item.pickupTime
        ? `${String(item.pickupTime.getUTCHours()).padStart(2, "0")}:${String(item.pickupTime.getUTCMinutes()).padStart(2, "0")}`
        : null,
      rescheduleDate: item.rescheduleDate
        ? formatDateOnly(item.rescheduleDate)
        : null,
      rescheduledFrom: item.rescheduledFrom
        ? formatDateOnly(item.rescheduledFrom)
        : null,
    })),

    channelCounts,

    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

function buildReservationWhere(
  filters: ReservationFilters
): ReservationWhereInput {
  const where: ReservationWhereInput = {};
  const today = getBusinessDate();

  if (filters.date) {
    where.tourDate = new Date(
      filters.date
    );
  } else if (
    filters.from ||
    filters.to
  ) {
    if (filters.from) {
      where.tourDate = {
        gte: new Date(filters.from),
      };
    }

    if (filters.to) {
      where.tourDate = {
        ...(where.tourDate as {
          gte?: Date;
          lte?: Date;
        } | Date),
        lte: new Date(filters.to),
      };
    }
  } else if (filters.dateFilter === "ALL") {
    // No date constraint. The client keeps this result in memory and applies
    // interactive filters without another network request.
  } else if (filters.dateFilter === "TODAY") {
    where.tourDate = {
      equals: today,
    };
  } else if (filters.dateFilter === "TOMORROW") {
    where.tourDate = {
      equals: getBusinessDate(1),
    };
  } else if (filters.dateFilter === "PREVIOUS") {
    where.tourDate = {
      lt: today,
    };
  } else if (filters.dateFilter === "THIS_WEEK") {
    where.tourDate = {
      gte: today,
      lte: getBusinessDate(6),
    };
  } else if (filters.jobFilter === "TODAY") {
    where.tourDate = {
      equals: today,
    };
  } else if (filters.jobFilter === "UPCOMING") {
    where.tourDate = {
      gte: getBusinessDate(1),
    };
  } else {
    where.tourDate = {
      gte: today,
      lte: getBusinessDate(7),
    };
  }

  if (filters.status) {
    where.status = filters.status;
  }

  if (filters.channel) {
    where.channel = {
      code: filters.channel,
    };
  }

  if (filters.search) {
    where.OR = [
      {
        supplierBookingId: {
          contains: filters.search,
        },
      },
      {
        supplierReference: {
          contains: filters.search,
        },
      },
      {
        customerName: {
          contains: filters.search,
        },
      },
      {
        customerEmail: {
          contains: filters.search,
        },
      },
      {
        customerPhone: {
          contains: filters.search,
        },
      },
      {
        tourName: {
          contains: filters.search,
        },
      },
      {
        tourOption: {
          contains: filters.search,
        },
      },
      {
        pickupAddress: {
          contains: filters.search,
        },
      },
      {
        customerNote: {
          contains: filters.search,
        },
      },
      {
        internalNote: {
          contains: filters.search,
        },
      },
      {
        channel: {
          code: {
            contains: filters.search,
          },
        },
      },
      {
        channel: {
          name: {
            contains: filters.search,
          },
        },
      },
    ];
  }

  return where;
}

export async function getChannelCounts(
  filters: ReservationFilters = {}
) {
  const where = buildReservationWhere(filters);

  const allChannels = await db.channel.findMany({
    select: { id: true, code: true },
  });

  const result: Record<string, number> = {};

  for (const ch of allChannels) {
    const count = await db.reservation.count({
      where: {
        ...where,
        channelId: ch.id,
      },
    });

    result[ch.code] = count;
  }

  return result;
}

export async function getStatusCounts(
  filters: ReservationFilters = {}
) {
  const where = buildReservationWhere(filters);

  const counts =
    await db.reservation.groupBy({
      by: ["status"],
      where,
      _count: {
        _all: true,
      },
    });

  const result: Record<string, number> = {};

  for (const item of counts) {
    result[item.status] = item._count._all;
  }

  return result;
}

export async function getDateCounts(
  filters: ReservationFilters = {}
) {
  const baseWhere = buildReservationWhere({
    ...filters,
    dateFilter: undefined,
    date: undefined,
    from: undefined,
    to: undefined,
  });

  const today = getBusinessDate();
  const tomorrow = getBusinessDate(1);
  const weekEnd = getBusinessDate(6);

  const result: Record<string, number> = {};

  result.ALL = await db.reservation.count({ where: baseWhere });

  result.TODAY = await db.reservation.count({
    where: {
      ...baseWhere,
      tourDate: { equals: today },
    },
  });

  result.TOMORROW = await db.reservation.count({
    where: {
      ...baseWhere,
      tourDate: { equals: tomorrow },
    },
  });

  result.THIS_WEEK = await db.reservation.count({
    where: {
      ...baseWhere,
      tourDate: {
        gte: today,
        lte: weekEnd,
      },
    },
  });

  result.PREVIOUS = await db.reservation.count({
    where: {
      ...baseWhere,
      tourDate: {
        lt: today,
      },
    },
  });

  return result;
}
