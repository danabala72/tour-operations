import { NextResponse } from "next/server";
import { jwtVerify } from "jose";

const SESSION_COOKIE = "tour-ops_session";

function getSecret() {
  const secret = process.env.AUTH_SECRET;

  if (!secret) {
    throw new Error("AUTH_SECRET is not configured");
  }

  return new TextEncoder().encode(secret);
}

export async function proxy(request: Request) {
  const url = new URL(request.url);
  const pathname = url.pathname;

  const isAuthRoute =
    pathname === "/login" ||
    pathname.startsWith("/api/auth/");

  const token = request.headers.get("cookie")?.split("; ").find((c) => c.startsWith(`${SESSION_COOKIE}=`))?.split("=")[1];

  if (isAuthRoute) {
    if (token && pathname === "/login") {
      return NextResponse.redirect(new URL("/dashboard", url));
    }

    return NextResponse.next();
  }

  if (!token) {
    return NextResponse.redirect(new URL("/login", url));
  }

  try {
    await jwtVerify(token, getSecret());

    return NextResponse.next();
  } catch {
    return NextResponse.redirect(new URL("/login", url));
  }
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|gif|svg|webp|ico|css|js)$).*)",
  ],
};