// routes/doctorRoutes.js

const express = require('express');
const router = express.Router();
const doctorController = require('../controllers/doctorController');
const { body } = require('express-validator');
const { isAuthenticated } = require('../middleware/authMiddleware');


 


// Doctor Login Route
router.post('/login', doctorController.loginDoctor);


// Get All Doctors Route
router.get('/', isAuthenticated, doctorController.getAllDoctors);

// Get Doctsor by ID Route
router.get('/:id', doctorController.getDoctorById);

// doctorRoutes.js
router.get('/:id', (req, res, next) => {
    console.log("getDoctorById route hit with ID:", req.params.id); // Log to confirm route is accessed
    next();
}, doctorController.getDoctorById);





//create new doctor
router.post(
    '/',
    [
        body('first_name').notEmpty().withMessage('First name is required.'),
        body('last_name').notEmpty().withMessage('Last name is required.'),
        body('specialization').notEmpty().withMessage('Specialization is required.'),
        body('email').isEmail().withMessage('Valid email is required.'),
        body('phone').optional().isMobilePhone().withMessage('Valid phone number is required.'),
        body('schedule').notEmpty().withMessage('Schedule is required.')
    ],
    doctorController.createDoctor
);





// Update Doctor Route
router.put(
    '/:id',
    isAuthenticated,
    [
        body('first_name').optional().notEmpty().withMessage('First name cannot be empty.'),
        body('last_name').optional().notEmpty().withMessage('Last name cannot be empty.'),
        body('specialization').optional().notEmpty().withMessage('Specialization is required.'),
        body('email').optional().isEmail().withMessage('Valid email is required.'),
        body('phone').optional().isMobilePhone().withMessage('Valid phone number is required.'),
        body('schedule').optional().notEmpty().withMessage('Schedule is required.')
    ],
    doctorController.updateDoctor
);

// Delete Doctor Route
router.delete('/:id', isAuthenticated, doctorController.deleteDoctor);

module.exports = router;
