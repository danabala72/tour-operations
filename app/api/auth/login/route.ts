import { authenticateUser } from "@/lib/auth";
import { createSession } from "@/lib/session";

export async function POST(
  request: Request
) {
  try {
    const body = await request.json();

    const username =
      typeof body.username === "string"
        ? body.username.trim()
        : "";

    const password =
      typeof body.password === "string"
        ? body.password
        : "";

    if (!username || !password) {
      return Response.json(
        {
          success: false,
          message:
            "Username and password are required.",
        },
        { status: 400 }
      );
    }

    const user =
      await authenticateUser(
        username,
        password
      );

    if (!user) {
      return Response.json(
        {
          success: false,
          message:
            "Invalid username or password.",
        },
        { status: 401 }
      );
    }

    await createSession({
      userId: user.id,
      role: user.role,
    });

    return Response.json({
      success: true,
      user,
    });
  } catch (error) {
    console.error(
      "[Auth] Login error:",
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
