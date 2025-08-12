const express = require('express');
const cors = require('cors');

const app = express();

// Enable CORS for all origins
app.use(cors());

// Simple body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// In-memory storage for development
let experiences = [
  {
    id: 1,
    title: "Great Web Development Project",
    description: "Client was very professional and payments were on time.",
    category: "Web Development",
    client_name: "ABC Company",
    rating: 5,
    project_value: 2500,
    upvotes: 3,
    downvotes: 0,
    comment_count: 2,
    username: "freelancer_pro",
    created_at: new Date().toISOString()
  }
];

let nextId = 2;

// Get all experiences
app.get('/api/experiences', (req, res) => {
  console.log('📋 Getting experiences...');
  res.json({ experiences });
});

// Add new experience - SIMPLIFIED
app.post('/api/experiences', (req, res) => {
  console.log('📝 Add experience request received');
  console.log('📝 Headers:', req.headers);
  console.log('📝 Raw body:', req.body);
  
  try {
    const { title, description, category, client_name, rating, project_value } = req.body;
    
    console.log('📝 Extracted data:');
    console.log('  - title:', title);
    console.log('  - description:', description);
    console.log('  - category:', category);
    console.log('  - client_name:', client_name);
    console.log('  - rating:', rating);
    console.log('  - project_value:', project_value);
    
    // Simple validation
    if (!title || title.trim() === '') {
      console.log('❌ Title missing');
      return res.status(400).json({ error: 'Title is required', success: false });
    }
    
    if (!description || description.trim() === '') {
      console.log('❌ Description missing');
      return res.status(400).json({ error: 'Description is required', success: false });
    }
    
    // Create new experience
    const newExperience = {
      id: nextId++,
      title: title.trim(),
      description: description.trim(),
      category: category || 'General',
      client_name: client_name || 'Unknown Client',
      rating: parseInt(rating) || 3,
      project_value: parseFloat(project_value) || 0,
      upvotes: 0,
      downvotes: 0,
      comment_count: 0,
      username: 'freelancer_user',
      created_at: new Date().toISOString()
    };
    
    experiences.unshift(newExperience); // Add to beginning of array
    
    console.log('✅ Experience added successfully:', newExperience);
    
    res.json({ 
      message: 'Experience added successfully!', 
      success: true,
      experience: newExperience
    });
    
  } catch (error) {
    console.error('❌ Error adding experience:', error);
    res.status(500).json({ 
      error: 'Server error while adding experience', 
      success: false,
      details: error.message 
    });
  }
});

// Vote on experience
app.post('/api/experiences/:id/vote', (req, res) => {
  const experienceId = parseInt(req.params.id);
  const { voteType } = req.body;
  
  console.log(`🗳️ Vote: ${voteType} for experience ${experienceId}`);
  
  const experience = experiences.find(exp => exp.id === experienceId);
  if (!experience) {
    return res.status(404).json({ error: 'Experience not found' });
  }
  
  if (voteType === 'up') {
    experience.upvotes++;
  } else if (voteType === 'down') {
    experience.downvotes++;
  }
  
  res.json({ success: true, upvotes: experience.upvotes, downvotes: experience.downvotes });
});

// Add comment
app.post('/api/experiences/:id/comments', (req, res) => {
  const experienceId = parseInt(req.params.id);
  const { content } = req.body;
  
  console.log(`💬 Comment for experience ${experienceId}: ${content}`);
  
  const experience = experiences.find(exp => exp.id === experienceId);
  if (!experience) {
    return res.status(404).json({ error: 'Experience not found' });
  }
  
  experience.comment_count++;
  
  res.json({ 
    success: true, 
    message: 'Comment added successfully',
    comment_count: experience.comment_count 
  });
});

// Get comments for experience
app.get('/api/experiences/:id/comments', (req, res) => {
  const experienceId = parseInt(req.params.id);
  
  // Mock comments for demo
  const mockComments = [
    {
      id: 1,
      content: "Thanks for sharing this experience!",
      username: "user1",
      created_at: new Date().toISOString()
    },
    {
      id: 2,
      content: "Very helpful information.",
      username: "user2", 
      created_at: new Date().toISOString()
    }
  ];
  
  res.json({ comments: mockComments });
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`🚀 Simple backend server running on port ${PORT}`);
  console.log(`✅ Ready to accept experience submissions!`);
});
