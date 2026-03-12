import type { Request, Response, NextFunction } from "express";
import { AI_GATEWAY_HEADER, isValidApiKey } from "../lib/auth";

export function requireApiKey(req: Request, res: Response, next: NextFunction): void {
  const apiKey = req.header(AI_GATEWAY_HEADER);

  if (!isValidApiKey(apiKey)) {
    res.status(401).json({
      error: "Unauthorized",
      message: `Provide a valid ${AI_GATEWAY_HEADER} header.`
    });
    return;
  }

  next();
}
