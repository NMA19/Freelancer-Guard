const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');
require('dotenv').config();

const app = express();

// Enable CORS for all origins
app.use(cors());

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Database connection configuration for phpMyAdmin
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASS || '',
  database: process.env.DB_NAME || 'freelancer_guard',
  port: process.env.DB_PORT || 3306
};

// Create connection pool
const pool = mysql.createPool({
  ...dbConfig,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Test database connection and create tables
async function initializeDatabase() {
  try {
    const connection = await pool.getConnection();
    console.log('✅ Connected to phpMyAdmin database successfully!');
    
    // Create database if it doesn't exist
    await connection.execute(`CREATE DATABASE IF NOT EXISTS ${dbConfig.database}`);
    console.log(`✅ Database '${dbConfig.database}' ready`);
    
    // Use the database
    await connection.execute(`USE ${dbConfig.database}`);
    
    // Create experiences table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS experiences (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        category VARCHAR(100) DEFAULT 'General',
        client_name VARCHAR(255) DEFAULT 'Unknown Client',
        rating INT DEFAULT 3 CHECK (rating >= 1 AND rating <= 5),
        project_value DECIMAL(10,2) DEFAULT 0.00,
        upvotes INT DEFAULT 0,
        downvotes INT DEFAULT 0,
        comment_count INT DEFAULT 0,
        username VARCHAR(100) DEFAULT 'freelancer_user',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    
    // Create users table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(100) UNIQUE NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Create votes table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS votes (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT DEFAULT 1,
        experience_id INT NOT NULL,
        vote_type ENUM('up', 'down') NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (experience_id) REFERENCES experiences(id) ON DELETE CASCADE
      )
    `);
    
    // Create comments table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS comments (
        id INT AUTO_INCREMENT PRIMARY KEY,
        experience_id INT NOT NULL,
        user_id INT DEFAULT 1,
        content TEXT NOT NULL,
        username VARCHAR(100) DEFAULT 'user',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (experience_id) REFERENCES experiences(id) ON DELETE CASCADE
      )
    `);
    
    console.log('✅ All tables created successfully! You can now view them in phpMyAdmin');
    
    // Insert sample data if table is empty
    const [rows] = await connection.execute('SELECT COUNT(*) as count FROM experiences');
    if (rows[0].count === 0) {
      await connection.execute(`
        INSERT INTO experiences (title, description, category, client_name, rating, project_value, upvotes, downvotes, comment_count, username) 
        VALUES 
        ('Excellent Website Development', 'Client was very professional and payments were made on time. Great communication throughout the project.', 'Web Development', 'TechCorp Solutions', 5, 2500.00, 12, 1, 3, 'freelancer_pro'),
        ('Mobile App Project', 'Smooth project execution with clear requirements. Client was responsive and appreciative of the work delivered.', 'Mobile Development', 'StartupXYZ', 4, 3500.00, 8, 2, 5, 'app_developer'),
        ('Logo Design Work', 'Creative freedom was given and the client loved the final designs. Quick approval process.', 'Design', 'Creative Agency', 5, 800.00, 15, 0, 2, 'designer_pro')
      `);
      console.log('✅ Sample data inserted for demonstration');
    }
    
    connection.release();
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    console.log('📝 Please check your phpMyAdmin database credentials in .env file');
    console.log('📝 Make sure XAMPP/WAMP/MAMP is running with MySQL service');
  }
}

// Initialize database on startup
initializeDatabase();

// API Routes

// Get all experiences
app.get('/api/experiences', async (req, res) => {
  try {
    console.log('📋 Fetching experiences from database...');
    const [rows] = await pool.execute(`
      SELECT * FROM experiences 
      ORDER BY created_at DESC
    `);
    
    console.log(`✅ Found ${rows.length} experiences`);
    res.json({ experiences: rows });
  } catch (error) {
    console.error('❌ Error fetching experiences:', error);
    res.status(500).json({ error: 'Failed to fetch experiences' });
  }
});

// Add new experience
app.post('/api/experiences', async (req, res) => {
  try {
    console.log('📝 Adding new experience...');
    console.log('📝 Request body:', req.body);
    
    const { title, description, category, client_name, rating, project_value } = req.body;
    
    // Validation
    if (!title || title.trim() === '') {
      return res.status(400).json({ error: 'Title is required', success: false });
    }
    
    if (!description || description.trim() === '') {
      return res.status(400).json({ error: 'Description is required', success: false });
    }
    
    // Insert into database
    const [result] = await pool.execute(`
      INSERT INTO experiences (title, description, category, client_name, rating, project_value, username, upvotes, downvotes, comment_count) 
      VALUES (?, ?, ?, ?, ?, ?, ?, 0, 0, 0)
    `, [
      title.trim(),
      description.trim(),
      category || 'General',
      client_name || 'Unknown Client',
      parseInt(rating) || 3,
      parseFloat(project_value) || 0,
      'freelancer_user'
    ]);
    
    console.log(`✅ Experience added with ID: ${result.insertId}`);
    
    res.json({ 
      message: 'Experience added successfully!', 
      success: true,
      experienceId: result.insertId
    });
    
  } catch (error) {
    console.error('❌ Error adding experience:', error);
    res.status(500).json({ error: 'Failed to add experience', success: false });
  }
});

// Vote on experience
app.post('/api/experiences/:id/vote', async (req, res) => {
  try {
    const experienceId = parseInt(req.params.id);
    const { voteType } = req.body;
    
    console.log(`🗳️ Voting ${voteType} for experience ${experienceId}`);
    
    if (!['up', 'down'].includes(voteType)) {
      return res.status(400).json({ error: 'Invalid vote type' });
    }
    
    // Insert vote record
    await pool.execute(`
      INSERT INTO votes (experience_id, vote_type) VALUES (?, ?)
    `, [experienceId, voteType]);
    
    // Update experience vote counts
    if (voteType === 'up') {
      await pool.execute(`
        UPDATE experiences SET upvotes = upvotes + 1 WHERE id = ?
      `, [experienceId]);
    } else {
      await pool.execute(`
        UPDATE experiences SET downvotes = downvotes + 1 WHERE id = ?
      `, [experienceId]);
    }
    
    // Get updated counts
    const [rows] = await pool.execute(`
      SELECT upvotes, downvotes FROM experiences WHERE id = ?
    `, [experienceId]);
    
    console.log(`✅ Vote recorded. New counts: ${rows[0].upvotes} up, ${rows[0].downvotes} down`);
    
    res.json({ 
      success: true, 
      upvotes: rows[0].upvotes, 
      downvotes: rows[0].downvotes 
    });
    
  } catch (error) {
    console.error('❌ Error recording vote:', error);
    res.status(500).json({ error: 'Failed to record vote' });
  }
});

// Add comment to experience
app.post('/api/experiences/:id/comments', async (req, res) => {
  try {
    const experienceId = parseInt(req.params.id);
    const { content } = req.body;
    
    console.log(`💬 Adding comment to experience ${experienceId}`);
    
    if (!content || content.trim() === '') {
      return res.status(400).json({ error: 'Comment content is required' });
    }
    
    // Insert comment
    await pool.execute(`
      INSERT INTO comments (experience_id, content, username) VALUES (?, ?, ?)
    `, [experienceId, content.trim(), 'anonymous_user']);
    
    // Update comment count
    await pool.execute(`
      UPDATE experiences SET comment_count = comment_count + 1 WHERE id = ?
    `, [experienceId]);
    
    // Get updated count
    const [rows] = await pool.execute(`
      SELECT comment_count FROM experiences WHERE id = ?
    `, [experienceId]);
    
    console.log(`✅ Comment added. New count: ${rows[0].comment_count}`);
    
    res.json({ 
      success: true, 
      message: 'Comment added successfully',
      comment_count: rows[0].comment_count 
    });
    
  } catch (error) {
    console.error('❌ Error adding comment:', error);
    res.status(500).json({ error: 'Failed to add comment' });
  }
});

// Get comments for experience
app.get('/api/experiences/:id/comments', async (req, res) => {
  try {
    const experienceId = parseInt(req.params.id);
    
    const [rows] = await pool.execute(`
      SELECT * FROM comments WHERE experience_id = ? ORDER BY created_at DESC
    `, [experienceId]);
    
    res.json({ comments: rows });
    
  } catch (error) {
    console.error('❌ Error fetching comments:', error);
    res.status(500).json({ error: 'Failed to fetch comments' });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'FreelancerGuard API is running',
    database: 'Connected to phpMyAdmin MySQL',
    timestamp: new Date().toISOString()
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 FreelancerGuard API server running on port ${PORT}`);
  console.log(`✅ Ready to connect with phpMyAdmin database`);
  console.log(`📊 Access phpMyAdmin at: http://localhost/phpmyadmin`);
  console.log(`🔗 API Health Check: http://localhost:${PORT}/api/health`);
});
