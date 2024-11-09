// middleware/authMiddleware.js

// Middleware to check if the user is authenticated (patients, doctors, or admins)
function isAuthenticated(req, res, next) {
  if (req.session && (req.session.patient || req.session.doctor || req.session.admin)) {
      return next(); // Proceed to the next middleware/controller
  }
  res.status(401).json({ error: 'Unauthorized' }); // User is not authenticated
}

// Optional: isAdmin middleware to restrict access to admins only
function isAdmin(req, res, next) {
  if (req.session && req.session.adminId) {
      return next(); // Allow access to the next route handler if the user is an admin
  }
  return res.status(403).json({ error: 'Forbidden: Admins only' }); // Deny access if the user is not an admin
}

// Optional: isDoctor middleware to restrict access to doctors only
function isDoctor(req, res, next) {
  if (req.session && req.session.doctor) {
      return next(); // Proceed to the next middleware/controller
  }
  res.status(403).json({ error: 'Forbidden: Doctors only' }); // User is not a doctor
}

module.exports = {
  isAuthenticated,
  isAdmin,
  isDoctor
};
