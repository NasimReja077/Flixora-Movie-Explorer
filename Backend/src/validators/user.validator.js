// src/validators/userValidator.js
import { body } from 'express-validator';

export const updateProfileValidator = [
  body('name')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Name cannot be empty')
    .bail()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters')
    .escape(),
];

export const updatePasswordValidator = [
  body('currentPassword')
    .notEmpty()
    .withMessage('Current password is required')
    .bail(),

  body('newPassword')
    .notEmpty()
    .withMessage('New password is required')
    .bail()
    .isLength({ min: 8 })
    .withMessage('New password must be at least 8 characters')
    .matches(/\d/)
    .withMessage('Must contain at least one number')
    .matches(/[A-Z]/)
    .withMessage('Must contain at least one uppercase letter')
    .matches(/[!@#$%^&*(),.?":{}|<>]/)
    .withMessage('Must contain at least one special character')
    .custom((value, { req }) => {
      if (value === req.body.currentPassword) {
        throw new Error('New password must be different from current password');
      }
      return true;
    }),

  body('confirmPassword')
    .notEmpty()
    .withMessage('Confirm password is required')
    .custom((value, { req }) => {
      if (value !== req.body.newPassword) {
        throw new Error('Passwords do not match');
      }
      return true;
    }),
];

export default {
  updateProfileValidator,
  updatePasswordValidator,
};