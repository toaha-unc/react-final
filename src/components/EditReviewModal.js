import React, { useState, useEffect } from 'react';
import { reviewsAPI } from '../services/api';
import './EditReviewModal.css';

const EditReviewModal = ({ review, isOpen, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    rating: 0,
    title: '',
    comment: '',
    images: []
  });
  const [hoveredRating, setHoveredRating] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (review && isOpen) {
      setFormData({
        rating: review.rating || 0,
        title: review.title || '',
        comment: review.comment || '',
        images: review.images || []
      });
    }
  }, [review, isOpen]);

  const handleRatingChange = (rating) => {
    setFormData(prev => ({ ...prev, rating }));
  };

  const handleTitleChange = (e) => {
    setFormData(prev => ({ ...prev, title: e.target.value }));
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
      setError('Please select a rating');
      return;
    }
    if (!formData.title.trim()) {
      setError('Please write a title');
      return;
    }
    if (!formData.comment.trim()) {
      setError('Please write a comment');
      return;
    }

    setIsSubmitting(true);
    setError(null);
    
    try {
      // Update the review
      const reviewData = {
        rating: formData.rating,
        title: formData.title,
        comment: formData.comment
      };
      
      await reviewsAPI.updateReview(review.id, reviewData);
      
      // Handle new image uploads if any
      const newImages = formData.images.filter(img => img.file);
      if (newImages.length > 0) {
        for (const imageFile of newImages) {
          const formData = new FormData();
          formData.append('image', imageFile.file);
          await reviewsAPI.uploadReviewImage(review.id, formData);
        }
      }
      
      onSave();
      onClose();
    } catch (error) {
      console.error('Error updating review:', error);
      setError('Failed to update review. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      rating: 0,
      title: '',
      comment: '',
      images: []
    });
    setError(null);
    onClose();
  };

  if (!isOpen || !review) return null;

  return (
    <div className="edit-review-modal-overlay">
      <div className="edit-review-modal">
        <div className="modal-header">
          <h2>Edit Review</h2>
          <button className="close-btn" onClick={handleCancel}>
            ×
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="edit-review-form">
          {error && (
            <div className="error-message">
              {error}
            </div>
          )}
          
          <div className="form-group">
            <label>Rating *</label>
            <div className="rating-input">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  className={`star-btn ${
                    star <= (hoveredRating || formData.rating) ? 'filled' : 'empty'
                  }`}
                  onClick={() => handleRatingChange(star)}
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                >
                  ★
                </button>
              ))}
              <span className="rating-text">
                {formData.rating > 0 ? `${formData.rating} star${formData.rating > 1 ? 's' : ''}` : 'Select rating'}
              </span>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="title">Title *</label>
            <input
              type="text"
              id="title"
              value={formData.title}
              onChange={handleTitleChange}
              placeholder="Give your review a title..."
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="comment">Comment *</label>
            <textarea
              id="comment"
              value={formData.comment}
              onChange={handleCommentChange}
              placeholder="Share your experience with this service..."
              rows="4"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="images">Images (Optional)</label>
            <input
              type="file"
              id="images"
              accept="image/*"
              multiple
              onChange={handleImageUpload}
            />
            {formData.images.length > 0 && (
              <div className="image-preview">
                {formData.images.map((image, index) => (
                  <div key={index} className="image-item">
                    <img
                      src={image.preview || image.image_url}
                      alt={`Preview ${index + 1}`}
                      className="preview-image"
                    />
                    <button
                      type="button"
                      className="remove-image-btn"
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
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Updating...' : 'Update Review'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditReviewModal;
