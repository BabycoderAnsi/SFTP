import { Request, Response, NextFunction } from "express";
import { verifyToken } from '../auth/jwt.utils';

export function requireAuth(requiredRoles: string[] = []) {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      const authHeader = req.headers.authorization;

      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        res.status(401).json({ error: "Unauthorized" });
        return;
      }

      const token = authHeader.split(" ")[1];
      const payload = verifyToken(token);

      if (
        requiredRoles.length &&
        (!payload.role || !requiredRoles.includes(payload.role))
      ) {
        res.status(403).json({ error: "Forbidden" });
        return;
      }
      req.user = payload;
      next();
    } catch (err) {
      res.status(401).json({ error: "Invalid Authorization Token" });
    }
  };
}
