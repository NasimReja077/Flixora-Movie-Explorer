import mongoose from 'mongoose';

const favoriteSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    movieId: {
      type: Number,
      required: true,
      index: true
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
  },
  {
    timestamps: true,
  }
);

// Compound index to prevent duplicate favorites
favoriteSchema.index({ user: 1, movieId: 1 }, { unique: true });

export const Favorite = mongoose.model('Favorite', favoriteSchema);