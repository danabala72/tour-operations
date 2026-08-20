import { db } from "@/lib/db";
import { requireRole } from "@/lib/session";
import { ReservationStatus } from "@/lib/generated/prisma/enums";

const VALID_STATUSES = new Set<string>(
  Object.values(ReservationStatus)
);

export async function POST(
  request: Request
) {
  try {
    await requireRole("ADMIN");

    const body = (await request
      .json()
      .catch(() => null)) as {
      ids?: unknown;
      status?: unknown;
    } | null;

    const ids = Array.isArray(body?.ids)
      ? (body!.ids as unknown[])
      : [];

    const nextStatus = body?.status;

    if (ids.length === 0) {
      return Response.json(
        {
          success: false,
          message: "No reservation ids provided.",
        },
        { status: 400 }
      );
    }

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

    const numericIds = ids
      .map((value) => Number(value))
      .filter((value) => Number.isInteger(value));

    if (numericIds.length === 0) {
      return Response.json(
        {
          success: false,
          message: "Invalid reservation ids.",
        },
        { status: 400 }
      );
    }

    const result = await db.reservation.updateMany({
      where: {
        id: { in: numericIds },
      },
      data: {
        status: nextStatus as ReservationStatus,
      },
    });

    return Response.json({
      success: true,
      data: { count: result.count },
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
      "[Reservations Bulk API]",
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
