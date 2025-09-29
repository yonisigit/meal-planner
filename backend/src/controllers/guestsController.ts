import type { Request, Response } from "express";
import { getGuests } from "../db/queries/guestQueries.js";


export async function getGuestsController(req: Request, res: Response){
  const guests = await getGuests();
  res.json(guests);
}