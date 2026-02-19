import { Router, Request, Response, NextFunction } from "express";
import { loginUser, refreshAccessToken } from './auth.service';
import { log } from '../src/logging/logging';
import { successResponse, errorResponse } from '../src/utils/response.utils';
import { validateBody } from '../middlewares/validate.middleware';
import { loginRateLimiter } from '../middlewares/rateLimit.middleware';
import { loginSchema, refreshTokenSchema } from '../src/schemas';
import { requireAuth } from '../middlewares/requireAuth';

const router = Router();

router.post(
  "/login",
  loginRateLimiter,
  validateBody(loginSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { username, password } = req.body;
      const requestId = req.requestId;

      log("info", "login_attempt", { requestId, username: "***" });

      const { accessToken, refreshToken } = await loginUser(username, password);

      log("info", "login_success", { requestId, username: "***" });

      successResponse(res, {
        accessToken,
        refreshToken,
        expiresIn: 900,
        tokenType: "Bearer",
      }, requestId);
    } catch (err) {
      if (err instanceof Error && err.message === "INVALID_CREDENTIALS") {
        log("warn", "login_failed", {
          requestId: req.requestId,
          reason: "invalid_credentials",
        });
        errorResponse(res, "Invalid username or password", req.requestId, 401, "INVALID_CREDENTIALS");
        return;
      }

      log("error", "login_error", {
        requestId: req.requestId,
        error: err instanceof Error ? err.message : String(err),
      });
      next(err);
    }
  }
);

router.post(
  "/refresh",
  validateBody(refreshTokenSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { refreshToken } = req.body;
      const requestId = req.requestId;

      log("info", "token_refresh_attempt", { requestId });

      const { accessToken } = await refreshAccessToken(refreshToken);

      log("info", "token_refresh_success", { requestId });

      successResponse(res, {
        accessToken,
        expiresIn: 900,
        tokenType: "Bearer",
      }, requestId);
    } catch (err) {
      log("warn", "token_refresh_failed", {
        requestId: req.requestId,
        error: err instanceof Error ? err.message : String(err),
      });
      errorResponse(res, "Invalid or expired refresh token", req.requestId, 401, "INVALID_REFRESH_TOKEN");
    }
  }
);

router.post(
  "/logout",
  requireAuth(),
  async (req: Request, res: Response) => {
    log("info", "logout", { requestId: req.requestId, user: "***" });
    successResponse(res, { message: "Logged out successfully" }, req.requestId);
  }
);

export default router;
