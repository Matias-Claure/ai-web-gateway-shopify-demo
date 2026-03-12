import type { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";

export function errorHandler(
  error: Error & { statusCode?: number },
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  if (error instanceof ZodError) {
    res.status(400).json({
      error: "ValidationError",
      message: "Request validation failed.",
      details: error.issues.map((issue) => ({
        path: issue.path.join("."),
        message: issue.message
      }))
    });
    return;
  }

  res.status(error.statusCode ?? 500).json({
    error: error.name || "Error",
    message: error.message || "Unexpected server error."
  });
}
