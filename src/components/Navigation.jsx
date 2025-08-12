import React from 'react';

const Navigation = ({ currentView, setCurrentView, user, onAddExperience, onShowAuth, onLogout }) => {
  return (
    <header className="app-header">
      <div className="header-content">
        <h1 className="logo">
          <span className="emoji">🚫</span>
          FreelancerGuard
          <span className="emoji">🛡️</span>
        </h1>
        
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
          <button 
            className={currentView === 'statistics' ? 'active' : ''}
            onClick={() => setCurrentView('statistics')}
          >
            📊 Statistics
          </button>
          {user && (
            <button 
              className={currentView === 'account' ? 'active' : ''}
              onClick={() => setCurrentView('account')}
            >
              👤 Account
            </button>
          )}
        </nav>
        
        <div className="header-actions">
          {user ? (
            <>
              <button 
                className="create-btn"
                onClick={onAddExperience}
              >
                ➕ Share Experience
              </button>
              <span className="user-info">👤 {user.username}</span>
              <button className="btn btn-secondary" onClick={onLogout}>
                🚪 Logout
              </button>
            </>
          ) : (
            <button className="btn btn-primary" onClick={onShowAuth}>
              🔑 Login / Register
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navigation;
