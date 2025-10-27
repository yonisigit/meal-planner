import express from "express";
import { addGuestToMealHandler, addMealHandler, deleteMealHandler, getMealGuestsHandler, getMealsByUserHandler, getMenuHandler, removeGuestFromMealHandler } from "../handlers/mealsHandler.js";


export const mealsRouter = express.Router();

mealsRouter.get("/", getMealsByUserHandler);
mealsRouter.post("/", addMealHandler);

mealsRouter.delete("/:mealId", deleteMealHandler);

mealsRouter.get("/:mealId", getMealGuestsHandler);
mealsRouter.post("/:mealId", addGuestToMealHandler);
mealsRouter.delete("/:mealId/guests/:guestId", removeGuestFromMealHandler);

mealsRouter.get("/:mealId/menu", getMenuHandler);