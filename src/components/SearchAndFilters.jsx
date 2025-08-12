import React, { memo } from 'react';

const SearchAndFilters = memo(({ 
  searchTerm, 
  setSearchTerm, 
  filterCategory, 
  setFilterCategory, 
  sortBy, 
  setSortBy, 
  onAddExperience 
}) => {
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
          placeholder="🔍 Search experiences..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="form-input search-input"
        />
      </div>
      
      <div className="filters-row">
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="form-select category-filter"
        >
          {categories.map((cat) => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>

        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="form-select sort-filter"
        >
          <option value="recent">📅 Most Recent</option>
          <option value="rating">⭐ Highest Rated</option>
          <option value="popular">🔥 Most Popular</option>
          <option value="upvotes">👍 Most Upvoted</option>
        </select>

        <button
          onClick={onAddExperience}
          className="btn btn-primary add-experience-btn"
        >
          ✨ Share Experience
        </button>
      </div>
    </div>
  );
});

SearchAndFilters.displayName = 'SearchAndFilters';

export default SearchAndFilters;
