import type { Request, Response } from "express";
import { addDish, getDishes, getDishesByUserId } from "../../db/queries/dishQueries.js";
//import { addGuest, getGuests, getGuestsByUserId } from "../../db/queries/guestQueries.js";


export async function getDIshesHandler(_: Request, res: Response){
  const guests = await getDishes();
  res.json(guests);
}

export async function addDishHandler(req: Request, res: Response){
  try {
    const {name, description, userId} = req.body;
    if (!name || !userId){
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
  try {
    const userId = req.params.userId;
    if (!userId){
      throw new Error("Error with user information");
    }
    const dishes = await getDishesByUserId(userId);

    res.status(200).json(dishes);
  } catch (error) {
    res.status(400).json({"message": `${error}`});
  }
}



