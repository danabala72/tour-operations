import { db } from "@/lib/db";
import { requireRole } from "@/lib/session";
import { ReservationStatus } from "@/lib/generated/prisma/enums";

const VALID_STATUSES = new Set<string>(
  Object.values(ReservationStatus)
);

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

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
      data: reservation,
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
    } | null;

    const nextStatus = body?.status;

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

    let updated;

    try {
      updated =
        await db.reservation.update({
          where: { id: reservationId },
          data: {
            status: nextStatus as ReservationStatus,
          },
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
      data: updated,
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
