import express from "express";
import protect from "../middlewares/auth.middleware.js";

import {
  addToWatchlist,
  removeFromWatchlist,
  getWatchlist,
} from "../controllers/watchlist.controller.js";

import {
  addWatchlistValidator,
  removeWatchlistValidator,
  watchlistPaginationValidator,
} from "../validators/watchlistValidator.js";

import validate from "../middlewares/validationMiddleware.js";

const router = express.Router();

// Protected routes
router.post(
  "/",
  protect,
  addWatchlistValidator,
  validate,
  addToWatchlist
);

router.delete(
  "/:movieId",
  protect,
  removeWatchlistValidator,
  validate,
  removeFromWatchlist
);

router.get(
  "/",
  protect,
  watchlistPaginationValidator,
  validate,
  getWatchlist
);

export default router;