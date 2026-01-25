import express, { Application } from "express";
import helmet from "helmet";
import authRouter from "../auth/auth.routes.ts";
import healthRoute from "./routes/health.route.ts";
import filesRouter from "./routes/files.route.ts";
import { requestIdMiddleware } from "./middlewares/requestId.ts";

const app: Application = express();

app.use(express.json());
app.use(helmet());
app.set("etag", false);
app.use(requestIdMiddleware);
app.use("/auth", authRouter);
app.use("/health", healthRoute);
app.use("/files", filesRouter);

export default app;
