const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mysql = require('mysql2/promise');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Multer configuration for image uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  // Accept only image files
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'), false);
  }
};

const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// Simple CORS - allow all origins
app.use(cors({
  origin: true,
  credentials: true
}));

app.use(express.json());

// Serve uploaded images statically
app.use('/uploads', express.static(uploadsDir));

// Database connection
const db = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'freelancerguard',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Test database connection
db.getConnection()
  .then(connection => {
    console.log('✅ Database connected successfully');
    connection.release();
  })
  .catch(err => {
    console.error('❌ Database connection failed:', err.message);
  });

// Test route
app.get('/api/test', (req, res) => {
  res.json({ message: 'Backend is working!' });
});

// Register
app.post('/api/auth/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    
    console.log('Register attempt:', { username, email });
    
    if (!username || !email || !password) {
      return res.status(400).json({ error: 'All fields are required' });
    }
    
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
    
    // Create token for immediate login
    const token = jwt.sign(
      { userId: result.insertId, email: email },
      'your-secret-key-12345',
      { expiresIn: '7d' }
    );
    
    console.log('User registered successfully:', result.insertId);
    res.json({ 
      message: 'User registered successfully', 
      token,
      user: {
        id: result.insertId,
        username: username,
        email: email
      }
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'Registration failed: ' + error.message });
  }
});

// Login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    console.log('Login attempt:', { email });
    
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }
    
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
      { expiresIn: '7d' } // Extended to 7 days
    );
    
    console.log('Login successful for user:', user.id);
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
    res.status(500).json({ error: 'Login failed: ' + error.message });
  }
});

// Get experiences
app.get('/api/experiences', async (req, res) => {
  try {
    const [experiences] = await db.query(`
      SELECT 
        e.*, 
        u.username,
        COALESCE(SUM(CASE WHEN ev.vote_type = 'up' THEN 1 ELSE 0 END), 0) AS upvotes,
        COALESCE(SUM(CASE WHEN ev.vote_type = 'down' THEN 1 ELSE 0 END), 0) AS downvotes,
        COUNT(DISTINCT ec.id) AS comment_count
      FROM experiences e 
      JOIN users u ON e.user_id = u.id 
      LEFT JOIN experience_votes ev ON e.id = ev.experience_id
      LEFT JOIN experience_comments ec ON e.id = ec.experience_id
      GROUP BY e.id, u.username
      ORDER BY e.created_at DESC
      LIMIT 50
    `);
    
    console.log('Fetched experiences:', experiences.length);
    res.json({ experiences });
  } catch (error) {
    console.error('Experiences error:', error);
    res.json({ experiences: [] });
  }
});

// Add experience
// Create experience with optional image upload
app.post('/api/experiences', upload.single('image'), async (req, res) => {
  try {
    const { 
      title, 
      description, 
      category, 
      client_name,
      client_email,
      client_type, 
      rating, 
      project_value,
      payment_method,
      project_duration_days
    } = req.body;
    
    // Simple auth check
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: 'No token provided' });
    }
    
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, 'your-secret-key-12345');
    
    let status = 'neutral';
    if (rating >= 4) status = 'positive';
    else if (rating <= 2) status = 'negative';
    
    // Handle uploaded image
    let imageUrl = null;
    if (req.file) {
      imageUrl = `/uploads/${req.file.filename}`;
    }
    
    console.log('Creating experience with data:', {
      title, description, category, client_name, client_email, client_type, rating, project_value, payment_method, project_duration_days, imageUrl
    });
    
    const [result] = await db.query(
      `INSERT INTO experiences (
        user_id, title, description, category, client_name, client_email, 
        client_type, rating, project_value, payment_method, project_duration_days, status, image_url
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        decoded.userId, title, description, category, client_name || null, client_email || null,
        client_type, rating, project_value || null, payment_method || null, project_duration_days || null, status, imageUrl
      ]
    );
    
    console.log('Experience added:', result.insertId);
    res.json({ message: 'Experience added successfully', experienceId: result.insertId });
  } catch (error) {
    console.error('Add experience error:', error);
    res.status(500).json({ error: 'Failed to add experience: ' + error.message });
  }
});

// Vote on experience
app.post('/api/experiences/:id/vote', async (req, res) => {
  try {
    const { id } = req.params;
    const { voteType } = req.body; // 'up' or 'down'
    
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: 'No token provided' });
    }
    
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, 'your-secret-key-12345');
    
    // Check if user already voted
    const [existingVote] = await db.query(
      'SELECT * FROM experience_votes WHERE experience_id = ? AND user_id = ?',
      [id, decoded.userId]
    );
    
    if (existingVote.length > 0) {
      // Update existing vote
      await db.query(
        'UPDATE experience_votes SET vote_type = ? WHERE experience_id = ? AND user_id = ?',
        [voteType, id, decoded.userId]
      );
    } else {
      // Insert new vote
      await db.query(
        'INSERT INTO experience_votes (experience_id, user_id, vote_type) VALUES (?, ?, ?)',
        [id, decoded.userId, voteType]
      );
    }
    
    // Update experience vote counts
    const [upvotes] = await db.query(
      'SELECT COUNT(*) as count FROM experience_votes WHERE experience_id = ? AND vote_type = "up"',
      [id]
    );
    const [downvotes] = await db.query(
      'SELECT COUNT(*) as count FROM experience_votes WHERE experience_id = ? AND vote_type = "down"',
      [id]
    );
    
    await db.query(
      'UPDATE experiences SET upvotes = ?, downvotes = ? WHERE id = ?',
      [upvotes[0].count, downvotes[0].count, id]
    );
    
    res.json({ 
      message: 'Vote recorded successfully',
      upvotes: upvotes[0].count,
      downvotes: downvotes[0].count
    });
  } catch (error) {
    console.error('Vote error:', error);
    res.status(500).json({ error: 'Failed to vote: ' + error.message });
  }
});

// Get user's vote for a specific experience
app.get('/api/experiences/:id/user-vote', async (req, res) => {
  try {
    const { id } = req.params;
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      return res.json({ voteType: null });
    }
    
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, 'your-secret-key-12345');
    
    const [vote] = await db.query(
      'SELECT vote_type FROM experience_votes WHERE experience_id = ? AND user_id = ?',
      [id, decoded.userId]
    );
    
    res.json({ voteType: vote.length > 0 ? vote[0].vote_type : null });
  } catch (error) {
    console.error('User vote check error:', error);
    res.json({ voteType: null });
  }
});

// Add comment to experience
app.post('/api/experiences/:id/comments', async (req, res) => {
  try {
    const { id } = req.params;
    const { content } = req.body;
    
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: 'No token provided' });
    }
    
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, 'your-secret-key-12345');
    
    if (!content || content.trim().length === 0) {
      return res.status(400).json({ error: 'Comment content is required' });
    }
    
    const [result] = await db.query(
      'INSERT INTO experience_comments (experience_id, user_id, content) VALUES (?, ?, ?)',
      [id, decoded.userId, content.trim()]
    );
    
    // Update comment count
    const [commentCount] = await db.query(
      'SELECT COUNT(*) as count FROM experience_comments WHERE experience_id = ?',
      [id]
    );
    
    await db.query(
      'UPDATE experiences SET comment_count = ? WHERE id = ?',
      [commentCount[0].count, id]
    );
    
    res.json({ 
      message: 'Comment added successfully',
      commentId: result.insertId,
      commentCount: commentCount[0].count
    });
  } catch (error) {
    console.error('Comment error:', error);
    res.status(500).json({ error: 'Failed to add comment: ' + error.message });
  }
});

// Get comments for experience
app.get('/api/experiences/:id/comments', async (req, res) => {
  try {
    const { id } = req.params;
    
    const [comments] = await db.query(`
      SELECT c.*, u.username 
      FROM experience_comments c 
      JOIN users u ON c.user_id = u.id 
      WHERE c.experience_id = ? 
      ORDER BY c.created_at DESC
    `, [id]);
    
    res.json({ comments });
  } catch (error) {
    console.error('Get comments error:', error);
    res.status(500).json({ error: 'Failed to get comments: ' + error.message });
  }
});

// Get user notifications
app.get('/api/notifications', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: 'No token provided' });
    }
    
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, 'your-secret-key-12345');
    
    const [notifications] = await db.query(`
      SELECT * FROM notifications 
      WHERE user_id = ? 
      ORDER BY created_at DESC 
      LIMIT 20
    `, [decoded.userId]);
    
    res.json({ notifications });
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({ error: 'Failed to get notifications: ' + error.message });
  }
});

// Mark notification as read
app.patch('/api/notifications/:id/read', async (req, res) => {
  try {
    const { id } = req.params;
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: 'No token provided' });
    }
    
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, 'your-secret-key-12345');
    
    await db.query(
      'UPDATE notifications SET is_read = 1 WHERE id = ? AND user_id = ?',
      [id, decoded.userId]
    );
    
    res.json({ message: 'Notification marked as read' });
  } catch (error) {
    console.error('Mark notification read error:', error);
    res.status(500).json({ error: 'Failed to mark notification as read: ' + error.message });
  }
});

// Get user analytics  
app.get('/api/analytics/user', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: 'No token provided' });
    }
    
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, 'your-secret-key-12345');
    
    // Get user's experience stats
    const [userExperiences] = await db.query(
      'SELECT COUNT(*) as total, AVG(rating) as avgRating FROM experiences WHERE user_id = ?',
      [decoded.userId]
    );
    
    // Get user's total likes received
    const [likesReceived] = await db.query(`
      SELECT COUNT(*) as total FROM experience_votes ev 
      JOIN experiences e ON ev.experience_id = e.id 
      WHERE e.user_id = ? AND ev.vote_type = 'up'
    `, [decoded.userId]);
    
    // Get user's comments received
    const [commentsReceived] = await db.query(`
      SELECT COUNT(*) as total FROM experience_comments ec 
      JOIN experiences e ON ec.experience_id = e.id 
      WHERE e.user_id = ? AND ec.user_id != ?
    `, [decoded.userId, decoded.userId]);
    
    res.json({
      analytics: {
        totalExperiences: userExperiences[0].total,
        averageRating: parseFloat(userExperiences[0].avgRating || 0).toFixed(1),
        likesReceived: likesReceived[0].total,
        commentsReceived: commentsReceived[0].total
      }
    });
  } catch (error) {
    console.error('Get user analytics error:', error);
    res.status(500).json({ error: 'Failed to get analytics: ' + error.message });
  }
});

// Search experiences with advanced filters
app.get('/api/experiences/search', async (req, res) => {
  try {
    const { 
      query = '', 
      category = '', 
      rating = '', 
      sortBy = 'created_at', 
      sortOrder = 'DESC',
      limit = 50,
      offset = 0
    } = req.query;
    
    let sql = `
      SELECT e.*, u.username 
      FROM experiences e 
      JOIN users u ON e.user_id = u.id 
      WHERE 1=1
    `;
    const params = [];
    
    if (query) {
      sql += ` AND (e.title LIKE ? OR e.description LIKE ? OR e.client_name LIKE ?)`;
      const searchTerm = `%${query}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }
    
    if (category) {
      sql += ` AND e.category = ?`;
      params.push(category);
    }
    
    if (rating) {
      sql += ` AND e.rating >= ?`;
      params.push(parseInt(rating));
    }
    
    sql += ` ORDER BY e.${sortBy} ${sortOrder} LIMIT ? OFFSET ?`;
    params.push(parseInt(limit), parseInt(offset));
    
    const [experiences] = await db.query(sql, params);
    
    res.json({ experiences });
  } catch (error) {
    console.error('Search experiences error:', error);
    res.status(500).json({ error: 'Failed to search experiences: ' + error.message });
  }
});

// Health check
app.get('/', (req, res) => {
  res.json({
    message: 'FreelancerGuard API is running',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📝 Test at: http://localhost:${PORT}/api/test`);
  console.log(`🌐 Health check: http://localhost:${PORT}/`);
});
