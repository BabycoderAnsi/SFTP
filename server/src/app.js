import express from 'express';
import helmet from 'helmet';
import healthRoute from './routes/health.route.js';

const app = express();

app.use(helmet());
app.set('etag', false);
app.use('/health', healthRoute);

export default app;
