import { db } from "../dbConfig.js";
import { guestsTable } from "../schema.js";


export async function getGuests(){
    const guests = await db.select().from(guestsTable);
    return guests;
}





