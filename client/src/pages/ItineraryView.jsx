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
    Edit3,
    Check,
    Search,
    Grid,
    List,
    Eye,
    Sliders,
    ChevronDown,
    Loader
} from 'lucide-react';
import './ItineraryView.css';

const ItineraryView = () => {
    const { tripId } = useParams();
    const navigate = useNavigate();
    const { user, logout } = useAuth();

    // State
    const [trip, setTrip] = useState(null);
    const [sections, setSections] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

    // Filters State for Activities
    const [search, setSearch] = useState('');
    const [sortOrder, setSortOrder] = useState('timeAsc'); // timeAsc, timeDesc, costAsc, costDesc
    const [filterType, setFilterType] = useState('All'); // All, Cost, Free
    const [viewMode, setViewMode] = useState('timeline'); // timeline, list

    // Adding/Editing activity modal or inline state
    const [activeSectionId, setActiveSectionId] = useState(null);
    const [showAddActivity, setShowAddActivity] = useState(false);
    const [newActName, setNewActName] = useState('');
    const [newActTime, setNewActTime] = useState('12:00 PM');
    const [newActCost, setNewActCost] = useState(0);
    const [newActDay, setNewActDay] = useState(1);

    const fetchTrip = async () => {
        setLoading(true);
        try {
            const response = await api.get(`/trips/${tripId}`);
            setTrip(response.data.data);
            setSections(response.data.data.itinerarySections || []);
            setError('');
        } catch (err) {
            console.error(err);
            setError('Could not retrieve trip layout.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTrip();
    }, [tripId]);

    const handleLogoutClick = () => {
        logout();
        navigate('/login');
    };

    const handleAddActivitySubmit = async (sectionId) => {
        if (!newActName) {
            alert('Activity name is required!');
            return;
        }

        setSaving(true);
        try {
            const updatedSections = sections.map(sec => {
                if (sec._id === sectionId) {
                    const acts = sec.activities || [];
                    return {
                        ...sec,
                        activities: [
                            ...acts,
                            {
                                name: newActName,
                                time: newActTime,
                                cost: Number(newActCost),
                                dayNumber: Number(newActDay)
                            }
                        ]
                    };
                }
                return sec;
            });

            await api.put(`/trips/${tripId}/itinerary`, {
                itinerarySections: updatedSections
            });

            queryReset();
            setSections(updatedSections);
            setShowAddActivity(false);
        } catch (err) {
            console.error(err);
            setError('Failed to add activity.');
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteActivity = async (sectionId, activityId) => {
        if (!window.confirm('Remove this activity from the plan?')) return;
        setSaving(true);
        try {
            const updatedSections = sections.map(sec => {
                if (sec._id === sectionId) {
                    return {
                        ...sec,
                        activities: (sec.activities || []).filter(act => act._id !== activityId)
                    };
                }
                return sec;
            });

            await api.put(`/trips/${tripId}/itinerary`, {
                itinerarySections: updatedSections
            });
            setSections(updatedSections);
        } catch (err) {
            console.error(err);
            setError('Failed to delete activity.');
        } finally {
            setSaving(false);
        }
    };

    const queryReset = () => {
        setNewActName('');
        setNewActTime('12:00 PM');
        setNewActCost(0);
        setNewActDay(1);
    };

    // Compile all activities from all sections matching search/sort criteria grouped by Day
    const getProcessedTimeline = () => {
        const daysMap = {};

        sections.forEach(sec => {
            const activities = sec.activities || [];
            activities.forEach(act => {
                // Filter actions
                const matchesSearch = act.name.toLowerCase().includes(search.toLowerCase());
                const matchesFilter = filterType === 'All'
                    || (filterType === 'Cost' && act.cost > 0)
                    || (filterType === 'Free' && act.cost === 0);

                if (matchesSearch && matchesFilter) {
                    const day = act.dayNumber || 1;
                    if (!daysMap[day]) {
                        daysMap[day] = [];
                    }
                    daysMap[day].push({
                        ...act,
                        sectionId: sec._id,
                        sectionTitle: sec.title
                    });
                }
            });
        });

        // Sort activities inside each day
        Object.keys(daysMap).forEach(day => {
            daysMap[day].sort((a, b) => {
                if (sortOrder === 'timeAsc') {
                    return a.time.localeCompare(b.time);
                } else if (sortOrder === 'timeDesc') {
                    return b.time.localeCompare(a.time);
                } else if (sortOrder === 'costAsc') {
                    return a.cost - b.cost;
                } else {
                    return b.cost - a.cost;
                }
            });
        });

        return daysMap;
    };

    const daysTimeline = getProcessedTimeline();
    const sortedDays = Object.keys(daysTimeline).sort((a, b) => Number(a) - Number(b));

    const totalExpense = sections.reduce((sum, sec) => {
        const itemSum = (sec.activities || []).reduce((acc, act) => acc + (act.cost || 0), 0);
        return sum + itemSum;
    }, 0);

    return (
        <div className="itinerary-view-page">
            {/* Header section */}
            <header className="itinerary-view-header">
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

            {/* Main Container */}
            <main className="itinerary-view-main">
                {/* Navigation & view toggle header */}
                <div className="header-navigation-row">
                    <div className="nav-buttons-block">
                        <button onClick={() => navigate('/dashboard')} className="back-link-btn">
                            <ArrowLeft size={18} />
                            <span>Back</span>
                        </button>
                        {trip && (
                            <button onClick={() => navigate(`/trips/${trip._id}/itinerary`)} className="edit-opt-btn">
                                <Edit3 size={16} />
                                <span>Edit Sections</span>
                            </button>
                        )}
                    </div>

                    <div className="view-mode-toggle-group">
                        <button
                            className={`toggle-btn ${viewMode === 'timeline' ? 'active' : ''}`}
                            onClick={() => setViewMode('timeline')}
                        >
                            <Grid size={16} />
                            <span>Timeline View</span>
                        </button>
                        <button
                            className={`toggle-btn ${viewMode === 'list' ? 'active' : ''}`}
                            onClick={() => setViewMode('list')}
                        >
                            <List size={16} />
                            <span>Stops List</span>
                        </button>
                    </div>
                </div>

                {trip && (
                    <div className="itinerary-title-card">
                        <h2>Itinerary for {trip.name}</h2>
                        <div className="budget-summary-pill">
                            <DollarSign size={16} />
                            <span>Total Activity Expense: <strong>{totalExpense.toLocaleString()} USD</strong></span>
                        </div>
                    </div>
                )}

                {/* Aligned Controls Bar resembling Screen 9 template */}
                <section className="controls-bar">
                    <div className="search-wrapper">
                        <Search className="search-icon" size={18} />
                        <input
                            type="text"
                            placeholder="Search bar ......"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>

                    <div className="filters-container">
                        <div className="select-wrapper">
                            <label>Group by</label>
                            <select defaultValue="day">
                                <option value="day">Day wise</option>
                            </select>
                        </div>

                        <div className="select-wrapper">
                            <label>Filter</label>
                            <select value={filterType} onChange={(e) => setFilterType(e.target.value)}>
                                <option value="All">All Activities</option>
                                <option value="Cost">Paid Stops</option>
                                <option value="Free">Free Stops</option>
                            </select>
                        </div>

                        <div className="select-wrapper">
                            <label>Sort by...</label>
                            <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value)}>
                                <option value="timeAsc">Time (AM to PM)</option>
                                <option value="timeDesc">Time (PM to AM)</option>
                                <option value="costAsc">Cost (Low to High)</option>
                                <option value="costDesc">Cost (High to Low)</option>
                            </select>
                        </div>
                    </div>
                </section>

                {error && <div className="itinerary-view-error">{error}</div>}

                {loading ? (
                    <div className="loading-container">
                        <Loader className="spinner" size={32} />
                        <p>Gathering itinerary plans...</p>
                    </div>
                ) : (
                    <div className="itinerary-content-canvas">
                        {/* View Mode 1: Timeline View (Screen 9 day timeline with expense box alignments) */}
                        {viewMode === 'timeline' ? (
                            sortedDays.length === 0 ? (
                                <div className="empty-itinerary-state">
                                    <Compass size={40} className="empty-icon" />
                                    <p>No activity logs found. Switch back to Edit Sections or add details below.</p>
                                </div>
                            ) : (
                                <div className="timeline-grid-layout">
                                    {/* Header Row labels */}
                                    <div className="timeline-labels-header">
                                        <span className="col-lbl days-lbl">Days</span>
                                        <span className="col-lbl activity-lbl">Physical Activity</span>
                                        <span className="col-lbl expense-lbl">Expense</span>
                                    </div>

                                    {/* Day blocks rendering */}
                                    {sortedDays.map((dayNum) => (
                                        <div key={dayNum} className="timeline-day-segment">
                                            {/* Day Pill on the Left */}
                                            <div className="timeline-day-pill-column">
                                                <span className="day-pill-badge">Day {dayNum}</span>
                                            </div>

                                            {/* Timeline flow on the Right */}
                                            <div className="timeline-activities-column">
                                                {daysTimeline[dayNum].map((act, actIdx) => (
                                                    <div key={act._id || actIdx} className="timeline-row-item">

                                                        {/* The Activity Box */}
                                                        <div className="activity-bubble-card">
                                                            <span className="activity-time-lbl">{act.time || '12:00 PM'}</span>
                                                            <div className="activity-bubble-text">
                                                                <h4>{act.name}</h4>
                                                                <span className="section-source-lbl">Stage: {act.sectionTitle}</span>
                                                            </div>
                                                            <button
                                                                className="bubble-delete-btn"
                                                                onClick={() => handleDeleteActivity(act.sectionId, act._id)}
                                                                title="Remove activity"
                                                            >
                                                                <Trash2 size={13} />
                                                            </button>
                                                        </div>

                                                        {/* Aligned Expense Box on the Right */}
                                                        <div className="expense-bubble-card">
                                                            <span className="expense-cost-val">${act.cost || 0} USD</span>
                                                        </div>

                                                        {/* Arrow connector ↓ if not the last item in the day list */}
                                                        {actIdx < daysTimeline[dayNum].length - 1 && (
                                                            <div className="activity-vertical-connector">
                                                                <span className="arrow-down-icon">↓</span>
                                                            </div>
                                                        )}

                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )
                        ) : (
                            /* View Mode 2: Stops List (Stops organized by city headers) */
                            <div className="stops-list-grid">
                                {sections.length === 0 ? (
                                    <div className="empty-itinerary-state">
                                        <p>No city stages defined for this trip yet.</p>
                                    </div>
                                ) : (
                                    sections.map((section) => (
                                        <div key={section._id} className="city-stage-section">
                                            <div className="city-stage-header">
                                                <h3>{section.title}</h3>
                                                <span className="city-stage-budget">Budget limit: ${section.budget || 0}</span>
                                            </div>

                                            <p className="city-stage-desc">{section.description}</p>

                                            <div className="city-activities-mini-list">
                                                {(section.activities || []).length === 0 ? (
                                                    <p className="no-acts-hint">No specific activity stops registered for this city yet.</p>
                                                ) : (
                                                    section.activities.map((act) => (
                                                        <div key={act._id} className="mini-activity-row">
                                                            <span className="act-time">{act.time}</span>
                                                            <span className="act-name">{act.name} (Day {act.dayNumber})</span>
                                                            <span className="act-cost">${act.cost}</span>
                                                        </div>
                                                    ))
                                                )}
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        )}

                        {/* Quick Actions Panel: Inline Logger Form */}
                        <section className="inline-activity-logger">
                            <h3>Quick Activities logger</h3>
                            <p className="hint-txt">Quickly add stops, meals, or transfers directly onto your timeline segments.</p>

                            <div className="logger-form-grid">
                                <div className="log-input-group">
                                    <label>Select Stage/City:</label>
                                    <select
                                        value={activeSectionId || ''}
                                        onChange={(e) => setActiveSectionId(e.target.value)}
                                    >
                                        <option value="" disabled>-- Choose a City Stage --</option>
                                        {sections.map(sec => (
                                            <option key={sec._id} value={sec._id}>{sec.title}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="log-input-group">
                                    <label>Activity/Stop Name:</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. Louvre guided exploration course"
                                        value={newActName}
                                        onChange={(e) => setNewActName(e.target.value)}
                                    />
                                </div>

                                <div className="log-input-group">
                                    <label>Scheduled Hour:</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. 09:30 AM"
                                        value={newActTime}
                                        onChange={(e) => setNewActTime(e.target.value)}
                                    />
                                </div>

                                <div className="log-input-group-row">
                                    <div className="log-input-group">
                                        <label>Est Cost (USD):</label>
                                        <input
                                            type="number"
                                            value={newActCost}
                                            onChange={(e) => setNewActCost(parseFloat(e.target.value) || 0)}
                                        />
                                    </div>

                                    <div className="log-input-group">
                                        <label>Journey Day Num:</label>
                                        <input
                                            type="number"
                                            min="1"
                                            value={newActDay}
                                            onChange={(e) => setNewActDay(parseInt(e.target.value) || 1)}
                                        />
                                    </div>
                                </div>
                            </div>

                            <button
                                className="add-activity-btn"
                                onClick={() => handleAddActivitySubmit(activeSectionId)}
                                disabled={saving || !activeSectionId}
                            >
                                {saving ? (
                                    <Loader className="spinner" size={16} />
                                ) : (
                                    <>
                                        <Plus size={16} />
                                        <span>Log Stop on Timeline</span>
                                    </>
                                )}
                            </button>
                        </section>
                    </div>
                )}
            </main>
        </div>
    );
};

export default ItineraryView;
