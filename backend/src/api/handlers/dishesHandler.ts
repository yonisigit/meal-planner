import type { Request, Response } from "express";
import { addDish, getDishes, getDishesByUserId } from "../../db/queries/dishQueries.js";
import { authenticateUserId
 } from "../../auth.js";


export async function getDIshesHandler(_: Request, res: Response){
  const guests = await getDishes();
  res.json(guests);
}

export async function addDishHandler(req: Request, res: Response){
  const userId = authenticateUserId(req);
  if (!userId) {
    res.status(401).json({ "message": "Unauthorized" });
    return;
  }
  try {
    const {name, description} = req.body;
    if (!name){
      throw new Error("Missing dish information.");
    }

    const dish = await addDish({
      name,
      description,
      userId 
    });

    res.status(200).json(dish);

  } catch (error) {
    res.status(400).json({"message": `${error}`});
  }
}

export async function getDishesByUserHandler(req: Request, res: Response){
  const userId = authenticateUserId(req);
  if (!userId) {
    res.status(401).json({ "message": "Unauthorized" });
    return;
  }
  try {
    const dishes = await getDishesByUserId(userId);

    res.status(200).json(dishes);
  } catch (error) {
    res.status(400).json({"message": `${error}`});
  }
}



