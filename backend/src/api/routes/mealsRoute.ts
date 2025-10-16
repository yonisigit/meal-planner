import express from "express";
import { addGuestToMealHandler, addMealHandler, getMealGuestsHandler, getMealsByUserHandler } from "../handlers/mealsHandler.js";


export const mealsRouter = express.Router();

mealsRouter.get("/", getMealsByUserHandler);
mealsRouter.post("/", addMealHandler);

mealsRouter.get("/:mealId", getMealGuestsHandler);
mealsRouter.post("/:mealId", addGuestToMealHandler);