import express, { Application } from "express";
import helmet from "helmet";
import authRouter from "../auth/auth.routes.js";
import healthRoute from "./routes/health.route.js";
import filesRouter from "./routes/files.route.js";
import { requestIdMiddleware } from "./middlewares/requestId.js";

const app: Application = express();

app.use(express.json());
app.use(helmet());
app.set("etag", false);
app.use(requestIdMiddleware);
app.use("/auth", authRouter);
app.use("/health", healthRoute);
app.use("/files", filesRouter);

export default app;
