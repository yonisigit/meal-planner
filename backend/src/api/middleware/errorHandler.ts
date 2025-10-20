import type { NextFunction, Request, Response } from "express";
import { toHttpError } from "../errors.js";

export function errorHandler(
  error: unknown,
  _req: Request,
  res: Response,
  next: NextFunction,
) {
  if (res.headersSent) {
    next(error);
    return;
  }

  const httpError = toHttpError(error);
  const statusCode = httpError.statusCode ?? 500;
  const payload = {
    message: statusCode >= 500 ? "Internal server error" : httpError.message || "Unexpected error",
  };

  if (statusCode >= 500) {
    console.error(error);
  }

  res.status(statusCode).json(payload);
}
