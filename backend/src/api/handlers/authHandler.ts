import type { Request, Response } from "express";
import { createUser, getRefreshToken, getUserByUsername, revokeRefreshToken, saveRefreshToken } from "../../db/queries/userQueries.js";
import { checkHashedPassword, generateAccessToken, generateRefreshToken, hashPassword } from "../../auth.js";
import { config } from "../../config/config.js";
import { HttpError } from "../errors.js";


export async function signupHandler(req: Request, res: Response) {
  try {
    const { username, name, password } = req.body;
    if (!username || !name || !password) {
      throw new Error("Missing user username/name/password");
    }

    const normalizedUsername = String(username).trim();
    const normalizedName = String(name).trim();
    if (!normalizedUsername || !normalizedName) {
      throw new Error("Missing user username/name/password");
    }

    if (await getUserByUsername(normalizedUsername)) {
      throw new Error("Username already exists");
    }

    const user = await createUser({
      username: normalizedUsername,
      name: normalizedName,
      hashedPassword: await hashPassword(password),
    });

    res.status(200).json({
      username: user?.username,
      name: user?.name
    });
  } catch (error) {
    res.status(401).json({ "message": `${error}` });
  }
}


export async function loginHandler(req: Request, res: Response) {
  const { username, password } = req.body;
  if (!username || !password) {
    throw new HttpError(400, "Missing user username/password");
  }

  const user = await getUserByUsername(username);
  if (!user) {
    throw new HttpError(401, "Username does not exist");
  }
  const isPasswordValid = await checkHashedPassword(user.hashedPassword, password);
  if (!isPasswordValid) {
    throw new HttpError(401, "Password is incorrect");
  }

  const accessToken = generateAccessToken(user.id, config.jwt.secret);
  const refreshToken = generateRefreshToken();
  await saveRefreshToken(refreshToken, user.id);

  res.status(200).
    cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: false,
      sameSite: 'strict',
      maxAge: config.jwt.refreshExpiry
    }).
    json({
      userID: user.id,
      username: user.username,
      name: user.name,
      accessToken: accessToken,
    });
}

export async function refreshHandler(req: Request, res: Response) {
  const refreshToken = req.cookies.refreshToken;
  if (!refreshToken) {
    res.status(401).json({ "message": "Unauthorized" });
    return;
  }

  const savedRefreshToken = await getRefreshToken(refreshToken);
  if (!savedRefreshToken || savedRefreshToken.revokedAt) {
    res.status(401).json({ "message": "Invalid refresh token" });
    return;
  }
  if (savedRefreshToken.expiresAt < Date.now()) {
    await revokeRefreshToken(refreshToken);
    res.status(401).json({ "message": "Refresh token expired" });
    return;
  }

  const accessToken = generateAccessToken(savedRefreshToken.userId, config.jwt.secret);

  res.status(200).json({ accessToken: accessToken });
}


export async function revokeHandler(req: Request, res: Response) {
  const refreshToken = req.cookies.refreshToken;
  await revokeRefreshToken(refreshToken);
  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: false,
    sameSite: "strict",
  });
  res.status(204).send();
}

