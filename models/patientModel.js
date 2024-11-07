// controllers/patientController.js
const pool = require('../config/db'); // Ensure the path is correct
const bcrypt = require('bcrypt');
const { validationResult } = require('express-validator');

// Register a new patient
exports.register = async (req, res) => {
    // Validate Request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { first_name, last_name, email, password, phone, date_of_birth, gender, address } = req.body;

    try {
        // Check if email already exists
        const [existingUser] = await pool.execute('SELECT id FROM Patients WHERE email = ?', [email]);
        if (existingUser.length > 0) {
            return res.status(409).json({ message: 'Email already in use.' });
        }

        // Hash the password
        const saltRounds = 10;
        const password_hash = await bcrypt.hash(password, saltRounds);

        // Insert patient into the database
        const [result] = await pool.execute(
            `INSERT INTO Patients 
            (first_name, last_name, email, password_hash, phone, date_of_birth, gender, address)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [first_name, last_name, email, password_hash, phone, date_of_birth, gender, address]
        );

        res.status(201).json({ message: 'Patient registered successfully.', patientId: result.insertId });
    } catch (error) {
        console.error('Error registering patient:', error);
        res.status(500).json({ message: 'Internal server error.' });
    }
};

// Additional Controller Methods (login, profile, etc.) can be added here
