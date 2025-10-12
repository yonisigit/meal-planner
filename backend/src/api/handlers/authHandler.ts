import type { Request, Response } from "express";
import { createUser, getRefreshToken, getUserByUsername, revokeRefreshToken, saveRefreshToken } from "../../db/queries/userQueries.js";
import { generateAccessToken, generateRefreshToken, getBearerToken, hashToken } from "../../auth.js";
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
  try {
    const {username, password} = req.body;
    if (!username || !password) {
      res.status(400).json({ "message": "Missing username or password" });
      return;
    }

    const user = await getUserByUsername(username);
    if (!user || user.password !== password){
      res.status(401).json({ "message": "Invalid credentials" });
      return;
    }

    const accessToken = generateAccessToken(user.id, config.jwt.secret);
    const refreshToken = generateRefreshToken();
    const refreshTokenHash = hashToken(refreshToken);
    const refreshExpiresAt = Date.now() + config.jwt.refreshExpiry * 1000;

    await saveRefreshToken(refreshTokenHash, user.id, refreshExpiresAt);
    
    res.status(200).json({
      userID: user.id,
      username: user.username,
      accessToken,
      refreshToken,
    });
  } catch (error) {
    res.status(500).json({ "message": error instanceof Error ? error.message : "Unable to login" });
  }
}

export async function refreshHandler(req: Request, res: Response){  
  try {
    const refreshToken = getBearerToken(req);
    if (!refreshToken) {
      res.status(401).json({ "message": "Unauthorized" });
      return;
    }

    const tokenHash = hashToken(refreshToken);
    const savedRefreshToken = await getRefreshToken(tokenHash);
    if (!savedRefreshToken || savedRefreshToken.revokedAt) {
      res.status(401).json({ "message": "Invalid refresh token" });
      return;
    }

    if (savedRefreshToken.expiresAt < Date.now()) {
      await revokeRefreshToken(tokenHash);
      res.status(401).json({ "message": "Refresh token expired" });
      return;
    }

    // rotate refresh token
    await revokeRefreshToken(tokenHash);
    const rotatedRefreshToken = generateRefreshToken();
    const rotatedHash = hashToken(rotatedRefreshToken);
    const refreshExpiresAt = Date.now() + config.jwt.refreshExpiry * 1000;
    await saveRefreshToken(rotatedHash, savedRefreshToken.userId, refreshExpiresAt);

    const accessToken = generateAccessToken(savedRefreshToken.userId, config.jwt.secret);

    res.status(200).json({ accessToken, refreshToken: rotatedRefreshToken });
  } catch (error) {
    res.status(500).json({ "message": error instanceof Error ? error.message : "Unable to refresh token" });
  }
}




