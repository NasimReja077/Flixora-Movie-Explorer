import crypto from 'crypto';

const generateOTP = () => {
  return crypto.randomInt(100000, 999999).toString();
};

const generateResetToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

const generateResetTokenExpire = () => {
  return new Date(Date.now() + 60 * 60 * 1000); // 1 hour
}

export default { 
  generateOTP, 
  generateResetToken, 
  generateResetTokenExpire
};