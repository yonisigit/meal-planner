import express from "express";
import { addDishHandler, deleteDishHandler, editDishHandler, getDishesByUserHandler } from "../handlers/dishesHandler.js";

export const dishesRouter = express.Router();

dishesRouter.get("/", getDishesByUserHandler);
dishesRouter.post("/", addDishHandler);

dishesRouter.put("/:dishId", editDishHandler);
dishesRouter.delete("/:dishId", deleteDishHandler);
