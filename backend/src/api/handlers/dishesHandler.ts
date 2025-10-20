import type { Request, Response } from "express";
import { HttpError } from "../errors.js";
import { addDish, getDishes, getDishesByUserId } from "../../db/queries/dishQueries.js";
import { authenticateUserId } from "../../auth.js";


export async function getDishesHandler(_: Request, res: Response){
  const guests = await getDishes();
  res.json(guests);
}

export async function addDishHandler(req: Request, res: Response){
  const userId = authenticateUserId(req);
  if (!userId) {
    throw new HttpError(401, "Unauthorized");
  }
  const {name, description, category} = req.body;
  if (!name || !category){
    throw new HttpError(400, "Missing dish information.");
  }

  const dish = await addDish({
    name,
    description,
    category,
    userId
  });

  res.status(200).json(dish);
}

export async function getDishesByUserHandler(req: Request, res: Response){
  const userId = authenticateUserId(req);
  if (!userId) {
    throw new HttpError(401, "Unauthorized");
  }
  const dishes = await getDishesByUserId(userId);

  res.status(200).json(dishes);
}



