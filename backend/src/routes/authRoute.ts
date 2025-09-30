import express from "express";
import { signupCtlr } from "../controllers/authController.js";

export const authRouter = express.Router();


authRouter.post("/signup", signupCtlr);