import { Router, Request, Response } from "express";
import { loginUser } from "./auth.service.js";
import { LoginRequest } from "../src/types/index.js";

const router = Router();

router.post(
  "/login",
  async (req: Request<object, unknown, LoginRequest>, res: Response) => {
    try {
      const { username, password } = req.body;

      if (!username || !password) {
        res.status(400).json({ error: "Username and password required" });
        return;
      }

      const token = await loginUser(username, password);

      res.json({ token });
    } catch (err) {
      if (err instanceof Error && err.message === "INVALID_CREDENTIALS") {
        res.status(401).json({ error: "Invalid username or password" });
        return;
      }

      console.error("Login failed", err);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

export default router;
