import type { Request, Response } from "express";
import { HttpError } from "../errors.js";
import { authenticateUserId } from "../../auth.js";
import { addGuestToMeal, addMeal, getDessertMealRankings, getMainMealRankings, getMealGuests, getMealsByUserId, getOtherMealRankings, getSideMealRankings, removeGuestFromMeal } from "../../db/queries/mealsQueries.js";


export async function getMealsByUserHandler(req: Request, res: Response) {
  const userId = authenticateUserId(req);
  if (!userId) {
    throw new HttpError(401, "Unauthorized");
  }

  const meals = await getMealsByUserId(userId);
  res.status(200).json(meals);
}

export async function getMealGuestsHandler(req: Request, res: Response) {
  const userId = authenticateUserId(req);
  if (!userId) {
    throw new HttpError(401, "Unauthorized");
  }

  const mealId = req.params.mealId;
  if (!mealId) {
    throw new HttpError(400, "Error with meal info.");
  }
  const guests = await getMealGuests(mealId);
  res.status(200).json(guests);
}


export async function addMealHandler(req: Request, res: Response) {
  const userId = authenticateUserId(req);
  if (!userId) {
    throw new HttpError(401, "Unauthorized");
  }

  const { date, name, description } = req.body;
  if (!date || !name) {
    throw new HttpError(400, "Missing meal information.");
  }

  const meal = await addMeal({
    date,
    name,
    description,
    userId
  });

  res.status(200).json(meal);
}


export async function addGuestToMealHandler(req: Request, res: Response) {
  const userId = authenticateUserId(req);
  if (!userId) {
    throw new HttpError(401, "Unauthorized");
  }
  const mealId = req.params.mealId;
  const { guestId } = req.body;
  if (!mealId || !guestId) {
    throw new HttpError(400, "Missing meal or guest information.");
  }

  const result = await addGuestToMeal(mealId, guestId);

  res.status(200).json(result);
} 

export async function removeGuestFromMealHandler(req: Request, res: Response) {
  const userId = authenticateUserId(req);
  if (!userId) {
    throw new HttpError(401, "Unauthorized");
  }

  const { mealId, guestId } = req.params;
  if (!mealId || !guestId) {
    throw new HttpError(400, "Missing meal or guest information.");
  }

  const result = await removeGuestFromMeal(mealId, guestId);
  if (!result || result.length === 0) {
    throw new HttpError(404, "Guest not found for this meal.");
  }

  res.status(200).json(result[0]);
}

export async function getMenuHandler(req: Request, res: Response) {
  const userId = authenticateUserId(req);
  if (!userId) {
    throw new HttpError(401, "Unauthorized");
  }

  const mealId = req.params.mealId;
  if (!mealId) {
    throw new HttpError(400, "Error with meal info.");
  }
  const mainDishes = await getMainMealRankings(mealId);
  const sideDishes = await getSideMealRankings(mealId);
  const dessertDishes = await getDessertMealRankings(mealId);
  const otherDishes = await getOtherMealRankings(mealId);

  res.status(200).json({
    main: mainDishes.slice(0, 2),
    side: sideDishes.slice(0, 4),
    dessert: dessertDishes.slice(0, 1),
    other: otherDishes.slice(0, 3)
  });
}