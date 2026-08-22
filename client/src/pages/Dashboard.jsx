import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import {
    Search,
    Trash2,
    LogOut,
    Compass,
    Calendar,
    MapPin,
    Plus,
    User,
    DollarSign,
    ChevronDown,
    Settings
} from 'lucide-react';
import './Dashboard.css';

const Dashboard = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    // State controls
    const [trips, setTrips] = useState([]);
    const [groupedTrips, setGroupedTrips] = useState(null);
    const [isGrouped, setIsGrouped] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Dropdown menus and inputs
    const [search, setSearch] = useState('');
    const [selectedRegion, setSelectedRegion] = useState('All');
    const [filter, setFilter] = useState('all');
    const [sort, setSort] = useState('dateDesc');
    const [groupBy, setGroupBy] = useState('none');
    const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

    const regions = ['Europe', 'Asia', 'Americas', 'Africa', 'Oceania'];

    // Fetch logic on change
    const fetchTrips = async () => {
        setLoading(true);
        try {
            const params = {};
            if (search) params.search = search;
            if (selectedRegion !== 'All') params.region = selectedRegion;
            if (filter !== 'all') params.filter = filter;
            if (sort) params.sort = sort;
            if (groupBy !== 'none') params.groupBy = groupBy;

            const response = await api.get('/trips', { params });

            if (response.data.grouped) {
                setIsGrouped(true);
                setGroupedTrips(response.data.data);
                setTrips([]);
            } else {
                setIsGrouped(false);
                setGroupedTrips(null);
                setTrips(response.data.data);
            }
            setError('');
        } catch (err) {
            console.error('Error fetching trips:', err);
            setError('Could not retrieve your journey plans. Please ensure database server is running.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        // Debounce search updates slightly
        const delayDebounce = setTimeout(() => {
            fetchTrips();
        }, 300);

        return () => clearTimeout(delayDebounce);
    }, [search, selectedRegion, filter, sort, groupBy]);

    const handleDeleteTrip = async (id, e) => {
        e.preventDefault();
        e.stopPropagation();
        if (!window.confirm('Are you sure you want to delete this trip?')) return;

        try {
            await api.delete(`/trips/${id}`);
            fetchTrips(); // Refresh list
        } catch (err) {
            console.error('Failed to delete trip:', err);
            alert('Could not delete trip card.');
        }
    };

    const handleLogoutClick = () => {
        logout();
        navigate('/login');
    };

    const formatDateRange = (start, end) => {
        const s = new Date(start);
        const e = new Date(end);
        const options = { month: 'short', day: 'numeric' };
        return `${s.toLocaleDateString('en-US', options)} - ${e.toLocaleDateString('en-US', options)}, ${e.getFullYear()}`;
    };

    const renderTripCard = (trip) => (
        <div key={trip._id} className="trip-card" onClick={() => navigate(`/trips/${trip._id}/itinerary`)} style={{ cursor: 'pointer' }}>
            <div className="trip-card-image">
                {trip.coverPhoto ? (
                    <img src={trip.coverPhoto} alt={trip.name} />
                ) : (
                    <div className="trip-card-image-fallback">
                        <Compass size={40} className="fallback-card-icon" />
                    </div>
                )}
                {trip.region && trip.region !== 'None' && (
                    <span className="trip-card-badge">{trip.region}</span>
                )}
                <button
                    className="trip-card-delete"
                    onClick={(e) => handleDeleteTrip(trip._id, e)}
                    title="Delete Trip"
                >
                    <Trash2 size={16} />
                </button>
            </div>
            <div className="trip-card-content">
                <h3 className="trip-card-title">{trip.name}</h3>
                <p className="trip-card-dates">
                    <Calendar size={14} style={{ marginRight: '6px' }} />
                    {formatDateRange(trip.startDate, trip.endDate)}
                </p>
                {trip.description && (
                    <p className="trip-card-desc">{trip.description}</p>
                )}
                <div className="trip-card-meta">
                    <span className="meta-item">
                        <MapPin size={12} style={{ marginRight: '4px' }} />
                        {trip.destinationCount || 0} stops
                    </span>
                    <span className="meta-item budget-item">
                        <DollarSign size={12} style={{ marginRight: '2px' }} />
                        {trip.totalBudget ? trip.totalBudget.toLocaleString() : '0'} USD
                    </span>
                </div>
            </div>
        </div>
    );

    return (
        <div className="dashboard-page">
            {/* Header section */}
            <header className="dashboard-header">
                <div className="header-container">
                    <div className="dashboard-logo">
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
                                <Link to="/profile" className="dropdown-item" style={{ textDecoration: 'none' }}>
                                    <Settings size={16} style={{ marginRight: '8px' }} />
                                    Profile & Settings
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
            <main className="dashboard-main">
                {/* Banner image layout */}
                <section className="dashboard-hero-banner">
                    <img src="/dashboard_banner.jpg" alt="Travel Banner" className="hero-banner-img" />
                    <div className="hero-banner-overlay">
                        <div className="hero-welcome">
                            <h1>Where to next, {user ? user.firstName : 'Traveler'}?</h1>
                            <p>Plan customized itineraries, log activities, and track budgets all in one place.</p>
                        </div>
                    </div>
                </section>

                {/* Search and Filters Bar */}
                <section className="controls-bar">
                    <div className="search-wrapper">
                        <Search className="search-icon" size={18} />
                        <input
                            type="text"
                            placeholder="Search trips by destination or keywords..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>

                    <div className="filters-container">
                        <div className="select-wrapper">
                            <label>Group by</label>
                            <select value={groupBy} onChange={(e) => setGroupBy(e.target.value)}>
                                <option value="none">None</option>
                                <option value="year">Year</option>
                                <option value="month">Month</option>
                            </select>
                        </div>

                        <div className="select-wrapper">
                            <label>Filter</label>
                            <select value={filter} onChange={(e) => setFilter(e.target.value)}>
                                <option value="all">All Trips</option>
                                <option value="upcoming">Upcoming</option>
                                <option value="active">Active Now</option>
                                <option value="past">Past Trips</option>
                            </select>
                        </div>

                        <div className="select-wrapper">
                            <label>Sort by</label>
                            <select value={sort} onChange={(e) => setSort(e.target.value)}>
                                <option value="dateDesc">Newest Date</option>
                                <option value="dateAsc">Oldest Date</option>
                                <option value="nameAsc">Name (A-Z)</option>
                                <option value="nameDesc">Name (Z-A)</option>
                            </select>
                        </div>
                    </div>
                </section>

                {/* Regional Selections Row */}
                <section className="regional-selections">
                    <h3>Top Regional Selections</h3>
                    <div className="regions-grid">
                        <button
                            className={`region-btn ${selectedRegion === 'All' ? 'active' : ''}`}
                            onClick={() => setSelectedRegion('All')}
                        >
                            All Regions
                        </button>
                        {regions.map((region) => (
                            <button
                                key={region}
                                className={`region-btn ${selectedRegion === region ? 'active' : ''}`}
                                onClick={() => setSelectedRegion(region)}
                            >
                                {region}
                            </button>
                        ))}
                    </div>
                </section>

                {/* Trips List Area */}
                <section className="trips-section">
                    <h3>Previous Trips</h3>

                    {error && <div className="dashboard-error">{error}</div>}

                    {loading ? (
                        <div className="loading-state">
                            <p>Loading your trips...</p>
                        </div>
                    ) : (
                        <>
                            {isGrouped ? (
                                /* Grouped layout mode */
                                <div className="grouped-trips-container">
                                    {Object.keys(groupedTrips).length === 0 ? (
                                        <div className="empty-trips-state">
                                            <p>No trips match your filters.</p>
                                        </div>
                                    ) : (
                                        Object.keys(groupedTrips).map((groupName) => (
                                            <div key={groupName} className="grouped-section">
                                                <h4 className="group-header">{groupName}</h4>
                                                <div className="trips-grid">
                                                    {groupedTrips[groupName].map((trip) => renderTripCard(trip))}
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            ) : (
                                /* Standard grid layout mode */
                                <>
                                    {trips.length === 0 ? (
                                        <div className="empty-trips-state">
                                            <Compass size={48} className="empty-state-icon" />
                                            <p>No travel plans found. Start designing your first getaway!</p>
                                            <Link to="/create-trip" className="plan-start-btn">
                                                <Plus size={16} style={{ marginRight: '6px' }} />
                                                Create a Trip
                                            </Link>
                                        </div>
                                    ) : (
                                        <div className="trips-grid">
                                            {trips.map((trip) => renderTripCard(trip))}
                                        </div>
                                    )}
                                </>
                            )}
                        </>
                    )}
                </section>
            </main>

            {/* Floating Plus Plan button */}
            <Link to="/create-trip" className="floating-plan-btn" title="Plan a trip">
                <Plus size={24} />
                <span className="btn-label">Plan a trip</span>
            </Link>
        </div>
    );
};

export default Dashboard;
