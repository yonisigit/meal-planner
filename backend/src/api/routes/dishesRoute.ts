import express from "express";
import { addDishCtrl, getDishesByUserCtlr } from "../controllers/dishesController.js";

export const dishesRouter = express.Router();

dishesRouter.get("/:userId", getDishesByUserCtlr);
dishesRouter.post("/add/:userId", addDishCtrl);
