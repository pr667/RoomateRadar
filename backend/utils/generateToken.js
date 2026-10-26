// utils/generateToken.js
const jwt = require('jsonwebtoken');

const generateToken = (userId) => {
  const expiresIn = process.env.JWT_EXPIRES_IN || '7d';
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn,
  });
};

module.exports = generateToken;
