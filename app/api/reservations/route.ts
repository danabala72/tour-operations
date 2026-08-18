import { requireRole } from "@/lib/session";
import {
  getReservations,
  getChannelCounts,
  getStatusCounts,
  getDateCounts,
} from "@/services/reservation-service";
import type { ReservationStatus } from "@/lib/generated/prisma/enums";

export async function GET(
  request: Request
) {
  try {
    await requireRole("ADMIN");

    const url =
      new URL(request.url);

    const result =
      await getReservations({
        date:
          url.searchParams.get(
            "date"
          ) ?? undefined,

        from:
          url.searchParams.get(
            "from"
          ) ?? undefined,

        to:
          url.searchParams.get(
            "to"
          ) ?? undefined,

        status:
          url.searchParams.get(
            "status"
          ) as
            | ReservationStatus
            | undefined ??
            undefined,

        channel:
          url.searchParams.get(
            "channel"
          ) ?? undefined,

        search:
          url.searchParams.get(
            "search"
          ) ?? undefined,

        dateFilter:
          url.searchParams.get(
            "dateFilter"
          ) as
            | "ALL"
            | "TODAY"
            | "TOMORROW"
            | "THIS_WEEK"
            | undefined,

        page: Number(
          url.searchParams.get(
            "page"
          ) ?? 1
        ),

        limit: Number(
          url.searchParams.get(
            "limit"
          ) ?? 20
        ),
      });

    const channelCounts =
      await getChannelCounts({
        date:
          url.searchParams.get(
            "date"
          ) ?? undefined,

        from:
          url.searchParams.get(
            "from"
          ) ?? undefined,

        to:
          url.searchParams.get(
            "to"
          ) ?? undefined,

        status:
          url.searchParams.get(
            "status"
          ) as
            | ReservationStatus
            | undefined ??
            undefined,

        search:
          url.searchParams.get(
            "search"
          ) ?? undefined,

        dateFilter:
          url.searchParams.get(
            "dateFilter"
          ) as
            | "ALL"
            | "TODAY"
            | "TOMORROW"
            | "THIS_WEEK"
            | undefined,
      });

    const statusCounts =
      await getStatusCounts({
        date:
          url.searchParams.get(
            "date"
          ) ?? undefined,

        from:
          url.searchParams.get(
            "from"
          ) ?? undefined,

        to:
          url.searchParams.get(
            "to"
          ) ?? undefined,

        channel:
          url.searchParams.get(
            "channel"
          ) ?? undefined,

        search:
          url.searchParams.get(
            "search"
          ) ?? undefined,

        dateFilter:
          url.searchParams.get(
            "dateFilter"
          ) as
            | "ALL"
            | "TODAY"
            | "TOMORROW"
            | "THIS_WEEK"
            | undefined,
      });

    const dateCounts =
      await getDateCounts({
        date:
          url.searchParams.get(
            "date"
          ) ?? undefined,

        from:
          url.searchParams.get(
            "from"
          ) ?? undefined,

        to:
          url.searchParams.get(
            "to"
          ) ?? undefined,

        status:
          url.searchParams.get(
            "status"
          ) as
            | ReservationStatus
            | undefined ??
            undefined,

        channel:
          url.searchParams.get(
            "channel"
          ) ?? undefined,

        search:
          url.searchParams.get(
            "search"
          ) ?? undefined,

        dateFilter:
          url.searchParams.get(
            "dateFilter"
          ) as
            | "ALL"
            | "TODAY"
            | "TOMORROW"
            | "THIS_WEEK"
            | undefined,
      });

    return Response.json({
      success: true,
      ...result,
      channelCounts,
      statusCounts,
      dateCounts,
    });
  } catch (error) {
    if (
      error instanceof Error &&
      error.message ===
        "UNAUTHENTICATED"
    ) {
      return Response.json(
        {
          success: false,
          message:
            "Unauthenticated.",
        },
        { status: 401 }
      );
    }

    if (
      error instanceof Error &&
      error.message ===
        "FORBIDDEN"
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
      "[Reservations API]",
      error
    );

    return Response.json(
      {
        success: false,
        message:
          "Internal server error.",
      },
      { status: 500 }
    );
  }
}