// controllers/appointmentController.js
const pool = require('../config/db');

// Book an Appointment
const bookAppointment = async (req, res) => {
    const { doctor_id, appointment_date, appointment_time } = req.body;
    const patient_id = req.session.patient?.id; // Assuming session stores patient ID

    if (!doctor_id || !appointment_date || !appointment_time) {
        return res.status(400).json({ error: 'All fields are required' });
    }

    try {
        // Check if doctor exists
        const [doctors] = await pool.query('SELECT * FROM Doctors WHERE id = ?', [doctor_id]);
        if (doctors.length === 0) {
            return res.status(404).json({ error: 'Doctor not found' });
        }

        // Insert appointment into the database
        const [result] = await pool.query(
            'INSERT INTO Appointments (patient_id, doctor_id, appointment_date, appointment_time, status) VALUES (?, ?, ?, ?, ?)',
            [patient_id, doctor_id, appointment_date, appointment_time, 'scheduled']
        );

        res.status(201).json({ message: 'Appointment booked successfully!', id: result.insertId });
    } catch (error) {
        console.error('Error booking appointment:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

// Get Patient's Appointments
const getMyAppointments = async (req, res) => {
    const patient_id = req.session.patient?.id;

    try {
        const [appointments] = await pool.query(`
            SELECT Appointments.id, Doctors.first_name AS doctor_first_name, Doctors.last_name AS doctor_last_name,
                   Appointments.appointment_date, Appointments.appointment_time, Appointments.status
            FROM Appointments
            JOIN Doctors ON Appointments.doctor_id = Doctors.id
            WHERE Appointments.patient_id = ?
            ORDER BY Appointments.appointment_date DESC, Appointments.appointment_time DESC
        `, [patient_id]);

        res.json(appointments);
    } catch (error) {
        console.error('Error fetching appointments:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

// Update Appointment
const updateAppointment = async (req, res) => {
    const { id } = req.params;
    const { appointment_date, appointment_time } = req.body;
    const patient_id = req.session.patient?.id;

    if (!appointment_date || !appointment_time) {
        return res.status(400).json({ error: 'Appointment date and time are required' });
    }

    try {
        const [appointments] = await pool.query('SELECT * FROM Appointments WHERE id = ? AND patient_id = ?', [id, patient_id]);
        if (appointments.length === 0) {
            return res.status(404).json({ error: 'Appointment not found' });
        }

        await pool.query(
            'UPDATE Appointments SET appointment_date = ?, appointment_time = ? WHERE id = ?',
            [appointment_date, appointment_time, id]
        );

        res.json({ message: 'Appointment updated successfully' });
    } catch (error) {
        console.error('Error updating appointment:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

// Cancel Appointment
const cancelAppointment = async (req, res) => {
    const { id } = req.params;
    const patient_id = req.session.patient?.id;

    try {
        const [appointments] = await pool.query('SELECT * FROM Appointments WHERE id = ? AND patient_id = ?', [id, patient_id]);
        if (appointments.length === 0) {
            return res.status(404).json({ error: 'Appointment not found' });
        }

        await pool.query('UPDATE Appointments SET status = ? WHERE id = ?', ['canceled', id]);
        res.json({ message: 'Appointment canceled successfully' });
    } catch (error) {
        console.error('Error canceling appointment:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

module.exports = {
    bookAppointment,
    getMyAppointments,
    updateAppointment,
    cancelAppointment
};
