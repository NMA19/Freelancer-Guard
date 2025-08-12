const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();

// Enable CORS for all origins
app.use(cors());

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// In-memory database for development (will work without MySQL)
let experiences = [
  {
    id: 1,
    title: "Nightmare Client from Hell",
    description: "Client demanded 50 revisions for a simple logo, then tried to pay with exposure. Avoid at all costs!",
    category: "Design",
    client_name: "DesignThief Co",
    rating: 1,
    project_value: 500,
    upvotes: 23,
    downvotes: 2,
    comment_count: 8,
    username: "designer123",
    created_at: new Date().toISOString()
  },
  {
    id: 2,
    title: "Amazing Tech Startup Experience",
    description: "Professional client, clear requirements, paid on time, and even gave a bonus for excellent work!",
    category: "Web Development",
    client_name: "TechFlow Inc",
    rating: 5,
    project_value: 2500,
    upvotes: 45,
    downvotes: 1,
    comment_count: 12,
    username: "webdev_pro",
    created_at: new Date().toISOString()
  },
  {
    id: 3,
    title: "Red Flag Marketing Agency",
    description: "Promised ongoing work but disappeared after first project. Communication was terrible throughout.",
    category: "Marketing",
    client_name: "QuickBuck Marketing",
    rating: 2,
    project_value: 800,
    upvotes: 18,
    downvotes: 3,
    comment_count: 5,
    username: "marketer_jane",
    created_at: new Date().toISOString()
  }
];

let votes = [];
let comments = [];
let nextId = 4;

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'FreelancerGuard API is running!',
    timestamp: new Date().toISOString(),
    database: 'In-Memory (Development Mode)',
    endpoints: [
      'GET /api/experiences',
      'POST /api/experiences',
      'POST /api/experiences/:id/vote',
      'GET /api/experiences/:id/comments',
      'POST /api/experiences/:id/comments'
    ]
  });
});

// Get all experiences
app.get('/api/experiences', (req, res) => {
  console.log('📋 Fetching all experiences...');
  res.json({
    success: true,
    experiences: experiences,
    total: experiences.length
  });
});

// Create new experience
app.post('/api/experiences', (req, res) => {
  console.log('📝 Creating new experience...', req.body);
  
  const { title, description, category, client_name, rating, project_value } = req.body;
  
  // Validation
  if (!title || !description) {
    return res.status(400).json({
      success: false,
      error: 'Title and description are required'
    });
  }
  
  const newExperience = {
    id: nextId++,
    title: title.trim(),
    description: description.trim(),
    category: category || 'Other',
    client_name: client_name || 'Anonymous',
    rating: parseInt(rating) || 3,
    project_value: parseFloat(project_value) || 0,
    upvotes: 0,
    downvotes: 0,
    comment_count: 0,
    username: 'anonymous_user',
    created_at: new Date().toISOString()
  };
  
  experiences.unshift(newExperience); // Add to beginning
  
  console.log('✅ Experience created:', newExperience);
  res.status(201).json({
    success: true,
    experience: newExperience,
    message: 'Experience added successfully'
  });
});

// Vote on experience
app.post('/api/experiences/:id/vote', (req, res) => {
  const experienceId = parseInt(req.params.id);
  const { vote_type } = req.body;
  
  console.log(`🗳️ Voting on experience ${experienceId}: ${vote_type}`);
  
  if (!['upvote', 'downvote'].includes(vote_type)) {
    return res.status(400).json({
      success: false,
      error: 'Invalid vote type. Must be "upvote" or "downvote"'
    });
  }
  
  const experience = experiences.find(exp => exp.id === experienceId);
  if (!experience) {
    return res.status(404).json({
      success: false,
      error: 'Experience not found'
    });
  }
  
  // Add vote to votes array
  const vote = {
    id: votes.length + 1,
    experience_id: experienceId,
    vote_type: vote_type,
    created_at: new Date().toISOString()
  };
  votes.push(vote);
  
  // Update experience vote counts
  if (vote_type === 'upvote') {
    experience.upvotes += 1;
  } else {
    experience.downvotes += 1;
  }
  
  console.log(`✅ Vote recorded. Experience ${experienceId} now has: ↑${experience.upvotes} ↓${experience.downvotes}`);
  
  res.json({
    success: true,
    experience: experience,
    message: `${vote_type} recorded successfully`
  });
});

// Get comments for experience
app.get('/api/experiences/:id/comments', (req, res) => {
  const experienceId = parseInt(req.params.id);
  
  console.log(`💬 Fetching comments for experience ${experienceId}`);
  
  const experienceComments = comments.filter(comment => comment.experience_id === experienceId);
  
  res.json({
    success: true,
    comments: experienceComments,
    total: experienceComments.length
  });
});

// Add comment to experience
app.post('/api/experiences/:id/comments', (req, res) => {
  const experienceId = parseInt(req.params.id);
  const { content } = req.body;
  
  console.log(`💬 Adding comment to experience ${experienceId}: ${content}`);
  
  if (!content || !content.trim()) {
    return res.status(400).json({
      success: false,
      error: 'Comment content is required'
    });
  }
  
  const experience = experiences.find(exp => exp.id === experienceId);
  if (!experience) {
    return res.status(404).json({
      success: false,
      error: 'Experience not found'
    });
  }
  
  const newComment = {
    id: comments.length + 1,
    experience_id: experienceId,
    content: content.trim(),
    username: 'anonymous_user',
    created_at: new Date().toISOString()
  };
  
  comments.push(newComment);
  
  // Update comment count
  experience.comment_count += 1;
  
  console.log(`✅ Comment added. Experience ${experienceId} now has ${experience.comment_count} comments`);
  
  res.status(201).json({
    success: true,
    comment: newComment,
    message: 'Comment added successfully'
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('❌ Server Error:', err);
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    message: err.message
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found',
    available_endpoints: [
      'GET /api/health',
      'GET /api/experiences',
      'POST /api/experiences',
      'POST /api/experiences/:id/vote',
      'GET /api/experiences/:id/comments',
      'POST /api/experiences/:id/comments'
    ]
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log('\n🚀 FreelancerGuard API Server Started!');
  console.log(`📡 Server running on: http://localhost:${PORT}`);
  console.log(`🔗 Health Check: http://localhost:${PORT}/api/health`);
  console.log(`📊 Experiences API: http://localhost:${PORT}/api/experiences`);
  console.log('\n✅ Ready for frontend connections!');
  console.log('💡 This server uses in-memory storage - perfect for development!');
  console.log('\n📋 Sample data loaded:');
  console.log(`   - ${experiences.length} experiences`);
  console.log(`   - Ready for voting and commenting`);
  console.log('\n🎯 Frontend should connect to: http://localhost:5173');
  console.log('────────────────────────────────────────────────');
});
