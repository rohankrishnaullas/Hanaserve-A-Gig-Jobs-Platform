import React, { useState, useEffect } from 'react';
import { getUserProfile, saveUserProfile, getConversationsForUser } from '../utils/storage';
import './Profile.css';

const Profile = ({ userId, currentUser }) => {
  const [profile, setProfile] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({});

  useEffect(() => {
    if (userId) {
      loadProfile();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, currentUser]);

  const loadProfile = () => {
    const userProfile = getUserProfile(userId);
    if (userProfile) {
      setProfile(userProfile);
      setEditData(userProfile);
    } else {
      // Initialize profile with authentication data if available
      let initialProfile = {
        name: '',
        email: '',
        location: '',
        age: '',
        gender: '',
        qualifications: [],
        skills: [],
        requestedServices: [],
        createdAt: new Date().toISOString()
      };

      // Pre-populate with authentication data
      if (currentUser) {
        initialProfile.name = currentUser.name || currentUser.username || '';
        initialProfile.email = currentUser.email || '';
      }

      // Try to extract additional profile info from conversations
      const conversations = getConversationsForUser(userId);
      if (conversations.length > 0) {
        const extractedProfile = extractProfileFromConversations(conversations);
        // Merge: auth data (name/email) takes precedence, use conversation data for other fields
        initialProfile = { 
          ...extractedProfile,
          name: initialProfile.name || extractedProfile.name,
          email: initialProfile.email || extractedProfile.email
        };
      }

      setProfile(initialProfile);
      setEditData(initialProfile);
      // Save the initial profile with auth data
      saveUserProfile(userId, initialProfile);
    }
  };

  const extractProfileFromConversations = (conversations) => {
    // Extract profile information from conversation history
    const profile = {
      name: '',
      email: '',
      location: '',
      age: '',
      gender: '',
      qualifications: [],
      skills: [],
      requestedServices: [],
      createdAt: new Date().toISOString()
    };

    conversations.forEach(conv => {
      if (conv.skills) {
        profile.skills = [...new Set([...profile.skills, ...conv.skills])];
      }
      if (conv.qualifications) {
        profile.qualifications = [...new Set([...profile.qualifications, ...conv.qualifications])];
      }
    });

    return profile;
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = () => {
    saveUserProfile(userId, editData);
    setProfile(editData);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditData(profile);
    setIsEditing(false);
  };

  const handleChange = (field, value) => {
    setEditData(prev => ({ ...prev, [field]: value }));
  };

  const handleArrayChange = (field, value) => {
    const items = value.split(',').map(item => item.trim()).filter(item => item.length > 0);
    setEditData(prev => ({ ...prev, [field]: items }));
  };

  if (!userId) {
    return (
      <div className="profile-container">
        <p>Please log in to view your profile.</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="profile-container">
        <p>Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="profile-container">
      <div className="profile-header">
        <h1>👤 My Profile</h1>
        {!isEditing ? (
          <button className="edit-button" onClick={handleEdit}>✏️ Edit Profile</button>
        ) : (
          <div className="edit-actions">
            <button className="save-button" onClick={handleSave}>💾 Save</button>
            <button className="cancel-button" onClick={handleCancel}>❌ Cancel</button>
          </div>
        )}
      </div>

      <div className="profile-content">
        <div className="profile-section">
          <h2>Personal Information</h2>
          <div className="profile-field">
            <label>Name:</label>
            {isEditing ? (
              <input
                type="text"
                value={editData.name || ''}
                onChange={(e) => handleChange('name', e.target.value)}
                placeholder="Enter your name"
              />
            ) : (
              <span>{profile.name || 'Not set'}</span>
            )}
          </div>

          <div className="profile-field">
            <label>Email:</label>
            {isEditing ? (
              <input
                type="email"
                value={editData.email || ''}
                onChange={(e) => handleChange('email', e.target.value)}
                placeholder="Enter your email"
              />
            ) : (
              <span>{profile.email || 'Not set'}</span>
            )}
          </div>

          <div className="profile-field">
            <label>Location:</label>
            {isEditing ? (
              <input
                type="text"
                value={editData.location || ''}
                onChange={(e) => handleChange('location', e.target.value)}
                placeholder="Enter your location"
              />
            ) : (
              <span>{profile.location || 'Not set'}</span>
            )}
          </div>

          <div className="profile-field">
            <label>Age:</label>
            {isEditing ? (
              <input
                type="number"
                value={editData.age || ''}
                onChange={(e) => handleChange('age', e.target.value)}
                placeholder="Enter your age"
              />
            ) : (
              <span>{profile.age || 'Not set'}</span>
            )}
          </div>

          <div className="profile-field">
            <label>Gender:</label>
            {isEditing ? (
              <select
                value={editData.gender || ''}
                onChange={(e) => handleChange('gender', e.target.value)}
              >
                <option value="">Select...</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
                <option value="Prefer not to say">Prefer not to say</option>
              </select>
            ) : (
              <span>{profile.gender || 'Not set'}</span>
            )}
          </div>
        </div>

        <div className="profile-section">
          <h2>Professional Information</h2>
          <div className="profile-field">
            <label>Skills:</label>
            {isEditing ? (
              <textarea
                value={(editData.skills || []).join(', ')}
                onChange={(e) => handleArrayChange('skills', e.target.value)}
                placeholder="Enter skills (comma-separated)"
                rows={3}
              />
            ) : (
              <div className="tags-container">
                {profile.skills && profile.skills.length > 0 ? (
                  profile.skills.map((skill, idx) => (
                    <span key={idx} className="tag">{skill}</span>
                  ))
                ) : (
                  <span>No skills added yet</span>
                )}
              </div>
            )}
          </div>

          <div className="profile-field">
            <label>Qualifications:</label>
            {isEditing ? (
              <textarea
                value={(editData.qualifications || []).join(', ')}
                onChange={(e) => handleArrayChange('qualifications', e.target.value)}
                placeholder="Enter qualifications (comma-separated)"
                rows={3}
              />
            ) : (
              <div className="tags-container">
                {profile.qualifications && profile.qualifications.length > 0 ? (
                  profile.qualifications.map((qual, idx) => (
                    <span key={idx} className="tag">{qual}</span>
                  ))
                ) : (
                  <span>No qualifications added yet</span>
                )}
              </div>
            )}
          </div>

          <div className="profile-field">
            <label>Requested Services:</label>
            {isEditing ? (
              <textarea
                value={(editData.requestedServices || []).join(', ')}
                onChange={(e) => handleArrayChange('requestedServices', e.target.value)}
                placeholder="Enter requested services (comma-separated)"
                rows={3}
              />
            ) : (
              <div className="tags-container">
                {profile.requestedServices && profile.requestedServices.length > 0 ? (
                  profile.requestedServices.map((service, idx) => (
                    <span key={idx} className="tag">{service}</span>
                  ))
                ) : (
                  <span>No services requested yet</span>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
