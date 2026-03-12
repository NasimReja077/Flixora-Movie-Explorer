import User from "../models/User.model.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import {
  imageUploadToCloudinary,
  imageDeleteFromCloudinary,
} from "../services/upload.service.js";
import { CLOUDINARY_FOLDERS } from "../config/cloudinary.config.js";

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
const updateProfile = async (req, res, next) => {
  try {
    const { username } = req.body;

    const user = await User.findById(req.user.id);

    if (username) user.username = username;

    await user.save();

    res
      .status(200)
      .json(new ApiResponse(200, { user }, "Profile updated successfully"));
  } catch (error) {
    next(error);
  }
};

// @desc    Upload avatar
// @route   POST /api/users/avatar
// @access  Private
const uploadAvatar = async (req, res, next) => {
  try {
    if (!req.file) {
      return next(new ApiError(400, "Please upload an image file"));
    }

    const user = await User.findById(req.user._id);
    // Handle avatar and cover image uploads if provided
    if (!user) {
      return next(new ApiError(404, "User not found"));
    }

    // Delete old avatar if exists and not default
    if (user.avatar && !user.avatar.includes("avatar-default")) {
      try {
        const parts = user.avatar.split("/");
        const publicIdWithExt = parts[parts.length - 1];
        const publicId = publicIdWithExt.split('.')[0];

        await imageDeleteFromCloudinary(
          `${CLOUDINARY_FOLDERS.AVATARS}/${publicId}`,
        );
      } catch (deletError) {
        console.error("Old avatar deletion failed:", deletError.message);
      }
    }

    // Upload new avatar
    const avatarUploadResult = await imageUploadToCloudinary(
      req.file,
      CLOUDINARY_FOLDERS.AVATARS,
    );

    user.avatar = avatarUpload.url;
    await user.save();

    res
      .status(200)
      .json(
        new ApiResponse(
          200,
          { avatarUrl: user.avatar },
          "Avatar uploaded successfully",
        ),
      );
  } catch (error) {
    next(error);
  }
};


// @desc    Update password
// @route   PUT /api/users/password
// @access  Private
const updatePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user.id).select('+password');

    // Check current password
    const isMatch = await user.comparePassword(currentPassword);

    if (!isMatch) {
      return next(new ApiError(400, 'Current password is incorrect'));
    }

    user.password = newPassword;
    await user.save();

    res.status(200).json(
      new ApiResponse(200, null, 'Password updated successfully')
    );
  } catch (error) {
    next(error);
  }
};


// @desc    Get current user's full profile
// @route   GET /api/users/profile
// @access  Private
const getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select(
      '-password -otp -otpExpire -passwordResetToken -passwordResetExpire'
    );

    if (!user) {
      return next(new ApiError(404, 'User not found'));
    }

    // // Optional: enrich with extra data (counts, etc.)
    // const [favoritesCount, reviewsCount] = await Promise.all([
    //   Favorite.countDocuments({ user: user._id }),
    //   Review.countDocuments({ user: user._id }),
    //   History.countDocuments({ user: req.user._id }),
    // ]);

    res.status(200).json(
      new ApiResponse(
        200,
        {
          user: {
            id: user._id,
            username: user.username,
            email: user.email,
            avatar: user.avatar,
            role: user.role,
            isVerified: user.isVerified,
            createdAt: user.createdAt,
            // stats: {
            //   favorites: favoritesCount,
            //   reviews: reviewsCount,
            //   // watchlistCount, watchHistoryCount, etc. can be added later
            // },
          },
        },
        'Profile retrieved successfully'
      )
    );
  } catch (error) {
    next(error);
  }
};

export default {
  updateProfile,
  uploadAvatar,
  updatePassword,
  getProfile
};