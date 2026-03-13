// src/services / email.service.js

import { defaultEmailOptions, transporter } from "../config/mailer.config.js";
import ApiError from "../utils/ApiError.js";
import { 
     PASSWORD_RESET_REQUEST_TEMPLATE,
      PASSWORD_RESET_SUCCESS_TEMPLATE, 
      VERIFICATION_EMAIL_TEMPLATE, 
      WELCOME_EMAIL_TEMPLATE 
} from "../templates/emailTemplates.js";

// Reusable Email Sender Function
const sendEmail = async (to, subject, htmlContent) =>{
     try {
          const mailOptions = {
               ...defaultEmailOptions,
               to,
               subject,
               html: htmlContent,
          };
          const info = await transporter.sendMail(mailOptions);
          console.log(`Email sent successfully to ${to}: ${info.messageId}`)
          return { success: true, messageId: info.messageId };
     } catch (error) {
          console.error(`Failed to send email to ${to}:`, error);
          throw new ApiError(500, `Email sending failed: ${error.message}`);
     }
};

// 1> Email Verification with OTP

export const sendOTPEmail = async (email, username, otp) => {
     const htmlContent = VERIFICATION_EMAIL_TEMPLATE
          .replace("{username}", username)
          .replace("{otp}", otp);
     return sendEmail(email, 'Verify Email Address', htmlContent);
};

// 2> Welcome Email

export const sendWelcomeEmail = async (email, username) => {
     const htmlContent = WELCOME_EMAIL_TEMPLATE
          .replace("{username}", username)
          .replace("{frontendUrl}", process.env.FRONTEND_URL);
     return sendEmail(email, 'Welcome to Our Platform! 🥳', htmlContent);
};

// 3> Password Reset Request

export const sendPasswordResetEmail = async (email, resetUrl, username) => {
     const htmlContent = PASSWORD_RESET_REQUEST_TEMPLATE
          .replace("{username}", username)
          .replace("{resetUrl}", resetUrl);
     return sendEmail(email, "Password Reset Request 🔑", htmlContent);
};

// 4> Password Reset Success

export const sendPasswordResetConfirmation = async (email, username) => {
     const htmlContent = PASSWORD_RESET_SUCCESS_TEMPLATE
          .replace('{username}', username);
     return sendEmail(email, "Password Reset Successful 🎉", htmlContent);
};