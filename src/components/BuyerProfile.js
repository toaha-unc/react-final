import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { profileAPI } from '../services/api';
import Header from './Header';
import './BuyerProfile.css';

const BuyerProfile = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    bio: '',
    location: '',
    website: '',
    preferences: {
      notifications: true,
      email_updates: true,
      sms_notifications: false,
      marketing_emails: false
    }
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Try to get buyer profile first, fallback to general profile
      let response;
      try {
        response = await profileAPI.getBuyerProfile();
      } catch (error) {
        // If buyer profile doesn't exist, get general profile
        response = await profileAPI.getProfile();
      }
      
      const profileData = response.data;
      setProfile(profileData);
      
      // Initialize form data
      setFormData({
        first_name: profileData.first_name || user?.first_name || '',
        last_name: profileData.last_name || user?.last_name || '',
        email: profileData.email || user?.email || '',
        phone: profileData.phone || '',
        bio: profileData.bio || '',
        location: profileData.location || '',
        website: profileData.website || '',
        preferences: {
          notifications: profileData.preferences?.notifications ?? true,
          email_updates: profileData.preferences?.email_updates ?? true,
          sms_notifications: profileData.preferences?.sms_notifications ?? false,
          marketing_emails: profileData.preferences?.marketing_emails ?? false
        }
      });
    } catch (error) {
      console.error('Error fetching profile:', error);
      setError('Failed to load profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name.startsWith('preferences.')) {
      const prefKey = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        preferences: {
          ...prev.preferences,
          [prefKey]: type === 'checkbox' ? checked : value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);
      
      // Try to update buyer profile first, fallback to general profile
      try {
        await profileAPI.updateBuyerProfile(formData);
      } catch (error) {
        // If buyer profile update fails, try general profile
        await profileAPI.updateProfile(formData);
      }
      
      setProfile({ ...profile, ...formData });
      setEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      setError('Failed to update profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      first_name: profile?.first_name || user?.first_name || '',
      last_name: profile?.last_name || user?.last_name || '',
      email: profile?.email || user?.email || '',
      phone: profile?.phone || '',
      bio: profile?.bio || '',
      location: profile?.location || '',
      website: profile?.website || '',
      preferences: {
        notifications: profile?.preferences?.notifications ?? true,
        email_updates: profile?.preferences?.email_updates ?? true,
        sms_notifications: profile?.preferences?.sms_notifications ?? false,
        marketing_emails: profile?.preferences?.marketing_emails ?? false
      }
    });
    setEditing(false);
  };

  if (loading) {
    return (
      <div className="buyer-profile-loading">
        <div className="loading-spinner"></div>
        <p>Loading your profile...</p>
      </div>
    );
  }

  if (error && !profile) {
    return (
      <div className="buyer-profile-error">
        <h3>Error Loading Profile</h3>
        <p>{error}</p>
        <button className="btn btn-primary" onClick={fetchProfile}>
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="buyer-profile">
      <Header />
      <div className="container">
        <div className="profile-header">
        <div className="profile-avatar">
          <div className="avatar-circle">
            {formData.first_name?.charAt(0)?.toUpperCase() || user?.first_name?.charAt(0)?.toUpperCase() || 'B'}
          </div>
        </div>
        <div className="profile-info">
          <h2>
            {editing ? 'Edit Profile' : 'My Profile'}
          </h2>
          <p>
            {editing 
              ? 'Update your personal information and preferences' 
              : 'Manage your account settings and preferences'
            }
          </p>
        </div>
        <div className="profile-actions">
          {!editing ? (
            <button 
              className="btn btn-primary"
              onClick={() => setEditing(true)}
            >
              Edit Profile
            </button>
          ) : (
            <div className="edit-actions">
              <button 
                className="btn btn-secondary"
                onClick={handleCancel}
                disabled={saving}
              >
                Cancel
              </button>
              <button 
                className="btn btn-primary"
                onClick={handleSave}
                disabled={saving}
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          )}
        </div>
      </div>

      {error && (
        <div className="profile-error">
          <p>{error}</p>
        </div>
      )}

      <div className="profile-content">
        <div className="profile-sections">
          <div className="profile-section">
            <h3>Personal Information</h3>
            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="first_name">First Name</label>
                <input
                  type="text"
                  id="first_name"
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleInputChange}
                  disabled={!editing}
                  className="form-input"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="last_name">Last Name</label>
                <input
                  type="text"
                  id="last_name"
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleInputChange}
                  disabled={!editing}
                  className="form-input"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="email">Email Address</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  disabled={!editing}
                  className="form-input"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="phone">Phone Number</label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  disabled={!editing}
                  className="form-input"
                  placeholder="+1 (555) 123-4567"
                />
              </div>
            </div>
          </div>

          <div className="profile-section">
            <h3>About You</h3>
            <div className="form-group">
              <label htmlFor="bio">Bio</label>
              <textarea
                id="bio"
                name="bio"
                value={formData.bio}
                onChange={handleInputChange}
                disabled={!editing}
                className="form-textarea"
                rows="4"
                placeholder="Tell us about yourself..."
              />
            </div>
            
            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="location">Location</label>
                <input
                  type="text"
                  id="location"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  disabled={!editing}
                  className="form-input"
                  placeholder="City, Country"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="website">Website</label>
                <input
                  type="url"
                  id="website"
                  name="website"
                  value={formData.website}
                  onChange={handleInputChange}
                  disabled={!editing}
                  className="form-input"
                  placeholder="https://yourwebsite.com"
                />
              </div>
            </div>
          </div>

          <div className="profile-section">
            <h3>Notification Preferences</h3>
            <div className="preferences-grid">
              <div className="preference-item">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="preferences.notifications"
                    checked={formData.preferences.notifications}
                    onChange={handleInputChange}
                    disabled={!editing}
                    className="checkbox-input"
                  />
                  <span className="checkbox-custom"></span>
                  <span className="checkbox-text">
                    <strong>Push Notifications</strong>
                    <small>Receive notifications about your orders and messages</small>
                  </span>
                </label>
              </div>
              
              <div className="preference-item">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="preferences.email_updates"
                    checked={formData.preferences.email_updates}
                    onChange={handleInputChange}
                    disabled={!editing}
                    className="checkbox-input"
                  />
                  <span className="checkbox-custom"></span>
                  <span className="checkbox-text">
                    <strong>Email Updates</strong>
                    <small>Receive email notifications about order status changes</small>
                  </span>
                </label>
              </div>
              
              <div className="preference-item">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="preferences.sms_notifications"
                    checked={formData.preferences.sms_notifications}
                    onChange={handleInputChange}
                    disabled={!editing}
                    className="checkbox-input"
                  />
                  <span className="checkbox-custom"></span>
                  <span className="checkbox-text">
                    <strong>SMS Notifications</strong>
                    <small>Receive text messages for urgent updates</small>
                  </span>
                </label>
              </div>
              
              <div className="preference-item">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="preferences.marketing_emails"
                    checked={formData.preferences.marketing_emails}
                    onChange={handleInputChange}
                    disabled={!editing}
                    className="checkbox-input"
                  />
                  <span className="checkbox-custom"></span>
                  <span className="checkbox-text">
                    <strong>Marketing Emails</strong>
                    <small>Receive promotional emails and new service recommendations</small>
                  </span>
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
};

export default BuyerProfile;
