import { requireRole } from "@/lib/session";
import { getStats } from "@/services/dashboard-service";

export async function GET(request: Request) {
  try {
    await requireRole("ADMIN");

    const url = new URL(request.url);

    const from = url.searchParams.get("from") ?? undefined;
    const to = url.searchParams.get("to") ?? undefined;

    const data = await getStats({ from, to });

    return Response.json({
      success: true,
      data,
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

    console.error("[Dashboard API]", error);

    return Response.json(
      {
        success: false,
        message: "Internal server error.",
      },
      { status: 500 }
    );
  }
}
