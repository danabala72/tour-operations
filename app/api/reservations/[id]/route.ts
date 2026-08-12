import { db } from "@/lib/db";
import { requireRole } from "@/lib/session";

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

    const [rows] = await db.query(
      `
        SELECT
          r.*,
          c.id AS channel_id,
          c.code AS channel_code,
          c.name AS channel_name
        FROM reservations r
        LEFT JOIN channels c
          ON c.id = r.channel_id
        WHERE r.id = ?
        LIMIT 1
      `,
      [reservationId]
    );

    const reservations =
      rows as Array<Record<string, unknown>>;

    const reservation =
      reservations[0];

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