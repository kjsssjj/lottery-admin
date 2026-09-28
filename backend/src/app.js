import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import { errorHandler } from './middleware/errorHandler.js';
import { notFound } from './middleware/notFound.js';
import authRouter from './routes/auth.js';
import usersRouter from './routes/users.js';
import activitiesRouter from './routes/activities.js';
import interactionsRouter from './routes/interactions.js';
import prizesRouter from './routes/prizes.js';
import participationsRouter from './routes/participations.js';
import statsRouter from './routes/stats.js';

const app = express();
const port = process.env.PORT || 3000;

app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(morgan('dev'));

app.use('/api/auth', rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
}));

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString(), env: process.env.NODE_ENV || 'development' });
});

app.use('/api/auth', authRouter);
app.use('/api/users', usersRouter);
app.use('/api/activities', activitiesRouter);
app.use('/api/interactions', interactionsRouter);
app.use('/api/prizes', prizesRouter);
app.use('/api/participations', participationsRouter);
app.use('/api/stats', statsRouter);

app.use(notFound);
app.use(errorHandler);

app.listen(port, () => {
  console.log(`[BE] listening on http://localhost:${port}`);
});

export default app;
