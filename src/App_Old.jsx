import React, { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import './App.css';

// Simple Search Component
const SearchAndFilters = ({ searchTerm, setSearchTerm, filterCategory, setFilterCategory, sortBy, setSortBy, onAddExperience }) => {
  const categories = [
    "All",
    "Web Development", 
    "Mobile Development",
    "Design", 
    "Writing", 
    "Marketing", 
    "Data Entry", 
    "Translation", 
    "Video Editing", 
    "Photography", 
    "Consulting", 
    "Other"
  ];

  return (
    <div className="search-filters">
      <div className="search-bar">
        <input
          type="text"
          placeholder="Search experiences..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="form-input"
          style={{ marginBottom: '15px' }}
        />
      </div>
      
      <div className="filters-row">
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="form-select"
          style={{ marginRight: '10px', width: 'auto' }}
        >
          {categories.map((cat) => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>

        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="form-select"
          style={{ marginRight: '10px', width: 'auto' }}
        >
          <option value="recent">Most Recent</option>
          <option value="rating">Highest Rated</option>
          <option value="popular">Most Popular</option>
        </select>

        <button
          onClick={onAddExperience}
          className="btn btn-primary"
          style={{ marginLeft: 'auto' }}
        >
          ✨ Share Experience
        </button>
      </div>
    </div>
  );
};

// Enhanced Experience Card Component  
const ExperienceCard = ({ exp, onLike, onRefresh }) => {
  const [expanded, setExpanded] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loadingComments, setLoadingComments] = useState(false);
  const [submittingComment, setSubmittingComment] = useState(false);
  const { isAuthenticated } = useAuth();
  
  const getStars = (rating) => {
    return '★'.repeat(rating) + '☆'.repeat(5 - rating);
  };

  const getCategoryColor = (category) => {
    const colors = {
      'Web Development': '#007bff',
      'Design': '#28a745', 
      'Writing': '#ffc107',
      'Marketing': '#17a2b8',
      'Other': '#6c757d'
    };
    return colors[category] || '#6c757d';
  };

  const fetchComments = async () => {
    if (loadingComments) return;
    
    setLoadingComments(true);
    try {
      const response = await fetch(`http://localhost:5000/api/experiences/${exp.id}/comments`);
      if (response.ok) {
        const data = await response.json();
        setComments(data.comments || []);
      }
    } catch (error) {
      console.error('Error fetching comments:', error);
    } finally {
      setLoadingComments(false);
    }
  };

  const handleToggleComments = () => {
    if (!showComments) {
      fetchComments();
    }
    setShowComments(!showComments);
  };

  const handleAddComment = async () => {
    if (!isAuthenticated) {
      alert('Please login to comment');
      return;
    }

    if (!newComment.trim()) {
      alert('Please enter a comment');
      return;
    }

    setSubmittingComment(true);
    try {
      const response = await fetch(`http://localhost:5000/api/experiences/${exp.id}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ content: newComment.trim() })
      });

      if (response.ok) {
        setNewComment('');
        fetchComments(); // Refresh comments
        if (onRefresh) onRefresh(); // Refresh the experience list to update comment count
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to add comment');
      }
    } catch (error) {
      console.error('Error adding comment:', error);
      alert('Error adding comment');
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleVote = async (voteType) => {
    try {
      // Convert 'up'/'down' to 'upvote'/'downvote' for backend
      const vote_type = voteType === 'up' ? 'upvote' : 'downvote';
      console.log(`🗳️ Voting ${vote_type} for experience ${exp.id}`);
      
      const response = await fetch(`http://localhost:5000/api/experiences/${exp.id}/vote`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ vote_type })
      });

      const data = await response.json();
      
      if (data.success) {
        // Update the experience with new vote counts from response
        if (data.experience) {
          exp.upvotes = data.experience.upvotes;
          exp.downvotes = data.experience.downvotes;
        }
        
        // Refresh the experiences list to show updated counts
        if (onRefresh) {
          onRefresh();
        }
        
        console.log(`✅ Vote recorded: ${exp.upvotes} up, ${exp.downvotes} down`);
      } else {
        console.error('❌ Failed to record vote:', data.error);
      }
    } catch (error) {
      console.error('❌ Error voting:', error);
    }
  };

  const loadComments = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/experiences/${exp.id}/comments`);
      const data = await response.json();
      setComments(data.comments || []);
    } catch (error) {
      console.error('❌ Error loading comments:', error);
    }
  };

  return (
    <div className="experience-card">
      <div className="experience-header">
        <div>
          <h3 className="experience-title">{exp.title}</h3>
          <div className="experience-meta">
            <span>👤 {exp.username || 'Anonymous'}</span>
            <span>📅 {new Date(exp.created_at).toLocaleDateString()}</span>
            <span className="rating">⭐ {getStars(exp.rating)} ({exp.rating}/5)</span>
          </div>
        </div>
      </div>

      <div className="experience-content">
        <p className="experience-description">
          {expanded ? exp.description : 
           exp.description.length > 200 ? 
           `${exp.description.substring(0, 200)}...` : 
           exp.description
          }
          {exp.description.length > 200 && (
            <button 
              onClick={() => setExpanded(!expanded)}
              style={{ color: '#007bff', background: 'none', border: 'none', cursor: 'pointer', marginLeft: '5px' }}
            >
              {expanded ? 'Show less' : 'Read more'}
            </button>
          )}
        </p>
      </div>

      <div className="experience-details">
        {exp.client_name && (
          <div><strong>Client:</strong> {exp.client_name}</div>
        )}
        {exp.project_value && (
          <div><strong>Project Value:</strong> ${parseFloat(exp.project_value).toLocaleString()}</div>
        )}
        <div><strong>Category:</strong> 
          <span 
            style={{ 
              color: getCategoryColor(exp.category), 
              fontWeight: 'bold',
              marginLeft: '5px'
            }}
          >
            {exp.category}
          </span>
        </div>
      </div>

      <div className="experience-actions">
        <button 
          onClick={() => handleVote('up')}
          className="btn btn-secondary"
          style={{ fontSize: '14px', padding: '5px 10px' }}
        >
          👍 {exp.upvotes || 0}
        </button>
        <button 
          onClick={() => handleVote('down')}
          className="btn btn-secondary"
          style={{ fontSize: '14px', padding: '5px 10px' }}
        >
          � {exp.downvotes || 0}
        </button>
        <button 
          onClick={handleToggleComments}
          className="btn btn-secondary"
          style={{ fontSize: '14px', padding: '5px 10px' }}
        >
          💬 {exp.comment_count || 0}
        </button>
        <button 
          className="btn btn-secondary"
          style={{ fontSize: '14px', padding: '5px 10px' }}
        >
          📤 Share
        </button>
      </div>

      {/* Comments Section */}
      {showComments && (
        <div className="comments-section" style={{ 
          marginTop: '15px', 
          paddingTop: '15px', 
          borderTop: '1px solid #eee' 
        }}>
          <h4 style={{ marginBottom: '10px', fontSize: '16px' }}>Comments</h4>
          
          {/* Add Comment Form */}
          {isAuthenticated && (
            <div className="add-comment" style={{ marginBottom: '15px' }}>
              <div style={{ display: 'flex', gap: '10px' }}>
                <input
                  type="text"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Add a comment..."
                  className="form-input"
                  style={{ flex: 1, marginBottom: 0 }}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddComment()}
                />
                <button
                  onClick={handleAddComment}
                  disabled={submittingComment || !newComment.trim()}
                  className="btn btn-primary"
                  style={{ padding: '8px 16px' }}
                >
                  {submittingComment ? '...' : 'Post'}
                </button>
              </div>
            </div>
          )}

          {/* Comments List */}
          {loadingComments ? (
            <div style={{ textAlign: 'center', padding: '10px', color: '#666' }}>
              Loading comments...
            </div>
          ) : comments.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '10px', color: '#666' }}>
              No comments yet. {isAuthenticated ? 'Be the first to comment!' : 'Login to add a comment.'}
            </div>
          ) : (
            <div className="comments-list">
              {comments.map((comment) => (
                <div key={comment.id} className="comment" style={{
                  background: '#f8f9fa',
                  padding: '10px',
                  borderRadius: '6px',
                  marginBottom: '8px'
                }}>
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    marginBottom: '5px',
                    fontSize: '12px',
                    color: '#666'
                  }}>
                    <strong>{comment.username}</strong>
                    <span>{new Date(comment.created_at).toLocaleDateString()}</span>
                  </div>
                  <div style={{ fontSize: '14px', color: '#333' }}>
                    {comment.content}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// Enhanced Experience List Component
const ExperienceList = ({ refreshKey, onAddExperience }) => {
  const [experiences, setExperiences] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');
  const [sortBy, setSortBy] = useState('recent');
  const { isAuthenticated } = useAuth();

  const fetchExperiences = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/experiences', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setExperiences(data.experiences || []);
      } else {
        setError('Failed to load experiences');
      }
    } catch (error) {
      setError('Error loading experiences');
      console.error('Error fetching experiences:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async (expId) => {
    if (!isAuthenticated) {
      alert('Please login to like experiences');
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/api/experiences/${expId}/vote`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ voteType: 'up' })
      });

      if (response.ok) {
        // Refresh experiences to show updated vote count
        fetchExperiences();
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to vote');
      }
    } catch (error) {
      console.error('Error voting:', error);
      alert('Error voting on experience');
    }
  };

  React.useEffect(() => {
    fetchExperiences();
  }, [refreshKey]);

  // Filter and sort experiences
  const filteredExperiences = React.useMemo(() => {
    let filtered = experiences.filter(exp => {
      const matchesSearch = exp.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           exp.description?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = filterCategory === 'All' || exp.category === filterCategory;
      return matchesSearch && matchesCategory;
    });

    // Sort experiences
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'recent':
          return new Date(b.created_at) - new Date(a.created_at);
        case 'rating':
          return b.rating - a.rating;
        case 'popular':
          return (b.upvotes || 0) - (a.upvotes || 0);
        default:
          return 0;
      }
    });

    return filtered;
  }, [experiences, searchTerm, filterCategory, sortBy]);

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '20px' }}>🔄 Loading experiences...</div>;
  }

  if (error) {
    return <div className="message message-error">{error}</div>;
  }

  return (
    <div className="experiences-section">
      <SearchAndFilters
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        filterCategory={filterCategory}
        setFilterCategory={setFilterCategory}
        sortBy={sortBy}
        setSortBy={setSortBy}
        onAddExperience={onAddExperience}
      />

      <div className="experiences-stats" style={{ margin: '20px 0', padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
        <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', fontSize: '14px' }}>
          <span><strong>{experiences.length}</strong> Total Experiences</span>
          <span><strong>{experiences.filter(exp => exp.rating >= 4).length}</strong> Positive Reviews</span>
          <span><strong>{filteredExperiences.length}</strong> Showing</span>
        </div>
      </div>

      {filteredExperiences.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
          <h3>📝 No experiences found</h3>
          <p>Try adjusting your search or be the first to share an experience!</p>
        </div>
      ) : (
        <div className="experiences-list">
          {filteredExperiences.map((exp) => (
            <ExperienceCard 
              key={exp.id} 
              exp={exp} 
              onLike={handleLike}
              onRefresh={fetchExperiences}
            />
          ))}
        </div>
      )}
    </div>
  );
};

// Experience Form Component
const ExperienceForm = ({ isOpen, onClose, onSubmit, onExperienceAdded }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Web Development',
    client_name: '',
    rating: 3,
    project_value: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');

  const categories = [
    'Web Development', 'Mobile Development', 'Design', 'Writing', 
    'Marketing', 'Data Entry', 'Translation', 'Video Editing', 
    'Photography', 'Consulting', 'Other'
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');

    // Trim whitespace from all text fields
    const cleanedFormData = {
      ...formData,
      title: formData.title?.trim() || '',
      description: formData.description?.trim() || '',
      client_name: formData.client_name?.trim() || '',
      category: formData.category || 'Web Development',
      rating: parseInt(formData.rating) || 3,
      project_value: parseFloat(formData.project_value) || 0
    };

    console.log('🔍 Form data being submitted:', JSON.stringify(cleanedFormData, null, 2));
    console.log('🔍 Form data fields:');
    console.log('  - title:', `"${cleanedFormData.title}" (length: ${cleanedFormData.title.length})`);
    console.log('  - description:', `"${cleanedFormData.description}" (length: ${cleanedFormData.description.length})`);
    console.log('  - category:', cleanedFormData.category);
    console.log('  - client_name:', cleanedFormData.client_name);
    console.log('  - rating:', cleanedFormData.rating);
    console.log('  - project_value:', cleanedFormData.project_value);

    // Frontend validation
    if (!cleanedFormData.title || !cleanedFormData.description) {
      setMessage('❌ Please fill in both title and description');
      setIsLoading(false);
      return;
    }

    try {
      const result = await onSubmit(cleanedFormData);
      if (result.success) {
        setMessage('Experience added successfully!');
        if (onExperienceAdded) onExperienceAdded(); // Refresh the experience list
        setTimeout(() => {
          onClose();
          setMessage('');
          setFormData({
            title: '',
            description: '',
            category: 'Web Development',
            client_name: '',
            rating: 3,
            project_value: ''
          });
        }, 1000);
      } else {
        setMessage(result.error || 'Failed to add experience');
      }
    } catch (error) {
      setMessage(error.message);
    }
    setIsLoading(false);
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2 className="modal-title">Share Your Experience</h2>
          <button className="close-btn" onClick={onClose}>&times;</button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Title:</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              placeholder="Brief title of your experience"
              required
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Description:</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              placeholder="Describe your experience with this client..."
              required
              rows="4"
              className="form-textarea"
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
            <div className="form-group">
              <label className="form-label">Category:</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({...formData, category: e.target.value})}
                className="form-select"
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Client Name:</label>
              <input
                type="text"
                value={formData.client_name}
                onChange={(e) => setFormData({...formData, client_name: e.target.value})}
                className="form-input"
                placeholder="Enter client or company name"
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
            <div className="form-group">
              <label className="form-label">Rating:</label>
              <div className="rating-container">
                {[1, 2, 3, 4, 5].map(star => (
                  <span
                    key={star}
                    className={`star ${star <= formData.rating ? 'active' : ''}`}
                    onClick={() => setFormData({...formData, rating: star})}
                  >
                    ★
                  </span>
                ))}
                <span style={{marginLeft: '10px'}}>({formData.rating}/5)</span>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Project Value ($):</label>
              <input
                type="number"
                value={formData.project_value}
                onChange={(e) => setFormData({...formData, project_value: e.target.value})}
                placeholder="Optional"
                min="0"
                step="0.01"
                className="form-input"
              />
            </div>
          </div>

          {message && (
            <div className={`message ${message.includes('successfully') ? 'message-success' : 'message-error'}`}>
              {message}
            </div>
          )}

          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              type="submit"
              disabled={isLoading}
              className="btn btn-primary"
              style={{ flex: 1 }}
            >
              {isLoading ? '⏳ Adding...' : '✅ Add Experience'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="btn btn-secondary"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Login Modal Component
const LoginModal = ({ isOpen, onClose }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  
  const { login, register } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');

    try {
      if (isLogin) {
        const result = await login({ email: formData.email, password: formData.password });
        if (result.success) {
          setMessage('Login successful!');
          setTimeout(() => onClose(), 1000);
        } else {
          setMessage(result.error || 'Login failed');
        }
      } else {
        const result = await register(formData);
        if (result.success) {
          setMessage('Registration successful! You can now login.');
          setIsLogin(true);
        } else {
          setMessage(result.error || 'Registration failed');
        }
      }
    } catch (error) {
      setMessage(error.message);
    }
    setIsLoading(false);
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2 className="modal-title">{isLogin ? 'Welcome Back' : 'Join FreelancerGuard'}</h2>
          <button className="close-btn" onClick={onClose}>&times;</button>
        </div>
        
        <form onSubmit={handleSubmit}>
          {!isLogin && (
            <div className="form-group">
              <label className="form-label">Username:</label>
              <input
                type="text"
                value={formData.username}
                onChange={(e) => setFormData({...formData, username: e.target.value})}
                required={!isLogin}
                className="form-input"
                placeholder="Choose a username"
              />
            </div>
          )}
          
          <div className="form-group">
            <label className="form-label">Email:</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              required
              className="form-input"
              placeholder="Enter your email"
            />
          </div>
          
          <div className="form-group">
            <label className="form-label">Password:</label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              required
              className="form-input"
              placeholder="Enter your password"
            />
          </div>

          {message && (
            <div className={`message ${message.includes('successful') ? 'message-success' : 'message-error'}`}>
              {message}
            </div>
          )}

          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              type="submit"
              disabled={isLoading}
              className="btn btn-primary"
              style={{ flex: 1 }}
            >
              {isLoading ? '⏳ Loading...' : (isLogin ? '🚀 Login' : '🎯 Register')}
            </button>
            
            <button
              type="button"
              onClick={onClose}
              className="btn btn-secondary"
            >
              Cancel
            </button>
          </div>
        </form>

        <div style={{ textAlign: 'center', marginTop: '15px' }}>
          <button
            type="button"
            onClick={() => setIsLogin(!isLogin)}
            style={{
              background: 'none',
              border: 'none',
              color: '#667eea',
              cursor: 'pointer',
              textDecoration: 'underline',
              fontSize: '14px'
            }}
          >
            {isLogin ? '✨ Need to register?' : '🔑 Already have an account?'}
          </button>
        </div>
      </div>
    </div>
  );
};

// Main App Component
const MainApp = () => {
  const [showModal, setShowModal] = useState(false);
  const [showExperienceForm, setShowExperienceForm] = useState(false);
  const [refreshExperiences, setRefreshExperiences] = useState(0);
  const { user, logout, isAuthenticated } = useAuth();

  const handleAddExperience = async (experienceData) => {
    try {
      console.log('🔥 Adding experience:', JSON.stringify(experienceData, null, 2));
      
      const response = await fetch('http://localhost:5000/api/experiences', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
          // Removed Authorization header for development
        },
        body: JSON.stringify(experienceData)
      });

      const data = await response.json();
      console.log('🔥 Experience response:', data);

      if (response.ok) {
        return { success: true, message: data.message };
      } else {
        return { success: false, error: data.error || 'Failed to add experience' };
      }
    } catch (error) {
      console.error('🔥 Experience error:', error);
      return { success: false, error: error.message };
    }
  };

  const handleExperienceAdded = () => {
    setRefreshExperiences(prev => prev + 1);
  };

  return (
    <div className="app-container">
      {/* Header */}
      <header className="header">
        <a href="/" className="logo">🛡️ FreelancerGuard</a>
        <div className="nav-buttons">
          {isAuthenticated ? (
            <>
              <span style={{ color: '#333', fontWeight: '600' }}>Welcome, {user?.username}!</span>
              <button onClick={logout} className="btn btn-danger">
                🚪 Logout
              </button>
            </>
          ) : (
            <button
              onClick={() => setShowModal(true)}
              className="btn btn-primary"
            >
              🚀 Login / Signup
            </button>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="main-content">
        <div className="welcome-section">
          <h1>🛡️ FreelancerGuard</h1>
          <p>
            Share your freelancing experiences. Help others avoid bad clients and find good ones. 
            Build a community of trust and transparency in the freelancing world.
          </p>
        </div>

        {isAuthenticated ? (
          <div className="experiences-section">
            <div style={{
              background: 'white',
              color: '#333',
              padding: '2rem',
              borderRadius: '8px',
              textAlign: 'center',
              marginBottom: '2rem',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}>
              <h3>🎉 Welcome back, {user?.username}!</h3>
              <p>Ready to share your freelancing experiences and help the community grow?</p>
            </div>

            <ExperienceList 
              key={refreshExperiences} 
              refreshKey={refreshExperiences}
              onAddExperience={() => setShowExperienceForm(true)}
            />
          </div>
        ) : (
          <div className="experiences-section">
            <div style={{ textAlign: 'center' }}>
              <h2>🚀 Get Started Today</h2>
              <p style={{ fontSize: '18px', color: '#666', marginBottom: '30px' }}>
                Join thousands of freelancers sharing their experiences
              </p>
              <button
                onClick={() => setShowModal(true)}
                className="btn btn-primary"
                style={{ fontSize: '18px', padding: '15px 30px' }}
              >
                🎯 Join FreelancerGuard
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Modals */}
      <LoginModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
      />
      
      <ExperienceForm
        isOpen={showExperienceForm}
        onClose={() => setShowExperienceForm(false)}
        onSubmit={handleAddExperience}
        onExperienceAdded={handleExperienceAdded}
      />
    </div>
  );
};

// App component with AuthProvider
function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}

export default App;
