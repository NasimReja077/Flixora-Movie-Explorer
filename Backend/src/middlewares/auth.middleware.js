import jwt from 'jsonwebtoken';
import {User} from '../models/User.model.js';
import redis from '../config/redis.config.js';
import ApiError from '../utils/ApiError.js';

const protect = async (req, res, next) => {
  try {

    let token;

    // Get token from cookie or Authorization header
    // const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");

     // 1. Extract token
    if (req.cookies.token) { 
      token = req.cookies.token;
    } else if ( 
      req.headers.authorization && req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }

    // console.log(token);

    if (!token) {
      return next(new ApiError(401, 'Unauthorized Request - please log-in to access the Resource'));
    }

    // Check if token is blacklisted in Redis
    const isBlacklisted = await redis.get(`blacklist:${token}`);
    if (isBlacklisted) {
      return next(new ApiError(401, 'Invalid token... Token is no longer valid. Session expired or logged out. Please log in again.'));
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Get user from token (Fetch User)
    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      return next(new ApiError(401, 'Invalid...,The User account associated with this token no longer exists.'));
    }

    // Check if user is banned
    if (user.isBanned) {
      return next(new ApiError(403, 'Your Account has been banned'));
    }

    req.user = user;
    req.token = token;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return next(new ApiError(401, 'Token has expired'));
    }
    return next(new ApiError(401, 'Invalid authentication token. Please log in again'));
  }
};

export default protect;