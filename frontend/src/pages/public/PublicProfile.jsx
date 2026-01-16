import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Clock } from 'lucide-react';
import { eventTypesApi } from '../../services/api';
import './PublicProfile.css';

const PublicProfile = () => {
  const [eventTypes, setEventTypes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEventTypes();
  }, []);

  const fetchEventTypes = async () => {
    try {
      // Reusing eventTypesApi to get all (simulating public profile fetch)
      // In real app, this would be a public endpoint /api/public/profile/:username
      const response = await eventTypesApi.getAll();
      setEventTypes(response.data.filter(et => et.isActive));
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="profile-loading">Loading...</div>;

  return (
    <div className="public-profile-page">
      <div className="profile-container">
        <div className="profile-header">
          <div className="profile-avatar">C</div>
          <h1 className="profile-name">Cal.com Clone</h1>
        </div>

        <div className="profile-events-list">
          {eventTypes.map((event) => (
            <Link to={`/book/${event.slug}`} key={event.id} className="profile-event-card">
              <div className="profile-event-content">
                <h3 className="profile-event-title">{event.title}</h3>
                {event.description && <p className="profile-event-desc">{event.description}</p>}
                <div className="profile-event-badge">
                  <Clock size={12} />
                  <span>{event.duration}m</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PublicProfile;
