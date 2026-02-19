import express, { Application } from "express";
import helmet from "helmet";
import authRouter from '../auth/auth.routes';
import healthRoute from './routes/health.route';
import filesRouter from './routes/files.route';
import { requestIdMiddleware } from './middlewares/requestId';

const app: Application = express();

app.use(express.json());
app.use(helmet());
app.set("etag", false);
app.use(requestIdMiddleware);
app.use("/auth", authRouter);
app.use("/health", healthRoute);
app.use("/files", filesRouter);

export default app;
