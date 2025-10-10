import type { Request, Response } from "express";
import { createUser, getUserByUsername } from "../../db/queries/userQueries.js";
import { generateAccessToken } from "../../auth.js";
import { config } from "../../config/config.js";


export async function signupHandler(req: Request, res: Response) {
  try {
    const {username, password} = req.body;
    if (!username || !password) {
      throw new Error("Missing user username/password");
    }

    if (await getUserByUsername(username)){
      throw new Error("Username already exists");
    }
    
    const user = await createUser(req.body);

    res.status(200).json(user);
  } catch (error) {
    res.status(401).json({ "message": `${error}` });
  }
}


export async function loginHandler(req: Request, res: Response){
  const {username, password} = req.body;
    if (!username || !password) {
      throw new Error("Missing user username/password");
    }

  const user = await getUserByUsername(username);
  if (!user){
    throw new Error("Username does not exist");
  }
  if(user.password !== password){
    throw new Error("Password is incorrect")
  }

  const accessToken = generateAccessToken(user.id, config.jwt.secret);
  
  res.status(200).json({
    userID: user.id,
    username: user.username,
    accessToken: accessToken
  });
}




