import { db } from "@/lib/db";
import { getSession } from "@/lib/session";

export async function GET() {
  const session = await getSession();

  if (!session) {
    return Response.json(
      {
        success: false,
        message: "Unauthenticated",
      },
      { status: 401 }
    );
  }

  const [rows] = await db.execute(
    `
      SELECT
        id,
        name,
        email,
        role,
        status
      FROM users
      WHERE id = ?
      LIMIT 1
    `,
    [session.userId]
  );

  const users = rows as Array<{
    id: number;
    name: string;
    email: string;
    role: "ADMIN" | "DRIVER";
    status: "ACTIVE" | "INACTIVE";
  }>;

  const user = users[0];

  if (!user || user.status !== "ACTIVE") {
    return Response.json(
      {
        success: false,
        message: "User not found",
      },
      { status: 401 }
    );
  }

  return Response.json({
    success: true,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  });
}