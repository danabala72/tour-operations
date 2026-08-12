import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

const SESSION_COOKIE = "tour-ops_session";

function getSecret() {
  const secret = process.env.AUTH_SECRET;

  if (!secret) {
    throw new Error(
      "AUTH_SECRET is not configured"
    );
  }

  return new TextEncoder().encode(secret);
}

export type SessionPayload = {
  userId: number;
  role: "ADMIN" | "DRIVER";
};

export async function createSession(
  payload: SessionPayload
) {
  const token = await new SignJWT({
    userId: payload.userId,
    role: payload.role,
  })
    .setProtectedHeader({
      alg: "HS256",
    })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(getSecret());

  const cookieStore = await cookies();

  cookieStore.set(
    SESSION_COOKIE,
    token,
    {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    }
  );
}

export async function getSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();

  const token =
    cookieStore.get(
      SESSION_COOKIE
    )?.value;

  if (!token) {
    return null;
  }

  try {
    const { payload } =
      await jwtVerify(
        token,
        getSecret()
      );

    if (
      typeof payload.userId !== "number" ||
      (payload.role !== "ADMIN" &&
        payload.role !== "DRIVER")
    ) {
      return null;
    }

    return {
      userId: payload.userId,
      role: payload.role,
    };
  } catch {
    return null;
  }
}

export async function destroySession() {
  const cookieStore = await cookies();

  cookieStore.delete(
    SESSION_COOKIE
  );
}


export async function requireSession() {
  const session = await getSession();

  if (!session) {
    throw new Error("UNAUTHENTICATED");
  }

  return session;
}

export async function requireRole(
  ...allowedRoles: Array<"ADMIN" | "DRIVER">
) {
  const session = await requireSession();

  if (!allowedRoles.includes(session.role)) {
    throw new Error("FORBIDDEN");
  }

  return session;
}