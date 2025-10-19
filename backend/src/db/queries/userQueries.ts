import { eq } from "drizzle-orm";
import { db } from "../dbConfig.js";
import { refreshTokensTable, usersTable, type User } from "../schema.js";
import { config } from "../../config/config.js";

export async function createUser(user: User) {
  const [newUser] = await db.insert(usersTable).values(user).returning();
  return newUser;
}

export async function getUserByUsername(username: string) {
  const [user] = await db.select().from(usersTable).where(eq(usersTable.username, username));
  return user;
}

export async function saveRefreshToken(token: string, userId: string) {
  const newToken = await db.insert(refreshTokensTable).values({
    token: token,
    userId: userId,
    expiresAt: Date.now() + config.jwt.refreshExpiry 
  }).returning();
  return newToken;
}

export async function revokeRefreshToken(token: string) {
  const result = await db.update(refreshTokensTable)
    .set({ revokedAt: Date.now() })
    .where(eq(refreshTokensTable.token, token))
    .returning();
  return result;
}

export async function getRefreshToken(token: string) {
  const [existingToken] = await db.select().from(refreshTokensTable).where(eq(refreshTokensTable.token, token));
  return existingToken;
}