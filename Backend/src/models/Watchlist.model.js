import mongoose from "mongoose";

const watchlistSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  movieId: {
    type: Number,
    required: true
  },
  movieType: {
    type: String,
    enum: ["movie", "tv"],
    default: "movie"
  }
}, { timestamps: true });

watchlistSchema.index({ user: 1, movieId: 1 }, { unique: true });

export const Watchlist = mongoose.model("Watchlist", watchlistSchema);
