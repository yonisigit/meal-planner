import { db } from "../dbConfig.js";
import { eq } from "drizzle-orm";
import { dishesTable, type Dish } from "../schema.js";

export async function getDishes(){
    const guests = await db.select().from(dishesTable);
    return guests;
}


export async function addDish(newDish: Dish){
    const [dish] = await db.insert(dishesTable).values(newDish).returning();
    return dish;
}

export async function getDishesByUserId(userId: string){
  const dishes = await db.select().from(dishesTable).where(eq(dishesTable.userId, userId)).orderBy(dishesTable.name);
  return dishes;
}