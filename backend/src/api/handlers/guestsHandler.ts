import type { Request, Response } from "express";
import { addGuest, getGuestDishes, getGuests, getGuestsByUserId, getGuestUser, rankDish } from "../../db/queries/guestQueries.js";


export async function getGuestsHandler(_: Request, res: Response) {
  const guests = await getGuests();
  res.json(guests);
}

export async function addGuestHandler(req: Request, res: Response) {
  try {
    const { name, userId } = req.body;
    if (!name || !userId) {
      throw new Error("Missing guest information.");
    }

    const guest = await addGuest({
      name: name,
      userId: userId
    });

    res.status(200).json(guest);

  } catch (error) {
    res.status(400).json({ "message": `${error}` });
  }
}

export async function getGuestsByUserHandler(req: Request, res: Response) {
  try {
    const userId = req.params.userId;
    if (!userId) {
      throw new Error("Error with user information");
    }
    const guests = await getGuestsByUserId(userId);

    res.status(200).json(guests);
  } catch (error) {
    res.status(400).json({ "message": `${error}` });
  }
}

export async function getGuestDishesHandler(req: Request, res: Response) {
  try {
    const guestId = req.params.guestId;
    if (!guestId) {
      throw new Error("Error with guest info.");
    }

    //TODO: get userId from auth token
    const user = await getGuestUser(guestId);
    if (!user?.userId){
      throw new Error("error with userid");
    }

    const dishes = await getGuestDishes(user.userId, guestId)

    res.status(200).json(dishes);

  } catch (error) {
    res.status(400).json({ "message": `${error}` });
  }
}

export async function rankDishHandler(req: Request, res: Response) {
  try {
    const { guestId, dishId, rank } = req.body;

    if (!guestId || !dishId || !rank) {
      throw new Error("Error with dish rank info.");
    }

    if (rank > 3 || rank < 1){
      throw new Error("rank must be between 1 and 3")
    }

    const rankedDish = await rankDish(guestId, dishId, rank);

    res.status(200).json(rankedDish);

  } catch (error) {
    res.status(400).json({ "message": `${error}` });
  }
}



