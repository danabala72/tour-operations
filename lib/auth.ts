import bcrypt from "bcryptjs";
import { db } from "@/lib/db";

export type UserRole = "ADMIN" | "DRIVER";

export type AuthUser = {
  id: number;
  name: string;
  email: string;
  role: UserRole;
};

export async function authenticateUser(
  email: string,
  password: string
): Promise<AuthUser | null> {
  const [rows] = await db.execute(
    `
      SELECT
        id,
        name,
        email,
        password_hash,
        role,
        status
      FROM users
      WHERE email = ?
      LIMIT 1
    `,
    [email]
  );

  const users = rows as Array<{
    id: number;
    name: string;
    email: string;
    password_hash: string;
    role: UserRole;
    status: "ACTIVE" | "INACTIVE";
  }>;

  const user = users[0];

  if (!user) {
    return null;
  }

  if (user.status !== "ACTIVE") {
    return null;
  }

  const validPassword =
    await bcrypt.compare(
      password,
      user.password_hash
    );

  if (!validPassword) {
    return null;
  }

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  };
}