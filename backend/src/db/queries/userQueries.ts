import { eq } from "drizzle-orm";
import { db } from "../dbConfig.js";
import { refreshTokensTable, usersTable, type User } from "../schema.js";

export async function createUser(user: User) {
  const [newUser] = await db.insert(usersTable).values(user).returning();
  return newUser;
}

export async function getUserByUsername(username: string) {
  const [user] = await db.select().from(usersTable).where(eq(usersTable.username, username));
  return user;
}

export async function saveRefreshToken(tokenHash: string, userId: string, expiresAt: number) {
  const [newToken] = await db
    .insert(refreshTokensTable)
    .values({
      token: tokenHash,
      userId,
      expiresAt,
      updatedAt: new Date().toISOString(),
    })
    .returning();
  return newToken;
}

export async function revokeRefreshToken(tokenHash: string) {
  const result = await db.update(refreshTokensTable)
    .set({ revokedAt: Date.now(), updatedAt: new Date().toISOString() })
    .where(eq(refreshTokensTable.token, tokenHash))
    .returning();
  return result;
}

export async function getRefreshToken(tokenHash: string) {
  const [existingToken] = await db
    .select()
    .from(refreshTokensTable)
    .where(eq(refreshTokensTable.token, tokenHash));
  return existingToken;
}