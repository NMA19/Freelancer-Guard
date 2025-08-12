const mysql = require("mysql2/promise");
require("dotenv").config();

// Database configuration - Update these with your PHP admin database credentials
const dbConfig = {
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root", // Your PHP admin database username
  password: process.env.DB_PASS || "", // Your PHP admin database password
  database: process.env.DB_NAME || "freelancer_guard", // Your PHP admin database name
  port: process.env.DB_PORT || 3306,
  charset: "utf8mb4",
  timezone: "+00:00"
};

// Create connection pool for better performance
const pool = mysql.createPool({
  ...dbConfig,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Test database connection
async function testConnection() {
  try {
    const connection = await pool.getConnection();
    console.log("✅ Database connected successfully!");
    
    // Test if the tables exist, if not, create them
    await createTablesIfNotExist(connection);
    
    connection.release();
  } catch (error) {
    console.error("❌ Database connection failed:", error.message);
    console.log("📝 Make sure your PHP admin database credentials are correct");
    console.log("📝 Update the database credentials in Backend/.env file");
  }
}

// Create tables if they don't exist (to match your PHP admin structure)
async function createTablesIfNotExist(connection) {
  try {
    // Users table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // Experiences table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS experiences (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(200) NOT NULL,
        description TEXT NOT NULL,
        client_name VARCHAR(100),
        project_value DECIMAL(10,2),
        category VARCHAR(50),
        rating INT CHECK (rating >= 1 AND rating <= 5),
        user_id INT,
        username VARCHAR(50),
        upvotes INT DEFAULT 0,
        downvotes INT DEFAULT 0,
        comment_count INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
      )
    `);

    // Votes table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS votes (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        target_id INT NOT NULL,
        target_type ENUM('experience', 'comment') NOT NULL,
        vote_type ENUM('up', 'down') NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE KEY unique_vote (user_id, target_id, target_type),
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    // Comments table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS comments (
        id INT AUTO_INCREMENT PRIMARY KEY,
        experience_id INT NOT NULL,
        user_id INT NOT NULL,
        content TEXT NOT NULL,
        upvotes INT DEFAULT 0,
        downvotes INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (experience_id) REFERENCES experiences(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    console.log("✅ Database tables verified/created successfully!");
  } catch (error) {
    console.error("❌ Error creating tables:", error.message);
  }
}

// Helper function to update vote counts
async function updateVoteCounts(experienceId) {
  try {
    const [upvotes] = await pool.execute(
      "SELECT COUNT(*) as count FROM votes WHERE target_id = ? AND target_type = 'experience' AND vote_type = 'up'",
      [experienceId]
    );
    
    const [downvotes] = await pool.execute(
      "SELECT COUNT(*) as count FROM votes WHERE target_id = ? AND target_type = 'experience' AND vote_type = 'down'",
      [experienceId]
    );

    await pool.execute(
      "UPDATE experiences SET upvotes = ?, downvotes = ? WHERE id = ?",
      [upvotes[0].count, downvotes[0].count, experienceId]
    );
  } catch (error) {
    console.error("Error updating vote counts:", error);
  }
}

// Helper function to update comment counts
async function updateCommentCounts(experienceId) {
  try {
    const [result] = await pool.execute(
      "SELECT COUNT(*) as count FROM comments WHERE experience_id = ?",
      [experienceId]
    );

    await pool.execute(
      "UPDATE experiences SET comment_count = ? WHERE id = ?",
      [result[0].count, experienceId]
    );
  } catch (error) {
    console.error("Error updating comment counts:", error);
  }
}

// Export the pool and helper functions
module.exports = {
  pool,
  query: (sql, params) => pool.execute(sql, params),
  testConnection,
  updateVoteCounts,
  updateCommentCounts
};
