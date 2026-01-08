import express from 'express';
import helmet from 'helmet';
import authRouter from '../auth/auth.routes.js';
import healthRoute from './routes/health.route.js';
import filesRouter from './routes/files.route.js';
const app = express();

app.use(express.json());
app.use(helmet());
app.set('etag', false);
app.use('/auth', authRouter)
app.use('/health', healthRoute);
app.use("/files", filesRouter);


export default app;
