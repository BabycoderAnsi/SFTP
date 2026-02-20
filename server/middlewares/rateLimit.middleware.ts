import rateLimit from 'express-rate-limit';
import { log } from '../src/logging/logging';

export const loginRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    log("warn", "rate_limit_exceeded", {
      requestId: req.requestId,
      ip: req.ip,
      path: req.path,
    });
    res.status(429).json({
      status: "error",
      requestId: req.requestId,
      error: {
        message: "Too many login attempts, please try again later",
        code: "RATE_LIMIT_EXCEEDED",
        retryAfter: 15 * 60,
      },
    });
  },
});

export const apiRateLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
});
