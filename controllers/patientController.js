// controllers/patientController.js

const pool = require('../config/db');
const bcrypt = require('bcrypt');
const { validationResult } = require('express-validator');

// Register a new patient
exports.register = async (req, res) => {
    console.log('Register endpoint hit');
    
    // Normalize gender input
    if (req.body.gender) {
        req.body.gender = req.body.gender.toLowerCase(); // Normalize to lowercase
    }

    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { first_name, last_name, email, password, phone, date_of_birth, gender, address } = req.body;

    try {
        // Check if email already exists
        const [existingUser] = await pool.query('SELECT id FROM Patients WHERE email = ?', [email]);
        if (existingUser.length > 0) {
            return res.status(409).json({ message: 'Email already in use.' });
        }

        // Hash the password
        const saltRounds = 10;
        const password_hash = await bcrypt.hash(password, saltRounds);

        // Insert patient into the database
        const [result] = await pool.query(
            `INSERT INTO Patients 
            (first_name, last_name, email, password_hash, phone, date_of_birth, gender, address)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [first_name, last_name, email, password_hash, phone, date_of_birth, gender, address]
        );

        res.status(201).json({ message: 'Patient registered successfully.', patientId: result.insertId });
    } catch (error) {
        console.error('Error during registration:', error);
        res.status(500).json({ message: 'Internal server error.', error: error.message });
    }
};

// Login Function
exports.login = async (req, res) => {
    const { email, password } = req.body;

    try {
        const [rows] = await pool.query('SELECT * FROM Patients WHERE email = ?', [email]);
        if (rows.length === 0) {
            return res.status(401).json({ message: 'Invalid email or password.' });
        }

        const patient = rows[0];
        const match = await bcrypt.compare(password, patient.password_hash);
        if (!match) {
            return res.status(401).json({ message: 'Invalid email or password.' });
        }

        req.session.patient = { 
            id: patient.id, 
            email: patient.email, 
            first_name: patient.first_name, 
            last_name: patient.last_name 
        };

        console.log('User logged in:', req.session.patient);
        return res.json({ message: 'Login successful!' });
    } catch (error) {
        console.error('Error during login:', error);
        return res.status(500).json({ message: 'Internal server error.', error: error.message });
    }
};

// Get Patient Profile
exports.getProfile = async (req, res) => {
    const patientId = req.session.patient.id;

    try {
        const [users] = await pool.execute(
            'SELECT id, first_name, last_name, email, phone, date_of_birth, gender, address FROM Patients WHERE id = ?',
            [patientId]
        );

        if (users.length === 0) {
            return res.status(404).json({ message: 'Patient not found.' });
        }

        res.status(200).json({ profile: users[0] });
    } catch (error) {
        console.error('Error fetching profile:', error);
        res.status(500).json({ message: 'Internal server error.' });
    }
};



// Update Patient Profile
exports.updateProfile = async (req, res) => {
    const patientId = req.session.patient?.id;
    if (!patientId) {
        console.error('No patient ID found in session.');
        return res.status(401).json({ message: 'Unauthorized' });
    }

    // Destructure values and use default values where necessary
    const { 
        first_name, 
        last_name, 
        phone, 
        date_of_birth, 
        gender = 'Other',  // Default value for gender
        address 
    } = req.body;

    // Construct the values array, using defaults where necessary
    const values = [
        first_name !== undefined ? first_name : null,
        last_name !== undefined ? last_name : null,
        phone !== undefined ? phone : null,
        date_of_birth !== undefined ? date_of_birth : null,
        gender,  // Ensure gender has a default
        address !== undefined ? address : null,
        patientId
    ];

    try {
        const [result] = await pool.execute(
            'UPDATE Patients SET first_name = ?, last_name = ?, phone = ?, date_of_birth = ?, gender = ?, address = ? WHERE id = ?',
            values
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Patient not found.' });
        }

        return res.json({ message: 'Profile updated successfully.' });
    } catch (error) {
        console.error('Error during profile update:', error);
        return res.status(500).json({ message: 'Internal server error.', error: error.message });
    }
};




















   

// Delete Patient Account
exports.deleteAccount = async (req, res) => {
    const patientId = req.session.patient.id;

    try {
        await pool.execute('DELETE FROM Patients WHERE id = ?', [patientId]);

        req.session.destroy(err => {
            if (err) {
                console.error('Session destruction error:', err);
                return res.status(500).json({ message: 'Could not delete account. Please try again.' });
            }
            res.clearCookie('session_cookie_name');
            res.status(200).json({ message: 'Account deleted successfully.' });
        });
    } catch (error) {
        console.error('Error deleting account:', error);
        res.status(500).json({ message: 'Internal server error.' });
    }
};

// Logout Function
exports.logout = (req, res) => {
    console.log('Logout route hit. Current session:', req.session);
    if (!req.session.patient) {
        console.log('No active session found.');
        return res.status(401).json({ message: 'Unauthorized: No active session found.' });
    }

    req.session.destroy(err => {
        if (err) {
            console.error('Session destruction error:', err);
            return res.status(500).json({ message: 'Could not log out.' });
        }
        res.clearCookie('session_cookie_name');
        res.status(200).json({ message: 'Logout successful.' });
    });
};
