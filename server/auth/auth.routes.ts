import { Router, Request, Response } from "express";
import { loginUser } from './auth.service';
import { LoginRequest } from '../src/types/index';
import { log } from '../src/logging/logging';

const router = Router();

router.post(
  "/login",
  async (req: Request<object, unknown, LoginRequest>, res: Response) => {
    const { username, password } = req.body;
    const requestId = req.requestId;

    if (!username || !password) {
      log("warn", "login_failed", {
        requestId,
        reason: "missing_credentials",
        username: username || "not_provided",
      });
      res.status(400).json({ error: "Username and password required" });
      return;
    }

    log("info", "login_attempt", { requestId, username });

    try {
      const token = await loginUser(username, password);

      log("info", "login_success", { requestId, username });
      res.json({ token });
    } catch (err) {
      if (err instanceof Error && err.message === "INVALID_CREDENTIALS") {
        log("warn", "login_failed", {
          requestId,
          username,
          reason: "invalid_credentials",
        });
        res.status(401).json({ error: "Invalid username or password" });
        return;
      }

      log("error", "login_error", {
        requestId,
        username,
        error: err instanceof Error ? err.message : String(err),
      });
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

export default router;
