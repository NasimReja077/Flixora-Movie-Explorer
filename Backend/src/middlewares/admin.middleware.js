import ApiError from '../utils/ApiError';

const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    return next(
      new ApiError(403, 'Access denied. Admin privileges required')
    );
  }
};

export default adminOnly;