const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Enhanced CORS middleware
app.use(cors({
  origin: ['http://localhost:5173', 'http://127.0.0.1:5173', 'http://localhost:3000'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));
app.use(express.json());

// Database configuration
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASS || '',
  database: process.env.DB_NAME || 'freelancer_guard',
  port: process.env.DB_PORT || 3306
};

// Create connection pool for better performance
const pool = mysql.createPool({
  host: dbConfig.host,
  user: dbConfig.user,
  password: dbConfig.password,
  database: dbConfig.database,
  port: dbConfig.port,
  waitForConnections: true,
  connectionLimit: 5,
  queueLimit: 0
});

// Initialize database and tables
async function initializeDatabase() {
  try {
    console.log('🔄 Initializing database...');
    
    // Simple connection for database creation
    const simpleConnection = await mysql.createConnection({
      host: dbConfig.host,
      user: dbConfig.user,
      password: dbConfig.password,
      port: dbConfig.port
    });
    
    // Create database if not exists
    await simpleConnection.query(`CREATE DATABASE IF NOT EXISTS ${dbConfig.database}`);
    console.log(`✅ Database '${dbConfig.database}' ready`);
    await simpleConnection.end();
    
    // Now connect to the specific database
    const connection = await pool.getConnection();
    
    // Drop tables in correct order (child tables first to avoid foreign key constraint errors)
    await connection.query(`SET FOREIGN_KEY_CHECKS = 0`);
    await connection.query(`DROP TABLE IF EXISTS comments`);
    await connection.query(`DROP TABLE IF EXISTS votes`);
    await connection.query(`DROP TABLE IF EXISTS experiences`);
    await connection.query(`SET FOREIGN_KEY_CHECKS = 1`);
    
    // Create experiences table
    await connection.query(`
      CREATE TABLE experiences (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        category VARCHAR(100) NOT NULL DEFAULT 'Other',
        client_name VARCHAR(255),
        rating INT DEFAULT 0,
        project_value DECIMAL(10,2),
        upvotes INT DEFAULT 0,
        downvotes INT DEFAULT 0,
        comment_count INT DEFAULT 0,
        username VARCHAR(100) DEFAULT 'Anonymous',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    
    // Create votes table
    await connection.query(`
      CREATE TABLE votes (
        id INT AUTO_INCREMENT PRIMARY KEY,
        experience_id INT NOT NULL,
        vote_type ENUM('upvote', 'downvote') NOT NULL,
        user_ip VARCHAR(45),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (experience_id) REFERENCES experiences(id) ON DELETE CASCADE
      )
    `);
    
    // Create comments table
    await connection.query(`
      CREATE TABLE comments (
        id INT AUTO_INCREMENT PRIMARY KEY,
        experience_id INT NOT NULL,
        content TEXT NOT NULL,
        username VARCHAR(100) DEFAULT 'Anonymous',
        user_ip VARCHAR(45),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (experience_id) REFERENCES experiences(id) ON DELETE CASCADE
      )
    `);
    
    console.log('✅ Database tables created/verified');
    
    // Start with empty database for fresh testing
    console.log('✅ Database ready for new experiences');
    
    connection.release();
    console.log('✅ Database initialization complete!');
    
  } catch (error) {
    console.error('❌ Database initialization failed:', error.message);
    // Fall back to in-memory storage for development
    console.log('🔄 Falling back to in-memory storage...');
    initInMemoryStorage();
  }
}

// Sample data insertion
async function insertSampleData(connection) {
  const sampleExperiences = [
    {
      title: "Nightmare Client from Hell",
      description: "Client constantly changed requirements, refused to pay for extra work, and demanded impossible deadlines. Ended up working 80+ hour weeks for below minimum wage. Avoid at all costs!",
      category: "Design",
      client_name: "RedFlag Design Co",
      rating: 1,
      project_value: 2500,
      upvotes: 45,
      downvotes: 2,
      comment_count: 12
    },
    {
      title: "Amazing Tech Startup Experience",
      description: "Professional client, clear communication, paid on time, and even gave a bonus for quality work. They understood the development process and were patient with iterations.",
      category: "Web Development",
      client_name: "Innovation Labs",
      rating: 5,
      project_value: 8500,
      upvotes: 67,
      downvotes: 1,
      comment_count: 8
    },
    {
      title: "Red Flag Marketing Agency",
      description: "Promised big budget project but kept reducing scope while maintaining the same unrealistic timeline. Communication was poor and payments were always late.",
      category: "Marketing",
      client_name: "Growth Hackers Inc",
      rating: 2,
      project_value: 3200,
      upvotes: 23,
      downvotes: 5,
      comment_count: 6
    }
  ];

  for (const exp of sampleExperiences) {
    await connection.query(
      `INSERT INTO experiences (title, description, category, client_name, rating, project_value, upvotes, downvotes, comment_count) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [exp.title, exp.description, exp.category, exp.client_name, exp.rating, exp.project_value, exp.upvotes, exp.downvotes, exp.comment_count]
    );
  }
  
  console.log('✅ Sample data inserted');
}

// In-memory storage fallback
let inMemoryExperiences = [];
let inMemoryComments = [];
let inMemoryVotes = [];
let nextId = 1;

function initInMemoryStorage() {
  inMemoryExperiences = [
    {
      id: 1,
      title: "Nightmare Client from Hell",
      description: "Client constantly changed requirements, refused to pay for extra work, and demanded impossible deadlines. Ended up working 80+ hour weeks for below minimum wage. Avoid at all costs!",
      category: "Design",
      client_name: "RedFlag Design Co",
      rating: 1,
      project_value: 2500,
      upvotes: 45,
      downvotes: 2,
      comment_count: 12,
      created_at: new Date().toISOString()
    },
    {
      id: 2,
      title: "Amazing Tech Startup Experience",
      description: "Professional client, clear communication, paid on time, and even gave a bonus for quality work. They understood the development process and were patient with iterations.",
      category: "Web Development",
      client_name: "Innovation Labs",
      rating: 5,
      project_value: 8500,
      upvotes: 67,
      downvotes: 1,
      comment_count: 8,
      created_at: new Date().toISOString()
    },
    {
      id: 3,
      title: "Red Flag Marketing Agency",
      description: "Promised big budget project but kept reducing scope while maintaining the same unrealistic timeline. Communication was poor and payments were always late.",
      category: "Marketing",
      client_name: "Growth Hackers Inc",
      rating: 2,
      project_value: 3200,
      upvotes: 23,
      downvotes: 5,
      comment_count: 6,
      created_at: new Date().toISOString()
    }
  ];
  
  nextId = 4;
  console.log('✅ In-memory storage initialized with sample data');
}

// Database helper functions
async function useDatabase() {
  try {
    const connection = await pool.getConnection();
    connection.release();
    return true;
  } catch {
    return false;
  }
}

// API Routes

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    database: useDatabase() ? 'connected' : 'in-memory'
  });
});

// Get all experiences
app.get('/api/experiences', async (req, res) => {
  console.log('📋 GET /api/experiences - Received request');
  try {
    if (await useDatabase()) {
      const connection = await pool.getConnection();
      const [rows] = await connection.query(
        'SELECT * FROM experiences ORDER BY created_at DESC'
      );
      connection.release();
      res.json(rows);
    } else {
      res.json(inMemoryExperiences.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)));
    }
  } catch (error) {
    console.error('Error fetching experiences:', error);
    res.status(500).json({ error: 'Failed to fetch experiences' });
  }
});

// Create new experience
app.post('/api/experiences', async (req, res) => {
  console.log('📝 POST /api/experiences - Received request');
  console.log('Request body:', req.body);
  try {
    const { title, description, category, client_name, rating, project_value } = req.body;
    
    if (!title || !description) {
      return res.status(400).json({ error: 'Title and description are required' });
    }

    const experienceData = {
      title: title.trim(),
      description: description.trim(),
      category: category || 'Other',
      client_name: client_name?.trim() || null,
      rating: parseInt(rating) || 0,
      project_value: parseFloat(project_value) || null,
      upvotes: 0,
      downvotes: 0,
      comment_count: 0,
      created_at: new Date().toISOString()
    };

    if (await useDatabase()) {
      const connection = await pool.getConnection();
      const [result] = await connection.query(
        `INSERT INTO experiences (title, description, category, client_name, rating, project_value, upvotes, downvotes, comment_count) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [experienceData.title, experienceData.description, experienceData.category, 
         experienceData.client_name, experienceData.rating, experienceData.project_value,
         experienceData.upvotes, experienceData.downvotes, experienceData.comment_count]
      );
      
      const [newExperience] = await connection.query(
        'SELECT * FROM experiences WHERE id = ?',
        [result.insertId]
      );
      connection.release();
      
      res.status(201).json(newExperience[0]);
    } else {
      const newExperience = { ...experienceData, id: nextId++ };
      inMemoryExperiences.unshift(newExperience);
      res.status(201).json(newExperience);
    }
  } catch (error) {
    console.error('Error creating experience:', error);
    res.status(500).json({ error: 'Failed to create experience' });
  }
});

// Vote on experience
app.post('/api/experiences/:id/vote', async (req, res) => {
  try {
    const experienceId = parseInt(req.params.id);
    const { vote_type } = req.body;
    const userIp = req.ip || req.connection.remoteAddress;

    if (!vote_type || !['upvote', 'downvote'].includes(vote_type)) {
      return res.status(400).json({ error: 'Invalid vote type' });
    }

    if (await useDatabase()) {
      const connection = await pool.getConnection();
      
      // Check if user already voted
      const [existingVote] = await connection.query(
        'SELECT * FROM votes WHERE experience_id = ? AND user_ip = ?',
        [experienceId, userIp]
      );

      if (existingVote.length > 0) {
        connection.release();
        return res.status(400).json({ error: 'You have already voted on this experience' });
      }

      // Insert vote
      await connection.query(
        'INSERT INTO votes (experience_id, vote_type, user_ip) VALUES (?, ?, ?)',
        [experienceId, vote_type, userIp]
      );

      // Update experience vote counts
      const voteField = vote_type === 'upvote' ? 'upvotes' : 'downvotes';
      await connection.query(
        `UPDATE experiences SET ${voteField} = ${voteField} + 1 WHERE id = ?`,
        [experienceId]
      );

      // Get updated experience
      const [updatedExp] = await connection.query(
        'SELECT * FROM experiences WHERE id = ?',
        [experienceId]
      );
      
      connection.release();
      
      res.json({ 
        success: true, 
        experience: updatedExp[0],
        upvotes: updatedExp[0].upvotes,
        downvotes: updatedExp[0].downvotes
      });
    } else {
      const experience = inMemoryExperiences.find(exp => exp.id === experienceId);
      if (!experience) {
        return res.status(404).json({ error: 'Experience not found' });
      }

      // Check if user already voted (simplified for in-memory)
      const existingVote = inMemoryVotes.find(vote => 
        vote.experience_id === experienceId && vote.user_ip === userIp
      );

      if (existingVote) {
        return res.status(400).json({ error: 'You have already voted on this experience' });
      }

      // Add vote
      inMemoryVotes.push({
        id: Date.now(),
        experience_id: experienceId,
        vote_type,
        user_ip: userIp,
        created_at: new Date().toISOString()
      });

      // Update vote counts
      if (vote_type === 'upvote') {
        experience.upvotes = (experience.upvotes || 0) + 1;
      } else {
        experience.downvotes = (experience.downvotes || 0) + 1;
      }

      res.json({ 
        success: true, 
        experience,
        upvotes: experience.upvotes,
        downvotes: experience.downvotes
      });
    }
  } catch (error) {
    console.error('Error voting:', error);
    res.status(500).json({ error: 'Failed to record vote' });
  }
});

// Get comments for experience
app.get('/api/experiences/:id/comments', async (req, res) => {
  try {
    const experienceId = parseInt(req.params.id);

    if (await useDatabase()) {
      const connection = await pool.getConnection();
      const [comments] = await connection.query(
        'SELECT * FROM comments WHERE experience_id = ? ORDER BY created_at DESC',
        [experienceId]
      );
      connection.release();
      res.json({ comments });
    } else {
      const comments = inMemoryComments
        .filter(comment => comment.experience_id === experienceId)
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      res.json({ comments });
    }
  } catch (error) {
    console.error('Error fetching comments:', error);
    res.status(500).json({ error: 'Failed to fetch comments' });
  }
});

// Add comment to experience
app.post('/api/experiences/:id/comments', async (req, res) => {
  try {
    const experienceId = parseInt(req.params.id);
    const { content } = req.body;
    const userIp = req.ip || req.connection.remoteAddress;

    if (!content || !content.trim()) {
      return res.status(400).json({ error: 'Comment content is required' });
    }

    const commentData = {
      experience_id: experienceId,
      content: content.trim(),
      username: 'Anonymous',
      user_ip: userIp,
      created_at: new Date().toISOString()
    };

    if (await useDatabase()) {
      const connection = await pool.getConnection();
      
      const [result] = await connection.query(
        'INSERT INTO comments (experience_id, content, username, user_ip) VALUES (?, ?, ?, ?)',
        [commentData.experience_id, commentData.content, commentData.username, commentData.user_ip]
      );

      // Update comment count
      await connection.query(
        'UPDATE experiences SET comment_count = comment_count + 1 WHERE id = ?',
        [experienceId]
      );

      const [newComment] = await connection.query(
        'SELECT * FROM comments WHERE id = ?',
        [result.insertId]
      );
      
      connection.release();
      res.status(201).json({ comment: newComment[0] });
    } else {
      const newComment = { ...commentData, id: Date.now() };
      inMemoryComments.push(newComment);
      
      // Update comment count
      const experience = inMemoryExperiences.find(exp => exp.id === experienceId);
      if (experience) {
        experience.comment_count = (experience.comment_count || 0) + 1;
      }
      
      res.status(201).json({ comment: newComment });
    }
  } catch (error) {
    console.error('Error adding comment:', error);
    res.status(500).json({ error: 'Failed to add comment' });
  }
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Server error:', error);
  res.status(500).json({ error: 'Internal server error' });
});

// Start server
async function startServer() {
  try {
    await initializeDatabase();
    
    const dbStatus = await useDatabase();
    
    app.listen(PORT, () => {
      console.log(`
🚀 FreelancerGuard API Server Started!
📡 Server running on: http://localhost:${PORT}
🔗 Health Check: http://localhost:${PORT}/api/health        
📊 Experiences API: http://localhost:${PORT}/api/experiences
${dbStatus ? '🗄️  Database: MySQL Connected' : '💾 Database: In-Memory Storage'}
✅ Ready for frontend connections!
🎯 Frontend should connect to: http://localhost:5173
────────────────────────────────────────────────`);
    });
  } catch (error) {
    console.error('❌ Server startup failed:', error);
    process.exit(1);
  }
}

startServer();
