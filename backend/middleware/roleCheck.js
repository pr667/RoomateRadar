// middleware/roleCheck.js
const roleCheck = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        message: `Role '${req.user.role}' is not allowed to do this`,
      });
    }
    next();
  };
};

module.exports = { roleCheck };
