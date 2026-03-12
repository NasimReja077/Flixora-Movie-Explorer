export const VERIFICATION_EMAIL_TEMPLATE = `
<!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .otp-box { background: white; padding: 20px; margin: 20px 0; border-radius: 8px; text-align: center; border: 2px dashed #667eea; }
        .otp-code { font-size: 32px; font-weight: bold; color: #667eea; letter-spacing: 5px; }
        .footer { text-align: center; margin-top: 20px; color: #888; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🎬 Welcome to Flixora!</h1>
        </div>
        <div class="content">
          <h2>Hello ${username}! 👋</h2>
          <p>Thank you for signing up! To complete your registration, please verify your email address using the OTP below:</p>
          <div class="otp-box">
            <p style="margin: 0; font-size: 14px; color: #666;">Your OTP Code:</p>
            <p class="otp-code">${otp}</p>
            <p style="margin: 0; font-size: 12px; color: #888;">Valid for 10 minutes</p>
          </div>
          <p>If you didn't create this account, please ignore this email.</p>
          <p>Happy watching! 🍿</p>
        </div>
        <div class="footer">
          <p>&copy; 2025 Flixora. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
`;

export const WELCOME_EMAIL_TEMPLATE = `
<!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        .footer { text-align: center; margin-top: 20px; color: #888; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🎉 Welcome to Flixora!</h1>
        </div>
        <div class="content">
          <h2>Hello ${username}! 👋</h2>
          <p>Your email has been successfully verified! You're now part of the Flixora community.</p>
          <p>Discover thousands of movies and TV shows, save your favorites, and enjoy personalized recommendations.</p>
          <a href="${process.env.FRONTEND_URL}" class="button">Start Exploring</a>
          <p>Happy watching! 🍿</p>
        </div>
        <div class="footer">
          <p>&copy; 2025 Flixora. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
`;

export const PASSWORD_RESET_REQUEST_TEMPLATE = `
<!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        .footer { text-align: center; margin-top: 20px; color: #888; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🔐 Password Reset Request</h1>
        </div>
        <div class="content">
          <h2>Hello ${username}!</h2>
          <p>We received a request to reset your password. Click the button below to create a new password:</p>
          <a href="${resetUrl}" class="button">Reset Password</a>
          <p style="color: #888; font-size: 12px;">This link will expire in 1 hour.</p>
          <p>If you didn't request this, please ignore this email.</p>
        </div>
        <div class="footer">
          <p>&copy; 2025 Flixora. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
`;

export const PASSWORD_RESET_SUCCESS_TEMPLATE = `
<!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .footer { text-align: center; margin-top: 20px; color: #888; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>✅ Password Reset Successful</h1>
        </div>
        <div class="content">
          <h2>Hello ${username}!</h2>
          <p>Your password has been successfully reset.</p>
          <p>You can now log in with your new password.</p>
          <p>If you didn't make this change, please contact our support immediately.</p>
        </div>
        <div class="footer">
          <p>&copy; 2025 Flixora. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
`;