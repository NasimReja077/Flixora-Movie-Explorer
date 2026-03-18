import mongoose from "mongoose";

const watchlistSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    movieId: {
      type: Number, // TMDB ID
      required: true,
      index: true,
    },

    movieType: {
      type: String,
      enum: ["movie", "tv"],
      default: "movie",
    },

    movieData: {
      title: String,
      posterPath: String,
      voteAverage: Number,
      releaseDate: String,
    },
  },
  { timestamps: true }
);

watchlistSchema.index({ user: 1, movieId: 1 }, { unique: true });

export const Watchlist = mongoose.model("Watchlist", watchlistSchema);