import jwt, { type JwtPayload } from "jsonwebtoken";

import { config } from "./config/config.js";
import type { Request } from "express";


type payload = Pick<JwtPayload, "iss" | "sub" | "iat" | "exp">;
export function generateAccessToken(userId: string, secret: string) {
  const issuedAt = Math.floor(Date.now() / 1000);
  const expiresAt = issuedAt + config.jwt.defaultExpiry;
  const tokenPayload: payload = {
    iss: config.jwt.issuer,
    sub: userId,
    iat: issuedAt,
    exp: expiresAt,
  };
  const accessToken = jwt.sign(tokenPayload, secret);
  return accessToken;
}

export function validateToken(token: string, secret: string) {
  try {
    const decodedPayload = jwt.verify(token, secret) as JwtPayload;
    return { valid: true, expired: false, payload: decodedPayload  };  
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      return { valid: false, expired: true, payload: null };
    }
    return { valid: false, expired: false, payloads: null };
  }

}

export function getBearerToken(req: Request): string{
  try {
    const authHeader = req.get("Authorization");
    if (!authHeader) {
      throw new Error("No authorization header");
    }
    const token = authHeader.split(' ')[1];
    if (!token) {
      throw new Error("No token provided");
    }
    return token;
  } catch (error) {
    throw new Error("Invalid authorization header");
  }
}

export function authenticateRequest(req: Request){
  const token = getBearerToken(req);
  try {
    const decoded = validateToken(token, config.jwt.secret);
    return decoded.payload?.sub; // userId
  } catch (error) {
    throw new Error("Failed to authenticate token");
  }
}