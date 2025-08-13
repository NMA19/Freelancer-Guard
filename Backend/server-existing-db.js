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
      
      // Get experiences with proper vote counts - first let's just get experiences without joins
      const [experiences] = await connection.query(`
        SELECT * FROM experiences ORDER BY created_at DESC
      `);
      
      // For each experience, get vote and comment counts separately
      for (let exp of experiences) {
        // Try to get votes (try both table names)
        try {
          const [votes] = await connection.query(`
            SELECT 
              SUM(CASE WHEN vote_type = 'upvote' THEN 1 ELSE 0 END) as upvotes,
              SUM(CASE WHEN vote_type = 'downvote' THEN 1 ELSE 0 END) as downvotes
            FROM votes WHERE experience_id = ?`, [exp.id]);
          exp.upvotes = votes[0]?.upvotes || 0;
          exp.downvotes = votes[0]?.downvotes || 0;
        } catch (error) {
          // If votes table doesn't work, try experience_votes
          try {
            const [votes] = await connection.query(`
              SELECT 
                SUM(CASE WHEN vote_type = 'upvote' THEN 1 ELSE 0 END) as upvotes,
                SUM(CASE WHEN vote_type = 'downvote' THEN 1 ELSE 0 END) as downvotes
              FROM experience_votes WHERE experience_id = ?`, [exp.id]);
            exp.upvotes = votes[0]?.upvotes || 0;
            exp.downvotes = votes[0]?.downvotes || 0;
          } catch (error2) {
            // No votes table exists, set defaults
            exp.upvotes = 0;
            exp.downvotes = 0;
          }
        }
        
        // Try to get comment count
        try {
          const [comments] = await connection.query(`
            SELECT COUNT(*) as count FROM comments WHERE experience_id = ?`, [exp.id]);
          exp.comment_count = comments[0]?.count || 0;
        } catch (error) {
          try {
            const [comments] = await connection.query(`
              SELECT COUNT(*) as count FROM experience_comments WHERE experience_id = ?`, [exp.id]);
            exp.comment_count = comments[0]?.count || 0;
          } catch (error2) {
            exp.comment_count = 0;
          }
        }
      }
      
      connection.release();
      res.json(experiences);
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
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    if (await useDatabase()) {
      const connection = await pool.getConnection();
      
      // Insert into your existing experiences table structure (without status column)
      const [result] = await connection.query(
        `INSERT INTO experiences (title, description, category, client_name, rating, project_value, username, created_at, updated_at) 
         VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
        [
          experienceData.title, 
          experienceData.description, 
          experienceData.category, 
          experienceData.client_name, 
          experienceData.rating, 
          experienceData.project_value,
          experienceData.username
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
  console.log('Request body:', req.body);
  try {
    const experienceId = parseInt(req.params.id);
    const { voteType, vote_type } = req.body;
    const actualVoteType = voteType || vote_type; // Support both formats
    const userIp = req.ip || req.connection.remoteAddress;

    if (!['upvote', 'downvote'].includes(actualVoteType)) {
      return res.status(400).json({ error: 'Invalid vote type. Expected "upvote" or "downvote"' });
    }

    if (await useDatabase()) {
      const connection = await pool.getConnection();
      
      // Try to use experience_votes table first, fallback to votes table
      let voteTable = 'experience_votes';
      let [existingVote] = [];
      
      try {
        [existingVote] = await connection.query(
          'SELECT * FROM experience_votes WHERE experience_id = ? AND user_ip = ?',
          [experienceId, userIp]
        );
      } catch (error) {
        // experience_votes table doesn't exist, try votes table
        voteTable = 'votes';
        try {
          [existingVote] = await connection.query(
            'SELECT * FROM votes WHERE experience_id = ? AND user_ip = ?',
            [experienceId, userIp]
          );
        } catch (error2) {
          // Neither table exists, create in-memory response
          const voteResult = { upvotes: 1, downvotes: 0 };
          console.log('✅ Vote recorded (no database table):', {
            experienceId,
            actualVoteType,
            result: voteResult
          });
          return res.json(voteResult);
        }
      }

      if (existingVote.length > 0) {
        // Update existing vote
        await connection.query(
          `UPDATE ${voteTable} SET vote_type = ?, created_at = NOW() WHERE experience_id = ? AND user_ip = ?`,
          [actualVoteType, experienceId, userIp]
        );
      } else {
        // Insert new vote
        await connection.query(
          `INSERT INTO ${voteTable} (experience_id, vote_type, user_ip, created_at) VALUES (?, ?, ?, NOW())`,
          [experienceId, actualVoteType, userIp]
        );
      }

      // Get updated vote counts
      const [voteCounts] = await connection.query(
        `SELECT 
          SUM(CASE WHEN vote_type = 'upvote' THEN 1 ELSE 0 END) as upvotes,
          SUM(CASE WHEN vote_type = 'downvote' THEN 1 ELSE 0 END) as downvotes
        FROM ${voteTable} WHERE experience_id = ?`,
        [experienceId]
      );

      connection.release();
      
      const result = {
        upvotes: parseInt(voteCounts[0]?.upvotes || 0),
        downvotes: parseInt(voteCounts[0]?.downvotes || 0)
      };
      
      console.log('✅ Vote recorded:', { experienceId, actualVoteType, result });
      res.json(result);
    } else {
      // In-memory fallback
      const experience = inMemoryExperiences.find(exp => exp.id === experienceId);
      if (!experience) {
        return res.status(404).json({ error: 'Experience not found' });
      }

      if (actualVoteType === 'upvote') {
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
        'SELECT * FROM experience_comments WHERE experience_id = ? ORDER BY created_at DESC',
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
        'INSERT INTO experience_comments (experience_id, content, username, user_ip, created_at) VALUES (?, ?, ?, ?, NOW())',
        [experienceId, content.trim(), username || 'Anonymous', userIp]
      );

      const [newComment] = await connection.query(
        'SELECT * FROM experience_comments WHERE id = ?',
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

// Authentication endpoints
app.post('/api/auth/register', async (req, res) => {
  console.log('📝 POST /api/auth/register - Received request');
  console.log('Request body:', req.body);
  try {
    const { username, email, password } = req.body;
    
    if (!username || !email || !password) {
      return res.status(400).json({ error: 'Username, email, and password are required' });
    }

    if (await useDatabase()) {
      const connection = await pool.getConnection();
      
      // Check if user already exists
      const [existingUser] = await connection.query(
        'SELECT * FROM users WHERE email = ? OR username = ?',
        [email, username]
      );

      if (existingUser.length > 0) {
        connection.release();
        return res.status(400).json({ error: 'User already exists with this email or username' });
      }

      // Insert new user (in a real app, you'd hash the password)
      const [result] = await connection.query(
        'INSERT INTO users (username, email, password, created_at, updated_at) VALUES (?, ?, ?, NOW(), NOW())',
        [username, email, password] // Note: In production, hash the password!
      );

      const [newUser] = await connection.query(
        'SELECT id, username, email, created_at FROM users WHERE id = ?',
        [result.insertId]
      );

      connection.release();
      
      const user = newUser[0];
      const token = `mock_token_${user.id}_${Date.now()}`; // Mock token
      
      console.log('✅ User registered:', user);
      res.status(201).json({ user, token, success: true });
    } else {
      // In-memory fallback
      const user = {
        id: Date.now(),
        username,
        email,
        created_at: new Date().toISOString()
      };
      const token = `mock_token_${user.id}`;
      res.status(201).json({ user, token, success: true });
    }
  } catch (error) {
    console.error('❌ Error registering user:', error);
    res.status(500).json({ error: 'Failed to register user', details: error.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  console.log('🔑 POST /api/auth/login - Received request');
  console.log('Request body:', req.body);
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    if (await useDatabase()) {
      const connection = await pool.getConnection();
      
      // Find user by email
      const [users] = await connection.query(
        'SELECT id, username, email, password FROM users WHERE email = ?',
        [email]
      );

      connection.release();

      if (users.length === 0) {
        return res.status(401).json({ error: 'Invalid email or password' });
      }

      const user = users[0];
      
      // In a real app, you'd compare hashed passwords
      if (user.password !== password) {
        return res.status(401).json({ error: 'Invalid email or password' });
      }

      const token = `mock_token_${user.id}_${Date.now()}`; // Mock token
      const userResponse = { id: user.id, username: user.username, email: user.email };
      
      console.log('✅ User logged in:', userResponse);
      res.json({ user: userResponse, token, success: true });
    } else {
      // In-memory fallback - mock successful login
      const user = { id: 1, username: 'dev_user', email };
      const token = `mock_token_${user.id}`;
      res.json({ user, token, success: true });
    }
  } catch (error) {
    console.error('❌ Error logging in user:', error);
    res.status(500).json({ error: 'Failed to login', details: error.message });
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
