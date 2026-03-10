import crypto from 'crypto';

const generateOTP = () => {
  return crypto.randomInt(100000, 999999).toString();
};

// const generateResetToken = () => {
//   return crypto.randomBytes(32).toString('hex');
// };

module.exports = { generateOTP };