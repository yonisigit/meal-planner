import express from "express";
import { addGuestHandler, getGuestsByUserHandler, getGuestDishesHandler, rankDishHandler } from "../handlers/guestsHandler.js";


export const guestsRouter = express.Router();

guestsRouter.get("/:userId", getGuestsByUserHandler);

guestsRouter.post("/:userId", addGuestHandler);

guestsRouter.get("/:guestId/dishes", getGuestDishesHandler);
guestsRouter.post("/:guestId/dishes/:dishId", rankDishHandler);
