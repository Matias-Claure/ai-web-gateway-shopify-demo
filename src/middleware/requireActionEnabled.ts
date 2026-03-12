import type { NextFunction, Request, Response } from "express";
import { isActionEnabled } from "../lib/actionRegistry";

export function requireActionEnabled(actionName: string) {
  return (_req: Request, res: Response, next: NextFunction): void => {
    if (!isActionEnabled(actionName)) {
      res.status(403).json({
        error: "ActionDisabled",
        message: `The action "${actionName}" is currently disabled in the dashboard.`
      });
      return;
    }

    next();
  };
}
