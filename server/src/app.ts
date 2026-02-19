import express, { Application, Request, Response, NextFunction } from "express";
import helmet from "helmet";
import authRouter from '../auth/auth.routes';
import healthRoute from './routes/health.route';
import filesRouter from './routes/files.route';
import { requestIdMiddleware } from './middlewares/requestId';
import { log } from './logging/logging';

const app: Application = express();

app.use(express.json());
app.use(helmet());
app.set("etag", false);
app.use(requestIdMiddleware);
app.use("/auth", authRouter);
app.use("/health", healthRoute);
app.use("/files", filesRouter);

app.use((err: Error, req: Request, res: Response, _next: NextFunction) => {
  log("error", "unhandled_error", {
    requestId: req.requestId,
    user: req.user?.sub,
    error: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
  });

  res.status(500).json({ error: "Internal server error" });
});

export default app;
