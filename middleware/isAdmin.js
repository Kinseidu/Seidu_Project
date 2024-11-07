// middleware/isAdmin.js

module.exports = (req, res, next) => {
    if (req.user && req.user.isAdmin) { // Ensure `req.user` is set by previous middleware
      next();
    } else {
      res.status(403).json({ message: 'Access denied, admin only' });
    }
  };
  