import React, { useState, useCallback, memo } from 'react';

// Optimized Experience Card Component with performance improvements
const ExperienceCard = memo(({ experience, onVote, onRefresh }) => {
  const [expanded, setExpanded] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);

  // Memoized helper functions to prevent unnecessary re-renders
  const getStars = useCallback((rating) => {
    return '★'.repeat(Math.max(0, Math.min(5, rating))) + '☆'.repeat(5 - Math.max(0, Math.min(5, rating)));
  }, []);

  const getCategoryColor = useCallback((category) => {
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
  }, []);

  // Optimized vote handler with debouncing
  const handleVote = useCallback(async (voteType) => {
    if (loading) return; // Prevent spam clicking
    
    setLoading(true);
    try {
      const vote_type = voteType === 'up' ? 'upvote' : 'downvote';
      
      const response = await fetch(`http://localhost:5000/api/experiences/${experience.id}/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ vote_type })
      });

      if (response.ok) {
        const data = await response.json();
        if (onVote) onVote(experience.id, data);
        if (onRefresh) onRefresh();
      }
    } catch (error) {
      console.error('Vote error:', error);
    } finally {
      setLoading(false);
    }
  }, [experience.id, loading, onVote, onRefresh]);

  // Optimized comment loading
  const loadComments = useCallback(async () => {
    if (loading) return;
    
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:5000/api/experiences/${experience.id}/comments`);
      if (response.ok) {
        const data = await response.json();
        setComments(data.comments || []);
      }
    } catch (error) {
      console.error('Comments error:', error);
    } finally {
      setLoading(false);
    }
  }, [experience.id, loading]);

  // Optimized comment submission
  const handleAddComment = useCallback(async () => {
    if (!newComment.trim() || loading) return;
    
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:5000/api/experiences/${experience.id}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: newComment.trim() })
      });

      if (response.ok) {
        setNewComment('');
        await loadComments();
        if (onRefresh) onRefresh();
      }
    } catch (error) {
      console.error('Comment error:', error);
    } finally {
      setLoading(false);
    }
  }, [newComment, loading, experience.id, loadComments, onRefresh]);

  // Toggle comments with lazy loading
  const toggleComments = useCallback(() => {
    if (!showComments && comments.length === 0) {
      loadComments();
    }
    setShowComments(!showComments);
  }, [showComments, comments.length, loadComments]);

  return (
    <div className="experience-card">
      {/* Card Header */}
      <div className="card-header">
        <div className="card-title-row">
          <h3 className="card-title">{experience.title}</h3>
          <div 
            className="category-badge" 
            style={{ backgroundColor: getCategoryColor(experience.category) }}
          >
            {experience.category}
          </div>
        </div>
        
        <div className="card-meta">
          <div className="rating">
            <span className="stars">{getStars(experience.rating || 0)}</span>
            <span className="rating-text">({experience.rating || 0}/5)</span>
          </div>
          {experience.client_name && (
            <div className="client">Client: {experience.client_name}</div>
          )}
          {experience.project_value && (
            <div className="value">Value: ${experience.project_value}</div>
          )}
        </div>
      </div>

      {/* Card Content */}
      <div className="card-content">
        <p className={`description ${expanded ? 'expanded' : ''}`}>
          {expanded ? experience.description : `${experience.description?.substring(0, 150)}...`}
        </p>
        
        {experience.description?.length > 150 && (
          <button 
            className="expand-btn"
            onClick={() => setExpanded(!expanded)}
          >
            {expanded ? 'Show Less' : 'Read More'}
          </button>
        )}
      </div>

      {/* Card Actions */}
      <div className="card-actions">
        <div className="vote-section">
          <button 
            className={`vote-btn upvote ${loading ? 'loading' : ''}`}
            onClick={() => handleVote('up')}
            disabled={loading}
          >
            👍 {experience.upvotes || 0}
          </button>
          
          <button 
            className={`vote-btn downvote ${loading ? 'loading' : ''}`}
            onClick={() => handleVote('down')}
            disabled={loading}
          >
            👎 {experience.downvotes || 0}
          </button>
        </div>

        <button 
          className="comment-btn"
          onClick={toggleComments}
        >
          💬 {experience.comment_count || comments.length || 0}
        </button>
      </div>

      {/* Comments Section */}
      {showComments && (
        <div className="comments-section">
          <div className="comments-list">
            {loading && comments.length === 0 && (
              <div className="loading">Loading comments...</div>
            )}
            
            {comments.map((comment, index) => (
              <div key={comment.id || index} className="comment">
                <div className="comment-author">{comment.username || 'Anonymous'}</div>
                <div className="comment-content">{comment.content}</div>
                <div className="comment-date">
                  {comment.created_at ? new Date(comment.created_at).toLocaleDateString() : 'Recently'}
                </div>
              </div>
            ))}
          </div>

          <div className="add-comment">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Add a comment..."
              className="comment-input"
              disabled={loading}
            />
            <button 
              onClick={handleAddComment}
              disabled={!newComment.trim() || loading}
              className="submit-comment-btn"
            >
              {loading ? 'Posting...' : 'Post Comment'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
});

ExperienceCard.displayName = 'ExperienceCard';

export default ExperienceCard;
