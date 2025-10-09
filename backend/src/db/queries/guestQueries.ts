import { db } from "../dbConfig.js";
import { and, eq } from "drizzle-orm";
import { dishesRankTable, dishesTable, guestsTable, type Guest } from "../schema.js";


export async function getGuests(){
    const guests = await db.select().from(guestsTable);
    return guests;
}


export async function addGuest(newGuest: Guest){
    const [guest] = await db.insert(guestsTable).values(newGuest).returning();
    return guest;
}

export async function getGuestsByUserId(userId: string){
  const guests = await db.select().from(guestsTable).where(eq(guestsTable.userId, userId));
  return guests;
}

export async function getGuestDishes(userId: string, guestId: string){
  // Return all dishes for the given user, with the optional rank the specified guest gave.
  // Use LEFT JOIN so dishes without a rank for this guest still appear with rank = null.
  const rows = await db
    .select({
      dishRankId: dishesRankTable.id,
      dishId: dishesTable.id,
      name: dishesTable.name,
      description: dishesTable.description,
      rank: dishesRankTable.rank,
    })
    .from(dishesTable)
    .leftJoin(
      dishesRankTable,
      and(
        eq(dishesTable.id, dishesRankTable.dishId),
        eq(dishesRankTable.guestId, guestId)
      )
    )
    .where(eq(dishesTable.userId, userId));

  return rows;
}


export async function rankDish(guestId: string, dishId: string, rank: number){
  const [rankedDish] = await db.insert(dishesRankTable).values({
    guestId,
    dishId,
    rank
  }).returning();

  return rankedDish;
}


export async function getGuestUser(guestId: string) {
  const [user] = await db.select({userId: guestsTable.userId}).from(guestsTable).where(eq(guestsTable.id, guestId));

  return user;
}


