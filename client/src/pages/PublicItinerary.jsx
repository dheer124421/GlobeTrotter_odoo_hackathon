import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import {
    Compass,
    User,
    MapPin,
    Calendar,
    Copy,
    Check,
    Link2,
    Sliders,
    Clock,
    Tag,
    ChevronDown,
    DollarSign,
    Info,
    Loader
} from 'lucide-react';
import './PublicItinerary.css';

// Inline SVG components to prevent Lucide export version disputes
const TwitterIcon = (props) => (
    <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" fill="currentColor" strokeWidth="0" {...props}>
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
);

const FacebookIcon = (props) => (
    <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" fill="currentColor" strokeWidth="0" {...props}>
        <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c4.56-.93 8-4.96 8-9.75z" stroke="none" />
    </svg>
);

const PublicItinerary = () => {
    const { tripId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth(); // Safe fallback to check if logged in

    const [trip, setTrip] = useState(null);
    const [sections, setSections] = useState([]);
    const [loading, setLoading] = useState(true);
    const [copying, setCopying] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [linkCopied, setLinkCopied] = useState(false);

    // Fetch from the public endpoint
    const fetchPublicTrip = async () => {
        setLoading(true);
        try {
            // Direct call bypassing JWT interceptor if token doesn't exist
            const url = `http://localhost:5000/api/trips/${tripId}/public`;
            const response = await axios.get(url);
            setTrip(response.data.data);
            setSections(response.data.data.itinerarySections || []);
        } catch (err) {
            console.error(err);
            setError('Could not retrieve this shared itinerary. Please verify URL authenticity.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPublicTrip();
    }, [tripId]);

    // Copy/Clone Trip Handler
    const handleCloneTrip = async () => {
        // Check if user is authenticated
        const token = localStorage.getItem('token');
        if (!token) {
            alert('Please log in or register a GlobalTrotter account to copy this trip to your dashboard!');
            navigate('/login');
            return;
        }

        setCopying(true);
        try {
            // Authenticated copy endpoint
            const headers = { Authorization: `Bearer ${token}` };
            const response = await axios.post(`http://localhost:5000/api/trips/${tripId}/copy`, {}, { headers });
            setSuccess('Trip cloned successfully! Redirecting to dashboard...');
            setTimeout(() => {
                navigate('/dashboard');
            }, 2000);
        } catch (err) {
            console.error(err);
            setError('Could not copy trip to your dashboard. Make sure you are authenticated.');
        } finally {
            setCopying(false);
        }
    };

    // Social share helpers
    const handleCopyShareLink = () => {
        const shareUrl = window.location.href;
        navigator.clipboard.writeText(shareUrl);
        setLinkCopied(true);
        setTimeout(() => setLinkCopied(false), 2000);
    };

    const getTwitterShareUrl = () => {
        const text = encodeURIComponent(`Check out this amazing travel itinerary for ${trip ? trip.name : 'my next trip'} on GlobalTrotter! 🗺️✈️`);
        const url = encodeURIComponent(window.location.href);
        return `https://twitter.com/intent/tweet?text=${text}&url=${url}`;
    };

    const getFacebookShareUrl = () => {
        const url = encodeURIComponent(window.location.href);
        return `https://www.facebook.com/sharer/sharer.php?u=${url}`;
    };

    // Compile all activities grouped by Day Number
    const getDayWiseActivitiesMap = () => {
        const map = {};
        sections.forEach(sec => {
            const acts = sec.activities || [];
            acts.forEach(act => {
                const day = act.dayNumber || 1;
                if (!map[day]) map[day] = [];
                map[day].push({
                    ...act,
                    sectionTitle: sec.title
                });
            });
        });
        return map;
    };

    const dayWiseActivities = getDayWiseActivitiesMap();
    const sortedDays = Object.keys(dayWiseActivities).sort((a, b) => Number(a) - Number(b));

    const totalDays = trip && trip.startDate && trip.endDate
        ? Math.ceil((new Date(trip.endDate) - new Date(trip.startDate)) / (1000 * 60 * 60 * 24)) + 1
        : 1;

    const totalExpense = sections.reduce((sum, sec) => {
        return sum + (sec.activities || []).reduce((s, act) => s + (act.cost || 0), 0);
    }, 0);

    return (
        <div className="public-itinerary-page">
            {/* Brand Header */}
            <header className="public-itinerary-header">
                <div className="header-container">
                    <div className="dashboard-logo" onClick={() => navigate('/dashboard')} style={{ cursor: 'pointer' }}>
                        <Compass className="logo-icon" size={28} />
                        <span>GlobalTrotter</span>
                    </div>

                    <div className="public-nav-actions">
                        {localStorage.getItem('token') ? (
                            <button className="primary-nav-btn" onClick={() => navigate('/dashboard')}>
                                Go to Dashboard
                            </button>
                        ) : (
                            <button className="primary-nav-btn outline" onClick={() => navigate('/login')}>
                                Sign In / Join
                            </button>
                        )}
                    </div>
                </div>
            </header>

            {/* Main Container */}
            <main className="public-itinerary-main">
                {error && <div className="public-notification error">{error}</div>}
                {success && <div className="public-notification success">{success}</div>}

                {loading ? (
                    <div className="loading-wrapper">
                        <Loader className="spinner" size={32} />
                        <p>Gathering shared itinerary...</p>
                    </div>
                ) : (
                    trip && (
                        <div className="public-itinerary-layout-rows">

                            {/* 1. Shared Banner Details */}
                            <div className="public-banner-card">
                                {trip.coverPhoto ? (
                                    <div className="public-banner-image">
                                        <img src={trip.coverPhoto} alt={trip.name} />
                                    </div>
                                ) : (
                                    <div className="public-banner-placeholder">
                                        <Compass size={48} />
                                    </div>
                                )}

                                <div className="public-banner-info">
                                    <div className="header-meta-row">
                                        <span className="region-indicator">{trip.region}</span>
                                        <span className="shared-badge">Shared Itinerary</span>
                                    </div>
                                    <h2>{trip.name}</h2>
                                    {trip.description && <p className="trip-desc-tag">{trip.description}</p>}

                                    <div className="key-details-row">
                                        <div className="lbl-pill">
                                            <Calendar size={14} />
                                            <span>{new Date(trip.startDate).toLocaleDateString()} - {new Date(trip.endDate).toLocaleDateString()} ({totalDays} Days)</span>
                                        </div>
                                        <div className="lbl-pill">
                                            <DollarSign size={14} />
                                            <span>Est Expense Spend: ${totalExpense.toLocaleString()} USD</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* 2. Copy & Social Share Controls Bar */}
                            <div className="share-controls-row">
                                <button
                                    className="clone-action-btn"
                                    onClick={handleCloneTrip}
                                    disabled={copying}
                                >
                                    {copying ? (
                                        <Loader className="spinner" size={16} />
                                    ) : (
                                        <>
                                            <Copy size={16} />
                                            <span>Copy Trip to Dashboard (Clone It)</span>
                                        </>
                                    )}
                                </button>

                                <div className="social-sharing-buttons">
                                    <span className="sharing-lbl">Share:</span>
                                    <button
                                        onClick={handleCopyShareLink}
                                        className={`share-btn copy-link ${linkCopied ? 'copied' : ''}`}
                                        title="Copy Link to Clipboard"
                                    >
                                        {linkCopied ? <Check size={14} /> : <Link2 size={14} />}
                                        <span>{linkCopied ? 'Link Copied!' : 'Copy Link'}</span>
                                    </button>

                                    <a
                                        href={getTwitterShareUrl()}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="share-btn twitter"
                                    >
                                        <TwitterIcon />
                                        <span>Post</span>
                                    </a>

                                    <a
                                        href={getFacebookShareUrl()}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="share-btn facebook"
                                    >
                                        <FacebookIcon />
                                        <span>Share</span>
                                    </a>
                                </div>
                            </div>

                            {/* 3. Read-Only Timeline Flow */}
                            <div className="read-only-timeline-box">
                                <h3>Journey Timeline</h3>

                                {sortedDays.length === 0 ? (
                                    <div className="empty-timeline-state">
                                        <Info size={32} style={{ opacity: 0.3, marginBottom: '8px' }} />
                                        <p>No timeline activities specified for this public trip.</p>
                                    </div>
                                ) : (
                                    <div className="public-days-list">
                                        {sortedDays.map(dayNum => {
                                            const dayActivities = dayWiseActivities[dayNum];
                                            return (
                                                <div key={dayNum} className="public-day-timeline-segment">
                                                    <div className="day-header-col">
                                                        <span className="day-number-bubble">Day {dayNum}</span>
                                                    </div>

                                                    <div className="activities-column-flow">
                                                        {dayActivities.map((act, index) => (
                                                            <div key={act._id || index} className="public-activity-timeline-card">

                                                                <div className="activity-main-info">
                                                                    <div className="activity-title-row">
                                                                        <h4>{act.name}</h4>
                                                                        {act.cost > 0 && (
                                                                            <span className="activity-cost-lbl">${act.cost}</span>
                                                                        )}
                                                                    </div>

                                                                    <div className="activity-meta-capsules-group">
                                                                        <span className="meta-capsule text-clock">
                                                                            <Clock size={12} />
                                                                            {act.time}
                                                                        </span>
                                                                        <span className={`meta-capsule category-tag ${act.category?.toLowerCase() || 'activities'}`}>
                                                                            <Tag size={12} />
                                                                            {act.category || 'Activities'}
                                                                        </span>
                                                                        <span className="stage-origin-lbl">
                                                                            📍 {act.sectionTitle}
                                                                        </span>
                                                                    </div>
                                                                </div>

                                                                {index < dayActivities.length - 1 && (
                                                                    <div className="vertical-timeline-connector-arrow">↓</div>
                                                                )}
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>

                        </div>
                    )
                )}
            </main>
        </div>
    );
};

export default PublicItinerary;
