import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import {
    Compass,
    User,
    LogOut,
    ArrowLeft,
    Calendar,
    DollarSign,
    Plus,
    Trash2,
    Save,
    Loader,
    AlertCircle,
    Eye
} from 'lucide-react';
import './Itinerary.css';

const Itinerary = () => {
    const { tripId } = useParams();
    const navigate = useNavigate();
    const { user, logout } = useAuth();

    // State
    const [trip, setTrip] = useState(null);
    const [sections, setSections] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [successMsg, setSuccessMsg] = useState('');
    const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

    useEffect(() => {
        const fetchTripData = async () => {
            setLoading(true);
            setError('');
            try {
                const response = await api.get(`/trips/${tripId}`);
                const tripData = response.data.data;
                setTrip(tripData);

                // If itinerarySections exists, load them. Else start with one default section
                if (tripData.itinerarySections && tripData.itinerarySections.length > 0) {
                    setSections(tripData.itinerarySections);
                } else {
                    setSections([
                        {
                            title: 'Section 1',
                            description: 'All the necessary information about this section. This can be anything like travel section, hotel or any other activity.',
                            startDate: tripData.startDate ? tripData.startDate.substring(0, 10) : '',
                            endDate: tripData.endDate ? tripData.endDate.substring(0, 10) : '',
                            budget: 0
                        }
                    ]);
                }
            } catch (err) {
                console.error('Error loading trip details:', err);
                setError('Failed to load trip details. It might have been deleted.');
            } finally {
                setLoading(false);
            }
        };
        fetchTripData();
    }, [tripId]);

    const handleLogoutClick = () => {
        logout();
        navigate('/login');
    };

    const handleAddSection = () => {
        const nextNum = sections.length + 1;
        // Default dates derived from trip dates or previous section end date
        let defaultStart = trip ? trip.startDate.substring(0, 10) : '';
        let defaultEnd = trip ? trip.endDate.substring(0, 10) : '';

        if (sections.length > 0) {
            const lastSection = sections[sections.length - 1];
            if (lastSection.endDate) {
                defaultStart = lastSection.endDate;
                defaultEnd = lastSection.endDate;
            }
        }

        setSections(prev => [
            ...prev,
            {
                title: `Section ${nextNum}`,
                description: '',
                startDate: defaultStart,
                endDate: defaultEnd,
                budget: 0
            }
        ]);
    };

    const handleDeleteSection = (index) => {
        if (sections.length === 1) {
            alert('Your itinerary must contain at least one section block.');
            return;
        }
        setSections(prev => prev.filter((_, idx) => idx !== index));
    };

    const handleFieldChange = (index, field, value) => {
        setSections(prev => {
            const updated = [...prev];
            updated[index] = {
                ...updated[index],
                [field]: value
            };
            return updated;
        });
    };

    const handleSaveItinerary = async () => {
        setSaving(true);
        setError('');
        setSuccessMsg('');
        try {
            const response = await api.put(`/trips/${tripId}/itinerary`, {
                itinerarySections: sections
            });
            setTrip(response.data.data);
            setSuccessMsg('Itinerary sections successfully saved!');
            setTimeout(() => setSuccessMsg(''), 3000);
        } catch (err) {
            console.error('Error saving itinerary:', err);
            setError(err?.response?.data?.message || 'Could not save itinerary data.');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="itinerary-page">
            {/* Header section */}
            <header className="itinerary-header">
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
                            {user && user.profilePhoto ? (
                                <img src={user.profilePhoto} alt="User Profile" />
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
                                    My Trips (List View)
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

            {/* Main planner panels */}
            <main className="itinerary-main">
                <div className="header-navigation-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', flexWrap: 'wrap', gap: '1rem' }}>
                    <div className="nav-buttons-block" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <button onClick={() => navigate('/dashboard')} className="back-link-btn">
                            <ArrowLeft size={18} />
                            <span>Back</span>
                        </button>
                        {trip && (
                            <button onClick={() => navigate(`/trips/${trip._id}/view`)} className="edit-opt-btn" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text)', padding: '6px 14px', borderRadius: '6px', fontSize: '0.85rem', fontWeight: '600', cursor: 'pointer' }}>
                                <Eye size={16} />
                                <span>View Itinerary</span>
                            </button>
                        )}
                    </div>
                    {trip && (
                        <div className="trip-summary-title" style={{ margin: 0, width: 'auto', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <h2>Build Itinerary - {trip.name}</h2>
                            <span className="trip-badge">{trip.region}</span>
                        </div>
                    )}
                </div>

                {error && (
                    <div className="msg-box error-box">
                        <AlertCircle size={20} style={{ marginRight: '8px' }} />
                        <span>{error}</span>
                    </div>
                )}

                {successMsg && (
                    <div className="msg-box success-box">
                        <span>{successMsg}</span>
                    </div>
                )}

                {loading ? (
                    <div className="loading-container">
                        <Loader className="spinner" size={32} />
                        <p>Loading itinerary plan details...</p>
                    </div>
                ) : (
                    <section className="itinerary-canvas">
                        <div className="itinerary-sections-list">
                            {sections.map((section, index) => (
                                <div key={section._id || index} className="itinerary-section-card">
                                    <div className="section-card-header">
                                        <input
                                            type="text"
                                            className="section-title-input"
                                            value={section.title}
                                            onChange={(e) => handleFieldChange(index, 'title', e.target.value)}
                                            placeholder={`Section ${index + 1}`}
                                        />
                                        <button
                                            className="delete-section-btn"
                                            onClick={() => handleDeleteSection(index)}
                                            title="Remove section block"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>

                                    <div className="section-card-body">
                                        <textarea
                                            className="section-desc-textarea"
                                            value={section.description}
                                            onChange={(e) => handleFieldChange(index, 'description', e.target.value)}
                                            placeholder="All the necessary information about this section. This can be anything like travel section, hotel or any other activity"
                                            rows="3"
                                        />

                                        <div className="section-meta-row">
                                            {/* Date Range Pill */}
                                            <div className="meta-pill date-range-pill">
                                                <Calendar size={14} className="pill-icon" />
                                                <span className="pill-label">Date Range:</span>
                                                <input
                                                    type="date"
                                                    className="pill-date-input"
                                                    value={section.startDate ? section.startDate.substring(0, 10) : ''}
                                                    onChange={(e) => handleFieldChange(index, 'startDate', e.target.value)}
                                                />
                                                <span className="pill-date-sep">to</span>
                                                <input
                                                    type="date"
                                                    className="pill-date-input"
                                                    value={section.endDate ? section.endDate.substring(0, 10) : ''}
                                                    onChange={(e) => handleFieldChange(index, 'endDate', e.target.value)}
                                                />
                                            </div>

                                            {/* Budget Pill */}
                                            <div className="meta-pill budget-pill">
                                                <DollarSign size={14} className="pill-icon" />
                                                <span className="pill-label">Budget:</span>
                                                <input
                                                    type="number"
                                                    className="pill-budget-input"
                                                    value={section.budget || 0}
                                                    onChange={(e) => handleFieldChange(index, 'budget', parseFloat(e.target.value) || 0)}
                                                    placeholder="Budget of this section"
                                                />
                                                <span className="pill-currency">USD</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Bottom Actions Row */}
                        <div className="canvas-footer-actions">
                            <button className="add-section-action-btn" onClick={handleAddSection}>
                                <Plus size={18} />
                                <span>Add another Section</span>
                            </button>

                            <button
                                className="add-section-action-btn"
                                onClick={() => navigate(`/trips/${tripId}/search-cities`)}
                                style={{ background: 'var(--accent-bg)', border: '1px solid rgba(0, 102, 204, 0.15)', color: 'var(--accent)' }}
                            >
                                <Compass size={18} />
                                <span>Search & Add Cities (Discover)</span>
                            </button>

                            <button className="save-itinerary-action-btn" onClick={handleSaveItinerary} disabled={saving}>
                                {saving ? (
                                    <Loader className="spinner" size={18} />
                                ) : (
                                    <>
                                        <Save size={18} />
                                        <span>Save Itinerary</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </section>
                )}
            </main>
        </div>
    );
};

export default Itinerary;
