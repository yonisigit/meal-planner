import express from "express";
import { loginHandler, refreshHandler, signupHandler } from "../handlers/authHandler.js";
import { revokeHandler } from "../../auth.js";


export const authRouter = express.Router();


authRouter.post("/signup", signupHandler);
authRouter.post("/login", loginHandler);
authRouter.post("/refresh", refreshHandler);
authRouter.post("/revoke", revokeHandler);