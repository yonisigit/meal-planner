import express from "express";
import { addGuestToMealHandler, addMealHandler, getMealGuestsHandler, getMealsByUserHandler, getMenuHandler } from "../handlers/mealsHandler.js";


export const mealsRouter = express.Router();

mealsRouter.get("/", getMealsByUserHandler);
mealsRouter.post("/", addMealHandler);

mealsRouter.get("/:mealId", getMealGuestsHandler);
mealsRouter.post("/:mealId", addGuestToMealHandler);

mealsRouter.get("/:mealId/menu", getMenuHandler);