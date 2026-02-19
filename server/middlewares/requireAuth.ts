import { Request, Response, NextFunction } from "express";
import { verifyToken } from '../auth/jwt.utils';
import { log } from '../src/logging/logging';

export function requireAuth(requiredRoles: string[] = []) {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      const authHeader = req.headers.authorization;

      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        log("warn", "auth_missing_token", {
          requestId: req.requestId,
          path: req.path,
          method: req.method,
        });
        res.status(401).json({ error: "Unauthorized" });
        return;
      }

      const token = authHeader.split(" ")[1];
      const payload = verifyToken(token);

      if (
        requiredRoles.length &&
        (!payload.role || !requiredRoles.includes(payload.role))
      ) {
        log("warn", "auth_forbidden", {
          requestId: req.requestId,
          user: payload.sub,
          actualRole: payload.role,
          requiredRoles,
          path: req.path,
        });
        res.status(403).json({ error: "Forbidden" });
        return;
      }
      req.user = payload;
      next();
    } catch (err) {
      log("warn", "auth_invalid_token", {
        requestId: req.requestId,
        path: req.path,
        method: req.method,
        error: err instanceof Error ? err.message : String(err),
      });
      res.status(401).json({ error: "Invalid Authorization Token" });
    }
  };
}
