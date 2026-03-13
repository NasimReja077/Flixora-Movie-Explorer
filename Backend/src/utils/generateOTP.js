import crypto from 'crypto';

export const generateOTP = () => {
  return crypto.randomInt(100000, 999999).toString();
};

export const generateResetToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

export const generateResetTokenExpire = () => {
  return new Date(Date.now() + 60 * 60 * 1000); // 1 hour
}