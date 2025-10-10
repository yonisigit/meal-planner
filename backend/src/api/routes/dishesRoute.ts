import express from "express";
import { addDishHandler, getDishesByUserHandler } from "../handlers/dishesHandler.js";

export const dishesRouter = express.Router();

dishesRouter.get("/", getDishesByUserHandler);
dishesRouter.post("/", addDishHandler);
