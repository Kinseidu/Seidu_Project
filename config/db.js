// C:\Users\KAD DIGITALS\Desktop\My_backend\telemedicine-backend\config\db.js

const mysql = require('mysql2/promise'); // Use promise-based API
require('dotenv').config(); // Load environment variables

const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '1017Kinasua@',
    database: process.env.DB_NAME || 'telemedicine_db',
    connectionLimit: 10,
    connectTimeout: 30000, // Set connection timeout
});

// Function to test database connection
async function testConnection() {
    try {
        const connection = await pool.getConnection();
        const [rows] = await connection.query('SELECT 1 + 1 AS solution');
        console.log('Database connection successful. Result:', rows[0].solution);
        connection.release(); // Release the connection back to the pool
    } catch (err) {
        console.error('Database connection failed:', err);
    }
}

// Call the test function
testConnection();

module.exports = pool; // Export the pool for use in other files
