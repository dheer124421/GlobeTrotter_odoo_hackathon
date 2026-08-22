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
    ArrowLeft,
    ChevronDown
} from 'lucide-react';
import './TripList.css';

const TripList = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    // State
    const [trips, setTrips] = useState([]);
    const [groupedTrips, setGroupedTrips] = useState(null);
    const [isGrouped, setIsGrouped] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Dropdown states
    const [search, setSearch] = useState('');
    const [filterRegion, setFilterRegion] = useState('All');
    const [sortOrder, setSortOrder] = useState('dateAsc'); // Default ascending list
    const [groupBy, setGroupBy] = useState('none');
    const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

    const regions = ['Europe', 'Asia', 'Americas', 'Africa', 'Oceania'];

    const fetchTrips = async () => {
        setLoading(true);
        try {
            const params = {};
            if (search) params.search = search;
            if (filterRegion !== 'All') params.region = filterRegion;
            if (sortOrder) params.sort = sortOrder;
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
            console.error('Error fetching list:', err);
            setError('Could not retrieve trips data.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const delayDebounce = setTimeout(() => {
            fetchTrips();
        }, 300);
        return () => clearTimeout(delayDebounce);
    }, [search, filterRegion, sortOrder, groupBy]);

    const handleDeleteTrip = async (id, e) => {
        e.preventDefault();
        e.stopPropagation();
        if (!window.confirm('Delete this trip plan?')) return;
        try {
            await api.delete(`/trips/${id}`);
            fetchTrips();
        } catch (err) {
            console.error(err);
            alert('Delete failed.');
        }
    };

    const handleLogoutClick = () => {
        logout();
        navigate('/login');
    };

    // Group trips into Ongoing, Upcoming, Completed segments
    const getCategorizedTrips = (tripList) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const ongoing = [];
        const upcoming = [];
        const completed = [];

        tripList.forEach((trip) => {
            const start = new Date(trip.startDate);
            start.setHours(0, 0, 0, 0);
            const end = new Date(trip.endDate);
            end.setHours(23, 59, 59, 999);

            if (start <= today && today <= end) {
                ongoing.push(trip);
            } else if (start > today) {
                upcoming.push(trip);
            } else {
                completed.push(trip);
            }
        });

        return { ongoing, upcoming, completed };
    };

    const formatDate = (dateStr) => {
        return new Date(dateStr).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    const renderHorizontalCard = (trip) => (
        <div key={trip._id} className="trip-wide-card" onClick={() => navigate(`/trips/${trip._id}/itinerary`)} style={{ cursor: 'pointer' }}>
            <div className="card-wide-gallery">
                {trip.coverPhoto ? (
                    <img src={trip.coverPhoto} alt={trip.name} />
                ) : (
                    <div className="card-wide-fallback">
                        <Compass size={36} />
                    </div>
                )}
            </div>

            <div className="card-wide-body">
                <div className="card-wide-header">
                    <div>
                        <h4 className="trip-name">{trip.name}</h4>
                        <div className="trip-dates">
                            <Calendar size={14} style={{ marginRight: '6px' }} />
                            {formatDate(trip.startDate)} - {formatDate(trip.endDate)}
                        </div>
                    </div>
                    <div className="badge-row">
                        {trip.region && trip.region !== 'None' && (
                            <span className="wide-region-badge">{trip.region}</span>
                        )}
                        <button
                            className="wide-delete-btn"
                            onClick={(e) => handleDeleteTrip(trip._id, e)}
                            title="Delete Trip"
                        >
                            <Trash2 size={16} />
                        </button>
                    </div>
                </div>

                <p className="trip-overview-desc">{trip.description}</p>

                <div className="card-wide-footer">
                    <div className="footer-meta">
                        <span className="meta-detail">
                            <MapPin size={12} style={{ marginRight: '4px' }} />
                            {trip.destinationCount || 0} stops planned
                        </span>
                        <span className="meta-detail budget-detail">
                            <DollarSign size={12} style={{ marginRight: '2px' }} />
                            Budget: {trip.totalBudget ? trip.totalBudget.toLocaleString() : '0'} USD
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );

    const { ongoing, upcoming, completed } = getCategorizedTrips(trips);

    return (
        <div className="trip-list-page">
            {/* Header section */}
            <header className="trip-list-header">
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
                                <button className="dropdown-item logout-btn" onClick={handleLogoutClick}>
                                    <LogOut size={16} style={{ marginRight: '8px' }} />
                                    Logout
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </header>

            {/* Main content body */}
            <main className="trip-list-main">
                {/* Route header link and title */}
                <div className="header-navigation-row">
                    <button onClick={() => navigate('/dashboard')} className="back-link-btn">
                        <ArrowLeft size={18} />
                        <span>Back</span>
                    </button>
                    <h2>Trip Listing</h2>
                </div>

                {/* Controls Bar Alignment */}
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
                            <select value={groupBy} onChange={(e) => setGroupBy(e.target.value)}>
                                <option value="none">None</option>
                                <option value="year">Year</option>
                                <option value="month">Month</option>
                            </select>
                        </div>

                        <div className="select-wrapper">
                            <label>Filter</label>
                            <select value={filterRegion} onChange={(e) => setFilterRegion(e.target.value)}>
                                <option value="All">All Regions</option>
                                {regions.map(r => (
                                    <option key={r} value={r}>{r}</option>
                                ))}
                            </select>
                        </div>

                        <div className="select-wrapper">
                            <label>Sort by...</label>
                            <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value)}>
                                <option value="dateAsc">Date Ascending</option>
                                <option value="dateDesc">Date Descending</option>
                                <option value="nameAsc">Name (A-Z)</option>
                            </select>
                        </div>
                    </div>
                </section>

                {error && <div className="trip-list-error">{error}</div>}

                {/* Categorized Lists Rendering */}
                {loading ? (
                    <div className="loading-container">
                        <p>Loading journey lists...</p>
                    </div>
                ) : (
                    <section className="categorized-sections-panel">
                        {isGrouped ? (
                            /* If Year/Month grouping is active, display sections under Group Keys */
                            Object.keys(groupedTrips).length === 0 ? (
                                <div className="empty-trips-view">
                                    <p>No trips found matching the filters.</p>
                                </div>
                            ) : (
                                Object.keys(groupedTrips).map((gName) => (
                                    <div key={gName} className="group-category-boundary">
                                        <h3 className="section-category-header">{gName}</h3>
                                        <div className="cards-wide-grid">
                                            {groupedTrips[gName].map((trip) => renderHorizontalCard(trip))}
                                        </div>
                                    </div>
                                ))
                            )
                        ) : (
                            /* Default Chronological Segmentation: Ongoing, Upcoming, Completed */
                            <>
                                {trips.length === 0 ? (
                                    <div className="empty-trips-view">
                                        <Compass size={40} className="empty-meta-icon" />
                                        <p>No trips currently matching your active filter criteria.</p>
                                        <Link to="/create-trip" className="create-first-btn">
                                            <Plus size={16} />
                                            Plan a trip
                                        </Link>
                                    </div>
                                ) : (
                                    <>
                                        {/* Ongoing Block */}
                                        {ongoing.length > 0 && (
                                            <div className="group-category-boundary">
                                                <h3 className="section-category-header">Ongoing</h3>
                                                <div className="cards-wide-grid">
                                                    {ongoing.map((trip) => renderHorizontalCard(trip))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Upcoming Block */}
                                        {upcoming.length > 0 && (
                                            <div className="group-category-boundary">
                                                <h3 className="section-category-header">Up-coming</h3>
                                                <div className="cards-wide-grid">
                                                    {upcoming.map((trip) => renderHorizontalCard(trip))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Completed Block */}
                                        {completed.length > 0 && (
                                            <div className="group-category-boundary">
                                                <h3 className="section-category-header">Completed</h3>
                                                <div className="cards-wide-grid">
                                                    {completed.map((trip) => renderHorizontalCard(trip))}
                                                </div>
                                            </div>
                                        )}
                                    </>
                                )}
                            </>
                        )}
                    </section>
                )}
            </main>
        </div>
    );
};

export default TripList;
