import React, { useState, memo } from 'react';

const ExperienceForm = memo(({ isOpen, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Web Development',
    client_name: '',
    rating: 5,
    project_value: '',
    image: null
  });
  const [imagePreview, setImagePreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const categories = [
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

  const handleChange = (e) => {
    const { name, value, type, files } = e.target;
    
    if (type === 'file') {
      const file = files[0];
      if (file) {
        // Validate file type and size
        if (!file.type.startsWith('image/')) {
          alert('Please select an image file');
          return;
        }
        if (file.size > 5 * 1024 * 1024) { // 5MB limit
          alert('Image size should be less than 5MB');
          return;
        }
        
        setFormData(prev => ({ ...prev, image: file }));
        
        // Create preview
        const reader = new FileReader();
        reader.onload = (e) => setImagePreview(e.target.result);
        reader.readAsDataURL(file);
      }
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: name === 'rating' ? parseInt(value) : value
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title.trim() || !formData.description.trim()) {
      alert('Title and description are required');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(formData);
      setFormData({
        title: '',
        description: '',
        category: 'Web Development',
        client_name: '',
        rating: 5,
        project_value: '',
        image: null
      });
      setImagePreview(null);
      onClose();
    } catch (error) {
      console.error('Form submission error:', error);
      alert('Failed to submit experience. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>✨ Share Your Experience</h2>
          <button className="close-btn" onClick={onClose}>&times;</button>
        </div>
        
        <form onSubmit={handleSubmit} className="experience-form">
          <div className="form-group">
            <label htmlFor="title">Experience Title *</label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Brief title of your experience..."
              className="form-input"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">Description *</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe your freelancing experience in detail..."
              className="form-textarea"
              rows="5"
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="category">Category</label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="form-select"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="rating">Rating</label>
              <select
                id="rating"
                name="rating"
                value={formData.rating}
                onChange={handleChange}
                className="form-select"
              >
                <option value={5}>⭐⭐⭐⭐⭐ (5) Excellent</option>
                <option value={4}>⭐⭐⭐⭐☆ (4) Good</option>
                <option value={3}>⭐⭐⭐☆☆ (3) Average</option>
                <option value={2}>⭐⭐☆☆☆ (2) Poor</option>
                <option value={1}>⭐☆☆☆☆ (1) Terrible</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="client_name">Client/Company Name</label>
              <input
                type="text"
                id="client_name"
                name="client_name"
                value={formData.client_name}
                onChange={handleChange}
                placeholder="Optional client name..."
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label htmlFor="project_value">Project Value ($)</label>
              <input
                type="number"
                id="project_value"
                name="project_value"
                value={formData.project_value}
                onChange={handleChange}
                placeholder="Optional project value..."
                className="form-input"
                min="0"
              />
            </div>
          </div>

          {/* Image Upload Section */}
          <div className="form-group">
            <label htmlFor="image">Add Image (Optional)</label>
            <input
              type="file"
              id="image"
              name="image"
              onChange={handleChange}
              accept="image/*"
              className="form-input"
            />
            <small className="form-help">
              Upload a screenshot or image related to your experience (max 5MB)
            </small>
            
            {imagePreview && (
              <div className="image-preview">
                <img src={imagePreview} alt="Preview" className="preview-image" />
                <button
                  type="button"
                  onClick={() => {
                    setFormData(prev => ({ ...prev, image: null }));
                    setImagePreview(null);
                  }}
                  className="remove-image-btn"
                >
                  ❌ Remove
                </button>
              </div>
            )}
          </div>

          <div className="form-actions">
            <button 
              type="button" 
              className="btn btn-secondary" 
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Sharing...' : 'Share Experience'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
});

ExperienceForm.displayName = 'ExperienceForm';

export default ExperienceForm;
