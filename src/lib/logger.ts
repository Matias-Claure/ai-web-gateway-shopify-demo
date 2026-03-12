import type { Request, Response, NextFunction } from "express";

export function logRequest(req: Request, res: Response, next: NextFunction): void {
  const startedAt = Date.now();

  res.on("finish", () => {
    const payload = {
      level: "info",
      method: req.method,
      path: req.path,
      statusCode: res.statusCode,
      durationMs: Date.now() - startedAt
    };

    console.log(JSON.stringify(payload));
  });

  next();
}
