import mongoose from 'mongoose';

const watchHistorySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    movieId: {
      type: Number,
      required: true,
    },
    movieType: {
      type: String,
      enum: ['movie', 'tv'],
      default: 'movie',
    },
    movieData: {
      title: String,
      posterUrl: String,
      releaseDate: String,
      rating: Number,
    },
    watchedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

watchHistorySchema.index({ user: 1, watchedAt: -1 });

export const WatchHistory = mongoose.model('WatchHistory', watchHistorySchema);