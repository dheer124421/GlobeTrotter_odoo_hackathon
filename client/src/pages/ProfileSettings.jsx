import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import {
    Compass,
    User,
    LogOut,
    Settings,
    Save,
    Trash2,
    Globe,
    Mail,
    Phone,
    MapPin,
    Calendar,
    Loader
} from 'lucide-react';
import './ProfileSettings.css';

const ProfileSettings = () => {
    const navigate = useNavigate();
    const { user, login, logout, register } = useAuth(); // AuthContext

    // Profile Edit fields
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [city, setCity] = useState('');
    const [country, setCountry] = useState('');
    const [language, setLanguage] = useState('English');
    const [profilePhoto, setProfilePhoto] = useState('');

    // Trips Lists State (Preplanned vs Previous)
    const [trips, setTrips] = useState([]);
    const [loadingTrips, setLoadingTrips] = useState(true);

    // Status indicators
    const [loadingProfile, setLoadingProfile] = useState(false);
    const [updating, setUpdating] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

    // Sync state with current authenticated user details
    useEffect(() => {
        if (user) {
            setFirstName(user.firstName || '');
            setLastName(user.lastName || '');
            setEmail(user.email || '');
            setPhone(user.phone || '');
            setCity(user.city || '');
            setCountry(user.country || '');
            setLanguage(user.language || 'English');
            setProfilePhoto(user.profilePhoto || '');
        }
    }, [user]);

    // Fetch all user trips to categorize them into Preplanned vs Previous
    const fetchUserTrips = async () => {
        setLoadingTrips(true);
        try {
            const response = await api.get('/api/trips');
            setTrips(response.data.data || []);
        } catch (err) {
            console.error(err);
            setError('Could not populate your trips registry list.');
        } finally {
            setLoadingTrips(false);
        }
    };

    useEffect(() => {
        fetchUserTrips();
    }, []);

    const handleLogoutClick = () => {
        logout();
        navigate('/login');
    };

    // Base64 file image encoder
    const handlePhotoUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (file.size > 2 * 1024 * 1024) {
            alert('Avatar size must be small (max 2MB) for storage.');
            return;
        }

        const reader = new FileReader();
        reader.onloadend = () => {
            setProfilePhoto(reader.result);
        };
        reader.readAsDataURL(file);
    };

    // Save profile updates
    const handleSaveProfile = async (e) => {
        e.preventDefault();
        setUpdating(true);
        setError('');
        setSuccess('');

        try {
            const response = await api.put('/api/auth/profile', {
                firstName,
                lastName,
                email,
                phone,
                city,
                country,
                language,
                profilePhoto
            });

            // Update token/local logs via logic or updating window
            // Our AuthContext reads user profile photo settings
            localStorage.setItem('user', JSON.stringify(response.data.user));

            // Force trigger refresh on auth state
            window.location.reload();

            setSuccess('Profile options updated successfully!');
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.message || 'Failed to persist settings changes.');
        } finally {
            setUpdating(false);
        }
    };

    // Delete User Account cascades
    const handleDeleteAccount = async () => {
        if (!window.confirm('WARNING: Deleting your account will permanently wipe all your profile details, contact settings, and all planned travel itineraries! This action CANNOT be undone.\n\nAre you sure you want to proceed?')) {
            return;
        }

        setDeleting(true);
        setError('');
        try {
            await api.delete('/api/auth/profile');
            alert('Your GlobalTrotter account has been successfully deleted. Farewell!');
            logout();
            navigate('/login');
        } catch (err) {
            console.error(err);
            setError('Could not process authorization cancellation.');
            setDeleting(false);
        }
    };

    // Filter dynamic lists
    const getPreplannedTrips = () => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return trips.filter(t => new Date(t.startDate) >= today);
    };

    const getPreviousTrips = () => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return trips.filter(t => new Date(t.endDate) < today);
    };

    const preplannedList = getPreplannedTrips();
    const previousList = getPreviousTrips();

    return (
        <div className="profile-settings-page">
            {/* Navigation Header */}
            <header className="profile-settings-header">
                <div className="header-container">
                    <div className="dashboard-logo" onClick={() => navigate('/dashboard')} style={{ cursor: 'pointer' }}>
                        <Compass className="logo-icon" size={28} />
                        <span>GlobalTrotter</span>
                    </div>

                    <div className="profile-container">
                        <button
                            className="profile-btn"
                            onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                        >
                            {profilePhoto ? (
                                <img src={profilePhoto} alt="User Avatar" />
                            ) : (
                                <div className="profile-btn-placeholder">
                                    <User size={18} />
                                </div>
                            )}
                        </button>

                        {profileDropdownOpen && (
                            <div className="profile-dropdown">
                                <div className="dropdown-user-details">
                                    <p className="user-name">{user ? `${user.firstName} ${user.lastName}` : 'Traveler'}</p>
                                    <p className="user-email">{user ? user.email : ''}</p>
                                </div>
                                <hr className="dropdown-divider" />
                                <Link to="/dashboard" className="dropdown-item" style={{ textDecoration: 'none' }}>
                                    <Compass size={16} style={{ marginRight: '8px' }} />
                                    Dashboard
                                </Link>
                                <Link to="/trips" className="dropdown-item" style={{ textDecoration: 'none' }}>
                                    <Compass size={16} style={{ marginRight: '8px' }} />
                                    My Trips
                                </Link>
                                <button className="dropdown-item logout-btn" onClick={handleLogoutClick}>
                                    <LogOut size={16} style={{ marginRight: '8px' }} />
                                    Logout
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </header>

            {/* Main Column Split Dashboard */}
            <main className="profile-settings-main">

                <div className="settings-page-intro">
                    <h2>Account Profile & Settings</h2>
                    <p>Control your identity information, travel settings, and view active lists.</p>
                </div>

                {error && <div className="settings-alert error">{error}</div>}
                {success && <div className="settings-alert success">{success}</div>}

                <div className="settings-split-grid">

                    {/* Left Column: Edit Details Form */}
                    <div className="settings-card form-card-panel">
                        <h3>Profile Credentials</h3>

                        <form onSubmit={handleSaveProfile} className="profile-data-form">

                            {/* Photo Uploader Circular widget */}
                            <div className="avatar-uploader-widget">
                                <div className="avatar-circle-frame">
                                    {profilePhoto ? (
                                        <img src={profilePhoto} alt="Preview Avatar" />
                                    ) : (
                                        <User size={48} className="avatar-default-placeholder" />
                                    )}
                                </div>
                                <div className="uploader-action-area">
                                    <label htmlFor="avatar-file-input" className="file-input-lbl">
                                        Upload Photo
                                    </label>
                                    <input
                                        id="avatar-file-input"
                                        type="file"
                                        accept="image/*"
                                        onChange={handlePhotoUpload}
                                        style={{ display: 'none' }}
                                    />
                                    <p className="uploader-specs-lbl">Max size: 2MB (JPG, PNG)</p>
                                </div>
                            </div>

                            {/* Input grid */}
                            <div className="form-fields-grid">
                                <div className="input-group-field">
                                    <label>First Name</label>
                                    <input
                                        type="text"
                                        value={firstName}
                                        onChange={(e) => setFirstName(e.target.value)}
                                        required
                                    />
                                </div>

                                <div className="input-group-field">
                                    <label>Last Name</label>
                                    <input
                                        type="text"
                                        value={lastName}
                                        onChange={(e) => setLastName(e.target.value)}
                                        required
                                    />
                                </div>

                                <div className="input-group-field double-column">
                                    <label>Email Address</label>
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                    />
                                </div>

                                <div className="input-group-field">
                                    <label>Phone Number</label>
                                    <input
                                        type="text"
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value)}
                                        placeholder="e.g. +1 555-0199"
                                    />
                                </div>

                                <div className="input-group-field">
                                    <label>Language Preference</label>
                                    <select
                                        value={language}
                                        onChange={(e) => setLanguage(e.target.value)}
                                    >
                                        <option value="English">English</option>
                                        <option value="Spanish">Español</option>
                                        <option value="French">Français</option>
                                        <option value="German">Deutsch</option>
                                        <option value="Hindi">हिन्दी</option>
                                    </select>
                                </div>

                                <div className="input-group-field">
                                    <label>City</label>
                                    <input
                                        type="text"
                                        value={city}
                                        onChange={(e) => setCity(e.target.value)}
                                        placeholder="Home City"
                                    />
                                </div>

                                <div className="input-group-field">
                                    <label>Country</label>
                                    <input
                                        type="text"
                                        value={country}
                                        onChange={(e) => setCountry(e.target.value)}
                                        placeholder="Home Country"
                                    />
                                </div>
                            </div>

                            <div className="form-btn-actions">
                                <button type="submit" className="save-settings-btn" disabled={updating}>
                                    {updating ? (
                                        <Loader className="spinner" size={16} />
                                    ) : (
                                        <>
                                            <Save size={16} />
                                            <span>Save Changes</span>
                                        </>
                                    )}
                                </button>
                            </div>

                        </form>

                        {/* Dangerous Cancellation Zone */}
                        <div className="danger-zone-area">
                            <h4>Dangerous Settings</h4>
                            <p>Permanently remove your account and all associated itineraries from the database.</p>
                            <button
                                onClick={handleDeleteAccount}
                                className="delete-acc-btn"
                                disabled={deleting}
                            >
                                <Trash2 size={16} />
                                <span>Delete GlobalTrotter Account</span>
                            </button>
                        </div>

                    </div>

                    {/* Right Column: Preplanned & Previous Trips Segment list */}
                    <div className="settings-trips-lists flex-column">

                        {/* Preplanned Trips */}
                        <div className="settings-card trips-list-panel">
                            <h3>Preplanned Trips (Upcoming)</h3>

                            {loadingTrips ? (
                                <div className="list-loader-box">
                                    <Loader className="spinner" size={24} />
                                </div>
                            ) : preplannedList.length === 0 ? (
                                <div className="empty-trips-state-pills">
                                    <p>No planned upcoming journeys register yet.</p>
                                    <Link to="/create-trip" className="create-direct-link">Start a Trip</Link>
                                </div>
                            ) : (
                                <div className="mini-trips-vertical-column">
                                    {preplannedList.map(trip => (
                                        <div key={trip._id} className="mini-trip-settings-card">
                                            <div className="mini-trip-details">
                                                <h5>{trip.name}</h5>
                                                <span>📍 {trip.region || 'None'}</span>
                                                <span className="mini-date-lbl">
                                                    <Calendar size={10} style={{ marginRight: '4px' }} />
                                                    {new Date(trip.startDate).toLocaleDateString()}
                                                </span>
                                            </div>
                                            <button
                                                onClick={() => navigate(`/trips/${trip._id}/view`)}
                                                className="mini-view-trip-btn"
                                            >
                                                View
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Previous Trips */}
                        <div className="settings-card trips-list-panel">
                            <h3>Previous Trips (Archive)</h3>

                            {loadingTrips ? (
                                <div className="list-loader-box">
                                    <Loader className="spinner" size={24} />
                                </div>
                            ) : previousList.length === 0 ? (
                                <div className="empty-trips-state-pills">
                                    <p>No completed/past journeys stored inside archive.</p>
                                </div>
                            ) : (
                                <div className="mini-trips-vertical-column">
                                    {previousList.map(trip => (
                                        <div key={trip._id} className="mini-trip-settings-card completed">
                                            <div className="mini-trip-details">
                                                <h5>{trip.name}</h5>
                                                <span>📍 {trip.region || 'None'}</span>
                                                <span className="mini-date-lbl">
                                                    <Calendar size={10} style={{ marginRight: '4px' }} />
                                                    {new Date(trip.startDate).toLocaleDateString()}
                                                </span>
                                            </div>
                                            <button
                                                onClick={() => navigate(`/trips/${trip._id}/view`)}
                                                className="mini-view-trip-btn"
                                            >
                                                View
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                    </div>

                </div>

            </main>
        </div>
    );
};

export default ProfileSettings;
