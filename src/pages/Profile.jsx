import React, { useState, useEffect } from 'react';
import '../styles/Profile.css';
import {
  FaLinkedin,
  FaGithub,
  FaTwitter,
  FaSun,
  FaMoon,
  FaSave,
  FaEdit,
} from 'react-icons/fa';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { verifyToken, updateProfile, updateProfilePhoto } from '../api';

const DEFAULT_AVATAR = 'https://www.testo.com/images/not-available.jpg';

export default function Profile() {
  const [editing, setEditing] = useState(false);
  const [theme, setTheme] = useState('light');
  const [profile, setProfile] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone_number: '',
    bio: '',
    current_employer: '',
    self_employed: '',
    latest_education_level: '',
    address: '',
    profession_id: '',
    dob: '',
    start_date: '',
    end_date: '',
    faculty_id: '',
    country_id: '',
    department: '',
    gender: true,
    status: '',
  });
  const [avatarUrl, setAvatarUrl] = useState(DEFAULT_AVATAR);
  const [avatarFile, setAvatarFile] = useState(null);

  // Fetch current user on mount
  useEffect(() => {
    document.body.className = theme;
  }, [theme]);

  useEffect(() => {
    (async () => {
      try {
        const { user } = await verifyToken();
        setProfile({
          first_name: user.first_name,
          last_name: user.last_name,
          email: user.email,
          phone_number: user.phone_number,
          bio: user.personal_information?.bio || '',
          current_employer: user.personal_information?.current_employer || '',
          self_employed: user.personal_information?.self_employed || '',
          latest_education_level:
            user.personal_information?.latest_education_level || '',
          address: user.personal_information?.address || '',
          profession_id: user.personal_information?.profession_id || '',
          dob: user.personal_information?.dob || '',
          start_date: user.personal_information?.start_date || '',
          end_date: user.personal_information?.end_date || '',
          faculty_id: user.personal_information?.faculty_id || '',
          country_id: user.personal_information?.country_id || '',
          department: user.personal_information?.department || '',
          gender: user.personal_information?.gender ?? true,
          status: user.personal_information?.status || '',
        });
        setAvatarUrl(user.personal_information?.photo || DEFAULT_AVATAR);
      } catch (err) {
        toast.error('Failed to load profile.');
      }
    })();
  }, []);

  const handleEditToggle = () => {
    if (editing) {
      handleSave();
    }
    setEditing(!editing);
  };

  const handleChange = e => {
    const { name, value, type, checked } = e.target;
    setProfile(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleThemeToggle = () => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  };

  const handleAvatarChange = e => {
    const file = e.target.files[0];
    if (!file) return;
    setAvatarFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setAvatarUrl(reader.result);
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    try {
      // 1) Update JSON fields
      await updateProfile({
        email: profile.email,
        phone_number: profile.phone_number,
        bio: profile.bio,
        current_employer: profile.current_employer,
        self_employed: profile.self_employed,
        latest_education_level: profile.latest_education_level,
        address: profile.address,
        profession_id: profile.profession_id,
        dob: profile.dob,
        start_date: profile.start_date,
        end_date: profile.end_date,
        faculty_id: profile.faculty_id,
        country_id: profile.country_id,
        department: profile.department,
        gender: profile.gender,
        status: profile.status,
      });
      // 2) If avatar changed, upload it
      if (avatarFile) {
        await updateProfilePhoto(avatarFile);
      }
      toast.success('Profile updated successfully!');
    } catch (err) {
      toast.error(err.message || 'Update failed.');
    }
  };

  return (
    <div className="profile-container">
      <ToastContainer />
      <div className="theme-toggle" onClick={handleThemeToggle}>
        {theme === 'light' ? <FaMoon /> : <FaSun />}
      </div>

      <div className="profile-card">
        <div className="profile-header">
          <label htmlFor="avatar-upload">
            <img
              src={avatarUrl}
              alt="Profile"
              className="profile-avatar"
              onError={() => setAvatarUrl(DEFAULT_AVATAR)}
            />
          </label>
          {editing && (
            <input
              type="file"
              id="avatar-upload"
              accept="image/*"
              onChange={handleAvatarChange}
              style={{ display: 'none' }}
            />
          )}
          <div className="profile-basic-info">
            <div className="field-group">
              <label>First Name</label>
              <input
                name="first_name"
                value={profile.first_name}
                disabled
              />
            </div>
            <div className="field-group">
              <label>Last Name</label>
              <input
                name="last_name"
                value={profile.last_name}
                disabled
              />
            </div>
          </div>
        </div>

        <div className="profile-section">
          <h3>Contact Info</h3>
          <div className="field-group">
            <label>Email</label>
            <input
              name="email"
              value={profile.email}
              onChange={handleChange}
              disabled={!editing}
            />
          </div>
          <div className="field-group">
            <label>Phone</label>
            <input
              name="phone_number"
              value={profile.phone_number}
              onChange={handleChange}
              disabled={!editing}
            />
          </div>
          <div className="field-group">
            <label>Address</label>
            <input
              name="address"
              value={profile.address}
              onChange={handleChange}
              disabled={!editing}
            />
          </div>
        </div>

        <div className="profile-section">
          <h3>Professional Info</h3>
          <div className="field-group">
            <label>Current Employer</label>
            <input
              name="current_employer"
              value={profile.current_employer}
              onChange={handleChange}
              disabled={!editing}
            />
          </div>
          <div className="field-group">
            <label>Self-Employed</label>
            <input
              name="self_employed"
              value={profile.self_employed}
              onChange={handleChange}
              disabled={!editing}
            />
          </div>
          <div className="field-group">
            <label>Education Level</label>
            <input
              name="latest_education_level"
              value={profile.latest_education_level}
              onChange={handleChange}
              disabled={!editing}
            />
          </div>
        </div>

        <div className="profile-section">
          <h3>About Me</h3>
          <textarea
            name="bio"
            value={profile.bio}
            onChange={handleChange}
            disabled={!editing}
          />
        </div>

        <div className="profile-actions">
          <button
            className="edit-profile-btn"
            onClick={handleEditToggle}
          >
            {editing ? (
              <>
                <FaSave /> Save Changes
              </>
            ) : (
              <>
                <FaEdit /> Edit Profile
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
