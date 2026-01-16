import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { bookingsApi, eventTypesApi } from '../../services/api';
import './Dashboard.css';

const Dashboard = () => {
  const [stats, setStats] = useState({ upcoming: 0, today: 0, total: 0, cancelled: 0 });
  const [eventTypes, setEventTypes] = useState([]);
  const [upcomingBookings, setUpcomingBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, eventsRes, bookingsRes] = await Promise.all([
          bookingsApi.getStats(),
          eventTypesApi.getAll(),
          bookingsApi.getAll({ upcoming: true }),
        ]);
        setStats(statsRes.data);
        setEventTypes(eventsRes.data.slice(0, 3));
        setUpcomingBookings(bookingsRes.data.slice(0, 5));
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTime = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <div className="page-header">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">Welcome back! Here's an overview of your scheduling.</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon upcoming">📅</div>
          <div className="stat-content">
            <span className="stat-value">{stats.upcoming}</span>
            <span className="stat-label">Upcoming Bookings</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon today">🌟</div>
          <div className="stat-content">
            <span className="stat-value">{stats.today}</span>
            <span className="stat-label">Today's Bookings</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon total">📊</div>
          <div className="stat-content">
            <span className="stat-value">{stats.total}</span>
            <span className="stat-label">Total Bookings</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon cancelled">❌</div>
          <div className="stat-content">
            <span className="stat-value">{stats.cancelled}</span>
            <span className="stat-label">Cancelled</span>
          </div>
        </div>
      </div>

      {/* Content Grid */}
      <div className="dashboard-grid">
        {/* Event Types Section */}
        <div className="dashboard-section">
          <div className="section-header">
            <h2 className="section-title">Event Types</h2>
            <Link to="/admin/event-types" className="section-link">View all →</Link>
          </div>

          <div className="event-types-list">
            {eventTypes.length === 0 ? (
              <div className="empty-state-small">
                <p>No event types yet.</p>
                <Link to="/admin/event-types/new" className="btn btn-primary btn-sm">
                  Create Event Type
                </Link>
              </div>
            ) : (
              eventTypes.map((event) => (
                <div key={event.id} className="event-type-item">
                  <div className="event-color" style={{ backgroundColor: event.color }}></div>
                  <div className="event-info">
                    <h3 className="event-title">{event.title}</h3>
                    <p className="event-meta">{event.duration} min · {event._count?.bookings || 0} bookings</p>
                  </div>
                  <span className={`event-status ${event.isActive ? 'active' : 'inactive'}`}>
                    {event.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Upcoming Bookings Section */}
        <div className="dashboard-section">
          <div className="section-header">
            <h2 className="section-title">Upcoming Bookings</h2>
            <Link to="/admin/bookings" className="section-link">View all →</Link>
          </div>

          <div className="bookings-list">
            {upcomingBookings.length === 0 ? (
              <div className="empty-state-small">
                <p>No upcoming bookings.</p>
              </div>
            ) : (
              upcomingBookings.map((booking) => (
                <div key={booking.id} className="booking-item">
                  <div className="booking-date">
                    <span className="date-day">{formatDate(booking.startTime)}</span>
                    <span className="date-time">{formatTime(booking.startTime)}</span>
                  </div>
                  <div className="booking-info">
                    <h3 className="booking-title">{booking.eventType?.title}</h3>
                    <p className="booking-meta">with {booking.bookerName}</p>
                  </div>
                  <div className="booking-badge" style={{ backgroundColor: booking.eventType?.color || '#6366f1' }}>
                    {booking.eventType?.duration}m
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="quick-actions">
        <h2 className="section-title">Quick Actions</h2>
        <div className="actions-grid">
          <Link to="/admin/event-types/new" className="action-card">
            <span className="action-icon">➕</span>
            <span className="action-text">New Event Type</span>
          </Link>
          <Link to="/admin/availability" className="action-card">
            <span className="action-icon">⏰</span>
            <span className="action-text">Set Availability</span>
          </Link>
          <Link to="/admin/bookings" className="action-card">
            <span className="action-icon">📋</span>
            <span className="action-text">Manage Bookings</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
