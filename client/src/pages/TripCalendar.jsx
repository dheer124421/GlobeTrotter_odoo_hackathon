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
    Clock,
    DollarSign,
    Tag,
    ChevronLeft,
    ChevronRight,
    Plus,
    Trash2,
    ArrowUp,
    ArrowDown,
    Edit3,
    Check,
    X,
    Loader
} from 'lucide-react';
import './TripCalendar.css';

const TripCalendar = () => {
    const { tripId } = useParams();
    const navigate = useNavigate();
    const { user, logout } = useAuth();

    // Core Trip states
    const [trip, setTrip] = useState(null);
    const [sections, setSections] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

    // Calendar render navigation states
    const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
    const [currentMonth, setCurrentMonth] = useState(new Date().getMonth()); // 0-indexed

    // Day expansion states
    // We'll set the active selected date (Date object) that the user clicks on the calendar
    const [selectedDate, setSelectedDate] = useState(null);

    // Editing activity state
    const [editingActivityId, setEditingActivityId] = useState(null);
    const [editName, setEditName] = useState('');
    const [editTime, setEditTime] = useState('');
    const [editCost, setEditCost] = useState(0);
    const [editCategory, setEditCategory] = useState('Activities');

    // Quick Add Form State under Expanded Day
    const [newActName, setNewActName] = useState('');
    const [newActTime, setNewActTime] = useState('12:00 PM');
    const [newActCost, setNewActCost] = useState(0);
    const [newActCategory, setNewActCategory] = useState('Activities');

    const fetchTripData = async () => {
        setLoading(true);
        try {
            const response = await api.get(`/trips/${tripId}`);
            const tripData = response.data.data;
            setTrip(tripData);
            setSections(tripData.itinerarySections || []);

            // Auto-set the calendar views to the trip's start date
            if (tripData.startDate) {
                const tripStart = new Date(tripData.startDate);
                setCurrentYear(tripStart.getFullYear());
                setCurrentMonth(tripStart.getMonth());
                setSelectedDate(new Date(tripStart));
            }
        } catch (err) {
            console.error(err);
            setError('Could not retrieve trip dates configuration.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTripData();
    }, [tripId]);

    const handleLogoutClick = () => {
        logout();
        navigate('/login');
    };

    // Helper date calculators
    const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
    const getFirstDayIndex = (year, month) => new Date(year, month, 1).getDay();

    const handlePrevMonth = () => {
        if (currentMonth === 0) {
            setCurrentMonth(11);
            setCurrentYear(currentYear - 1);
        } else {
            setCurrentMonth(currentMonth - 1);
        }
    };

    const handleNextMonth = () => {
        if (currentMonth === 11) {
            setCurrentMonth(0);
            setCurrentYear(currentYear + 1);
        } else {
            setCurrentMonth(currentMonth + 1);
        }
    };

    const getMonthName = (monthIdx) => {
        const months = [
            'January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'
        ];
        return months[monthIdx];
    };

    // Check if a calendar day cell falls within the trip dates
    const isDateInTripRange = (year, month, dayNum) => {
        if (!trip || !trip.startDate || !trip.endDate) return false;
        const cellDate = new Date(year, month, dayNum, 0, 0, 0, 0);
        const tripStart = new Date(trip.startDate);
        const tripEnd = new Date(trip.endDate);
        tripStart.setHours(0, 0, 0, 0);
        tripEnd.setHours(0, 0, 0, 0);
        return cellDate >= tripStart && cellDate <= tripEnd;
    };

    // Determine the Day Number of the trip for a given date cell
    const getTripDayNumber = (dateObj) => {
        if (!trip || !trip.startDate) return null;
        const start = new Date(trip.startDate);
        start.setHours(0, 0, 0, 0);
        const target = new Date(dateObj);
        target.setHours(0, 0, 0, 0);
        const diffTime = target - start;
        const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24)) + 1;
        return diffDays > 0 ? diffDays : null;
    };

    // Get activities scheduled on a specific calendar cell
    const getBinActivities = (year, month, dayNum) => {
        if (!trip) return [];
        const cellDate = new Date(year, month, dayNum);
        const dayNo = getTripDayNumber(cellDate);
        if (!dayNo) return [];

        const actsList = [];
        sections.forEach(sec => {
            const acts = sec.activities || [];
            acts.forEach(act => {
                if (act.dayNumber === dayNo) {
                    actsList.push({
                        ...act,
                        sectionId: sec._id,
                        sectionTitle: sec.title
                    });
                }
            });
        });
        return actsList;
    };

    // Re-ordering handler: move activity index in section subdocument array
    const handleSwapActivities = async (sectionId, actId, direction) => {
        setSaving(true);
        try {
            const updatedSections = sections.map(sec => {
                if (sec._id === sectionId) {
                    const acts = [...(sec.activities || [])];
                    const index = acts.findIndex(a => a._id === actId);
                    if (index === -1) return sec;

                    const targetIndex = direction === 'up' ? index - 1 : index + 1;
                    if (targetIndex >= 0 && targetIndex < acts.length) {
                        // Swap
                        const temp = acts[index];
                        acts[index] = acts[targetIndex];
                        acts[targetIndex] = temp;
                    }
                    return {
                        ...sec,
                        activities: acts
                    };
                }
                return sec;
            });

            const response = await api.put(`/trips/${tripId}/itinerary`, {
                itinerarySections: updatedSections
            });
            setTrip(response.data.data);
            setSections(response.data.data.itinerarySections || []);
            setSuccess('Activity order updated!');
            setTimeout(() => setSuccess(''), 2000);
        } catch (err) {
            console.error(err);
            setError('Could not update activities sequence.');
        } finally {
            setSaving(false);
        }
    };

    // Delete activity handler
    const handleDeleteActivity = async (sectionId, actId) => {
        if (!window.confirm('Delete this scheduled activity?')) return;
        setSaving(true);
        try {
            const updatedSections = sections.map(sec => {
                if (sec._id === sectionId) {
                    return {
                        ...sec,
                        activities: (sec.activities || []).filter(a => a._id !== actId)
                    };
                }
                return sec;
            });

            const response = await api.put(`/trips/${tripId}/itinerary`, {
                itinerarySections: updatedSections
            });
            setTrip(response.data.data);
            setSections(response.data.data.itinerarySections || []);
            setSuccess('Activity removed!');
            setTimeout(() => setSuccess(''), 2000);
        } catch (err) {
            console.error(err);
            setError('Failed to delete activity.');
        } finally {
            setSaving(false);
        }
    };

    // Save quick editing options
    const startEditActivity = (act) => {
        setEditingActivityId(act._id);
        setEditName(act.name);
        setEditTime(act.time || '12:00 PM');
        setEditCost(act.cost || 0);
        setEditCategory(act.category || 'Activities');
    };

    const cancelEditActivity = () => {
        setEditingActivityId(null);
    };

    const handleSaveActivityEdit = async (sectionId, actId) => {
        if (!editName) {
            alert('Activity name is required!');
            return;
        }
        setSaving(true);
        try {
            const updatedSections = sections.map(sec => {
                if (sec._id === sectionId) {
                    const acts = (sec.activities || []).map(a => {
                        if (a._id === actId) {
                            return {
                                ...a,
                                name: editName,
                                time: editTime,
                                cost: Number(editCost),
                                category: editCategory
                            };
                        }
                        return a;
                    });
                    return { ...sec, activities: acts };
                }
                return sec;
            });

            const response = await api.put(`/trips/${tripId}/itinerary`, {
                itinerarySections: updatedSections
            });
            setTrip(response.data.data);
            setSections(response.data.data.itinerarySections || []);
            setEditingActivityId(null);
            setSuccess('Activity details updated successfully!');
            setTimeout(() => setSuccess(''), 2000);
        } catch (err) {
            console.error(err);
            setError('Failed to save activity modifications.');
        } finally {
            setSaving(false);
        }
    };

    // Quick add activity form submit under chosen day
    const handleQuickAddLocal = async (e) => {
        e.preventDefault();
        if (!newActName) {
            alert('Activity name is required!');
            return;
        }
        if (!selectedDate) return;
        const dayNo = getTripDayNumber(selectedDate);
        if (!dayNo) return;

        // Find first section, or add to first section of the trip
        if (sections.length === 0) {
            alert('You must add at least one stage (city/location section) under itinerary builder first!');
            return;
        }

        // Default target section is the first section
        const targetSectionId = sections[0]._id;

        setSaving(true);
        try {
            const updatedSections = sections.map(sec => {
                if (sec._id === targetSectionId) {
                    const acts = sec.activities || [];
                    return {
                        ...sec,
                        activities: [
                            ...acts,
                            {
                                name: newActName,
                                category: newActCategory,
                                time: newActTime,
                                cost: Number(newActCost),
                                dayNumber: Number(dayNo)
                            }
                        ]
                    };
                }
                return sec;
            });

            const response = await api.put(`/trips/${tripId}/itinerary`, {
                itinerarySections: updatedSections
            });

            setTrip(response.data.data);
            setSections(response.data.data.itinerarySections || []);
            setNewActName('');
            setNewActCost(0);
            setSuccess('Card activity registered!');
            setTimeout(() => setSuccess(''), 2000);
        } catch (err) {
            console.error(err);
            setError('Could not insert calendar activity.');
        } finally {
            setSaving(false);
        }
    };

    // Render Calendar Helper Lists
    const renderCalendarCells = () => {
        const daysInMonth = getDaysInMonth(currentYear, currentMonth);
        const firstDayIndex = getFirstDayIndex(currentYear, currentMonth);
        const cells = [];

        // Blank cells before the 1st of the month
        for (let i = 0; i < firstDayIndex; i++) {
            cells.push(<div key={`blank-${i}`} className="calendar-cell cell-empty" />);
        }

        // Actual day cells
        for (let day = 1; day <= daysInMonth; day++) {
            const dateVal = new Date(currentYear, currentMonth, day, 0, 0, 0, 0);
            const inRange = isDateInTripRange(currentYear, currentMonth, day);
            const isSelected = selectedDate &&
                selectedDate.getDate() === day &&
                selectedDate.getMonth() === currentMonth &&
                selectedDate.getFullYear() === currentYear;

            const dayActs = getBinActivities(currentYear, currentMonth, day);
            const tripDayNo = getTripDayNumber(dateVal);

            cells.push(
                <div
                    key={`day-${day}`}
                    className={`calendar-cell cell-active ${inRange ? 'trip-range' : ''} ${isSelected ? 'cell-selected' : ''}`}
                    onClick={() => setSelectedDate(dateVal)}
                >
                    <div className="day-number-badge">{day}</div>
                    {tripDayNo && inRange && (
                        <div className="trip-day-no-lbl">Day {tripDayNo}</div>
                    )}
                    {dayActs.length > 0 && (
                        <div className="cell-activities-indicator">
                            <span className="dot-pulse" />
                            <span className="count-txt">{dayActs.length} {dayActs.length === 1 ? 'act' : 'acts'}</span>
                        </div>
                    )}
                </div>
            );
        }

        return cells;
    };

    const selectedDayNo = selectedDate ? getTripDayNumber(selectedDate) : null;
    const activeDayActivitiesList = selectedDate ? getBinActivities(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate()) : [];

    return (
        <div className="trip-calendar-page">
            {/* Header element */}
            <header className="trip-calendar-header">
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
            <main className="trip-calendar-main">
                <div className="header-navigation-row">
                    <button onClick={() => navigate(`/trips/${tripId}/view`)} className="back-link-btn">
                        <ArrowLeft size={18} />
                        <span>Back to Timeline</span>
                    </button>
                </div>

                {error && <div className="calendar-message error">{error}</div>}
                {success && <div className="calendar-message success">{success}</div>}

                {trip && (
                    <div className="title-banner-area">
                        <h2>Timeline Calendar: {trip.name}</h2>
                        <span className="date-span">
                            <Calendar size={14} style={{ marginRight: '6px' }} />
                            {new Date(trip.startDate).toLocaleDateString()} - {new Date(trip.endDate).toLocaleDateString()}
                        </span>
                    </div>
                )}

                {loading ? (
                    <div className="loading-wrapper">
                        <Loader className="spinner" size={32} />
                        <p>Shedding light on calendar grids...</p>
                    </div>
                ) : (
                    <div className="calendar-dynamic-grid">

                        {/* Left Column: The Monthly Calendar Grid */}
                        <div className="calendar-card-panel">
                            <div className="calendar-month-controls">
                                <button className="month-control-btn" onClick={handlePrevMonth}>
                                    <ChevronLeft size={20} />
                                </button>
                                <h3>{getMonthName(currentMonth)} {currentYear}</h3>
                                <button className="month-control-btn" onClick={handleNextMonth}>
                                    <ChevronRight size={20} />
                                </button>
                            </div>

                            <div className="weekday-header-grid">
                                <div>SUN</div>
                                <div>MON</div>
                                <div>TUE</div>
                                <div>WED</div>
                                <div>THU</div>
                                <div>FRI</div>
                                <div>SAT</div>
                            </div>

                            <div className="calendar-days-cells-grid">
                                {renderCalendarCells()}
                            </div>
                        </div>

                        {/* Right Column: Expandable Day View Details */}
                        <div className="day-details-panel">
                            {selectedDate ? (
                                <div className="day-details-content">

                                    <div className="details-header-row">
                                        <div>
                                            <h3>{selectedDate.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</h3>
                                            {selectedDayNo ? (
                                                <span className="trip-day-badge">Trip Day {selectedDayNo}</span>
                                            ) : (
                                                <span className="trip-day-badge non-trip">Outside Trip Range</span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Activities list for selected day */}
                                    <div className="activities-list-container">
                                        <h4>Daily Schedule Layout</h4>

                                        {activeDayActivitiesList.length === 0 ? (
                                            <div className="empty-day-state-box">
                                                <Clock size={32} style={{ opacity: 0.3 }} />
                                                <p>No activities scheduled for this date.</p>
                                            </div>
                                        ) : (
                                            <div className="vertical-timeline-reorder-list">
                                                {activeDayActivitiesList.map((act, index) => (
                                                    <div key={act._id} className="timeline-activity-reorder-card">

                                                        {/* Reorder actions column */}
                                                        <div className="reorder-actions-col">
                                                            <button
                                                                className="reorder-chevron-btn"
                                                                onClick={() => handleSwapActivities(act.sectionId, act._id, 'up')}
                                                                disabled={index === 0 || saving}
                                                                title="Move activity up"
                                                            >
                                                                <ArrowUp size={14} />
                                                            </button>
                                                            <button
                                                                className="reorder-chevron-btn"
                                                                onClick={() => handleSwapActivities(act.sectionId, act._id, 'down')}
                                                                disabled={index === activeDayActivitiesList.length - 1 || saving}
                                                                title="Move activity down"
                                                            >
                                                                <ArrowDown size={14} />
                                                            </button>
                                                        </div>

                                                        {/* Main Details / Form block */}
                                                        {editingActivityId === act._id ? (
                                                            <div className="inline-quick-edit-form">
                                                                <div className="edit-input-row">
                                                                    <input
                                                                        type="text"
                                                                        value={editName}
                                                                        onChange={(e) => setEditName(e.target.value)}
                                                                        placeholder="Activity Name"
                                                                    />
                                                                </div>
                                                                <div className="edit-input-row double">
                                                                    <input
                                                                        type="text"
                                                                        value={editTime}
                                                                        onChange={(e) => setEditTime(e.target.value)}
                                                                        placeholder="09:00 AM"
                                                                    />
                                                                    <input
                                                                        type="number"
                                                                        value={editCost}
                                                                        onChange={(e) => setEditCost(parseFloat(e.target.value) || 0)}
                                                                        placeholder="Cost (USD)"
                                                                    />
                                                                </div>
                                                                <div className="edit-input-row">
                                                                    <select
                                                                        value={editCategory}
                                                                        onChange={(e) => setEditCategory(e.target.value)}
                                                                    >
                                                                        <option value="Activities">Activities</option>
                                                                        <option value="Transport">Transport</option>
                                                                        <option value="Stay">Stay/Accommodation</option>
                                                                        <option value="Meals">Meals/Food</option>
                                                                        <option value="Other">Other</option>
                                                                    </select>
                                                                </div>
                                                                <div className="edit-actions-row">
                                                                    <button onClick={() => handleSaveActivityEdit(act.sectionId, act._id)} className="save-edit-btn">
                                                                        <Check size={14} />
                                                                        Save
                                                                    </button>
                                                                    <button onClick={cancelEditActivity} className="cancel-edit-btn">
                                                                        <X size={14} />
                                                                        Cancel
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <div className="activity-info-box">
                                                                <div className="act-title-row">
                                                                    <h5>{act.name}</h5>
                                                                    <div className="item-price-tag">${act.cost}</div>
                                                                </div>

                                                                <div className="act-meta-row">
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

                                                                <div className="activity-functional-actions">
                                                                    <button className="meta-action-btn edit" onClick={() => startEditActivity(act)}>
                                                                        <Edit3 size={12} />
                                                                        <span>Quick Edit</span>
                                                                    </button>
                                                                    <button className="meta-action-btn trash" onClick={() => handleDeleteActivity(act.sectionId, act._id)}>
                                                                        <Trash2 size={12} />
                                                                        <span>Delete</span>
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        )}

                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    {/* Quick Add Form inside Day detail (Only shown if date falls in Trip range) */}
                                    {selectedDayNo && sections.length > 0 && (
                                        <div className="detailed-day-quick-add-form">
                                            <h4>Log Activity for Day {selectedDayNo}</h4>
                                            <form onSubmit={handleQuickAddLocal} className="quick-add-timeline-form">
                                                <div className="input-field-group">
                                                    <input
                                                        type="text"
                                                        placeholder="e.g. Visit Louvre Museum"
                                                        value={newActName}
                                                        onChange={(e) => setNewActName(e.target.value)}
                                                        required
                                                    />
                                                </div>

                                                <div className="input-field-row">
                                                    <input
                                                        type="text"
                                                        placeholder="e.g. 10:00 AM"
                                                        value={newActTime}
                                                        onChange={(e) => setNewActTime(e.target.value)}
                                                    />
                                                    <input
                                                        type="number"
                                                        placeholder="Price (USD)"
                                                        value={newActCost}
                                                        onChange={(e) => setNewActCost(parseFloat(e.target.value) || 0)}
                                                    />
                                                </div>

                                                <div className="input-field-group">
                                                    <select
                                                        value={newActCategory}
                                                        onChange={(e) => setNewActCategory(e.target.value)}
                                                    >
                                                        <option value="Activities">Activities</option>
                                                        <option value="Transport">Transport</option>
                                                        <option value="Stay">Stay/Accommodation</option>
                                                        <option value="Meals">Meals/Food</option>
                                                        <option value="Other">Other</option>
                                                    </select>
                                                </div>

                                                <button type="submit" className="submit-act-btn" disabled={saving}>
                                                    {saving ? <Loader className="spinner" size={14} /> : <Plus size={14} />}
                                                    <span>Add to Calendar</span>
                                                </button>
                                            </form>
                                        </div>
                                    )}

                                </div>
                            ) : (
                                <div className="no-day-selected-state">
                                    <Calendar size={48} style={{ opacity: 0.15, marginBottom: '12px' }} />
                                    <h4>Select a Date</h4>
                                    <p>Click on any date cell inside the monthly calendar grid to view or manage scheduled activities.</p>
                                </div>
                            )}
                        </div>

                    </div>
                )}
            </main>
        </div>
    );
};

export default TripCalendar;
