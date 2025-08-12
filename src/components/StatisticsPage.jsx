import React, { useState, useEffect, useCallback } from 'react';

const StatisticsPage = () => {
  const [stats, setStats] = useState({
    totalExperiences: 0,
    categoriesBreakdown: {},
    averageRating: 0,
    topCategories: [],
    recentActivity: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStatistics = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/experiences');
        if (response.ok) {
          const experiences = await response.json();
          calculateStatistics(experiences);
        }
      } catch (error) {
        console.error('Error fetching statistics:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStatistics();
  }, []);

  // Remove duplicate function definition

  const calculateStatistics = (experiences) => {
    const total = experiences.length;
    const categories = {};
    let totalRating = 0;
    let ratedExperiences = 0;

    experiences.forEach(exp => {
      // Count categories
      const category = exp.category || 'Other';
      categories[category] = (categories[category] || 0) + 1;

      // Calculate average rating
      if (exp.rating) {
        totalRating += exp.rating;
        ratedExperiences++;
      }
    });

    // Get top categories
    const topCategories = Object.entries(categories)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5);

    const averageRating = ratedExperiences > 0 ? (totalRating / ratedExperiences).toFixed(1) : 0;

    setStats({
      totalExperiences: total,
      categoriesBreakdown: categories,
      averageRating: averageRating,
      topCategories: topCategories,
      recentActivity: experiences.filter(exp => {
        const experienceDate = new Date(exp.created_at);
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        return experienceDate > weekAgo;
      }).length
    });
  };

  if (loading) {
    return (
      <div className="statistics-page">
        <div className="loading-spinner"></div>
        <p>Loading statistics...</p>
      </div>
    );
  }

  return (
    <div className="statistics-page">
      <div className="statistics-container">
        <h2>📊 Community Statistics</h2>
        <p className="stats-intro">
          Here's an overview of the FreelancerGuard community activity and insights.
        </p>
        
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">📝</div>
            <div className="stat-number">{stats.totalExperiences}</div>
            <div className="stat-label">Total Experiences</div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon">⭐</div>
            <div className="stat-number">{stats.averageRating}</div>
            <div className="stat-label">Average Rating</div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon">🔥</div>
            <div className="stat-number">{stats.recentActivity}</div>
            <div className="stat-label">This Week</div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon">📁</div>
            <div className="stat-number">{Object.keys(stats.categoriesBreakdown).length}</div>
            <div className="stat-label">Categories</div>
          </div>
        </div>
        
        <div className="charts-section">
          <div className="chart-container">
            <h3>Top Categories</h3>
            <div className="category-chart">
              {stats.topCategories.map(([category, count]) => (
                <div key={category} className="category-bar">
                  <div className="category-label">{category}</div>
                  <div className="category-bar-container">
                    <div 
                      className="category-bar-fill"
                      style={{ 
                        width: `${(count / stats.totalExperiences) * 100}%`,
                        backgroundColor: getCategoryColor(category)
                      }}
                    ></div>
                    <span className="category-count">{count}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="chart-container">
            <h3>All Categories</h3>
            <div className="categories-list">
              {Object.entries(stats.categoriesBreakdown)
                .sort(([,a], [,b]) => b - a)
                .map(([category, count]) => (
                  <div key={category} className="category-item">
                    <span className="category-name">{category}</span>
                    <span className="category-count">{count} experiences</span>
                    <span className="category-percentage">
                      {((count / stats.totalExperiences) * 100).toFixed(1)}%
                    </span>
                  </div>
                ))}
            </div>
          </div>
        </div>
        
        <div className="insights-section">
          <h3>📈 Community Insights</h3>
          <div className="insights-grid">
            <div className="insight-card">
              <h4>Most Active Category</h4>
              <p>{stats.topCategories[0]?.[0] || 'N/A'}</p>
              <small>{stats.topCategories[0]?.[1] || 0} experiences</small>
            </div>
            
            <div className="insight-card">
              <h4>Community Rating</h4>
              <p>{stats.averageRating >= 3 ? 'Positive' : 'Mixed'}</p>
              <small>Average: {stats.averageRating}/5</small>
            </div>
            
            <div className="insight-card">
              <h4>Weekly Activity</h4>
              <p>{stats.recentActivity > 5 ? 'High' : stats.recentActivity > 2 ? 'Moderate' : 'Low'}</p>
              <small>{stats.recentActivity} new experiences</small>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const getCategoryColor = (category) => {
  const colors = {
    'Web Development': '#3b82f6',
    'Mobile Development': '#10b981', 
    'Design': '#f59e0b',
    'Writing': '#ef4444',
    'Marketing': '#8b5cf6',
    'Data Entry': '#06b6d4',
    'Translation': '#84cc16',
    'Video Editing': '#f97316',
    'Photography': '#ec4899',
    'Consulting': '#6366f1',
    'Other': '#6b7280'
  };
  return colors[category] || '#6b7280';
};

export default StatisticsPage;
