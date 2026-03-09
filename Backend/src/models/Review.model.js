import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema(
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
    rating: {
      type: Number,
      required: true,
      min: 0,
      max: 10,
    },
    content: {
      type: String,
      required: true,
      trim: true,
    },
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Compound index
reviewSchema.index({ user: 1, movieId: 1 }, { unique: true });

export const Review = mongoose.model('Review', reviewSchema);