import React, { useState, useEffect } from 'react';
import './App.css';

// Authentication hook
const useAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    if (token && userData) {
      setUser(JSON.parse(userData));
    }
    setLoading(false);
  }, []);

  const login = (userData, token) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  return { user, login, logout, loading };
};

// Enhanced Notification Component
const NotificationBell = ({ user }) => {
  const [notifications, setNotifications] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (user) {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 30000); // Check every 30 seconds
      return () => clearInterval(interval);
    }
  }, [user]);

  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/notifications', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setNotifications(data.notifications);
        setUnreadCount(data.notifications.filter(n => !n.is_read).length);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      const token = localStorage.getItem('token');
      await fetch(`http://localhost:5000/api/notifications/${notificationId}/read`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      fetchNotifications();
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  return (
    <div className="notification-container">
      <button 
        className="notification-bell"
        onClick={() => setShowDropdown(!showDropdown)}
      >
        🔔
        {unreadCount > 0 && <span className="notification-badge">{unreadCount}</span>}
      </button>
      
      {showDropdown && (
        <div className="notification-dropdown">
          <h4>Notifications</h4>
          {notifications.length === 0 ? (
            <p>No notifications yet</p>
          ) : (
            notifications.map(notification => (
              <div 
                key={notification.id} 
                className={`notification-item ${!notification.is_read ? 'unread' : ''}`}
                onClick={() => markAsRead(notification.id)}
              >
                <h5>{notification.title}</h5>
                <p>{notification.message}</p>
                <small>{new Date(notification.created_at).toLocaleDateString()}</small>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

// Rules Page Component
const RulesPage = () => {
  return (
    <div className="rules-page">
      <div className="rules-container">
        <h2>📋 FreelancerGuard Community Rules</h2>
        <p className="rules-intro">
          Welcome to FreelancerGuard! To maintain a supportive and professional community, 
          please follow these guidelines when sharing experiences.
        </p>
        
        <div className="rules-section">
          <h3 className="do-section">✅ DO's - What We Encourage</h3>
          <div className="rules-list do-list">
            <div className="rule-item">
              <span className="rule-icon">✅</span>
              <div className="rule-content">
                <strong>Be Honest and Factual</strong>
                <p>Share genuine experiences with accurate details about your interactions with clients.</p>
              </div>
            </div>
            <div className="rule-item">
              <span className="rule-icon">✅</span>
              <div className="rule-content">
                <strong>Provide Constructive Feedback</strong>
                <p>Help others by sharing specific details about communication, payment, and project scope.</p>
              </div>
            </div>
            <div className="rule-item">
              <span className="rule-icon">✅</span>
              <div className="rule-content">
                <strong>Use Professional Language</strong>
                <p>Maintain a respectful tone even when describing negative experiences.</p>
              </div>
            </div>
            <div className="rule-item">
              <span className="rule-icon">✅</span>
              <div className="rule-content">
                <strong>Protect Privacy</strong>
                <p>Use client company names or initials instead of full personal names when possible.</p>
              </div>
            </div>
            <div className="rule-item">
              <span className="rule-icon">✅</span>
              <div className="rule-content">
                <strong>Include Evidence</strong>
                <p>Back up your claims with screenshots, emails, or other documentation when relevant.</p>
              </div>
            </div>
            <div className="rule-item">
              <span className="rule-icon">✅</span>
              <div className="rule-content">
                <strong>Help Others Learn</strong>
                <p>Share lessons learned and tips for avoiding similar situations.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="rules-section">
          <h3 className="dont-section">❌ DON'Ts - What to Avoid</h3>
          <div className="rules-list dont-list">
            <div className="rule-item">
              <span className="rule-icon">❌</span>
              <div className="rule-content">
                <strong>Don't Post False Information</strong>
                <p>Fabricated or exaggerated experiences damage the community's credibility.</p>
              </div>
            </div>
            <div className="rule-item">
              <span className="rule-icon">❌</span>
              <div className="rule-content">
                <strong>Don't Use Offensive Language</strong>
                <p>Profanity, hate speech, or discriminatory language is not tolerated.</p>
              </div>
            </div>
            <div className="rule-item">
              <span className="rule-icon">❌</span>
              <div className="rule-content">
                <strong>Don't Share Personal Details</strong>
                <p>Avoid posting full names, addresses, phone numbers, or other sensitive information.</p>
              </div>
            </div>
            <div className="rule-item">
              <span className="rule-icon">❌</span>
              <div className="rule-content">
                <strong>Don't Spam or Self-Promote</strong>
                <p>This is not a platform for advertising your services or unrelated content.</p>
              </div>
            </div>
            <div className="rule-item">
              <span className="rule-icon">❌</span>
              <div className="rule-content">
                <strong>Don't Retaliate</strong>
                <p>Don't create fake accounts or post revenge experiences. Keep it professional.</p>
              </div>
            </div>
            <div className="rule-item">
              <span className="rule-icon">❌</span>
              <div className="rule-content">
                <strong>Don't Violate Confidentiality</strong>
                <p>Respect NDAs and confidentiality agreements you may have with clients.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="rules-section">
          <h3 className="guidelines-section">💡 Community Guidelines</h3>
          <div className="guidelines-list">
            <div className="guideline-item">
              <strong>Voting System:</strong> Use upvotes for helpful, accurate experiences and downvotes for suspicious or unhelpful content.
            </div>
            <div className="guideline-item">
              <strong>Comment Respectfully:</strong> When commenting on experiences, be constructive and supportive.
            </div>
            <div className="guideline-item">
              <strong>Report Issues:</strong> If you notice violations of these rules, please report them to moderators.
            </div>
            <div className="guideline-item">
              <strong>Update Experiences:</strong> If circumstances change with a client, consider updating your review.
            </div>
          </div>
        </div>

        <div className="rules-footer">
          <p>
            <strong>Remember:</strong> FreelancerGuard is built by freelancers, for freelancers. 
            Let's work together to create a trustworthy community that protects and empowers all of us.
          </p>
          <p className="last-updated">
            Last updated: {new Date().toLocaleDateString()}
          </p>
        </div>
      </div>
    </div>
  );
};

// Enhanced User Analytics Dashboard
const UserDashboard = ({ user }) => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/analytics/user', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setAnalytics(data.analytics);
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading">Loading dashboard...</div>;

  return (
    <div className="user-dashboard">
      <h3>📊 Your Dashboard</h3>
      <div className="dashboard-grid">
        <div className="dashboard-card">
          <h4>📝 Experiences</h4>
          <div className="stat-value">{analytics?.totalExperiences || 0}</div>
        </div>
        <div className="dashboard-card">
          <h4>⭐ Average Rating</h4>
          <div className="stat-value">{analytics?.averageRating || '0.0'}</div>
        </div>
        <div className="dashboard-card">
          <h4>👍 Likes Received</h4>
          <div className="stat-value">{analytics?.likesReceived || 0}</div>
        </div>
        <div className="dashboard-card">
          <h4>💬 Comments Received</h4>
          <div className="stat-value">{analytics?.commentsReceived || 0}</div>
        </div>
      </div>
    </div>
  );
};

// Loading Component
const LoadingSpinner = ({ message = "Loading..." }) => (
  <div className="loading-container">
    <div className="loading-spinner">
      <div className="spinner-ring"></div>
      <div className="spinner-ring"></div>
      <div className="spinner-ring"></div>
    </div>
    <p className="loading-message">{message}</p>
  </div>
);

// Enhanced Search and Filters
const SearchAndFilters = ({ onSearch, onFilter }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [category, setCategory] = useState('');
  const [rating, setRating] = useState('');
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState('DESC');

  const handleSearch = () => {
    onSearch({
      query: searchTerm,
      category,
      rating,
      sortBy,
      sortOrder
    });
  };

  return (
    <div className="search-filters">
      <div className="search-bar">
        <input
          type="text"
          placeholder="🔍 Search experiences, clients, or keywords..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
        />
        <button onClick={handleSearch}>Search</button>
      </div>
      
      <div className="filters">
        <select value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="">All Categories</option>
          <option value="Web Development">Web Development</option>
          <option value="Mobile Development">Mobile Development</option>
          <option value="Design">Design</option>
          <option value="Writing">Writing</option>
          <option value="Marketing">Marketing</option>
          <option value="Data Entry">Data Entry</option>
          <option value="Translation">Translation</option>
          <option value="Video Editing">Video Editing</option>
          <option value="Photography">Photography</option>
          <option value="Consulting">Consulting</option>
          <option value="Other">Other</option>
        </select>
        
        <select value={rating} onChange={(e) => setRating(e.target.value)}>
          <option value="">All Ratings</option>
          <option value="4">4+ Stars</option>
          <option value="3">3+ Stars</option>
          <option value="2">2+ Stars</option>
          <option value="1">1+ Stars</option>
        </select>
        
        <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
          <option value="created_at">Date Created</option>
          <option value="rating">Rating</option>
          <option value="upvotes">Most Liked</option>
          <option value="comment_count">Most Commented</option>
        </select>
        
        <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value)}>
          <option value="DESC">Newest First</option>
          <option value="ASC">Oldest First</option>
        </select>
      </div>
    </div>
  );
};

// Enhanced Experience Card
const ExperienceCard = ({ experience, onVote, onComment, user }) => {
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [userVote, setUserVote] = useState(null);
  const [isVoting, setIsVoting] = useState(false);
  const [isCommenting, setIsCommenting] = useState(false);
  const [localUpvotes, setLocalUpvotes] = useState(experience.upvotes || 0);
  const [localDownvotes, setLocalDownvotes] = useState(experience.downvotes || 0);

  // Check user's current vote on mount
  useEffect(() => {
    const checkUserVote = async () => {
      if (user) {
        try {
          const token = localStorage.getItem('token');
          const response = await fetch(`http://localhost:5000/api/experiences/${experience.id}/user-vote`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          if (response.ok) {
            const data = await response.json();
            setUserVote(data.voteType);
          }
        } catch (error) {
          console.error('Error checking user vote:', error);
        }
      }
    };
    checkUserVote();
  }, [experience.id, user]);

  const fetchComments = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/experiences/${experience.id}/comments`);
      if (response.ok) {
        const data = await response.json();
        setComments(data.comments);
      }
    } catch (error) {
      console.error('Error fetching comments:', error);
    }
  };

  const handleVote = async (voteType) => {
    if (!user) {
      // Create a beautiful login prompt
      const loginPrompt = document.createElement('div');
      loginPrompt.className = 'login-prompt';
      loginPrompt.innerHTML = `
        <div class="login-prompt-content">
          <h3>🔐 Login Required</h3>
          <p>Please login to vote on experiences</p>
          <button onclick="this.parentElement.parentElement.remove()" class="login-prompt-btn">OK</button>
        </div>
      `;
      document.body.appendChild(loginPrompt);
      setTimeout(() => loginPrompt.remove(), 3000);
      return;
    }
    
    setIsVoting(true);
    
    // Optimistic update
    const wasVoted = userVote === voteType;
    const oldUserVote = userVote;
    
    if (wasVoted) {
      // Remove vote
      setUserVote(null);
      if (voteType === 'up') {
        setLocalUpvotes(prev => Math.max(0, prev - 1));
      } else {
        setLocalDownvotes(prev => Math.max(0, prev - 1));
      }
    } else {
      // Add new vote or change vote
      if (oldUserVote) {
        // Changing vote
        if (oldUserVote === 'up') {
          setLocalUpvotes(prev => Math.max(0, prev - 1));
        } else {
          setLocalDownvotes(prev => Math.max(0, prev - 1));
        }
      }
      
      setUserVote(voteType);
      if (voteType === 'up') {
        setLocalUpvotes(prev => prev + 1);
      } else {
        setLocalDownvotes(prev => prev + 1);
      }
    }
    
    const result = await onVote(experience.id, voteType);
    if (result) {
      // Add visual feedback
      const button = document.querySelector(`[data-experience="${experience.id}"] .vote-btn.${voteType === 'up' ? 'upvote' : 'downvote'}`);
      if (button) {
        button.style.transform = 'scale(1.2)';
        setTimeout(() => {
          button.style.transform = '';
        }, 200);
      }
    } else {
      // Revert optimistic update on failure
      setUserVote(oldUserVote);
      setLocalUpvotes(experience.upvotes || 0);
      setLocalDownvotes(experience.downvotes || 0);
    }
    setIsVoting(false);
  };

  const handleComment = async () => {
    if (!user) {
      const loginPrompt = document.createElement('div');
      loginPrompt.className = 'login-prompt';
      loginPrompt.innerHTML = `
        <div class="login-prompt-content">
          <h3>🔐 Login Required</h3>
          <p>Please login to comment on experiences</p>
          <button onclick="this.parentElement.parentElement.remove()" class="login-prompt-btn">OK</button>
        </div>
      `;
      document.body.appendChild(loginPrompt);
      setTimeout(() => loginPrompt.remove(), 3000);
      return;
    }
    
    if (!newComment.trim()) return;
    
    setIsCommenting(true);
    const result = await onComment(experience.id, newComment);
    if (result) {
      setNewComment('');
      fetchComments();
      // Add success animation
      const commentForm = document.querySelector(`[data-experience="${experience.id}"] .comment-submit`);
      if (commentForm) {
        const originalText = commentForm.textContent;
        commentForm.textContent = '✓ Posted!';
        commentForm.style.background = 'linear-gradient(135deg, #28a745 0%, #20c997 100%)';
        setTimeout(() => {
          commentForm.textContent = originalText;
          commentForm.style.background = '';
        }, 2000);
      }
    }
    setIsCommenting(false);
  };

  const toggleComments = () => {
    setShowComments(!showComments);
    if (!showComments) {
      fetchComments();
    }
  };

  const getStars = (rating) => {
    return '⭐'.repeat(rating) + '☆'.repeat(5 - rating);
  };

  const getRatingColor = (rating) => {
    if (rating >= 4) return '#28a745';
    if (rating >= 3) return '#ffc107';
    return '#dc3545';
  };

  return (
    <div className="experience-card" data-experience={experience.id}>
      <div className="experience-header">
        <h3>{experience.title}</h3>
        <div className="rating-container">
          <span className="rating" style={{ color: getRatingColor(experience.rating) }}>
            {getStars(experience.rating)}
          </span>
          <span className="rating-number">({experience.rating}/5)</span>
        </div>
      </div>
      
      <div className="experience-meta">
        <span className="author">👤 {experience.username}</span>
        <span className="category">🏷️ {experience.category}</span>
        <span className="date">📅 {new Date(experience.created_at).toLocaleDateString()}</span>
      </div>
      
      <div className="client-info">
        <strong>Client:</strong> {experience.client_name}
        {experience.client_email && <span> ({experience.client_email})</span>}
        {experience.is_verified && <span className="verified">✅ Verified</span>}
      </div>
      
      {experience.image_url && (
        <div className="experience-image">
          <img 
            src={`http://localhost:5000${experience.image_url}`} 
            alt="Project screenshot"
            className="project-image"
            onClick={() => {
              // Open image in modal
              const modal = document.createElement('div');
              modal.className = 'image-modal';
              modal.innerHTML = `
                <div class="image-modal-content">
                  <img src="http://localhost:5000${experience.image_url}" alt="Project screenshot" />
                  <button class="close-modal">✕</button>
                </div>
              `;
              document.body.appendChild(modal);
              modal.querySelector('.close-modal').onclick = () => modal.remove();
              modal.onclick = (e) => {
                if (e.target === modal) modal.remove();
              };
            }}
          />
        </div>
      )}
      
      <p className="description">{experience.description}</p>
      
      <div className="experience-actions">
        <div className="vote-section">
          <button 
            className={`vote-btn upvote ${userVote === 'up' ? 'active' : ''} ${isVoting ? 'loading' : ''}`}
            onClick={() => handleVote('up')}
            disabled={isVoting}
          >
            <span className="vote-icon">👍</span>
            <span>{localUpvotes}</span>
          </button>
          <button 
            className={`vote-btn downvote ${userVote === 'down' ? 'active' : ''} ${isVoting ? 'loading' : ''}`}
            onClick={() => handleVote('down')}
            disabled={isVoting}
          >
            <span className="vote-icon">👎</span>
            <span>{localDownvotes}</span>
          </button>
        </div>
        
        <button className="comment-toggle" onClick={toggleComments}>
          <span className="comment-icon">💬</span>
          <span>Comments ({experience.comment_count || 0})</span>
        </button>
      </div>
      
      {showComments && (
        <div className="comments-section">
          {user && (
            <div className="comment-form">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Share your thoughts..."
                rows="3"
                className="comment-textarea"
              />
              <button 
                onClick={handleComment}
                disabled={isCommenting || !newComment.trim()}
                className={`comment-submit ${isCommenting ? 'loading' : ''}`}
              >
                {isCommenting ? '⏳ Posting...' : '📝 Post Comment'}
              </button>
            </div>
          )}
          
          <div className="comments-list">
            {comments.length === 0 ? (
              <div className="no-comments">
                <span>💭</span>
                <p>No comments yet. Be the first to share your thoughts!</p>
              </div>
            ) : (
              comments.map(comment => (
                <div key={comment.id} className="comment">
                  <div className="comment-header">
                    <strong className="comment-author">👤 {comment.username}</strong>
                    <small className="comment-date">{new Date(comment.created_at).toLocaleDateString()}</small>
                  </div>
                  <p className="comment-text">{comment.content}</p>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// Experience List Component
const ExperienceList = ({ experiences, onVote, onComment, user }) => {
  if (experiences.length === 0) {
    return (
      <div className="no-experiences">
        <h3>No experiences found</h3>
        <p>Be the first to share your freelancing experience!</p>
      </div>
    );
  }

  return (
    <div className="experience-list">
      {experiences.map(experience => (
        <ExperienceCard
          key={experience.id}
          experience={experience}
          onVote={onVote}
          onComment={onComment}
          user={user}
        />
      ))}
    </div>
  );
};

// Enhanced Experience Form
const ExperienceForm = ({ onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    client_name: '',
    client_email: '',
    category: 'Web Development',
    client_type: 'Individual',
    rating: 5,
    project_value: '',
    payment_method: '',
    project_duration_days: ''
  });
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Create FormData to handle file upload
    const submitData = new FormData();
    Object.keys(formData).forEach(key => {
      submitData.append(key, formData[key]);
    });
    
    if (selectedImage) {
      submitData.append('image', selectedImage);
    }
    
    await onSubmit(submitData);
    setIsSubmitting(false);
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('Image size should be less than 5MB');
        return;
      }
      
      setSelectedImage(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    document.getElementById('image-upload').value = '';
  };

  return (
    <div className="form-overlay">
      <form className="experience-form" onSubmit={handleSubmit}>
        <h3>📝 Share Your Experience</h3>
        
        <input
          type="text"
          name="title"
          placeholder="Experience title"
          value={formData.title}
          onChange={handleChange}
          required
          className="form-input"
        />
        
        <textarea
          name="description"
          placeholder="Describe your experience..."
          value={formData.description}
          onChange={handleChange}
          rows="4"
          required
          className="form-textarea"
        />
        
        <input
          type="text"
          name="client_name"
          placeholder="Client name *"
          value={formData.client_name}
          onChange={handleChange}
          required
          className="form-input"
        />
        
        <input
          type="email"
          name="client_email"
          placeholder="Client email (optional)"
          value={formData.client_email}
          onChange={handleChange}
          className="form-input"
        />

        {/* Image Upload Section */}
        <div className="image-upload-section">
          <label className="image-upload-label">
            <span className="upload-icon">📸</span>
            <span>Add Project Image (Optional)</span>
            <input
              id="image-upload"
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="image-upload-input"
            />
          </label>
          
          {imagePreview && (
            <div className="image-preview">
              <img src={imagePreview} alt="Preview" className="preview-image" />
              <button type="button" onClick={removeImage} className="remove-image-btn">
                ❌ Remove
              </button>
            </div>
          )}
        </div>
        
        <div className="form-row">
          <select name="category" value={formData.category} onChange={handleChange} className="form-select">
            <option value="Web Development">Web Development</option>
            <option value="Mobile Development">Mobile Development</option>
            <option value="Design">Design</option>
            <option value="Writing">Writing</option>
            <option value="Marketing">Marketing</option>
            <option value="Data Entry">Data Entry</option>
            <option value="Translation">Translation</option>
            <option value="Video Editing">Video Editing</option>
            <option value="Photography">Photography</option>
            <option value="Consulting">Consulting</option>
            <option value="Other">Other</option>
          </select>
          
          <select name="client_type" value={formData.client_type} onChange={handleChange} className="form-select">
            <option value="Individual">Individual</option>
            <option value="Small Business">Small Business</option>
            <option value="Enterprise">Enterprise</option>
            <option value="Agency">Agency</option>
            <option value="Startup">Startup</option>
            <option value="Non-profit">Non-profit</option>
          </select>
        </div>
        
        <div className="form-row">
          <input
            type="number"
            name="project_value"
            placeholder="Project value ($)"
            value={formData.project_value}
            onChange={handleChange}
            min="0"
            step="0.01"
            className="form-input"
          />
          <input
            type="text"
            name="payment_method"
            placeholder="Payment method"
            value={formData.payment_method}
            onChange={handleChange}
            className="form-input"
          />
        </div>
        
        <input
          type="number"
          name="project_duration_days"
          placeholder="Project duration (days)"
          value={formData.project_duration_days}
          onChange={handleChange}
          min="1"
          className="form-input"
        />
        
        <div className="rating-section">
          <label>Rating: </label>
          <select name="rating" value={formData.rating} onChange={handleChange} className="form-select">
            <option value="5">⭐⭐⭐⭐⭐ Excellent</option>
            <option value="4">⭐⭐⭐⭐☆ Good</option>
            <option value="3">⭐⭐⭐☆☆ Average</option>
            <option value="2">⭐⭐☆☆☆ Poor</option>
            <option value="1">⭐☆☆☆☆ Terrible</option>
          </select>
        </div>
        
        <div className="form-actions">
          <button type="submit" disabled={isSubmitting} className="submit-btn">
            {isSubmitting ? '⏳ Sharing...' : '🚀 Share Experience'}
          </button>
          <button type="button" onClick={onCancel} className="cancel-btn">
            ❌ Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

// Login Form Component
const LoginForm = ({ onLogin, onSwitchToRegister }) => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      const data = await response.json();
      
      if (response.ok) {
        onLogin(data.user, data.token);
      } else {
        alert(data.error || 'Login failed');
      }
    } catch (error) {
      alert('Login error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="auth-form" onSubmit={handleSubmit}>
      <h2>🔐 Login to FreelancerGuard</h2>
      <input
        type="email"
        placeholder="Email"
        value={formData.email}
        onChange={(e) => setFormData({...formData, email: e.target.value})}
        required
      />
      <input
        type="password"
        placeholder="Password"
        value={formData.password}
        onChange={(e) => setFormData({...formData, password: e.target.value})}
        required
      />
      <button type="submit" disabled={loading}>
        {loading ? 'Logging in...' : 'Login'}
      </button>
      <p>
        Don't have an account?{' '}
        <button type="button" onClick={onSwitchToRegister}>Register here</button>
      </p>
    </form>
  );
};

// Register Form Component
const RegisterForm = ({ onRegister, onSwitchToLogin }) => {
  const [formData, setFormData] = useState({ 
    username: '', 
    email: '', 
    password: '',
    bio: '',
    location: ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const response = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      const data = await response.json();
      
      if (response.ok) {
        onRegister(data.user, data.token);
      } else {
        alert(data.error || 'Registration failed');
      }
    } catch (error) {
      alert('Registration error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="auth-form" onSubmit={handleSubmit}>
      <h2>📝 Join FreelancerGuard</h2>
      <input
        type="text"
        placeholder="Username"
        value={formData.username}
        onChange={(e) => setFormData({...formData, username: e.target.value})}
        required
      />
      <input
        type="email"
        placeholder="Email"
        value={formData.email}
        onChange={(e) => setFormData({...formData, email: e.target.value})}
        required
      />
      <input
        type="password"
        placeholder="Password"
        value={formData.password}
        onChange={(e) => setFormData({...formData, password: e.target.value})}
        required
      />
      <textarea
        placeholder="Tell us about yourself (optional)"
        value={formData.bio}
        onChange={(e) => setFormData({...formData, bio: e.target.value})}
        rows="3"
      />
      <input
        type="text"
        placeholder="Location (optional)"
        value={formData.location}
        onChange={(e) => setFormData({...formData, location: e.target.value})}
      />
      <button type="submit" disabled={loading}>
        {loading ? 'Creating account...' : 'Register'}
      </button>
      <p>
        Already have an account?{' '}
        <button type="button" onClick={onSwitchToLogin}>Login here</button>
      </p>
    </form>
  );
};

// Main App Component
function App() {
  const { user, login, logout, loading } = useAuth();
  const [currentView, setCurrentView] = useState('experiences'); // experiences, dashboard
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState('login'); // login, register
  const [showExperienceForm, setShowExperienceForm] = useState(false);
  const [experiences, setExperiences] = useState([]);
  const [filteredExperiences, setFilteredExperiences] = useState([]);
  const [loadingExperiences, setLoadingExperiences] = useState(true);

  useEffect(() => {
    fetchExperiences();
  }, []);

  const fetchExperiences = async (searchParams = {}) => {
    try {
      setLoadingExperiences(true);
      let url = 'http://localhost:5000/api/experiences';
      
      if (Object.keys(searchParams).length > 0) {
        const params = new URLSearchParams(searchParams);
        url = `http://localhost:5000/api/experiences/search?${params}`;
      }
      
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        setExperiences(data.experiences);
        setFilteredExperiences(data.experiences);
      }
    } catch (error) {
      console.error('Error fetching experiences:', error);
    } finally {
      setLoadingExperiences(false);
    }
  };

  const handleVote = async (experienceId, voteType) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/experiences/${experienceId}/vote`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ voteType: voteType })
      });
      
      if (response.ok) {
        fetchExperiences(); // Refresh experiences
        return true;
      } else if (response.status === 401) {
        // Token expired or invalid
        const data = await response.json();
        if (data.error && data.error.includes('expired')) {
          alert('⏰ Your session has expired. Please login again to vote.');
          logout();
          setShowAuthModal(true);
          setAuthMode('login');
        }
        return false;
      }
    } catch (error) {
      console.error('Error voting:', error);
    }
    return false;
  };

  const handleComment = async (experienceId, comment) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/experiences/${experienceId}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ content: comment })
      });
      
      if (response.ok) {
        fetchExperiences(); // Refresh experiences
        return true;
      } else if (response.status === 401) {
        // Token expired or invalid
        const data = await response.json();
        if (data.error && data.error.includes('expired')) {
          alert('⏰ Your session has expired. Please login again to comment.');
          logout();
          setShowAuthModal(true);
          setAuthMode('login');
        }
        return false;
      }
    } catch (error) {
      console.error('Error commenting:', error);
    }
    return false;
  };

  const handleCreateExperience = async (formData) => {
    try {
      const token = localStorage.getItem('token');
      
      // Check if formData is FormData (with file) or regular object
      let requestOptions;
      if (formData instanceof FormData) {
        // FormData for file upload
        requestOptions = {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
            // Don't set Content-Type for FormData, let browser set it with boundary
          },
          body: formData
        };
      } else {
        // Regular JSON data
        requestOptions = {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(formData)
        };
      }
      
      const response = await fetch('http://localhost:5000/api/experiences', requestOptions);
      
      if (response.ok) {
        setShowExperienceForm(false);
        fetchExperiences();
        // Show success message with animation
        const successMsg = document.createElement('div');
        successMsg.className = 'success-toast';
        successMsg.textContent = '✅ Experience shared successfully!';
        document.body.appendChild(successMsg);
        setTimeout(() => {
          successMsg.remove();
        }, 3000);
      } else if (response.status === 401) {
        // Token expired or invalid
        const data = await response.json();
        if (data.error && data.error.includes('expired')) {
          alert('⏰ Your session has expired. Please login again to continue.');
          logout(); // This will clear the token and user data
          setShowAuthModal(true);
          setAuthMode('login');
        } else {
          alert('❌ Authentication failed. Please login again.');
          logout();
          setShowAuthModal(true);
          setAuthMode('login');
        }
      } else {
        const data = await response.json();
        alert('❌ ' + (data.error || 'Failed to create experience'));
      }
    } catch (error) {
      alert('Error creating experience: ' + error.message);
    }
  };

  const handleSearch = (searchParams) => {
    fetchExperiences(searchParams);
  };

  if (loading) {
    return <div className="loading">Loading FreelancerGuard...</div>;
  }

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-content">
          <h1 className="logo">🛡️ FreelancerGuard</h1>
          <nav className="nav-tabs">
            <button 
              className={currentView === 'experiences' ? 'active' : ''}
              onClick={() => setCurrentView('experiences')}
            >
              📝 Experiences
            </button>
            <button 
              className={currentView === 'rules' ? 'active' : ''}
              onClick={() => setCurrentView('rules')}
            >
              📋 Rules
            </button>
            {user && (
              <button 
                className={currentView === 'dashboard' ? 'active' : ''}
                onClick={() => setCurrentView('dashboard')}
              >
                📊 Dashboard
              </button>
            )}
          </nav>
          <div className="header-actions">
            {user ? (
              <>
                <NotificationBell user={user} />
                <button 
                  className="create-btn"
                  onClick={() => setShowExperienceForm(true)}
                >
                  ➕ Share Experience
                </button>
                <span className="user-info">👤 {user.username}</span>
                <button onClick={logout}>🚪 Logout</button>
              </>
            ) : (
              <button onClick={() => setShowAuthModal(true)}>
                🔑 Login / Register
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="main-content">
        {currentView === 'experiences' && (
          <>
            <SearchAndFilters onSearch={handleSearch} />
            {loadingExperiences ? (
              <LoadingSpinner message="Loading experiences..." />
            ) : (
              <ExperienceList
                experiences={filteredExperiences}
                onVote={handleVote}
                onComment={handleComment}
                user={user}
              />
            )}
          </>
        )}
        
        {currentView === 'rules' && (
          <RulesPage />
        )}
        
        {currentView === 'dashboard' && user && (
          <UserDashboard user={user} />
        )}
      </main>

      {showAuthModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <button 
              className="close-btn"
              onClick={() => setShowAuthModal(false)}
            >
              ❌
            </button>
            {authMode === 'login' ? (
              <LoginForm
                onLogin={(userData, token) => {
                  login(userData, token);
                  setShowAuthModal(false);
                }}
                onSwitchToRegister={() => setAuthMode('register')}
              />
            ) : (
              <RegisterForm
                onRegister={(userData, token) => {
                  login(userData, token);
                  setShowAuthModal(false);
                }}
                onSwitchToLogin={() => setAuthMode('login')}
              />
            )}
          </div>
        </div>
      )}

      {showExperienceForm && (
        <ExperienceForm
          onSubmit={handleCreateExperience}
          onCancel={() => setShowExperienceForm(false)}
        />
      )}
    </div>
  );
}

export default App;
