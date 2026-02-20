import { Router, Request, Response, NextFunction } from "express";
import { loginUser, refreshAccessToken, registerUser } from './auth.service';
import { log } from '../src/logging/logging';
import { successResponse, errorResponse } from '../src/utils/response.utils';
import { validateBody } from '../middlewares/validate.middleware';
import { loginRateLimiter } from '../middlewares/rateLimit.middleware';
import { loginSchema, refreshTokenSchema, registerSchema } from '../src/schemas';
import { requireAuth } from '../middlewares/requireAuth';

const router = Router();

router.post(
  "/register",
  validateBody(registerSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { username, email, password } = req.body;
      const requestId = req.requestId;

      log("info", "registration_attempt", { requestId, username, email });

      const result = await registerUser(username, email, password);

      log("audit", "user_registered", { requestId, username, email });

      successResponse(res, result, requestId, 201);
    } catch (err) {
      if (err instanceof Error) {
        if (err.message === "USERNAME_EXISTS") {
          errorResponse(res, "Username already exists", req.requestId, 409, "USERNAME_EXISTS");
          return;
        }
        if (err.message === "EMAIL_EXISTS") {
          errorResponse(res, "Email already registered", req.requestId, 409, "EMAIL_EXISTS");
          return;
        }
      }
      log("error", "registration_error", {
        requestId: req.requestId,
        error: err instanceof Error ? err.message : String(err),
      });
      next(err);
    }
  }
);

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

      if (err instanceof Error && err.message === "ACCOUNT_PENDING") {
        log("warn", "login_failed", {
          requestId: req.requestId,
          reason: "account_pending",
        });
        errorResponse(res, "Account awaiting admin approval", req.requestId, 403, "ACCOUNT_PENDING");
        return;
      }

      if (err instanceof Error && err.message === "ACCOUNT_DISABLED") {
        log("warn", "login_failed", {
          requestId: req.requestId,
          reason: "account_disabled",
        });
        errorResponse(res, "Account has been disabled", req.requestId, 403, "ACCOUNT_DISABLED");
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
