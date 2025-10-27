import type { Request, Response } from "express";
import { HttpError } from "../errors.js";
import { addDish, deleteDish, editDish, getDishes, getDishesByUserId } from "../../db/queries/dishQueries.js";
import { authenticateUserId } from "../../auth.js";
import { DISH_CATEGORIES } from "../../db/schema.js";


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

  if (!DISH_CATEGORIES.includes(category)) {
    throw new HttpError(400, "Invalid dish category.");
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



export async function editDishHandler(req: Request, res: Response){
  const userId = authenticateUserId(req); 
  if (!userId) {
    throw new HttpError(401, "Unauthorized");
  }
  const dishId = req.params.dishId;
  const { name, description, category } = req.body;
  if (!dishId || !name || !category) {
    throw new HttpError(400, "Missing dish information.");
  }

  if (!DISH_CATEGORIES.includes(category)) {
    throw new HttpError(400, "Invalid dish category.");
  }

  const updatedDish = await editDish(dishId, name, category, description);
  res.status(200).json(updatedDish);
}

export async function deleteDishHandler(req: Request, res: Response){
  const userId = authenticateUserId(req); 
  if (!userId) {
    throw new HttpError(401, "Unauthorized");
  }
  const { dishId } = req.params;
  if (!dishId) {
    throw new HttpError(400, "Missing dish information.");
  }

  await deleteDish(dishId);
  res.status(200).json({ message: "Dish deleted successfully." });
}