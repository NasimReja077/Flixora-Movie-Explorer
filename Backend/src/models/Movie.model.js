import mongoose from 'mongoose';

const movieSchema = new mongoose.Schema(
  {
    tmdbId: {
      type: Number,
      required: true,
      unique: true,
      index: true
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    posterUrl: {
      type: String,
      default: 'https://res.cloudinary.com/dhw2dz1km/image/upload/v1773024526/shop_01_inm6m6.jpg',
    },
    backdropUrl: {
      type: String,
    },
    description: {
      type: String,
      default: 'Description not available',
    },
    releaseDate: {
      type: Date,
    },
    trailerUrl: {
      type: String,
    },
    genres: [String],
    category: {
      type: String,
      enum: ['movie', 'tv'],
      default: 'movie',
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 10,
    },
    runtime: {
      type: Number,
    },
    language: {
      type: String,
    },
    addedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

export const Movie = mongoose.model('Movie', movieSchema);