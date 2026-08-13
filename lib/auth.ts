import bcrypt from "bcryptjs";
import { db } from "@/lib/db";

export type UserRole = "ADMIN" | "DRIVER";

export type AuthUser = {
  id: number;
  name: string;
  username: string;
  role: UserRole;
};

export async function authenticateUser(
  username: string,
  password: string
): Promise<AuthUser | null> {
  const user = await db.user.findFirst({
    where: {
      username,
      status: "ACTIVE",
    },
    select: {
      id: true,
      name: true,
      username: true,
      passwordHash: true,
      role: true,
    },
  });

  if (!user) {
    return null;
  }

  const validPassword =
    await bcrypt.compare(
      password,
      user.passwordHash
    );

  if (!validPassword) {
    return null;
  }

  return {
    id: Number(user.id),
    name: user.name,
    username: user.username,
    role: user.role as UserRole,
  };
}
