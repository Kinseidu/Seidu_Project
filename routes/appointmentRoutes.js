const express = require('express');
const router = express.Router();
const appointmentController = require('../controllers/appointmentController');

// Book an appointment
router.post('/', appointmentController.bookAppointment);

// Update an appointment
router.patch('/:id', appointmentController.updateAppointment);

// List upcoming appointments for a patient
router.get('/:patient_id', appointmentController.getMyAppointments);

// Cancel an appointment
router.delete('/:id', appointmentController.cancelAppointment);

module.exports = router;
