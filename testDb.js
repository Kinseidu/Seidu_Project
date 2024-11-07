// testDb.js

const db = require('./config/db'); // Ensure this path is correct

// Test database connection
const testDatabaseConnection = async () => {
    try {
        // Execute a simple query to test the connection
        const [rows] = await db.query('SELECT 1 + 1 AS solution');
        console.log('Database connection successful. Result:', rows[0].solution);
    } catch (err) {
        console.error('Database connection failed:', err);
    }
};

// Call the function to test the connection
testDatabaseConnection();
