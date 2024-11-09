const express = require('express');
const session = require('express-session');
const MySQLStore = require('express-mysql-session')(session);
const dotenv = require('dotenv');
const patientRoutes = require('./routes/patientRoutes');
const doctorRoutes = require('./routes/doctorRoutes'); // Import doctor routes
const adminRoutes = require('./routes/adminRoutes');  // Import admin routes
const morgan = require('morgan');
const helmet = require('helmet');
const cors = require('cors');
const pool = require('./config/db'); // Ensure your MySQL pool is correctly set up
const appointmentRoutes = require('./routes/appointmentRoutes'); 

dotenv.config();

const app = express();
const PORT = process.env.PORT || 7000; // Default to 7000

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({
    origin: 'http://localhost:3000', // Update to your frontend's URL (this should point to your frontend)
    credentials: true // Allow cookies to be sent
}));
app.use(morgan('dev'));
app.use(helmet());

// Session Store Configuration
const sessionStore = new MySQLStore({}, pool); // Use the pool instead of creating a new connection

// Session Configuration
app.use(session({
    key: 'session_cookie_name',
    secret: process.env.SESSION_SECRET || 'yourSecretKey', // Use a strong secret and store it in .env
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
        secure: false, // Set to true if using HTTPS
        httpOnly: true,
        sameSite: 'lax' // Adjust as needed
    }
}));

// Patient Routes
app.use('/api/patients', patientRoutes);

// Doctor Routes
app.use('/api/doctor', doctorRoutes); // Set up doctor routes with '/api/doctor' prefix

// Admin Routes
app.use('/api/admin', adminRoutes); // Use the correct adminRoutes

app.use('/api/appointments', appointmentRoutes);

// Basic Routes
app.get('/', (req, res) => {
    res.send('Server is running.');
});

app.get('/health', (req, res) => {
    res.status(200).json({ message: 'Server is healthy.' });
});




// Error Handling Middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Something went wrong!' });
});

// Start Server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
