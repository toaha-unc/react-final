import React, { useState, useEffect } from 'react';
import { profileAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import './SellerProfile.css';

const SellerProfile = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState('basic');

  const [formData, setFormData] = useState({
    // Basic Info
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    
    // Seller Profile
    bio: '',
    skills: [],
    experience_years: '',
    languages: [],
    availability: 'available',
    
    // Business Info
    business_name: '',
    business_type: '',
    website: '',
    location: '',
    timezone: '',
    
    // Social Links
    linkedin: '',
    twitter: '',
    github: '',
    portfolio: '',
    
    // Preferences
    hourly_rate: '',
    response_time: '24',
    working_hours: '9-17',
    timezone: 'UTC'
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError(null);

      const [basicProfile, sellerProfile] = await Promise.allSettled([
        profileAPI.getProfile(),
        profileAPI.getSellerProfile()
      ]);

      const basicData = basicProfile.status === 'fulfilled' ? basicProfile.value.data : {};
      const sellerData = sellerProfile.status === 'fulfilled' ? sellerProfile.value.data : {};

      const profileData = {
        ...basicData,
        ...sellerData,
        skills: sellerData.skills || [],
        languages: sellerData.languages || []
      };

      setProfile(profileData);
      setFormData(prev => ({
        ...prev,
        ...profileData,
        skills: Array.isArray(profileData.skills) ? profileData.skills : [],
        languages: Array.isArray(profileData.languages) ? profileData.languages : []
      }));
    } catch (error) {
      console.error('Error fetching profile:', error);
      setError('Failed to load profile. Please try again.');
      // Use fallback data
      setProfile({
        first_name: user?.first_name || '',
        last_name: user?.last_name || '',
        email: user?.email || '',
        bio: 'Professional service provider with years of experience.',
        skills: ['Web Development', 'Graphic Design', 'Digital Marketing'],
        experience_years: '5',
        languages: ['English', 'Spanish'],
        availability: 'available',
        business_name: 'My Business',
        business_type: 'Freelance',
        location: 'New York, NY',
        hourly_rate: '50',
        response_time: '24',
        working_hours: '9-17',
        timezone: 'UTC'
      });
      setFormData(prev => ({
        ...prev,
        first_name: user?.first_name || '',
        last_name: user?.last_name || '',
        email: user?.email || '',
        bio: 'Professional service provider with years of experience.',
        skills: ['Web Development', 'Graphic Design', 'Digital Marketing'],
        experience_years: '5',
        languages: ['English', 'Spanish'],
        availability: 'available',
        business_name: 'My Business',
        business_type: 'Freelance',
        location: 'New York, NY',
        hourly_rate: '50',
        response_time: '24',
        working_hours: '9-17',
        timezone: 'UTC'
      }));
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleArrayInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value.split(',').map(item => item.trim()).filter(item => item)
    }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);
      setSuccess(false);

      // Split basic profile and seller profile data
      const basicProfileData = {
        first_name: formData.first_name,
        last_name: formData.last_name,
        email: formData.email,
        phone: formData.phone
      };

      const sellerProfileData = {
        bio: formData.bio,
        skills: formData.skills,
        experience_years: formData.experience_years,
        languages: formData.languages,
        availability: formData.availability,
        business_name: formData.business_name,
        business_type: formData.business_type,
        website: formData.website,
        location: formData.location,
        timezone: formData.timezone,
        linkedin: formData.linkedin,
        twitter: formData.twitter,
        github: formData.github,
        portfolio: formData.portfolio,
        hourly_rate: formData.hourly_rate,
        response_time: formData.response_time,
        working_hours: formData.working_hours
      };

      // Update both profiles
      await Promise.all([
        profileAPI.updateProfile(basicProfileData),
        profileAPI.updateSellerProfile(sellerProfileData)
      ]);

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      console.error('Error saving profile:', error);
      setError('Failed to save profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const tabs = [
    { id: 'basic', label: 'Basic Info', icon: '👤' },
    { id: 'business', label: 'Business', icon: '🏢' },
    { id: 'skills', label: 'Skills & Experience', icon: '🛠️' },
    { id: 'preferences', label: 'Preferences', icon: '⚙️' },
    { id: 'social', label: 'Social Links', icon: '🔗' }
  ];

  const renderBasicInfo = () => (
    <div className="profile-section">
      <h3>Basic Information</h3>
      <div className="form-grid">
        <div className="form-group">
          <label htmlFor="first_name">First Name</label>
          <input
            type="text"
            id="first_name"
            name="first_name"
            value={formData.first_name}
            onChange={handleInputChange}
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
            className="form-input"
          />
        </div>
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            className="form-input"
          />
        </div>
        <div className="form-group">
          <label htmlFor="phone">Phone</label>
          <input
            type="tel"
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={handleInputChange}
            className="form-input"
          />
        </div>
      </div>
    </div>
  );

  const renderBusinessInfo = () => (
    <div className="profile-section">
      <h3>Business Information</h3>
      <div className="form-grid">
        <div className="form-group">
          <label htmlFor="business_name">Business Name</label>
          <input
            type="text"
            id="business_name"
            name="business_name"
            value={formData.business_name}
            onChange={handleInputChange}
            className="form-input"
          />
        </div>
        <div className="form-group">
          <label htmlFor="business_type">Business Type</label>
          <select
            id="business_type"
            name="business_type"
            value={formData.business_type}
            onChange={handleInputChange}
            className="form-select"
          >
            <option value="freelance">Freelance</option>
            <option value="agency">Agency</option>
            <option value="company">Company</option>
            <option value="individual">Individual</option>
          </select>
        </div>
        <div className="form-group">
          <label htmlFor="website">Website</label>
          <input
            type="url"
            id="website"
            name="website"
            value={formData.website}
            onChange={handleInputChange}
            className="form-input"
            placeholder="https://yourwebsite.com"
          />
        </div>
        <div className="form-group">
          <label htmlFor="location">Location</label>
          <input
            type="text"
            id="location"
            name="location"
            value={formData.location}
            onChange={handleInputChange}
            className="form-input"
            placeholder="City, Country"
          />
        </div>
        <div className="form-group full-width">
          <label htmlFor="bio">Bio</label>
          <textarea
            id="bio"
            name="bio"
            value={formData.bio}
            onChange={handleInputChange}
            className="form-textarea"
            rows="4"
            placeholder="Tell potential clients about yourself and your expertise..."
          />
        </div>
      </div>
    </div>
  );

  const renderSkillsExperience = () => (
    <div className="profile-section">
      <h3>Skills & Experience</h3>
      <div className="form-grid">
        <div className="form-group">
          <label htmlFor="experience_years">Years of Experience</label>
          <input
            type="number"
            id="experience_years"
            name="experience_years"
            value={formData.experience_years}
            onChange={handleInputChange}
            className="form-input"
            min="0"
            max="50"
          />
        </div>
        <div className="form-group">
          <label htmlFor="availability">Availability</label>
          <select
            id="availability"
            name="availability"
            value={formData.availability}
            onChange={handleInputChange}
            className="form-select"
          >
            <option value="available">Available</option>
            <option value="busy">Busy</option>
            <option value="unavailable">Unavailable</option>
          </select>
        </div>
        <div className="form-group full-width">
          <label htmlFor="skills">Skills (comma-separated)</label>
          <input
            type="text"
            id="skills"
            value={formData.skills.join(', ')}
            onChange={(e) => handleArrayInputChange('skills', e.target.value)}
            className="form-input"
            placeholder="Web Development, Graphic Design, Digital Marketing"
          />
        </div>
        <div className="form-group full-width">
          <label htmlFor="languages">Languages (comma-separated)</label>
          <input
            type="text"
            id="languages"
            value={formData.languages.join(', ')}
            onChange={(e) => handleArrayInputChange('languages', e.target.value)}
            className="form-input"
            placeholder="English, Spanish, French"
          />
        </div>
      </div>
    </div>
  );

  const renderPreferences = () => (
    <div className="profile-section">
      <h3>Work Preferences</h3>
      <div className="form-grid">
        <div className="form-group">
          <label htmlFor="hourly_rate">Hourly Rate ($)</label>
          <input
            type="number"
            id="hourly_rate"
            name="hourly_rate"
            value={formData.hourly_rate}
            onChange={handleInputChange}
            className="form-input"
            min="0"
            step="0.01"
          />
        </div>
        <div className="form-group">
          <label htmlFor="response_time">Response Time (hours)</label>
          <select
            id="response_time"
            name="response_time"
            value={formData.response_time}
            onChange={handleInputChange}
            className="form-select"
          >
            <option value="1">1 hour</option>
            <option value="4">4 hours</option>
            <option value="24">24 hours</option>
            <option value="48">48 hours</option>
          </select>
        </div>
        <div className="form-group">
          <label htmlFor="working_hours">Working Hours</label>
          <input
            type="text"
            id="working_hours"
            name="working_hours"
            value={formData.working_hours}
            onChange={handleInputChange}
            className="form-input"
            placeholder="9-17"
          />
        </div>
        <div className="form-group">
          <label htmlFor="timezone">Timezone</label>
          <select
            id="timezone"
            name="timezone"
            value={formData.timezone}
            onChange={handleInputChange}
            className="form-select"
          >
            <option value="UTC">UTC</option>
            <option value="EST">Eastern Time</option>
            <option value="PST">Pacific Time</option>
            <option value="GMT">Greenwich Mean Time</option>
          </select>
        </div>
      </div>
    </div>
  );

  const renderSocialLinks = () => (
    <div className="profile-section">
      <h3>Social Links</h3>
      <div className="form-grid">
        <div className="form-group">
          <label htmlFor="linkedin">LinkedIn</label>
          <input
            type="url"
            id="linkedin"
            name="linkedin"
            value={formData.linkedin}
            onChange={handleInputChange}
            className="form-input"
            placeholder="https://linkedin.com/in/yourprofile"
          />
        </div>
        <div className="form-group">
          <label htmlFor="twitter">Twitter</label>
          <input
            type="url"
            id="twitter"
            name="twitter"
            value={formData.twitter}
            onChange={handleInputChange}
            className="form-input"
            placeholder="https://twitter.com/yourhandle"
          />
        </div>
        <div className="form-group">
          <label htmlFor="github">GitHub</label>
          <input
            type="url"
            id="github"
            name="github"
            value={formData.github}
            onChange={handleInputChange}
            className="form-input"
            placeholder="https://github.com/yourusername"
          />
        </div>
        <div className="form-group">
          <label htmlFor="portfolio">Portfolio</label>
          <input
            type="url"
            id="portfolio"
            name="portfolio"
            value={formData.portfolio}
            onChange={handleInputChange}
            className="form-input"
            placeholder="https://yourportfolio.com"
          />
        </div>
      </div>
    </div>
  );

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'basic':
        return renderBasicInfo();
      case 'business':
        return renderBusinessInfo();
      case 'skills':
        return renderSkillsExperience();
      case 'preferences':
        return renderPreferences();
      case 'social':
        return renderSocialLinks();
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="seller-profile-loading">
        <div className="loading-spinner"></div>
        <p>Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="seller-profile">
      <div className="profile-header">
        <div className="header-content">
          <h2>Profile Settings</h2>
          <p>Manage your seller profile and preferences</p>
        </div>
        <div className="profile-actions">
          <button 
            className="btn btn-primary"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>

      {error && (
        <div className="profile-error">
          <p>{error}</p>
        </div>
      )}

      {success && (
        <div className="profile-success">
          <p>Profile updated successfully!</p>
        </div>
      )}

      <div className="profile-content">
        <div className="profile-sidebar">
          <nav className="profile-nav">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                className={`nav-item ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                <span className="nav-icon">{tab.icon}</span>
                <span className="nav-label">{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>

        <div className="profile-main">
          <div className="profile-form">
            {renderActiveTab()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SellerProfile;
