import express from "express";
import { getGuestsController } from "../controllers/guestsController.js";


export const guestsRouter = express.Router();

guestsRouter.get("/", getGuestsController);