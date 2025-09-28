import { db } from "../db.js";
import { guests } from "../schema.js";


export async function testDB() {
  await db.insert(guests).values({ bar: "First Guest" }).run();
  await db.insert(guests).values({ bar: "Second Guest" }).run();

  const result = await db.select().from(guests).all();
}

