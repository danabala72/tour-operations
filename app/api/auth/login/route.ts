import { authenticateUser } from "@/lib/auth";
import { createSession } from "@/lib/session";

export async function POST(
  request: Request
) {
  try {
    const body = await request.json();

    const email =
      typeof body.email === "string"
        ? body.email.trim().toLowerCase()
        : "";

    const password =
      typeof body.password === "string"
        ? body.password
        : "";

    if (!email || !password) {
      return Response.json(
        {
          success: false,
          message:
            "Email and password are required.",
        },
        { status: 400 }
      );
    }

    const user =
      await authenticateUser(
        email,
        password
      );

    if (!user) {
      return Response.json(
        {
          success: false,
          message:
            "Invalid email or password.",
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