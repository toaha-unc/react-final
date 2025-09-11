import React, { useState } from 'react';
import './ReviewForm.css';

const ReviewForm = ({ onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    rating: 0,
    comment: '',
    images: []
  });
  const [hoveredRating, setHoveredRating] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleRatingChange = (rating) => {
    setFormData(prev => ({ ...prev, rating }));
  };

  const handleCommentChange = (e) => {
    setFormData(prev => ({ ...prev, comment: e.target.value }));
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    const imageFiles = files.map(file => ({
      file,
      preview: URL.createObjectURL(file)
    }));
    setFormData(prev => ({ 
      ...prev, 
      images: [...prev.images, ...imageFiles] 
    }));
  };

  const removeImage = (index) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.rating === 0) {
      alert('Please select a rating');
      return;
    }
    if (!formData.comment.trim()) {
      alert('Please write a comment');
      return;
    }

    setIsSubmitting(true);
    try {
      // Prepare review data without file objects
      const reviewData = {
        rating: formData.rating,
        comment: formData.comment,
        images: formData.images.map(img => img.file) // Send only file objects
      };
      await onSubmit(reviewData);
    } catch (error) {
      console.error('Error submitting review:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      rating: 0,
      comment: '',
      images: []
    });
    if (onCancel) {
      onCancel();
    }
  };

  return (
    <div className="review-form">
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label">Rating *</label>
          <div className="rating-input">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                className={`star-btn ${star <= (hoveredRating || formData.rating) ? 'active' : ''}`}
                onClick={() => handleRatingChange(star)}
                onMouseEnter={() => setHoveredRating(star)}
                onMouseLeave={() => setHoveredRating(0)}
              >
                ★
              </button>
            ))}
            <span className="rating-text">
              {formData.rating === 0 ? 'Select a rating' : 
               formData.rating === 1 ? 'Poor' :
               formData.rating === 2 ? 'Fair' :
               formData.rating === 3 ? 'Good' :
               formData.rating === 4 ? 'Very Good' : 'Excellent'}
            </span>
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Your Review *</label>
          <textarea
            className="form-textarea"
            value={formData.comment}
            onChange={handleCommentChange}
            placeholder="Share your experience with this service..."
            rows={5}
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label">Images (Optional)</label>
          <div className="image-upload">
            <input
              type="file"
              id="review-images"
              multiple
              accept="image/*"
              onChange={handleImageUpload}
              className="file-input"
            />
            <label htmlFor="review-images" className="file-label">
              📷 Upload Images
            </label>
          </div>
          
          {formData.images.length > 0 && (
            <div className="image-preview">
              {formData.images.map((image, index) => (
                <div key={index} className="preview-item">
                  <img src={image.preview} alt={`Preview ${index + 1}`} />
                  <button
                    type="button"
                    className="remove-image"
                    onClick={() => removeImage(index)}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="form-actions">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={handleCancel}
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={isSubmitting || formData.rating === 0 || !formData.comment.trim()}
          >
            {isSubmitting ? 'Submitting...' : 'Submit Review'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ReviewForm;
