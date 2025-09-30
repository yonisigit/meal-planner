import { db } from "../dbConfig.js";
import { usersTable, type User } from "../schema.js";

export async function createUser(user: User) {
  const [newUser] = await db.insert(usersTable).values(user).returning();
  return newUser;
}