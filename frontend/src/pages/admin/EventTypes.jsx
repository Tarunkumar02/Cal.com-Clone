import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Plus, Clock, ExternalLink, Link2, MoreHorizontal, User } from 'lucide-react';
import { eventTypesApi } from '../../services/api';
import './EventTypes.css';

const EventTypes = () => {
  const [eventTypes, setEventTypes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEventTypes();
  }, []);

  const fetchEventTypes = async () => {
    try {
      const response = await eventTypesApi.getAll();
      setEventTypes(response.data);
    } catch (error) {
      console.error('Error fetching event types:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async (id, currentStatus) => {
    try {
      // Optimistic update
      setEventTypes(prev => prev.map(ev =>
        ev.id === id ? { ...ev, isActive: !ev.isActive } : ev
      ));
      await eventTypesApi.toggle(id);
    } catch (error) {
      console.error('Error toggling event type:', error);
      fetchEventTypes(); // Revert on error
    }
  };

  const copyLink = (slug) => {
    const url = `${window.location.origin}/book/${slug}`;
    navigator.clipboard.writeText(url);
    // Could add toast notification here
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="event-types-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Event types</h1>
          <p className="page-subtitle">Configure different events for people to book on your calendar.</p>
        </div>
        <div className="header-actions">
          <div className="search-bar">
            <Search size={16} className="search-icon" />
            <input type="text" placeholder="Search" className="search-input" />
          </div>
          <Link to="/admin/event-types/new" className="btn btn-primary">
            <Plus size={16} />
            New
          </Link>
        </div>
      </div>

      <div className="event-types-list">
        {eventTypes.map((event) => (
          <div key={event.id} className="event-item">
            <div className="event-item-left">
              <div className="event-info-top">
                <h3 className="event-title">{event.title}</h3>
                <span className="event-slug">/lava-pramod/{event.slug}</span>
              </div>

              {event.description && (
                <p className="event-description">{event.description}</p>
              )}

              <div className="event-meta-badge">
                <Clock size={12} />
                <span>{event.duration}m</span>
              </div>
            </div>

            <div className="event-item-right">
              {!event.isActive && <span className="hidden-label">Disabled</span>}

              <div
                className={`toggle-switch ${event.isActive ? 'active' : ''}`}
                onClick={() => handleToggle(event.id, event.isActive)}
              >
                <div className="toggle-thumb" />
              </div>

              <div className="item-actions">
                <a
                  href={`/book/${event.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="icon-btn"
                  title="View public page"
                >
                  <ExternalLink size={16} />
                </a>

                <button
                  onClick={() => copyLink(event.slug)}
                  className="icon-btn"
                  title="Copy link"
                >
                  <Link2 size={16} />
                </button>

                <Link
                  to={`/admin/event-types/${event.id}/edit`}
                  className="icon-btn"
                  title="Edit"
                >
                  <MoreHorizontal size={16} />
                </Link>
              </div>
            </div>
          </div>
        ))}

        {eventTypes.length === 0 && (
          <div className="empty-state">
            <p>No event types found.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default EventTypes;
