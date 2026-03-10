import jwt from "jsonwebtoken";

// Generate a JWT Token signed with the User ID
export const generateToken = (userId) => {
  return jwt.sign(
     { 
          id: userId 
     }, 
     process.env.JWT_SECRET, 
     {
          expiresIn: process.env.JWT_EXPIRE || "7d",
     });
};

// Verify JWT Token - if a JWT Token is valid and untampered
export const verifyToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET);
};

// Send token in an HttpOnly cookie and JSON response
export const sendTokenResponse = (user, statusCode, res, message = 'Success') => {
  const token = generateToken(user._id);

  const options = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000
    ),
    // maxAge: 7 * 24 * 60 * 60 * 1000,
    httpOnly: true, //XSS Shields
    secure: process.env.NODE_ENV === 'production', // Man-in-the-Middle Shields
    sameSite: 'strict', // CSRF Shields
  };

  res.status(statusCode).cookie('token', token, options).json({
    success: true,
    message,
    token, // Provided for clients
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      role: user.role,
    },
  });
};
