const express = require('express');
const router = express.Router();
const db = require('../config/db');

// Book an appointment
router.post('/', async (req, res) => {
    const { patient_id, doctor_id, appointment_date, appointment_time } = req.body;

    try {
        const [result] = await db.execute('INSERT INTO Appointments (patient_id, doctor_id, appointment_date, appointment_time, status) VALUES (?, ?, ?, ?, ?)', 
        [patient_id, doctor_id, appointment_date, appointment_time, 'scheduled']);
        res.status(201).json({ message: 'Appointment booked successfully!', id: result.insertId });
    } catch (error) {
        res.status(500).json({ error: 'Booking failed' });
    }
});

// List upcoming appointments for a patient
router.get('/:patient_id', async (req, res) => {
    const { patient_id } = req.params;

    try {
        const [rows] = await db.execute('SELECT * FROM Appointments WHERE patient_id = ? AND status = ?', [patient_id, 'scheduled']);
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: 'Failed to retrieve appointments' });
    }
});

// Cancel appointment
router.delete('/:id', async (req, res) => {
    const { id } = req.params;

    try {
        await db.execute('UPDATE Appointments SET status = ? WHERE id = ?', ['canceled', id]);
        res.status(200).json({ message: 'Appointment canceled successfully!' });
    } catch (error) {
        res.status(500).json({ error: 'Cancellation failed' });
    }
});

module.exports = router;
