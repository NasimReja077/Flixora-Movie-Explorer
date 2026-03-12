import User from "../models/User.model";
import redis from "../config/redis.config";
import ApiError from "../utils/ApiError";
import ApiResponse from "../utils/ApiResponse";
import { sendTokenResponse } from "../utils/jwt";
import { generateOTP, generateResetToken, generateResetTokenExpire } from "../utils/generateOTP";

import {
  imageUploadToCloudinary,
} from "../services/upload.service.js";
import { CLOUDINARY_FOLDERS } from "../config/cloudinary.config.js";
import {
  sendOTPEmail,
  sendWelcomeEmail,
  sendPasswordResetEmail,
  sendPasswordResetConfirmation,
} from "../services/email.service";

// @desc    Register user
// @route   POST /api/auth/signup
// @access  Public

const signup = async (req, res, next) => {
  try {
    const { username, email, password } = req.body;

    // Check if user exists
    const existingUser = await User.findOne({
      $or: [{ email }, { username }],
    });

    if (existingUser) {
      const message =
        existingUser.email === email
          ? "Email already exists"
          : "Username already exists";

      return next(new ApiError(409, message));
    }

    let avatarUrl = User.schema.path('avatar').defaultValue; // or your default URL
    if (req.file) {
      const uploadResult = await imageUploadToCloudinary(req.file, CLOUDINARY_FOLDERS.AVATARS);
      avatarUrl = uploadResult.url;
    }


    // Generate OTP
    const otp = generateOTP();
    const otpExpire = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Create user
    const user = await User.create({
      username,
      email,
      password,
      avatar: avatarUrl,
      otp,
      otpExpire,
      isVerified: false,
    });

    // Send OTP email
    await sendOTPEmail(user.email, otp, user.username);

    const token = sendTokenResponse(user._id, res);

    res
      .status(201)
      .json(
        new ApiResponse(
          201,
          { email: user.email, token },
          "Registration successful! Please verify your email with OTP",
        ),
      );
  } catch (error) {
    next(error);
  }
};

// @desc    Verify OTP
// @route   POST /api/auth/verify-otp
// @access  Public
const verifyOTP = async (req, res, next) => {
  try {
    const { email, otp } = req.body;

    // 1. Check if both fields are provided
    if (!email || !otp) {
      return next(new ApiError(400, 'Please provide email and OTP'));
    }
    
    // 2. Find user and explicitly select hidden fields
    const user = await User.findOne({ email }).select('+otp +otpExpire');

    if (!user) {
      return next(new ApiError(404, 'User not found'));
    }

    // 3. Check if already verified
    if (user.isVerified) {
      return next(new ApiError(400, 'Thes Email account is already verified'));
    }

    // Check OTP expiration
    if (user.otpExpire < Date.now()) {
      return next(new ApiError(400, 'OTP has expired. Please request a new one'));
    }

    // Check OTP validity
    if (user.otp !== otp) {
      return next(new ApiError(400, 'Invalid OTP'));
    }

    // Update user
    user.isVerified = true;
    user.otp = undefined;
    user.otpExpire = undefined;
    await user.save();

    // Send welcome email
    try {
     await sendWelcomeEmail(email, user.username); 
    } catch (emailErr) {
      console.error("Welcome email failed to send:", emailErr);
    }

    // 8. Final Response
    // Ensure Send token response
    sendTokenResponse(user, 200, res, 'Email verified successfully');
  } catch (error) {
    next(error);
  }
};

// @desc    Resend OTP
// @route   POST /api/auth/resend-otp
// @access  Public
const resendOTP = async (req, res, next) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return next(new ApiError(404, 'User not found'));
    }

    if (user.isVerified) {
      return next(new ApiError(400, 'Email already verified'));
    }

    // Generate new OTP
    const otp = generateOTP();
    const otpExpire = new Date(Date.now() + 10 * 60 * 1000);

    user.otp = otp;
    user.otpExpire = otpExpire;
    await user.save();

    // Send OTP email
    await sendOTPEmail(email, otp, user.username);

    res.status(200).json(new ApiResponse(200, null, 'OTP sent successfully'));
  } catch (error) {
    next(error);
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return next(new ApiError(400, "Please provide email and password"));
    }

    // Check if user exists
    const user = await User.findOne({ email }).select('+password');

    // 3. Check if user exists BEFORE checking properties like isVerified
    if (!user) {
      return next(new ApiError(401, 'Invalid email or password'));
    }

    // Check if email is verified
    if (!user.isVerified) {
      return next(new ApiError(401, 'Please verify your email first'));
    }

    // Check if user is banned
    if (user.isBanned) {
      return next(new ApiError(403, 'Your account has been banned'));
    }

    // Check password
    const isPasswordMatch = await user.comparePassword(password);

    if (!isPasswordMatch) {
      return next(new ApiError(401, 'Invalid email or password'));
    }

    sendTokenResponse(user, 200, res, 'Login Successful');
  } catch (error) {
    next(error);
  }
};

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
const logout = async (req, res, next) => {
  try {

    const token = req.token;

    if (!token) {
      return res.status(200).json(new ApiResponse(200, null, 'Already logged out'));
    }

    // Add token to Redis blacklist
    const decoded = sendTokenResponse.decoded(token);

    if (decoded && decoded.exp) {
      const currentTime = Math.floor(Date.now() / 1000);
      const expiresIn = decoded.exp - currentTime;

      // 2. Add to Redis blacklist only if the token hasn't already naturally expired
      if (expiresIn > 0) {
        await redis.setex(`blacklist:${token}`,'true' ,'EXP-',expiresIn);
      }
    }

    res.cookie('token', '', {
      expires: new Date(0),
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
    });

    res.status(200).json(new ApiResponse(200, null, 'Logout successful'));
  } catch (error) {
    next(error);
  }
};

// @desc    Forgot password
// @route   POST /api/auth/forgot-password
// @access  Public
const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    if(!email){
      return next(new ApiError(400, 'Email is required'));
    }

    const user = await User.findOne({ email });

    if (!user) {
      return next(new ApiError(404, 'No user found with this email'));
    }

    // Generate reset token
    const resetToken = generateResetToken();
    const resetTokenExpire = generateResetTokenExpire(); // 1 hour

    user.passwordResetToken = resetToken;
    user.passwordResetExpire = resetTokenExpire;
    await user.save();

    // Create reset URL
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

    // Send email
    await sendPasswordResetEmail(email, resetUrl, user.username);

    res
      .status(200)
      .json(new ApiResponse(200, null, 'Password reset link sent to email'));
  } catch (error) {
    next(error);
  }
};

// @desc    Reset password
// @route   POST /api/auth/reset-password/:token
// @access  Public
const resetPassword = async (req, res, next) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    if (!password) {
      return next(new ApiError(400, 'Please provide a new password'));
    }

    const user = await User.findOne({
      passwordResetToken: token,
      passwordResetExpire: { $gt: Date.now() },
    });

    if (!user) {
      return next(new ApiError(400, 'Invalid or expired reset token'));
    }

    // Update password
    user.password = password;
    user.passwordResetToken = undefined;
    user.passwordResetExpire = undefined;
    await user.save();

    // Send confirmation email
    await sendPasswordResetConfirmation(user.email, user.username);

    res
      .status(200)
      .json(new ApiResponse(200, null, 'Password reset successful'));
  } catch (error) {
    next(error);
  }
};

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res, next) => {
  try {
    
    const user = req.user;
    
    if (!user) {
      return next(new ApiError(404, 'User not found'));
    }
    res.status(200).json(
      new ApiResponse(200, { user }, 'User profile fetched successfully')
    );
  } catch (error) {
    next(error);
  }
};

export default {
  signup,
  verifyOTP,
  resendOTP,
  login,
  logout,
  forgotPassword,
  resetPassword,
  getMe,
};