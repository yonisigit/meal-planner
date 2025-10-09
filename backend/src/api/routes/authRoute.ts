import express from "express";
import { loginHandler, signupHandler } from "../handlers/authHandler.js";

export const authRouter = express.Router();


authRouter.post("/signup", signupHandler);
authRouter.post("/login", loginHandler);