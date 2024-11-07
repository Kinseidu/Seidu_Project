// routes/patientRoutes.js
const express = require('express');
const router = express.Router();
const patientController = require('../controllers/patientController');
const { body } = require('express-validator');
const { isAuthenticated } = require('../middleware/authMiddleware');


// Registration Route
router.post('/register', [
    body('first_name').notEmpty().withMessage('First name is required.'),
    body('last_name').notEmpty().withMessage('Last name is required.'),
    body('email').isEmail().withMessage('Valid email is required.'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters.'),
    body('phone').optional().isMobilePhone().withMessage('Valid phone number is required.'),
    body('date_of_birth').optional().isDate().withMessage('Valid date of birth is required.'),
    body('gender').optional().isIn(['Male', 'Female', 'Other']).withMessage('Gender must be Male, Female, or Other.'),
    body('address').optional().isString().withMessage('Address must be a string.')
], patientController.register);

// Login Route
router.post('/login', [
    body('email').isEmail().withMessage('Valid email is required.'),
    body('password').notEmpty().withMessage('Password is required.')
], patientController.login);


// Logout Route
router.post('/logout', isAuthenticated, patientController.logout);


// Get Profile Route
router.get('/profile', isAuthenticated, patientController.getProfile);

// Update Profile Route
router.put('/profile', isAuthenticated, [
    body('first_name').optional().notEmpty().withMessage('First name cannot be empty.'),
    body('last_name').optional().notEmpty().withMessage('Last name cannot be empty.'),
    body('phone').optional().isMobilePhone().withMessage('Valid phone number is required.'),
    body('date_of_birth').optional().isDate().withMessage('Valid date of birth is required.'),
    body('gender').optional().isIn(['Male', 'Female', 'Other']).withMessage('Gender must be Male, Female, or Other.'),
    body('address').optional().isString().withMessage('Address must be a string.')
], patientController.updateProfile);


// Delete Account Route
router.delete('/profile', isAuthenticated, patientController.deleteAccount);


// Export the router
module.exports = router;
