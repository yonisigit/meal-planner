import { and, avg, eq, desc } from "drizzle-orm";

import { db } from "../dbConfig.js";
import { dishesRankTable, dishesTable, guestsTable, mealGuestsTable, mealsTable, type Meal } from "../schema.js";


export async function getMealsByUserId(userId: string) {
  const meals = await db.select().from(mealsTable).where(eq(mealsTable.userId, userId));
  return meals;
}

export async function getMealGuests(mealId: string) {
  const guests = await db
    .select({
      id: guestsTable.id,
      name: guestsTable.name,
    })
    .from(mealGuestsTable)
    .innerJoin(guestsTable, eq(guestsTable.id, mealGuestsTable.guestId))
    .where(eq(mealGuestsTable.mealId, mealId));

  return guests;
}

export async function addMeal(meal: Meal) {
  const [newMeal] = await db.insert(mealsTable).values(meal).returning();
  return newMeal;
}

export async function addGuestToMeal(mealId: string, guestId: string) {
  const [mealGuest] = await db.insert(mealGuestsTable).values({
    mealId,
    guestId
  }).returning();
  return mealGuest;
}

export async function removeGuestFromMeal(mealId: string, guestId: string) {
  const result = await db.delete(mealGuestsTable)
    .where(and(
      eq(mealGuestsTable.mealId, mealId),
      eq(mealGuestsTable.guestId, guestId)
    ))
    .returning();
  return result;
}

export async function getMealRankings(mealId: string) {
  const dishRankings = await db
    .select({
      dishId: dishesTable.id,
      name: dishesTable.name,
      description: dishesTable.description,
      avgRank: avg(dishesRankTable.rank)
    }).from(mealGuestsTable)
    .innerJoin(dishesRankTable, eq(mealGuestsTable.guestId, dishesRankTable.guestId))
    .innerJoin(dishesTable, eq(dishesTable.id, dishesRankTable.dishId))
    .where(eq(mealGuestsTable.mealId, mealId))
    .groupBy(dishesTable.id)
    .orderBy(desc(avg(dishesRankTable.rank)));

  return dishRankings;
}