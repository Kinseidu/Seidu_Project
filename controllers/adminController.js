const bcrypt = require('bcryptjs');
const pool = require('../config/db');

// Register Admin
const registerAdmin = async (req, res) => {
    const { username, password, role } = req.body;

    if (!username || !password || !role) {
        return res.status(400).json({ error: 'All fields are required' });
    }

    try {
        const [existingAdmin] = await pool.query('SELECT * FROM Admin WHERE username = ?', [username]);
        if (existingAdmin.length > 0) {
            return res.status(409).json({ error: 'Username already in use' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const [result] = await pool.query(
            'INSERT INTO Admin (username, password_hash, role) VALUES (?, ?, ?)',
            [username, hashedPassword, role]
        );

        res.status(201).json({ message: 'Admin registered successfully!', adminId: result.insertId });
    } catch (error) {
        console.error('Error registering admin:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

// Login Admin
const loginAdmin = async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ error: 'Username and password are required' });
    }

    try {
        const [admins] = await pool.query('SELECT * FROM Admin WHERE username = ?', [username]);
        if (admins.length === 0) {
            return res.status(401).json({ error: 'Invalid username or password' });
        }

        const admin = admins[0];
        const isMatch = await bcrypt.compare(password, admin.password_hash);
        if (!isMatch) {
            return res.status(401).json({ error: 'Invalid username or password' });
        }

        req.session.adminId = admin.id;
        console.log('Admin logged in, session data:', req.session);
        res.json({ message: 'Admin login successful' });
    } catch (error) {
        console.error('Error logging in admin:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

// Get All Patients (Admin Only)
const getAllPatients = async (req, res) => {
    try {
        const [patients] = await pool.query(
            'SELECT id, first_name, last_name, email, phone, date_of_birth, gender, address FROM Patients'
        );
        res.json(patients);
    } catch (error) {
        console.error('Error fetching patients:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

// Get All Appointments (Admin Only)
const getAllAppointments = async (req, res) => {
    try {
        const [appointments] = await pool.query(`
            SELECT Appointments.id, Patients.first_name AS patient_first_name, Patients.last_name AS patient_last_name,
                   Doctors.first_name AS doctor_first_name, Doctors.last_name AS doctor_last_name,
                   Appointments.appointment_date, Appointments.appointment_time, Appointments.status
            FROM Appointments
            JOIN Patients ON Appointments.patient_id = Patients.id
            JOIN Doctors ON Appointments.doctor_id = Doctors.id
        `);
        res.json(appointments);
    } catch (error) {
        console.error('Error fetching appointments:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

// Logout Admin
const logoutAdmin = (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).json({ error: 'Could not log out. Please try again.' });
        }
        res.json({ message: 'Admin logout successful' });
    });
};

// Delete Patient by Admin
const deletePatientByAdmin = async (req, res) => {
    const patientId = req.params.id;

    try {
        const [result] = await pool.query('DELETE FROM Patients WHERE id = ?', [patientId]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Patient not found' });
        }

        res.json({ message: 'Patient deleted successfully' });
    } catch (error) {
        console.error('Error deleting patient:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

module.exports = {
    registerAdmin,
    loginAdmin,
    getAllPatients,
    getAllAppointments,
    deletePatientByAdmin,
    logoutAdmin
};
