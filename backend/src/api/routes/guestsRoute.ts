import express from "express";
import { addGuestCtlr, getGuestsByUserCtlr, getGuestsCtlr } from "../controllers/guestsController.js";


export const guestsRouter = express.Router();

guestsRouter.get("/:userId", getGuestsByUserCtlr);
guestsRouter.post("/add/:userId", addGuestCtlr);