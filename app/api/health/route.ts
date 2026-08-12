import { db } from "@/lib/db";

export async function GET() {
  try {
    await db.query({ sql: "SELECT 1" });

    return Response.json({
      success: true,
      database: "connected",
    });
  } catch (error) {
    console.error("[Health] Database error:", error);

    return Response.json(
      {
        success: false,
        database: "disconnected",
      },
      {
        status: 500,
      }
    );
  }
}