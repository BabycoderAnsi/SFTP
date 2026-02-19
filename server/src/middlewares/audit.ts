import { Request, Response, NextFunction } from "express";
import { log } from "../logging/logging.js";

export function auditMiddleware(action: string) {
  return (req: Request, res: Response, next: NextFunction): void => {
    res.on("finish", () => {
      log("audit", "file_action", {
        requestId: req.requestId,
        user: req.user?.sub,
        role: req.user?.role,
        action,
        path:
          (req.query.path as string) ||
          (req.body as Record<string, string>)?.path,
        status: res.statusCode,
      });
    });
    next();
  };
}
