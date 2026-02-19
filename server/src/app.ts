import express, { Application, Request, Response, NextFunction } from "express";
import helmet from "helmet";
import authRouter from '../auth/auth.routes';
import healthRoute from './routes/health.route';
import filesRouter from './routes/files.route';
import { requestIdMiddleware } from './middlewares/requestId';
import { log } from './logging/logging';
import { requestTimeout } from '../middlewares/timeout.middleware';
import { apiRateLimiter } from '../middlewares/rateLimit.middleware';

const app: Application = express();

app.use(helmet());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.set("etag", false);

app.use(requestIdMiddleware);

app.use(requestTimeout(30000));

app.use(apiRateLimiter);

app.use("/health", healthRoute);
app.use("/v1/auth", authRouter);
app.use("/v1/files", filesRouter);

app.use((req: Request, res: Response) => {
  res.status(404).json({
    status: "error",
    requestId: req.requestId,
    error: {
      message: "Not found",
      code: "NOT_FOUND",
      path: req.path,
    },
  });
});

app.use((err: Error, req: Request, res: Response, _next: NextFunction) => {
  log("error", "unhandled_error", {
    requestId: req.requestId,
    user: req.user?.sub,
    error: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
  });

  res.status(500).json({
    status: "error",
    requestId: req.requestId,
    error: {
      message: "Internal server error",
      code: "INTERNAL_ERROR",
    },
  });
});

export default app;
