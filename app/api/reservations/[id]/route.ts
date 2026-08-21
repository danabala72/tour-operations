import { db } from "@/lib/db";
import { requireRole } from "@/lib/session";
import { ReservationStatus } from "@/lib/generated/prisma/enums";
import { formatDateOnly } from "@/lib/format";

const VALID_STATUSES = new Set<string>(
  Object.values(ReservationStatus)
);

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

function formatReservationDate(value: Date | null | undefined) {
  if (!value) {
    return null;
  }

  return formatDateOnly(value);
}

export async function GET(
  _request: Request,
  context: RouteContext
) {
  try {
    await requireRole("ADMIN");

    const { id } = await context.params;

    const reservationId = Number(id);

    if (!Number.isInteger(reservationId)) {
      return Response.json(
        {
          success: false,
          message: "Invalid reservation id.",
        },
        { status: 400 }
      );
    }

    const reservation =
      await db.reservation.findUnique({
        where: { id: reservationId },
        include: {
          channel: {
            select: {
              id: true,
              code: true,
              name: true,
            },
          },
        },
      });

    if (!reservation) {
      return Response.json(
        {
          success: false,
          message: "Reservation not found.",
        },
        { status: 404 }
      );
    }

    return Response.json({
      success: true,
      data: {
        ...reservation,
        tourDate: formatReservationDate(reservation.tourDate),
        tourTime: reservation.tourTime
          ? `${String(reservation.tourTime.getUTCHours()).padStart(2, "0")}:${String(reservation.tourTime.getUTCMinutes()).padStart(2, "0")}`
          : null,
        pickupTime: reservation.pickupTime
          ? `${String(reservation.pickupTime.getUTCHours()).padStart(2, "0")}:${String(reservation.pickupTime.getUTCMinutes()).padStart(2, "0")}`
          : null,
        rescheduleDate: formatReservationDate(reservation.rescheduleDate),
        rescheduledFrom: formatReservationDate(reservation.rescheduledFrom),
      },
    });
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === "UNAUTHENTICATED"
    ) {
      return Response.json(
        {
          success: false,
          message: "Unauthenticated.",
        },
        { status: 401 }
      );
    }

    if (
      error instanceof Error &&
      error.message === "FORBIDDEN"
    ) {
      return Response.json(
        {
          success: false,
          message: "Forbidden.",
        },
        { status: 403 }
      );
    }

    console.error(
      "[Reservation Detail API]",
      error
    );

    return Response.json(
      {
        success: false,
        message: "Internal server error.",
      },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  context: RouteContext
) {
  try {
    await requireRole("ADMIN");

    const { id } = await context.params;

    const reservationId = Number(id);

    if (!Number.isInteger(reservationId)) {
      return Response.json(
        {
          success: false,
          message: "Invalid reservation id.",
        },
        { status: 400 }
      );
    }

    const body = (await request
      .json()
      .catch(() => null)) as {
      status?: unknown;
      rescheduleDate?: unknown;
    } | null;

    const nextStatus = body?.status;
    const rescheduleDate = body?.rescheduleDate;

    if (
      typeof nextStatus !== "string" ||
      !VALID_STATUSES.has(nextStatus)
    ) {
      return Response.json(
        {
          success: false,
          message: "Invalid status.",
        },
        { status: 400 }
      );
    }

    if (
      typeof rescheduleDate !== "string" ||
      !/^\d{4}-\d{2}-\d{2}$/.test(rescheduleDate)
    ) {
      return Response.json(
        {
          success: false,
          message: "Invalid reschedule date.",
        },
        { status: 400 }
      );
    }

    const current =
      await db.reservation.findUnique({
        where: { id: reservationId },
        select: {
          id: true,
          tourDate: true,
          rescheduleDate: true,
          rescheduledFrom: true,
        },
      });

    if (!current) {
      return Response.json(
        {
          success: false,
          message: "Reservation not found.",
        },
        { status: 404 }
      );
    }

    const [year, month, day] = rescheduleDate.split("-").map(Number);
    const newTourDate = new Date(Date.UTC(year, month - 1, day));

    const data: Record<string, unknown> = {
      status: nextStatus as ReservationStatus,
    };

    if (newTourDate.getTime() !== current.tourDate.getTime()) {
      data.tourDate = newTourDate;
      data.rescheduleDate = newTourDate;

      if (!current.rescheduledFrom) {
        data.rescheduledFrom = current.tourDate;
      }
    }

    let updated;

    try {
      updated =
        await db.reservation.update({
          where: { id: reservationId },
          data,
          include: {
            channel: {
              select: {
                id: true,
                code: true,
                name: true,
              },
            },
          },
        });
    } catch (err) {
      const code = (
        err as { code?: string }
      )?.code;

      if (code === "P2025") {
        return Response.json(
          {
            success: false,
            message: "Reservation not found.",
          },
          { status: 404 }
        );
      }

      throw err;
    }

    return Response.json({
      success: true,
      data: {
        ...updated,
        tourDate: formatReservationDate(updated.tourDate as Date),
        tourTime: updated.tourTime
          ? `${String((updated.tourTime as Date).getUTCHours()).padStart(2, "0")}:${String((updated.tourTime as Date).getUTCMinutes()).padStart(2, "0")}`
          : null,
        pickupTime: updated.pickupTime
          ? `${String((updated.pickupTime as Date).getUTCHours()).padStart(2, "0")}:${String((updated.pickupTime as Date).getUTCMinutes()).padStart(2, "0")}`
          : null,
        rescheduleDate: formatReservationDate(updated.rescheduleDate as Date | null),
        rescheduledFrom: formatReservationDate(updated.rescheduledFrom as Date | null),
      },
    });
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === "UNAUTHENTICATED"
    ) {
      return Response.json(
        {
          success: false,
          message: "Unauthenticated.",
        },
        { status: 401 }
      );
    }

    if (
      error instanceof Error &&
      error.message === "FORBIDDEN"
    ) {
      return Response.json(
        {
          success: false,
          message: "Forbidden.",
        },
        { status: 403 }
      );
    }

    console.error(
      "[Reservation Detail API]",
      error
    );

    return Response.json(
      {
        success: false,
        message: "Internal server error.",
      },
      { status: 500 }
    );
  }
}
