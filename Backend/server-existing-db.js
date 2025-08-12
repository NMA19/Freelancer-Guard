const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Enhanced CORS middleware
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174', 'http://127.0.0.1:5173', 'http://127.0.0.1:5174', 'http://localhost:3000'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));
app.use(express.json());

// Add basic request logging
app.use((req, res, next) => {
  console.log(`📥 ${req.method} ${req.path} - ${new Date().toISOString()}`);
  next();
});

// Simple test route
app.get('/', (req, res) => {
  res.json({ message: 'FreelancerGuard API is running!', timestamp: new Date().toISOString() });
});

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
  connectionLimit: 10,
  queueLimit: 0
});

// In-memory fallback storage
let inMemoryExperiences = [];
let nextId = 1;

// Database connection test
async function testDatabaseConnection() {
  try {
    const connection = await pool.getConnection();
    console.log('✅ Database connection successful');
    connection.release();
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    return false;
  }
}

// Check if database is available
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

// Get all experiences with enhanced data
app.get('/api/experiences', async (req, res) => {
  console.log('📋 GET /api/experiences - Received request');
  try {
    if (await useDatabase()) {
      const connection = await pool.getConnection();
      
      // First, let's just get basic experiences without joins to see what's available
      const [experiences] = await connection.query(`
        SELECT * FROM experiences ORDER BY created_at DESC
      `);
      
      // Add default vote and comment counts
      const enhancedExperiences = experiences.map(exp => ({
        ...exp,
        upvotes: 0,
        downvotes: 0,
        comment_count: 0
      }));
      
      connection.release();
      res.json(enhancedExperiences);
    } else {
      res.json(inMemoryExperiences);
    }
  } catch (error) {
    console.error('Error fetching experiences:', error);
    res.status(500).json({ error: 'Failed to fetch experiences' });
  }
});

// Create new experience using your existing schema
app.post('/api/experiences', async (req, res) => {
  console.log('📝 POST /api/experiences - Received request');
  console.log('Request body:', req.body);
  try {
    const { title, description, category, client_name, rating, project_value, username } = req.body;
    
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
      username: username || 'Anonymous',
      status: 'active',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    if (await useDatabase()) {
      const connection = await pool.getConnection();
      
      // Insert into your existing experiences table structure
      const [result] = await connection.query(
        `INSERT INTO experiences (title, description, category, client_name, rating, project_value, username, status, created_at, updated_at) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
        [
          experienceData.title, 
          experienceData.description, 
          experienceData.category, 
          experienceData.client_name, 
          experienceData.rating, 
          experienceData.project_value,
          experienceData.username,
          experienceData.status
        ]
      );
      
      // Get the created experience with all data
      const [newExperience] = await connection.query(
        `SELECT 
          e.*,
          0 as upvotes,
          0 as downvotes,
          0 as comment_count
        FROM experiences e 
        WHERE e.id = ?`,
        [result.insertId]
      );
      
      connection.release();
      console.log('✅ Experience created in database:', newExperience[0]);
      res.status(201).json(newExperience[0]);
    } else {
      const newExperience = { ...experienceData, id: nextId++, upvotes: 0, downvotes: 0, comment_count: 0 };
      inMemoryExperiences.unshift(newExperience);
      console.log('✅ Experience created in memory:', newExperience);
      res.status(201).json(newExperience);
    }
  } catch (error) {
    console.error('❌ Error creating experience:', error);
    res.status(500).json({ error: 'Failed to create experience', details: error.message });
  }
});

// Vote on experience using your existing schema
app.post('/api/experiences/:id/vote', async (req, res) => {
  console.log('🗳️ POST /api/experiences/:id/vote - Received request');
  try {
    const experienceId = parseInt(req.params.id);
    const { voteType } = req.body;
    const userIp = req.ip || req.connection.remoteAddress;

    if (!['upvote', 'downvote'].includes(voteType)) {
      return res.status(400).json({ error: 'Invalid vote type' });
    }

    if (await useDatabase()) {
      const connection = await pool.getConnection();
      
      // Check if user already voted using the 'votes' table
      const [existingVote] = await connection.query(
        'SELECT * FROM votes WHERE experience_id = ? AND user_ip = ?',
        [experienceId, userIp]
      );

      if (existingVote.length > 0) {
        // Update existing vote
        await connection.query(
          'UPDATE votes SET vote_type = ?, created_at = NOW() WHERE experience_id = ? AND user_ip = ?',
          [voteType, experienceId, userIp]
        );
      } else {
        // Insert new vote
        await connection.query(
          'INSERT INTO votes (experience_id, vote_type, user_ip, created_at) VALUES (?, ?, ?, NOW())',
          [experienceId, voteType, userIp]
        );
      }

      // Get updated vote counts
      const [voteCounts] = await connection.query(
        `SELECT 
          SUM(CASE WHEN vote_type = 'upvote' THEN 1 ELSE 0 END) as upvotes,
          SUM(CASE WHEN vote_type = 'downvote' THEN 1 ELSE 0 END) as downvotes
        FROM votes WHERE experience_id = ?`,
        [experienceId]
      );

      connection.release();
      
      const result = {
        upvotes: parseInt(voteCounts[0]?.upvotes || 0),
        downvotes: parseInt(voteCounts[0]?.downvotes || 0)
      };
      
      console.log('✅ Vote recorded:', { experienceId, voteType, result });
      res.json(result);
    } else {
      // In-memory fallback
      const experience = inMemoryExperiences.find(exp => exp.id === experienceId);
      if (!experience) {
        return res.status(404).json({ error: 'Experience not found' });
      }

      if (voteType === 'upvote') {
        experience.upvotes = (experience.upvotes || 0) + 1;
      } else {
        experience.downvotes = (experience.downvotes || 0) + 1;
      }

      res.json({ upvotes: experience.upvotes, downvotes: experience.downvotes });
    }
  } catch (error) {
    console.error('❌ Error voting:', error);
    res.status(500).json({ error: 'Failed to record vote' });
  }
});

// Get comments for an experience
app.get('/api/experiences/:id/comments', async (req, res) => {
  console.log('💬 GET /api/experiences/:id/comments - Received request');
  try {
    const experienceId = parseInt(req.params.id);

    if (await useDatabase()) {
      const connection = await pool.getConnection();
      const [comments] = await connection.query(
        'SELECT * FROM comments WHERE experience_id = ? ORDER BY created_at DESC',
        [experienceId]
      );
      connection.release();
      res.json(comments);
    } else {
      res.json([]);
    }
  } catch (error) {
    console.error('❌ Error fetching comments:', error);
    res.status(500).json({ error: 'Failed to fetch comments' });
  }
});

// Add comment to experience using your existing schema
app.post('/api/experiences/:id/comments', async (req, res) => {
  console.log('💬 POST /api/experiences/:id/comments - Received request');
  try {
    const experienceId = parseInt(req.params.id);
    const { content, username } = req.body;
    const userIp = req.ip || req.connection.remoteAddress;

    if (!content?.trim()) {
      return res.status(400).json({ error: 'Comment content is required' });
    }

    if (await useDatabase()) {
      const connection = await pool.getConnection();
      
      const [result] = await connection.query(
        'INSERT INTO comments (experience_id, content, username, user_ip, created_at) VALUES (?, ?, ?, ?, NOW())',
        [experienceId, content.trim(), username || 'Anonymous', userIp]
      );

      const [newComment] = await connection.query(
        'SELECT * FROM comments WHERE id = ?',
        [result.insertId]
      );

      connection.release();
      console.log('✅ Comment added:', newComment[0]);
      res.status(201).json(newComment[0]);
    } else {
      const newComment = {
        id: Date.now(),
        experience_id: experienceId,
        content: content.trim(),
        username: username || 'Anonymous',
        user_ip: userIp,
        created_at: new Date().toISOString()
      };
      res.status(201).json(newComment);
    }
  } catch (error) {
    console.error('❌ Error adding comment:', error);
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
  console.log('🔄 Connecting to existing database...');
  
  const dbConnected = await testDatabaseConnection();
  
  if (!dbConnected) {
    console.log('🔄 Falling back to in-memory storage...');
    console.log('✅ In-memory storage initialized');
  }

  app.listen(PORT, () => {
    console.log(`
🚀 FreelancerGuard API Server Started!
📡 Server running on: http://localhost:${PORT}
🔗 Health Check: http://localhost:${PORT}/api/health
📊 Experiences API: http://localhost:${PORT}/api/experiences
${dbConnected ? '🗄️  Database: MySQL Connected (Using Existing Schema)' : '💾 Database: In-Memory Storage'}
✅ Ready for frontend connections!
🎯 Frontend should connect to: http://localhost:5173
────────────────────────────────────────────────`);
  });
}

startServer().catch(console.error);
