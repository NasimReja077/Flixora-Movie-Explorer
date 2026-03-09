import mongoose from "mongoose";

const tokenBlacklistSchema = new mongoose.Schema({
  token: {
    type: String,
    required: [ true, "token is required for blacklisting." ],
    unique: true,
  },
}, { timestamps: true });

export const TokenBlacklist = mongoose.model('TokenBlacklist', tokenBlacklistSchema);