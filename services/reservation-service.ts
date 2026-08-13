import { db } from "@/lib/db";
import type { ReservationWhereInput } from "@/lib/generated/prisma/models/Reservation";
import type { ReservationStatus } from "@/lib/generated/prisma/enums";

export type ReservationFilters = {
  date?: string;
  from?: string;
  to?: string;
  status?: ReservationStatus;
  channel?: string;
  search?: string;
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
    100,
    Math.max(
      1,
      Number(filters.limit ?? 20)
    )
  );

  const where: ReservationWhereInput = {};

  // =========================
  // DATE
  // =========================

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
  } else {
    const today = new Date();
    const next7 = new Date();
    next7.setDate(today.getDate() + 7);

    where.tourDate = {
      gte: today,
      lte: next7,
    };
  }

  // =========================
  // STATUS
  // =========================

  if (filters.status) {
    where.status = filters.status;
  }

  // =========================
  // CHANNEL
  // =========================

  if (filters.channel) {
    where.channel = {
      code: filters.channel,
    };
  }

  // =========================
  // SEARCH
  // =========================

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

  // =========================
  // DATA
  // =========================

  const [data, total] =
    await Promise.all([
      db.reservation.findMany({
        where,
        include: {
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

  return {
    data,

    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}
