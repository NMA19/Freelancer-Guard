import React, { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import './App.css';

// Experience Form Component
const ExperienceForm = ({ isOpen, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Web Development',
    client_type: 'Individual',
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

  const clientTypes = [
    'Individual', 'Small Business', 'Enterprise', 'Agency', 'Startup', 'Non-profit'
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');

    try {
      const result = await onSubmit(formData);
      if (result.success) {
        setMessage('Experience added successfully!');
        setTimeout(() => {
          onClose();
          setMessage('');
          setFormData({
            title: '',
            description: '',
            category: 'Web Development',
            client_type: 'Individual',
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
              <label className="form-label">Client Type:</label>
              <select
                value={formData.client_type}
                onChange={(e) => setFormData({...formData, client_type: e.target.value})}
                className="form-select"
              >
                {clientTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
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

// Simple Login Modal Component
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
            type="button"
            onClick={() => setIsLogin(!isLogin)}
            style={{
              background: 'none',
              border: 'none',
              color: '#007bff',
              cursor: 'pointer',
              textDecoration: 'underline'
            }}
          >
            {isLogin ? 'Need to register?' : 'Already have an account?'}
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
  const { user, logout, isAuthenticated } = useAuth();

  const handleAddExperience = async (experienceData) => {
    try {
      console.log('🔥 Adding experience:', experienceData);
      
      const response = await fetch('http://localhost:5000/api/experiences', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
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
            <div className="section-header">
              <h2 className="section-title">Your Dashboard</h2>
              <button
                onClick={() => setShowExperienceForm(true)}
                className="btn btn-primary"
              >
                ✨ Add Experience
              </button>
            </div>
            
            <div style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              padding: '2rem',
              borderRadius: '15px',
              textAlign: 'center',
              marginBottom: '2rem'
            }}>
              <h3>🎉 Welcome back, {user?.username}!</h3>
              <p>Ready to share your freelancing experiences and help the community grow?</p>
            </div>
            
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '20px',
              marginTop: '20px'
            }}>
              <div style={{
                background: 'linear-gradient(45deg, #ff6b6b, #ff8e8e)',
                color: 'white',
                padding: '20px',
                borderRadius: '10px',
                textAlign: 'center'
              }}>
                <h4>📝 Share Experience</h4>
                <p>Tell the community about your client experiences</p>
              </div>
              
              <div style={{
                background: 'linear-gradient(45deg, #4ecdc4, #44a08d)',
                color: 'white',
                padding: '20px',
                borderRadius: '10px',
                textAlign: 'center'
              }}>
                <h4>� Browse Reviews</h4>
                <p>Research clients before taking projects</p>
              </div>
              
              <div style={{
                background: 'linear-gradient(45deg, #ffa726, #ffcc02)',
                color: 'white',
                padding: '20px',
                borderRadius: '10px',
                textAlign: 'center'
              }}>
                <h4>🤝 Build Trust</h4>
                <p>Help create a safer freelancing environment</p>
              </div>
            </div>
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
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              <span>Welcome, {user?.username}!</span>
              <button
                onClick={logout}
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#dc3545',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                Logout
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowModal(true)}
              style={{
                padding: '10px 20px',
                backgroundColor: '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '16px'
              }}
            >
              Login / Signup
            </button>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main>
        <div style={{
          textAlign: 'center',
          marginBottom: '40px'
        }}>
          <h2>Share Your Freelancing Experiences</h2>
          <p style={{ color: '#666', fontSize: '18px' }}>
            Help others avoid bad clients and find good ones. Share your experiences securely and anonymously.
          </p>
        </div>

        {isAuthenticated ? (
          <div style={{
            backgroundColor: '#e7f3ff',
            padding: '20px',
            borderRadius: '8px',
            textAlign: 'center'
          }}>
            <h3>Welcome to FreelancerGuard!</h3>
            <p>You're logged in as <strong>{user?.username}</strong></p>
            <p>You can now start sharing your freelancing experiences and help the community!</p>
            
            <button
              onClick={() => setShowExperienceForm(true)}
              style={{
                padding: '12px 24px',
                backgroundColor: '#28a745',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '16px',
                marginTop: '10px'
              }}
            >
              + Add Experience
            </button>
          </div>
        ) : (
          <div style={{
            backgroundColor: '#fff3cd',
            padding: '20px',
            borderRadius: '8px',
            textAlign: 'center'
          }}>
            <h3>Get Started</h3>
            <p>Please login or register to start sharing your experiences and accessing the community features.</p>
          </div>
        )}

        {/* Features */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '20px',
          marginTop: '40px'
        }}>
          <div style={{
            padding: '20px',
            backgroundColor: 'white',
            border: '1px solid #ddd',
            borderRadius: '8px'
          }}>
            <h4>🛡️ Secure Sharing</h4>
            <p>Share experiences safely with privacy protection and moderation.</p>
          </div>
          
          <div style={{
            padding: '20px',
            backgroundColor: 'white',
            border: '1px solid #ddd',
            borderRadius: '8px'
          }}>
            <h4>👥 Community Driven</h4>
            <p>Help fellow freelancers make informed decisions about potential clients.</p>
          </div>
          
          <div style={{
            padding: '20px',
            backgroundColor: 'white',
            border: '1px solid #ddd',
            borderRadius: '8px'
          }}>
            <h4>⭐ Verified Reviews</h4>
            <p>Read authentic experiences from verified freelancers in the community.</p>
          </div>
        </div>
      </main>

      {/* Login Modal */}
      <LoginModal 
        isOpen={showModal} 
        onClose={() => setShowModal(false)} 
      />

      {/* Experience Form */}
      <ExperienceForm
        isOpen={showExperienceForm}
        onClose={() => setShowExperienceForm(false)}
        onSubmit={handleAddExperience}
      />
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}

export default App;
