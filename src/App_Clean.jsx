import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { AuthProvider } from './contexts/AuthContext';
import ExperienceCard from './components/ExperienceCard';
import SearchAndFilters from './components/SearchAndFilters';
import ExperienceForm from './components/ExperienceForm';
import './App.css';

// Main App Component - Clean and Optimized
const MainApp = () => {
  // State management
  const [experiences, setExperiences] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');
  const [sortBy, setSortBy] = useState('recent');
  const [showExperienceForm, setShowExperienceForm] = useState(false);
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
    try {
      const response = await fetch('http://localhost:5000/api/experiences', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(experienceData)
      });

      if (!response.ok) throw new Error('Failed to create experience');
      
      const newExperience = await response.json();
      setExperiences(prev => [newExperience, ...prev]);
      return newExperience;
    } catch (error) {
      console.error('Error creating experience:', error);
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
      {/* Header */}
      <header className="app-header">
        <div className="container">
          <h1 className="app-title">
            <span className="emoji">🚫</span>
            FreelancerGuard
            <span className="emoji">🛡️</span>
          </h1>
          <p className="app-subtitle">
            Share and discover freelancing experiences to protect the community
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="app-main">
        <div className="container">
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
        </div>
      </main>

      {/* Experience Form Modal */}
      <ExperienceForm
        isOpen={showExperienceForm}
        onClose={() => setShowExperienceForm(false)}
        onSubmit={handleAddExperience}
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
