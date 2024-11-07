// controllers/doctorController.js

const pool = require('../config/db');
const { validationResult } = require('express-validator');
const bcrypt = require('bcrypt');

// Doctor Login
const loginDoctor = async (req, res) => {
    const { email, password } = req.body;

    try {
        const [rows] = await pool.query('SELECT * FROM Doctors WHERE email = ?', [email]);

        if (rows.length === 0) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const doctor = rows[0];
        const match = await bcrypt.compare(password, doctor.password_hash);

        if (!match) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        req.session.doctor = { id: doctor.id, email: doctor.email };
        res.json({ message: 'Logged in successfully!' });
    } catch (error) {
        console.error('Error logging in doctor:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

// Get All Doctors
const getAllDoctors = async (req, res) => {
    try {
        const [doctors] = await pool.query(
            'SELECT id, first_name, last_name, specialization, email, phone, schedule FROM Doctors'
        );
        res.json(doctors);
    } catch (error) {
        console.error('Error fetching all doctors:', error);
        res.status(500).json({ error: 'Server error while fetching doctors' });
    }
};















// Get Doctor by ID
const getDoctorById = async (req, res) => {
    console.log('getDoctorById called');  // <-- Add this line for debugging
    const { id } = req.params;
    try {
        const [doctors] = await pool.query(
            'SELECT id, first_name, last_name, specialization, email, phone, schedule FROM Doctors WHERE id = ?',
            [id]
        );
        if (doctors.length === 0) {
            return res.status(404).json({ error: 'Doctor not found' });
        }
        res.json(doctors[0]);
    } catch (error) {
        console.error('Error fetching doctor by ID:', error);
        res.status(500).json({ error: 'Server error while fetching doctor' });
    }
};





// Create New Doctor function
const createDoctor = async (req, res) => {
    const { first_name, last_name, specialization, email, phone, schedule } = req.body;

    // Validation
    if (!first_name || !last_name || !specialization || !email || !schedule) {
        return res.status(400).json({ message: 'All required fields must be provided.' });
    }

    try {
        // Insert into the database
        const [result] = await pool.query(
            'INSERT INTO Doctors (first_name, last_name, specialization, email, phone, schedule) VALUES (?, ?, ?, ?, ?, ?)',
            [first_name, last_name, specialization, email, phone, schedule]
        );

        // Send the response
        res.status(201).json({
            message: 'Doctor created successfully!',
            doctorId: result.insertId
        });
    } catch (error) {
        console.error('Error creating doctor:', error);
        res.status(500).json({ message: 'Internal server error.', error: error.message });
    }
};





// Update Doctor
const updateDoctor = async (req, res) => {
    const { id } = req.params;
    const { first_name, last_name, specialization, email, phone, schedule } = req.body;

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const [doctors] = await pool.query('SELECT * FROM Doctors WHERE id = ?', [id]);
        if (doctors.length === 0) {
            return res.status(404).json({ error: 'Doctor not found' });
        }

        await pool.query(
            'UPDATE Doctors SET first_name = ?, last_name = ?, specialization = ?, email = ?, phone = ?, schedule = ? WHERE id = ?',
            [first_name, last_name, specialization, email, phone, JSON.stringify(schedule), id]
        );

        res.json({ message: 'Doctor updated successfully' });
    } catch (error) {
        console.error('Error updating doctor:', error);
        res.status(500).json({ error: 'Server error while updating doctor' });
    }
};

// Delete Doctor
const deleteDoctor = async (req, res) => {
    const { id } = req.params;

    try {
        const [doctors] = await pool.query('SELECT * FROM Doctors WHERE id = ?', [id]);
        if (doctors.length === 0) {
            return res.status(404).json({ error: 'Doctor not found' });
        }

        await pool.query('DELETE FROM Doctors WHERE id = ?', [id]);
        res.json({ message: 'Doctor deleted successfully' });
    } catch (error) {
        console.error('Error deleting doctor:', error);
        res.status(500).json({ error: 'Server error while deleting doctor' });
    }
};

// Export all methods
module.exports = {
    loginDoctor,
    getAllDoctors,
    getDoctorById,
    createDoctor,
    updateDoctor,
    deleteDoctor,
};