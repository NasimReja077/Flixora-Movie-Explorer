import express from "express";
import helmet from "helmet";
import cors from "cors";
import cookieParser from "cookie-parser";
import morgan from "morgan";

import { apiLimiter } from './middlewares/rateLimitMiddleware.js';
import errorHandler from './middlewares/errorMiddleware.js';

import authRoutes from './routes/auth.routes.js';
import userRouter from './routes/user.routes.js';
import favoriteRoutes from './routes/favorite.routes.js';
import watchHistoryRoutes from './routes/watchHistory.routes.js';
import reviewRoutes from './routes/review.routes.js';
import tmdbRoutes from './routes/tmdb.routes.js';
import adminRoutes from './routes/admin.routes.js';
import watchlistRoutes from "./routes/watchlist.routes.js";

import path from "path";
import { fileURLToPath } from "url";

const app = express();
const allowedOrigins = ["http://localhost:5173", process.env.FRONTEND_URL].filter(Boolean);

// Security headers
app.use(helmet());

app.use(morgan("dev"));

// Body parser middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Cookie parser
app.use(cookieParser());


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// CORS configuration
app.use(cors({
     origin: allowedOrigins,
     methods: [ "GET", "POST", "PUT", "DELETE" ],
     credentials: true
}));

if (process.env.NODE_ENV === "production") {
  app.use(morgan("combined"));
}

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
app.use("/api/watchlist", watchlistRoutes);

// test route
app.get("/", (req, res) => {
  res.send("Flixora API running...");
});

app.use(errorHandler);

export default app;