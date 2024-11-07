const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { isAdmin } = require('../middleware/authMiddleware');

// Debug log to confirm routes are loaded
console.log('Admin Routes Loaded:', adminController);

// Admin Registration (Optional, for manual admin addition)
router.post('/register', adminController.registerAdmin);

// Admin Login
router.post('/login', adminController.loginAdmin);

// Protected routes (Admin Only)
router.get('/patients', isAdmin, adminController.getAllPatients);
router.get('/appointments', isAdmin, adminController.getAllAppointments);
router.delete('/patients/:id', isAdmin, adminController.deletePatientByAdmin);

// Logout Admin
router.post('/logout', adminController.logoutAdmin);

module.exports = router;
