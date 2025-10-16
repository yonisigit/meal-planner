import type { Request, Response } from "express";
import { authenticateUserId } from "../../auth.js";
import { addGuestToMeal, addMeal, getMealGuests, getMealsByUserId } from "../../db/queries/mealsQueries.js";


export async function getMealsByUserHandler(req: Request, res: Response) {
  const userId = authenticateUserId(req);
  if (!userId) {
    res.status(401).json({ "message": "Unauthorized" });
    return;
  }

  try {
    const meals = await getMealsByUserId(userId);
    res.status(200).json(meals);
  } catch (error) {
    console.error("Error fetching meals:", error);
    res.status(500).json({ "message": "Internal Server Error" });
  }
}

export async function getMealGuestsHandler(req: Request, res: Response) {
  const userId = authenticateUserId(req);
  if (!userId) {
    res.status(401).json({ "message": "Unauthorized" });
    return;
  }

  try {
    const mealId = req.params.mealId;
    if (!mealId) {
      throw new Error("Error with meal info.");
    }
    const guests = await getMealGuests(mealId);
    res.status(200).json(guests);
  } catch (error) {
    console.error("Error fetching meal guests:", error);
    res.status(500).json({ "message": "Internal Server Error" });
  }
}


export async function addMealHandler(req: Request, res: Response) {
  const userId = authenticateUserId(req);
  if (!userId) {
    res.status(401).json({ "message": "Unauthorized" });
    return;
  }

  try {
    const { date, name, description } = req.body;
    if (!date || !name) {
      throw new Error("Missing meal information.");
    }

    const meal = await addMeal({
      date,
      name,
      description,
      userId
    });

    res.status(200).json(meal);

  } catch (error) {
    res.status(400).json({ "message": `${error}` });
  }
}


export async function addGuestToMealHandler(req: Request, res: Response) {
  const userId = authenticateUserId(req);
  if (!userId) {
    res.status(401).json({ "message": "Unauthorized" });
    return;
  }

  try {
    const mealId = req.params.mealId;
    const { guestId } = req.body;
    if (!mealId || !guestId) {
      throw new Error("Missing meal or guest information.");
    }

    const result = await addGuestToMeal(mealId, guestId);

    res.status(200).json(result);

  } catch (error) {
    res.status(400).json({ "message": `${error}` });
  }
} 