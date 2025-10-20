import type { Request, Response } from "express";
import { HttpError } from "../errors.js";
import { addGuest, getDishForUser, getGuestByRankToken, getGuestDishes, getGuests, getGuestsByUserId, getGuestUser, rankDish } from "../../db/queries/guestQueries.js";
import { authenticateUserId } from "../../auth.js";
import { getUserNameById } from "../../db/queries/userQueries.js";


export async function getGuestsHandler(_: Request, res: Response) {
  const guests = await getGuests();
  res.json(guests);
}

export async function addGuestHandler(req: Request, res: Response) {
  const userId = authenticateUserId(req);
  if (!userId) {
    throw new HttpError(401, "Unauthorized");
  }

  const { name } = req.body;
  if (!name) {
    throw new HttpError(400, "Missing guest information.");
  }

  const guest = await addGuest({
    name: name,
    userId: userId
  });

  res.status(200).json(guest);
}

export async function getGuestsByUserHandler(req: Request, res: Response) {
  const userId = authenticateUserId(req);
  if (!userId) {
    throw new HttpError(401, "Unauthorized");
  }

  const guests = await getGuestsByUserId(userId);

  res.status(200).json(guests);
}

export async function getGuestDishesHandler(req: Request, res: Response) {
  const userId = authenticateUserId(req);
  if (!userId) {
    throw new HttpError(401, "Unauthorized");
  }
  const guestId = req.params.guestId;
  if (!guestId) {
    throw new HttpError(400, "Error with guest info.");
  }

  const dishes = await getGuestDishes(userId, guestId);

  res.status(200).json(dishes);
}

export async function rankDishHandler(req: Request, res: Response) {
  const userId = authenticateUserId(req);
  if (!userId) {
    throw new HttpError(401, "Unauthorized");
  }
  const { guestId, dishId } = req.params;
  const { rank } = req.body;

  if (!guestId || !dishId || !rank) {
    throw new HttpError(400, "Error with dish rank info.");
  }

  const numericRank = Number(rank);
  if (!Number.isFinite(numericRank)) {
    throw new HttpError(400, "Invalid rank value");
  }
  if (numericRank > 3 || numericRank < 1) {
    throw new HttpError(400, "rank must be between 1 and 3");
  }

  const guestsUser = await getGuestUser(guestId);
  if (guestsUser?.userId !== userId) {
    throw new HttpError(403, "Forbidden");
  }

  const rankedDish = await rankDish(guestId, dishId, numericRank);

  res.status(200).json(rankedDish);
}

export async function getGuestByRankTokenHandler(req: Request, res: Response) {
  const { rankToken } = req.params;
  if (!rankToken) {
    throw new HttpError(400, "Missing rank token");
  }

  const guest = await getGuestByRankToken(rankToken);
  if (!guest) {
    throw new HttpError(404, "Guest not found");
  }

  const hostName = await getUserNameById(guest.userId);
  const dishes = await getGuestDishes(guest.userId, guest.id);

  res.status(200).json({ guest, dishes, hostName });
}

export async function rankDishByRankTokenHandler(req: Request, res: Response) {
  const { rankToken, dishId } = req.params;
  const { rank } = req.body;

  if (!rankToken || !dishId) {
    throw new HttpError(400, "Missing rank token or dish information");
  }

  const parsedRank = Number(rank);
  if (!Number.isFinite(parsedRank)) {
    throw new HttpError(400, "Invalid rank value");
  }
  if (parsedRank > 3 || parsedRank < 1) {
    throw new HttpError(400, "rank must be between 1 and 3");
  }

  const guest = await getGuestByRankToken(rankToken);
  if (!guest) {
    throw new HttpError(404, "Guest not found");
  }

  const dish = await getDishForUser(dishId, guest.userId);
  if (!dish) {
    throw new HttpError(404, "Dish not found");
  }

  const rankedDish = await rankDish(guest.id, dishId, parsedRank);

  res.status(200).json(rankedDish);
}



