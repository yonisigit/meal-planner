import { eq } from "drizzle-orm";
import { db } from "../dbConfig.js";
import { usersTable, type User } from "../schema.js";

export async function createUser(user: User) {
  const [newUser] = await db.insert(usersTable).values(user).returning();
  return newUser;
}

export async function getUserByUsername(username: string){
  const [user] = await db.select().from(usersTable).where(eq(usersTable.username,username));
  return user;
}