import express from "express";
import { getGuestsCtlr } from "../controllers/guestsController.js";


export const guestsRouter = express.Router();

guestsRouter.get("/", getGuestsCtlr);