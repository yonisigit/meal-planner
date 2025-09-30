import type { Request, Response } from "express";
import { createUser } from "../db/queries/userQueries.js";


export async function signupCtlr(req: Request, res: Response) {
  try {
    const {username, password} = req.body;

    if (!username || !password) {
      throw new Error("Missing user username/password");
    }
    
    const user = await createUser(req.body);

    res.status(200).json(user);
  } catch (error) {
    res.status(401).json({ "message": `${error}` });
  }
}



