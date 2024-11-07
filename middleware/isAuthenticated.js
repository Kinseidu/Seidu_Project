// middleware/isAuthenticated.js

const pool = require('../config/db'); // Assuming you use a DB pool

module.exports = async (req, res, next) => {
  if (req.session && req.session.patientId) {
    try {
      const [users] = await pool.query('SELECT * FROM Patients WHERE id = ?', [req.session.patientId]);
      if (users.length > 0) {
        req.user = users[0]; // Attach user data to req.user
        next();
      } else {
        res.status(401).json({ error: 'Unauthorized' });
      }
    } catch (error) {
      console.error('Error fetching user:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  } else {
    res.status(401).json({ error: 'Unauthorized' });
  }
};
