import express from 'express';
import helmet from 'helmet';
import healthRoute from './routes/health.route.js';
import filesRouter from './routes/files.route.js';
const app = express();

app.use(helmet());
app.set('etag', false);
app.use('/health', healthRoute);
app.use("/files", filesRouter);

export default app;
