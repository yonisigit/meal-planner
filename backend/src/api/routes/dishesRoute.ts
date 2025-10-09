import express from "express";
import { addDishHandler, getDishesByUserHandler } from "../handlers/dishesHandler.js";

export const dishesRouter = express.Router();

dishesRouter.get("/:userId", getDishesByUserHandler);
dishesRouter.post("/:userId", addDishHandler);
