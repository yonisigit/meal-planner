import { db } from "../dbConfig.js";
import { eq } from "drizzle-orm";
import { guestsTable, type Guest } from "../schema.js";


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





