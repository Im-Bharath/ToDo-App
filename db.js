// db.js

const mysql = require('mysql2/promise');

// Create a connection pool
const dbConnection = mysql.createPool({
  host: 'localhost', // Change to your MySQL server host
  user: 'bharath', // Change to your MySQL username
  password: 'root', // Change to your MySQL password
  database: 'to_do',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0, 
  // Change to your MySQL database name
});

// Export the pool to be used in other parts of your application
module.exports = dbConnection;
