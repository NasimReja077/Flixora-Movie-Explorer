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
      required: [true, "Rating is required"],
      min: [1, "Rating must be at least 1"],
      max: [10, "Rating cannot exceed 10"],
    },
    content: {
      type: String,
      required: true,
      trim: true,
    },

    spoiler: { 
      type: Boolean, 
      default: false 
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
reviewSchema.index({ user: 1, movieId: 1, movieType: 1 }, { unique: true });

export const Review = mongoose.model('Review', reviewSchema);