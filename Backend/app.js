const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const mysql = require("mysql2/promise");
// const db = require("./mockDB"); // Commented out mock database
require("dotenv").config();

const app = express();

// Security middleware
app.use(helmet({
  contentSecurityPolicy: false,
}));

// CORS configuration - ADD PORT 5174 for Vite
const corsOptions = {
  origin: ["http://localhost:3000", "http://localhost:5173", "http://localhost:5174"],
  credentials: true,
  optionsSuccessStatus: 200,
};
app.use(cors(corsOptions));

// Body parser middleware with error handling
app.use(express.json({ 
  limit: "10mb",
  verify: (req, res, buf) => {
    try {
      JSON.parse(buf);
    } catch (e) {
      console.error('❌ JSON Parse Error:', e.message);
      console.error('❌ Raw body:', buf.toString());
      res.status(400).json({ error: 'Invalid JSON format' });
      return;
    }
  }
}));

app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// JSON error handling middleware
app.use((error, req, res, next) => {
  if (error instanceof SyntaxError && error.status === 400 && 'body' in error) {
    console.error('❌ JSON Syntax Error:', error.message);
    console.error('❌ Request body:', req.body);
    return res.status(400).json({ error: 'Invalid JSON syntax in request body' });
  }
  next();
});

// Database connection - using real MySQL database for PHP admin integration
const db = require("./db");

// Test database connection on startup
db.testConnection();

// Make db available to routes  
app.set('db', db);

// Test route
app.get('/api/test', (req, res) => {
  res.json({ message: 'Backend is working!' });
});

// Simple auth routes (remove the route files for now)
app.post('/api/auth/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    
    if (!username || !email || !password) {
      return res.status(400).json({ error: 'All fields are required' });
    }
    
    const bcrypt = require('bcryptjs');
    
    // Check if user exists
    const [existing] = await db.query('SELECT * FROM users WHERE email = ? OR username = ?', [email, username]);
    if (existing.length > 0) {
      return res.status(400).json({ error: 'User already exists' });
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Insert user
    const [result] = await db.query(
      'INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)',
      [username, email, hashedPassword]
    );
    
    res.json({ message: 'User registered successfully', userId: result.insertId });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }
    
    const bcrypt = require('bcryptjs');
    const jwt = require('jsonwebtoken');
    
    // Find user
    const [users] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    
    if (users.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const user = users[0];
    
    // Check password
    const isValid = await bcrypt.compare(password, user.password_hash);
    
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    // Create token
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      'your-secret-key-12345',
      { expiresIn: '24h' }
    );
    
    res.json({ 
      token, 
      user: { 
        id: user.id, 
        username: user.username, 
        email: user.email 
      } 
    });
    
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Experiences routes
app.get('/api/experiences', async (req, res) => {
  try {
    const [experiences] = await db.query(`
      SELECT 
        e.*, 
        u.username,
        COALESCE(upvotes.count, 0) as upvotes,
        COALESCE(downvotes.count, 0) as downvotes,
        COALESCE(comments.count, 0) as comment_count
      FROM experiences e 
      JOIN users u ON e.user_id = u.id 
      LEFT JOIN (
        SELECT target_id, COUNT(*) as count 
        FROM votes 
        WHERE target_type = 'experience' AND vote_type = 'up' 
        GROUP BY target_id
      ) upvotes ON e.id = upvotes.target_id
      LEFT JOIN (
        SELECT target_id, COUNT(*) as count 
        FROM votes 
        WHERE target_type = 'experience' AND vote_type = 'down' 
        GROUP BY target_id
      ) downvotes ON e.id = downvotes.target_id
      LEFT JOIN (
        SELECT experience_id, COUNT(*) as count 
        FROM comments 
        GROUP BY experience_id
      ) comments ON e.id = comments.experience_id
      ORDER BY e.created_at DESC
    `);
    
    res.json({ experiences });
  } catch (error) {
    console.error('Experiences error:', error);
    res.json({ experiences: [] });
  }
});

// Test endpoint for debugging JSON issues
app.post('/api/test', (req, res) => {
  console.log('🔍 Test endpoint - Raw body:', req.body);
  console.log('🔍 Test endpoint - Body type:', typeof req.body);
  console.log('🔍 Test endpoint - Headers:', req.headers);
  res.json({ 
    success: true, 
    receivedBody: req.body,
    bodyType: typeof req.body,
    message: 'Test endpoint working' 
  });
});

app.post('/api/experiences', async (req, res) => {
  try {
    console.log('🔍 Received request body:', JSON.stringify(req.body, null, 2));
    const { title, description, category, client_name, rating, project_value } = req.body;
    
    console.log('🔍 Extracted fields:');
    console.log('  - title:', title);
    console.log('  - description:', description);
    console.log('  - category:', category);
    console.log('  - client_name:', client_name);
    console.log('  - rating:', rating);
    console.log('  - project_value:', project_value);
    
    // For development, we'll use a mock user. In production, implement proper authentication
    const userId = 1;
    const username = 'freelancer_user';
    
    // Validate required fields
    const trimmedTitle = title?.trim();
    const trimmedDescription = description?.trim();
    
    if (!trimmedTitle && !trimmedDescription) {
      console.log('❌ Validation failed - both title and description are missing');
      return res.status(400).json({ error: 'Both title and description are required' });
    }
    
    if (!trimmedTitle) {
      console.log('❌ Validation failed - title is missing');
      return res.status(400).json({ error: 'Title is required' });
    }
    
    if (!trimmedDescription) {
      console.log('❌ Validation failed - description is missing');
      return res.status(400).json({ error: 'Description is required' });
    }
    
    console.log('✅ Validation passed, inserting into database...');
    
    // Ensure rating is between 1-5
    const validRating = Math.max(1, Math.min(5, parseInt(rating) || 3));
    
    const [result] = await db.query(
      'INSERT INTO experiences (user_id, username, title, description, category, client_name, rating, project_value, upvotes, downvotes, comment_count, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0, 0, 0, NOW())',
      [userId, username, trimmedTitle, trimmedDescription, category || 'General', client_name || 'Unknown Client', validRating, parseFloat(project_value) || 0]
    );
    
    console.log('✅ Experience added successfully with ID:', result.insertId);
    
    res.json({ 
      message: 'Experience added successfully', 
      experienceId: result.insertId,
      success: true 
    });
  } catch (error) {
    console.error('❌ Add experience error:', error);
    console.error('❌ Error details:', error.message);
    res.status(500).json({ 
      error: 'Failed to add experience', 
      details: error.message,
      success: false 
    });
  }
});

// Vote on experience
app.post('/api/experiences/:id/vote', async (req, res) => {
  try {
    const { voteType } = req.body; // 'up' or 'down'
    const experienceId = parseInt(req.params.id);
    const userId = 1; // Mock user ID for development
    
    if (!['up', 'down'].includes(voteType)) {
      return res.status(400).json({ error: 'Invalid vote type' });
    }

    // Check if user already voted
    const existingVotes = await db.query(
      'SELECT * FROM votes WHERE target_id = ? AND target_type = ? AND user_id = ?',
      [experienceId, 'experience', userId]
    );

    if (existingVotes[0].length > 0) {
      // Remove existing vote
      await db.query(
        'DELETE FROM votes WHERE target_id = ? AND target_type = ? AND user_id = ?',
        [experienceId, 'experience', userId]
      );
    }

    // Add new vote
    await db.query(
      'INSERT INTO votes (user_id, target_id, target_type, vote_type) VALUES (?, ?, ?, ?)',
      [userId, experienceId, 'experience', voteType]
    );

    // Update vote counts in mock DB if available
    if (db.updateVoteCounts) {
      db.updateVoteCounts(experienceId);
    }

    res.json({ success: true, message: 'Vote recorded successfully' });
    
  } catch (error) {
    console.error('Vote error:', error);
    res.status(500).json({ error: 'Failed to record vote' });
  }
});

// Get comments for experience
app.get('/api/experiences/:id/comments', async (req, res) => {
  try {
    const experienceId = parseInt(req.params.id);
    const [comments] = await db.query(
      'SELECT c.*, u.username FROM comments c JOIN users u ON c.user_id = u.id WHERE c.experience_id = ? ORDER BY c.created_at DESC',
      [experienceId]
    );
    
    res.json(comments);
    
  } catch (error) {
    console.error('Comments error:', error);
    res.status(500).json({ error: 'Failed to fetch comments' });
  }
});

// Add comment to experience
app.post('/api/experiences/:id/comments', async (req, res) => {
  try {
    const { content } = req.body;
    const experienceId = parseInt(req.params.id);
    const userId = 1; // Mock user ID for development
    
    if (!content || !content.trim()) {
      return res.status(400).json({ error: 'Comment content is required' });
    }

    const [result] = await db.query(
      'INSERT INTO comments (experience_id, user_id, content) VALUES (?, ?, ?)',
      [experienceId, userId, content.trim()]
    );

    // Update comment counts in mock DB if available
    if (db.updateCommentCounts) {
      db.updateCommentCounts(experienceId);
    }

    res.json({ 
      success: true, 
      message: 'Comment added successfully',
      commentId: result.insertId 
    });
    
  } catch (error) {
    console.error('Add comment error:', error);
    res.status(500).json({ error: 'Failed to add comment' });
  }
});

// Health check
app.get("/", (req, res) => {
  res.json({
    message: "FreelancerGuard API is running",
    version: "1.0.0",
    timestamp: new Date().toISOString(),
  });
});

module.exports = app;