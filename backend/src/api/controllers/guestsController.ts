import type { Request, Response } from "express";
import { addGuest, getGuests, getGuestsByUserId } from "../../db/queries/guestQueries.js";


export async function getGuestsCtlr(_: Request, res: Response){
  const guests = await getGuests();
  res.json(guests);
}

export async function addGuestCtlr(req: Request, res: Response){
  try {
    const {name, userId} = req.body;
    if (!name || !userId){
      throw new Error("Missing guest information.");
    }

    const guest = await addGuest({
      name: name,
      userId: userId
    });

    res.status(200).json(guest);

  } catch (error) {
    res.status(400).json({"message": `${error}`});
  }
}

export async function getGuestsByUserCtlr(req: Request, res: Response){
  try {
    const userId = req.params.userId;
    if (!userId){
      throw new Error("Error with user information");
    }
    const guests = await getGuestsByUserId(userId);

    res.status(200).json(guests);
  } catch (error) {
    res.status(400).json({"message": `${error}`});
  }
}



