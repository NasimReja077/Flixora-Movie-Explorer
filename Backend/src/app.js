import express from "express";
import helmet from "helmet";
import cors from "cors";

import cookieParser from "cookie-parser";
import { apiLimiter } from './middlewares/rateLimitMiddleware.js';
import errorHandler from './middlewares/errorMiddleware.js';

import authRoutes from './routes/auth.routes.js';
import userRouter from './routes/user.routes.js';
import favoriteRoutes from './routes/favorite.routes.js';
import watchHistoryRoutes from './routes/watchHistory.routes.js';
import reviewRoutes from './routes/review.routes.js';
import tmdbRoutes from './routes/tmdb.routes.js';
import adminRoutes from './routes/admin.routes.js';

const app = express();

// Security headers
app.use(helmet());


// CORS configuration
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:5173",
  credentials: true
}));

// Body parser middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Cookie parser
app.use(cookieParser());


// Rate Limiting
app.use('/api', apiLimiter);

// Mount routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRouter);
app.use('/api/favorites', favoriteRoutes);
app.use('/api/watch-history', watchHistoryRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/tmdb', tmdbRoutes);
app.use('/api/admin', adminRoutes);

// test route
app.get("/", (req, res) => {
  res.send("Flixora API running...");
});

app.use(errorHandler);

export default app;