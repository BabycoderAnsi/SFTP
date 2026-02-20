import { Request, Response, NextFunction } from "express";
import { verifyToken } from '../auth/jwt.utils';
import { findUserById } from '../src/repositories/user.repo';
import { UserStatus } from '../src/generated/prisma';
import { log } from '../src/logging/logging';

export function requireAuth(requiredRoles: string[] = []) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
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

      const user = await findUserById(payload.id);

      if (!user) {
        log("warn", "auth_user_not_found", {
          requestId: req.requestId,
          userId: payload.id,
        });
        res.status(401).json({ error: "User not found" });
        return;
      }

      if (user.status === UserStatus.PENDING) {
        log("warn", "auth_account_pending", {
          requestId: req.requestId,
          user: payload.sub,
        });
        res.status(403).json({ error: "Account awaiting admin approval" });
        return;
      }

      if (user.status === UserStatus.DISABLED) {
        log("warn", "auth_account_disabled", {
          requestId: req.requestId,
          user: payload.sub,
        });
        res.status(403).json({ error: "Account has been disabled" });
        return;
      }

      if (
        requiredRoles.length &&
        (!user.role || !requiredRoles.includes(user.role))
      ) {
        log("warn", "auth_forbidden", {
          requestId: req.requestId,
          user: payload.sub,
          actualRole: user.role,
          requiredRoles,
          path: req.path,
        });
        res.status(403).json({ error: "Forbidden" });
        return;
      }

      req.user = {
        ...payload,
        id: user.id,
        sub: user.username,
        role: user.role,
        email: user.email,
        status: user.status,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      };
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
