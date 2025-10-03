import express from "express";
import { loginCtlr, signupCtlr } from "../controllers/authController.js";

export const authRouter = express.Router();


authRouter.post("/signup", signupCtlr);
authRouter.post("/login", loginCtlr);