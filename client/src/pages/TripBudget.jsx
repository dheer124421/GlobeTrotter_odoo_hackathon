import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import {
    Compass,
    User,
    LogOut,
    ArrowLeft,
    DollarSign,
    AlertCircle,
    Calendar,
    Sliders,
    Plus,
    Trash2,
    Loader,
    TrendingDown,
    Info
} from 'lucide-react';
import './TripBudget.css';

const TripBudget = () => {
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

    // New Transaction Form State
    const [newExpenseName, setNewExpenseName] = useState('');
    const [newExpenseCategory, setNewExpenseCategory] = useState('Activities');
    const [newExpenseCost, setNewExpenseCost] = useState(0);
    const [newExpenseDay, setNewExpenseDay] = useState(1);
    const [selectedSectionId, setSelectedSectionId] = useState('');

    const categories = ['Transport', 'Stay', 'Activities', 'Meals', 'Other'];

    const fetchTripData = async () => {
        setLoading(true);
        try {
            const response = await api.get(`/trips/${tripId}`);
            const tripData = response.data.data;
            setTrip(tripData);
            setSections(tripData.itinerarySections || []);
            if (tripData.itinerarySections && tripData.itinerarySections.length > 0) {
                setSelectedSectionId(tripData.itinerarySections[0]._id);
            }
        } catch (err) {
            console.error(err);
            setError('Could not retrieve trip budget specifications.');
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

    // Compile all activities across all sections
    const getAllActivitiesObjList = () => {
        const list = [];
        sections.forEach(sec => {
            const acts = sec.activities || [];
            acts.forEach(act => {
                list.push({
                    ...act,
                    sectionId: sec._id,
                    sectionTitle: sec.title
                });
            });
        });
        return list;
    };

    const activitiesList = getAllActivitiesObjList();

    // Financial Metrics
    const totalBudget = trip ? trip.totalBudget || 0 : 0;
    const currentExpenses = activitiesList.reduce((sum, act) => sum + (act.cost || 0), 0);
    const remainingBudget = totalBudget - currentExpenses;
    const isOverBudget = remainingBudget < 0;

    // Day calculations
    const calculateTotalTripDaysValue = () => {
        if (!trip || !trip.startDate || !trip.endDate) return 1;
        const start = new Date(trip.startDate);
        const end = new Date(trip.endDate);
        const diff = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
        return diff > 0 ? diff : 1;
    };
    const totalTripDays = calculateTotalTripDaysValue();
    const averageSpendPerDay = currentExpenses / totalTripDays;
    const dailyBudgetLimit = totalBudget / totalTripDays;

    // Category splits
    const categoryTotals = {
        Transport: 0,
        Stay: 0,
        Activities: 0,
        Meals: 0,
        Other: 0
    };
    activitiesList.forEach(act => {
        const cat = act.category || 'Activities';
        if (categoryTotals[cat] !== undefined) {
            categoryTotals[cat] += act.cost || 0;
        } else {
            categoryTotals['Activities'] += act.cost || 0;
        }
    });

    // Calculate day-wise expenses & discover over-budget days
    const getDayWiseExpensesMap = () => {
        const map = {};
        activitiesList.forEach(act => {
            const day = act.dayNumber || 1;
            map[day] = (map[day] || 0) + (act.cost || 0);
        });
        return map;
    };
    const dayWiseExpenses = getDayWiseExpensesMap();

    const overBudgetDaysList = [];
    Object.keys(dayWiseExpenses).forEach(dayNum => {
        const cost = dayWiseExpenses[dayNum];
        if (cost > dailyBudgetLimit) {
            overBudgetDaysList.push({
                day: Number(dayNum),
                spent: cost,
                limit: dailyBudgetLimit,
                excess: cost - dailyBudgetLimit
            });
        }
    });
    // Sort alerts by Day number
    overBudgetDaysList.sort((a, b) => a.day - b.day);

    // Form Submit Handler matching backend saves
    const handleAddNewExpense = async (e) => {
        e.preventDefault();
        if (!newExpenseName) {
            alert('Expense name status required!');
            return;
        }
        if (!selectedSectionId) {
            alert('Please select a City Stage/Section block to assign this expense!');
            return;
        }

        setSaving(true);
        try {
            const updatedSections = sections.map(sec => {
                if (sec._id === selectedSectionId) {
                    const acts = sec.activities || [];
                    return {
                        ...sec,
                        activities: [
                            ...acts,
                            {
                                name: newExpenseName,
                                category: newExpenseCategory,
                                time: '12:00 PM',
                                cost: Number(newExpenseCost),
                                dayNumber: Number(newExpenseDay)
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
            setSuccessMsg('Expense logged successfully!');
            setNewExpenseName('');
            setNewExpenseCost(0);
            setNewExpenseDay(1);
            setTimeout(() => setSuccessMsg(''), 3000);
        } catch (err) {
            console.error(err);
            setError('Could not save expense transaction.');
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteExpense = async (sectionId, activityId) => {
        if (!window.confirm('Delete this expense transaction record?')) return;
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

            const response = await api.put(`/trips/${tripId}/itinerary`, {
                itinerarySections: updatedSections
            });
            setTrip(response.data.data);
            setSections(response.data.data.itinerarySections || []);
        } catch (err) {
            console.error(err);
            setError('Could not remove expense transaction.');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="trip-budget-page">
            {/* Header section */}
            <header className="trip-budget-header">
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
            <main className="trip-budget-main">
                <div className="header-navigation-row">
                    <button onClick={() => navigate(`/trips/${tripId}/view`)} className="back-link-btn">
                        <ArrowLeft size={18} />
                        <span>Back to Timeline</span>
                    </button>
                </div>

                {error && <div className="budget-notification error">{error}</div>}
                {successMsg && <div className="budget-notification success">{successMsg}</div>}

                {trip && (
                    <div className="title-banner-area">
                        <h2>Financial Breakdown for {trip.name}</h2>
                        <span className="region-indicator">{trip.region} Budget Tracker</span>
                    </div>
                )}

                {loading ? (
                    <div className="loading-wrapper">
                        <Loader className="spinner" size={32} />
                        <p>Analyzing financials...</p>
                    </div>
                ) : (
                    <div className="budget-content-grid">

                        {/* 1. Core Financial Metrics Cards */}
                        <div className="financial-summaries-grid">
                            <div className="summary-card budget-total">
                                <div className="card-top">
                                    <DollarSign size={20} className="card-icon" />
                                    <span>Total Budget Limit</span>
                                </div>
                                <h3>${totalBudget.toLocaleString()}</h3>
                                <span className="card-hint">Configured target budget limit</span>
                            </div>

                            <div className="summary-card budget-spent">
                                <div className="card-top">
                                    <Sliders size={20} className="card-icon" />
                                    <span>Accumulated Spent</span>
                                </div>
                                <h3>${currentExpenses.toLocaleString()}</h3>
                                <span className="card-hint">Total categorized item cost logs</span>
                            </div>

                            <div className={`summary-card budget-remaining ${isOverBudget ? 'over' : 'under'}`}>
                                <div className="card-top">
                                    <Info size={20} className="card-icon" />
                                    <span>Remaining Balance</span>
                                </div>
                                <h3>${remainingBudget.toLocaleString()}</h3>
                                <span className="card-hint">
                                    {isOverBudget ? 'You have exceeded budget limits!' : 'Under target configurations'}
                                </span>
                            </div>

                            <div className="summary-card budget-average">
                                <div className="card-top">
                                    <Calendar size={20} className="card-icon" />
                                    <span>Average Cost / Day</span>
                                </div>
                                <h3>${Math.round(averageSpendPerDay).toLocaleString()}</h3>
                                <span className="card-hint">Total costs divided by {totalTripDays} days</span>
                            </div>
                        </div>

                        {/* Overbudget warning banner if applicable */}
                        {isOverBudget && (
                            <div className="overbudget-threat-alert">
                                <AlertCircle size={24} style={{ marginRight: '10px' }} />
                                <span>
                                    <strong>Budget Limit Warning:</strong> You are currently over budget by{' '}
                                    <strong>${Math.abs(remainingBudget).toLocaleString()} USD</strong>! Review options below to trim expenses.
                                </span>
                            </div>
                        )}

                        {/* 2. Middle Row: Category splits vs Over budget days alerts */}
                        <div className="mid-analysis-section">

                            {/* Category Breakdown progress bars */}
                            <div className="category-breakdown-card">
                                <h3>Categorized Splits</h3>
                                <p className="card-tagline">Proportions of investments by activity types.</p>

                                <div className="progress-bars-list">
                                    {categories.map(cat => {
                                        const cost = categoryTotals[cat];
                                        const percentage = currentExpenses > 0 ? (cost / currentExpenses) * 100 : 0;
                                        return (
                                            <div key={cat} className="category-progress-item">
                                                <div className="progress-label-row">
                                                    <span className="category-label">{cat}</span>
                                                    <span className="category-value-row">
                                                        <strong>${cost.toLocaleString()}</strong>
                                                        <span className="percentage-small">({Math.round(percentage)}%)</span>
                                                    </span>
                                                </div>
                                                <div className="progress-track">
                                                    <div
                                                        className={`progress-fill ${cat.toLowerCase()}`}
                                                        style={{ width: `${percentage}%` }}
                                                    />
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Overbudget Days Alerts */}
                            <div className="overbudget-alerts-card">
                                <h3>Over-budget Days Alerts</h3>
                                <p className="card-tagline">
                                    Days where expenditures exceed target daily threshold of <strong>${Math.round(dailyBudgetLimit)} USD</strong>.
                                </p>

                                {overBudgetDaysList.length === 0 ? (
                                    <div className="clean-balance-box">
                                        <TrendingDown className="green-icon" size={24} />
                                        <p>All travel days are within daily budget limits. Good job!</p>
                                    </div>
                                ) : (
                                    <div className="alerts-list">
                                        {overBudgetDaysList.map(alertItem => (
                                            <div key={alertItem.day} className="alert-item-container">
                                                <div className="alert-indicator-badge">Day {alertItem.day}</div>
                                                <div className="alert-details-text">
                                                    <p className="alert-title-text">
                                                        Exceeded limit by <strong>${Math.round(alertItem.excess).toLocaleString()}</strong>
                                                    </p>
                                                    <span className="alert-ratio-hint">
                                                        Spent: ${alertItem.spent.toLocaleString()} / Limit: ${Math.round(alertItem.limit).toLocaleString()}
                                                    </span>
                                                </div>
                                                <div className="alert-warn-mark">⚠️</div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* 3. Transaction Log list and Add Form */}
                        <div className="bottom-transactions-section">

                            {/* List of items */}
                            <div className="transactions-list-card">
                                <h3>Expense Transaction Log</h3>

                                {activitiesList.length === 0 ? (
                                    <div className="empty-itinerary-state">
                                        <Sliders size={32} className="empty-icon" />
                                        <p>No activity expense logs found for this trip.</p>
                                    </div>
                                ) : (
                                    <div className="table-responsive">
                                        <table className="transactions-table">
                                            <thead>
                                                <tr>
                                                    <th>Item/Stop Name</th>
                                                    <th>Category</th>
                                                    <th>Stage</th>
                                                    <th>Day</th>
                                                    <th>Cost</th>
                                                    <th>Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {activitiesList.map((act, idx) => (
                                                    <tr key={act._id || idx}>
                                                        <td className="item-name-cell">{act.name}</td>
                                                        <td>
                                                            <span className={`cat-badge ${act.category?.toLowerCase() || 'activities'}`}>
                                                                {act.category || 'Activities'}
                                                            </span>
                                                        </td>
                                                        <td className="section-cell">{act.sectionTitle}</td>
                                                        <td>Day {act.dayNumber}</td>
                                                        <td className="cost-cell">${act.cost?.toLocaleString()}</td>
                                                        <td>
                                                            <button
                                                                className="action-trash-btn"
                                                                onClick={() => handleDeleteExpense(act.sectionId, act._id)}
                                                                title="Remove transaction record"
                                                                disabled={saving}
                                                            >
                                                                <Trash2 size={14} />
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>

                            {/* Logger Form */}
                            <div className="add-transaction-card">
                                <h3>Log New Expense</h3>
                                <p className="card-tagline">Record transport, tickets, shopping, or food items directly.</p>

                                <form onSubmit={handleAddNewExpense} className="budget-form">
                                    <div className="budget-input-group">
                                        <label>Select Stage/City:</label>
                                        <select
                                            value={selectedSectionId}
                                            onChange={(e) => setSelectedSectionId(e.target.value)}
                                            required
                                        >
                                            <option value="" disabled>-- Assign to Stage --</option>
                                            {sections.map(sec => (
                                                <option key={sec._id} value={sec._id}>{sec.title}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="budget-input-group">
                                        <label>Expense Name:</label>
                                        <input
                                            type="text"
                                            placeholder="e.g. Cab fare to Eiffel Tower"
                                            value={newExpenseName}
                                            onChange={(e) => setNewExpenseName(e.target.value)}
                                            required
                                        />
                                    </div>

                                    <div className="budget-input-row">
                                        <div className="budget-input-group">
                                            <label>Category:</label>
                                            <select
                                                value={newExpenseCategory}
                                                onChange={(e) => setNewExpenseCategory(e.target.value)}
                                            >
                                                <option value="Activities">Activities</option>
                                                <option value="Transport">Transport</option>
                                                <option value="Stay">Stay/Accommodation</option>
                                                <option value="Meals">Meals/Food</option>
                                                <option value="Other">Other</option>
                                            </select>
                                        </div>

                                        <div className="budget-input-group">
                                            <label>Journey Day Num:</label>
                                            <input
                                                type="number"
                                                min="1"
                                                value={newExpenseDay}
                                                onChange={(e) => setNewExpenseDay(parseInt(e.target.value) || 1)}
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="budget-input-group">
                                        <label>Est Cost (USD):</label>
                                        <input
                                            type="number"
                                            placeholder="USD Price"
                                            value={newExpenseCost}
                                            onChange={(e) => setNewExpenseCost(parseFloat(e.target.value) || 0)}
                                            required
                                        />
                                    </div>

                                    <button
                                        type="submit"
                                        className="budget-submit-btn"
                                        disabled={saving || !selectedSectionId}
                                    >
                                        {saving ? (
                                            <Loader className="spinner" size={16} />
                                        ) : (
                                            <>
                                                <Plus size={16} />
                                                <span>Add Expense Record</span>
                                            </>
                                        )}
                                    </button>
                                </form>
                            </div>

                        </div>

                    </div>
                )}
            </main>
        </div>
    );
};

export default TripBudget;
