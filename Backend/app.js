const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const mysql = require("mysql2/promise");
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

// Body parser middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Database connection - make it available to routes
const db = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'freelancerguard',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

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

app.post('/api/experiences', async (req, res) => {
  try {
    const { title, description, category, client_type, rating, project_value } = req.body;
    
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: 'No token provided' });
    }
    
    const jwt = require('jsonwebtoken');
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, 'your-secret-key-12345');
    
    let status = 'neutral';
    if (rating >= 4) status = 'positive';
    else if (rating <= 2) status = 'negative';
    
    const [result] = await db.query(
      'INSERT INTO experiences (user_id, title, description, category, client_type, rating, project_value, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [decoded.userId, title, description, category, client_type, rating, project_value, status]
    );
    
    res.json({ message: 'Experience added successfully', experienceId: result.insertId });
  } catch (error) {
    console.error('Add experience error:', error);
    res.status(500).json({ error: 'Failed to add experience' });
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

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📝 Test at: http://localhost:${PORT}/api/test`);
});