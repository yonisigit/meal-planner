import type { Request, Response } from "express";
import { authenticateUserId } from "../../auth.js";
import { addGuestToMeal, addMeal, getMealGuests, getMealRankings, getMealsByUserId, removeGuestFromMeal } from "../../db/queries/mealsQueries.js";


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

export async function removeGuestFromMealHandler(req: Request, res: Response) {
  const userId = authenticateUserId(req);
  if (!userId) {
    res.status(401).json({ "message": "Unauthorized" });
    return;
  }

  try {
    const { mealId, guestId } = req.params;
    if (!mealId || !guestId) {
      throw new Error("Missing meal or guest information.");
    }

    const result = await removeGuestFromMeal(mealId, guestId);
    if (!result || result.length === 0) {
      res.status(404).json({ "message": "Guest not found for this meal." });
      return;
    }

    res.status(200).json(result[0]);

  } catch (error) {
    console.error("Error removing guest from meal:", error);
    res.status(400).json({ "message": `${error}` });
  }
}

export async function getMenuHandler(req: Request, res: Response) {
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
    const menu = await getMealRankings(mealId);

    res.status(200).json(menu.slice(0, 4));
  } catch (error) {
    console.error("Error fetching meal menu:", error);
    res.status(500).json({ "message": "Internal Server Error" });
  }
}