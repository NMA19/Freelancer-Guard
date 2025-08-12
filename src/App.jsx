import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Navigation from './components/Navigation';
import ExperienceCard from './components/ExperienceCard';
import SearchAndFilters from './components/SearchAndFilters';
import ExperienceForm from './components/ExperienceFormSimple';
import RulesPage from './components/RulesPage';
import StatisticsPage from './components/StatisticsPage';
import AccountPage from './components/AccountPage';
import AuthModal from './components/AuthModal';
import './App.css';

// Main App Component - Enhanced with Navigation and Multiple Pages
const MainApp = () => {
  const { user, logout } = useAuth();
  
  // State management
  const [currentView, setCurrentView] = useState('experiences');
  const [experiences, setExperiences] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');
  const [sortBy, setSortBy] = useState('recent');
  const [showExperienceForm, setShowExperienceForm] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Optimized data fetching with proper error handling
  const fetchExperiences = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('http://localhost:5000/api/experiences');
      if (!response.ok) throw new Error('Failed to fetch experiences');
      
      const data = await response.json();
      setExperiences(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching experiences:', error);
      setError('Failed to load experiences. Please try again.');
      setExperiences([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Optimized experience creation
  const handleAddExperience = useCallback(async (experienceData) => {
    console.log('🚀 Frontend: Submitting experience:', experienceData);
    try {
      const response = await fetch('http://localhost:5000/api/experiences', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(experienceData)
      });

      console.log('📡 Frontend: Response status:', response.status);
      console.log('📡 Frontend: Response ok:', response.ok);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Frontend: Error response:', errorText);
        throw new Error(`Failed to create experience: ${response.status} ${errorText}`);
      }
      
      const newExperience = await response.json();
      console.log('✅ Frontend: Experience created:', newExperience);
      setExperiences(prev => [newExperience, ...prev]);
      return newExperience;
    } catch (error) {
      console.error('❌ Frontend: Error creating experience:', error);
      throw error;
    }
  }, []);

  // Optimized vote handler
  const handleVote = useCallback((experienceId, voteData) => {
    setExperiences(prev => 
      prev.map(exp => 
        exp.id === experienceId 
          ? { ...exp, upvotes: voteData.upvotes, downvotes: voteData.downvotes }
          : exp
      )
    );
  }, []);

  // Memoized filtered and sorted experiences
  const filteredExperiences = useMemo(() => {
    let filtered = experiences;

    // Apply search filter
    if (searchTerm.trim()) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(exp => 
        exp.title?.toLowerCase().includes(search) ||
        exp.description?.toLowerCase().includes(search) ||
        exp.category?.toLowerCase().includes(search) ||
        exp.client_name?.toLowerCase().includes(search)
      );
    }

    // Apply category filter
    if (filterCategory !== 'All') {
      filtered = filtered.filter(exp => exp.category === filterCategory);
    }

    // Apply sorting
    switch (sortBy) {
      case 'rating':
        filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      case 'popular':
        filtered.sort((a, b) => 
          ((b.upvotes || 0) + (b.comment_count || 0)) - 
          ((a.upvotes || 0) + (a.comment_count || 0))
        );
        break;
      case 'upvotes':
        filtered.sort((a, b) => (b.upvotes || 0) - (a.upvotes || 0));
        break;
      case 'recent':
      default:
        filtered.sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
        break;
    }

    return filtered;
  }, [experiences, searchTerm, filterCategory, sortBy]);

  // Load experiences on mount
  useEffect(() => {
    fetchExperiences();
  }, [fetchExperiences]);

  return (
    <div className="app">
      {/* Enhanced Navigation */}
      <Navigation
        currentView={currentView}
        setCurrentView={setCurrentView}
        user={user}
        onAddExperience={() => setShowExperienceForm(true)}
        onShowAuth={() => setShowAuthModal(true)}
        onLogout={logout}
      />

      {/* Main Content */}
      <main className="app-main">
        <div className="container">
          {/* Experiences View */}
          {currentView === 'experiences' && (
            <>
              {/* Search and Filters */}
              <SearchAndFilters
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                filterCategory={filterCategory}
                setFilterCategory={setFilterCategory}
                sortBy={sortBy}
                setSortBy={setSortBy}
                onAddExperience={() => setShowExperienceForm(true)}
              />

              {/* Loading State */}
              {loading && (
                <div className="loading-state">
                  <div className="loading-spinner"></div>
                  <p>Loading experiences...</p>
                </div>
              )}

              {/* Error State */}
              {error && (
                <div className="error-state">
                  <p className="error-message">{error}</p>
                  <button onClick={fetchExperiences} className="btn btn-primary">
                    Try Again
                  </button>
                </div>
              )}

              {/* Experiences List */}
              {!loading && !error && (
                <>
                  {filteredExperiences.length > 0 ? (
                    <div className="experiences-grid">
                      {filteredExperiences.map((experience) => (
                        <ExperienceCard
                          key={experience.id}
                          experience={experience}
                          onVote={handleVote}
                          onRefresh={fetchExperiences}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="empty-state">
                      <div className="empty-icon">📝</div>
                      <h3>No experiences found</h3>
                      <p>
                        {searchTerm || filterCategory !== 'All'
                          ? 'Try adjusting your search or filters'
                          : 'Be the first to share an experience!'}
                      </p>
                      {!searchTerm && filterCategory === 'All' && (
                        <button 
                          onClick={() => setShowExperienceForm(true)}
                          className="btn btn-primary"
                        >
                          ✨ Share Your Experience
                        </button>
                      )}
                    </div>
                  )}
                </>
              )}
            </>
          )}

          {/* Rules Page */}
          {currentView === 'rules' && <RulesPage />}

          {/* Statistics Page */}
          {currentView === 'statistics' && <StatisticsPage />}

          {/* Account Page */}
          {currentView === 'account' && <AccountPage />}
        </div>
      </main>

      {/* Experience Form Modal */}
      <ExperienceForm
        isOpen={showExperienceForm}
        onClose={() => setShowExperienceForm(false)}
        onSubmit={handleAddExperience}
      />

      {/* Auth Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
      />
    </div>
  );
};

// App component with AuthProvider
const App = () => {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
};

export default App;
