import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Globe, MoreHorizontal, Copy, Trash2 } from 'lucide-react';
import { availabilityApi } from '../../services/api';
import './Availability.css';

const Availability = () => {
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSchedules();
  }, []);

  const fetchSchedules = async () => {
    try {
      const response = await availabilityApi.getAll();
      setSchedules(response.data);
    } catch (error) {
      console.error('Error fetching schedules:', error);
    } finally {
      setLoading(false);
    }
  };

  const getDaySummary = (rules) => {
    if (!rules || rules.length === 0) return 'No availability configured';

    // Group adjacent days with same times? Simplified for now.
    // Check if weekend only
    const days = rules.map(r => r.dayOfWeek);
    const hasMonday = days.includes(1);
    const hasSunday = days.includes(0);
    const hasSaturday = days.includes(6);

    if (days.length === 5 && !hasSunday && !hasSaturday) return 'Mon - Fri, 9:00 AM - 5:00 PM';
    if (days.length === 7) return 'Every day, 9:00 AM - 5:00 PM';

    // Fallback: list days
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const activeDays = rules.map(r => dayNames[r.dayOfWeek]).join(', ');
    const times = rules[0] ? `${formatTime(rules[0].startTime)} - ${formatTime(rules[0].endTime)}` : '';
    return `${activeDays}, ${times}`;
  };

  const formatTime = (timeStr) => {
    if (!timeStr) return '';
    const [hours, minutes] = timeStr.split(':');
    const h = parseInt(hours);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const h12 = h % 12 || 12;
    return `${h12}:${minutes} ${ampm}`;
  };

  const handleDelete = async (id, e) => {
    e.preventDefault();
    e.stopPropagation();

    // Explicit debug log
    console.log('Delete button clicked for schedule:', id);

    if (window.confirm('Are you sure you want to delete this schedule? This cannot be undone.')) {
      try {
        console.log('Sending delete request...');
        await availabilityApi.delete(id);
        console.log('Delete success');

        // Show success message to user
        alert('Schedule deleted successfully.');

        fetchSchedules();
      } catch (error) {
        console.error('Error deleting schedule:', error);
        alert('Failed to delete schedule: ' + (error.response?.data?.error || error.message));
      }
    }
  };

  if (loading) return <div className="spinner-container"><div className="spinner"></div></div>;

  return (
    <div className="availability-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Availability</h1>
          <p className="page-subtitle">Configure times when you are available for bookings.</p>
        </div>
        <div className="header-actions">
          {/* Removed tabs as requested */}
          <Link to="/admin/availability/new" className="btn btn-primary">
            <Plus size={16} />
            New
          </Link>
        </div>
      </div>

      <div className="schedules-list">
        {schedules.map((schedule) => (
          <div key={schedule.id} className="schedule-item-card">
            <Link to={`/admin/availability/${schedule.id}`} className="schedule-content-link">
              <div className="schedule-content">
                <div className="schedule-header-row">
                  <h3 className="schedule-title">{schedule.name}</h3>
                  {schedule.isDefault && <span className="badge badge-default">Default</span>}
                </div>
                <p className="schedule-summary">{getDaySummary(schedule.availabilityRules)}</p>
              </div>
            </Link>

            <div className="schedule-meta-right">
              <div className="timezone-badge">
                <Globe size={14} />
                <span>{schedule.timezone.replace('_', ' ')}</span>
              </div>
              <button
                className="btn-icon btn-delete"
                onClick={(e) => handleDelete(schedule.id, e)}
                title="Delete Schedule"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}

        {schedules.length === 0 && (
          <div className="empty-state">
            <p>No availability schedules found.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Availability;
