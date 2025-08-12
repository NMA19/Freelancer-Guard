import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

const AccountPage = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [profileData, setProfileData] = useState({
    username: user?.username || '',
    email: user?.email || '',
    bio: user?.bio || '',
    location: user?.location || '',
    website: user?.website || ''
  });
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const handleSaveProfile = async () => {
    setSaving(true);
    setMessage('');
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setMessage('Profile updated successfully!');
      setEditing(false);
    } catch (err) {
      console.error('Profile update error:', err);
      setMessage('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setProfileData({
      username: user?.username || '',
      email: user?.email || '',
      bio: user?.bio || '',
      location: user?.location || '',
      website: user?.website || ''
    });
    setEditing(false);
  };

  if (!user) {
    return (
      <div className="account-page">
        <div className="account-container">
          <h2>👤 Account</h2>
          <p>Please log in to view your account information.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="account-page">
      <div className="account-container">
        <h2>👤 My Account</h2>
        
        <div className="account-tabs">
          <button
            className={activeTab === 'profile' ? 'active' : ''}
            onClick={() => setActiveTab('profile')}
          >
            👤 Profile
          </button>
          <button
            className={activeTab === 'experiences' ? 'active' : ''}
            onClick={() => setActiveTab('experiences')}
          >
            📝 My Experiences
          </button>
          <button
            className={activeTab === 'settings' ? 'active' : ''}
            onClick={() => setActiveTab('settings')}
          >
            ⚙️ Settings
          </button>
        </div>

        {activeTab === 'profile' && (
          <div className="profile-section">
            <div className="profile-header">
              <div className="profile-avatar">
                {user.username?.charAt(0).toUpperCase() || '👤'}
              </div>
              <div className="profile-info">
                <h3>{user.username}</h3>
                <p>{user.email}</p>
                <span className="join-date">
                  Joined {new Date(user.created_at || Date.now()).toLocaleDateString()}
                </span>
              </div>
              <button
                className="btn btn-primary"
                onClick={() => setEditing(!editing)}
              >
                {editing ? '❌ Cancel' : '✏️ Edit Profile'}
              </button>
            </div>

            {message && (
              <div className={`message ${message.includes('success') ? 'message-success' : 'message-error'}`}>
                {message}
              </div>
            )}

            <div className="profile-form">
              <div className="form-group">
                <label>Username</label>
                <input
                  type="text"
                  value={profileData.username}
                  onChange={(e) => setProfileData({...profileData, username: e.target.value})}
                  disabled={!editing}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  value={profileData.email}
                  onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                  disabled={!editing}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label>Bio</label>
                <textarea
                  value={profileData.bio}
                  onChange={(e) => setProfileData({...profileData, bio: e.target.value})}
                  disabled={!editing}
                  placeholder="Tell us about yourself..."
                  className="form-textarea"
                  rows="3"
                />
              </div>

              <div className="form-group">
                <label>Location</label>
                <input
                  type="text"
                  value={profileData.location}
                  onChange={(e) => setProfileData({...profileData, location: e.target.value})}
                  disabled={!editing}
                  placeholder="City, Country"
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label>Website</label>
                <input
                  type="url"
                  value={profileData.website}
                  onChange={(e) => setProfileData({...profileData, website: e.target.value})}
                  disabled={!editing}
                  placeholder="https://yourwebsite.com"
                  className="form-input"
                />
              </div>

              {editing && (
                <div className="form-actions">
                  <button
                    className="btn btn-primary"
                    onClick={handleSaveProfile}
                    disabled={saving}
                  >
                    {saving ? '💾 Saving...' : '💾 Save Changes'}
                  </button>
                  <button
                    className="btn btn-secondary"
                    onClick={handleCancelEdit}
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'experiences' && (
          <div className="my-experiences-section">
            <h3>📝 My Shared Experiences</h3>
            <p>Track and manage the experiences you've shared with the community.</p>
            
            <div className="experience-stats">
              <div className="stat-item">
                <span className="stat-number">0</span>
                <span className="stat-label">Experiences Shared</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">0</span>
                <span className="stat-label">Total Votes</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">0</span>
                <span className="stat-label">Comments Received</span>
              </div>
            </div>

            <div className="my-experiences-list">
              <div className="empty-state">
                <div className="empty-icon">📝</div>
                <h4>No experiences yet</h4>
                <p>Start sharing your freelancing experiences to help others in the community!</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="settings-section">
            <h3>⚙️ Account Settings</h3>
            
            <div className="settings-group">
              <h4>🔔 Notifications</h4>
              <label className="checkbox-label">
                <input type="checkbox" defaultChecked />
                Email notifications for new comments
              </label>
              <label className="checkbox-label">
                <input type="checkbox" defaultChecked />
                Email notifications for experience votes
              </label>
              <label className="checkbox-label">
                <input type="checkbox" />
                Weekly community digest
              </label>
            </div>

            <div className="settings-group">
              <h4>🔒 Privacy</h4>
              <label className="checkbox-label">
                <input type="checkbox" defaultChecked />
                Show my profile to other users
              </label>
              <label className="checkbox-label">
                <input type="checkbox" />
                Allow others to see my experience history
              </label>
            </div>

            <div className="settings-group danger-zone">
              <h4>⚠️ Danger Zone</h4>
              <p>These actions cannot be undone.</p>
              <button className="btn btn-danger" onClick={logout}>
                🚪 Logout
              </button>
              <button className="btn btn-danger">
                🗑️ Delete Account
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AccountPage;
