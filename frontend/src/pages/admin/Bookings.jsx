import { useState, useEffect } from 'react';
import { bookingsApi } from '../../services/api';
import { MoreHorizontal, Video, Filter, ChevronLeft, ChevronRight, Calendar, XCircle } from 'lucide-react';
import { format } from 'date-fns';
import './Bookings.css';

const Bookings = () => {
  const [activeTab, setActiveTab] = useState('upcoming');
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBookings();
  }, [activeTab]);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      let params = {};
      if (activeTab === 'upcoming') params.upcoming = true;
      else if (activeTab === 'past') params.past = true;
      else if (activeTab === 'canceled') params.status = 'CANCELLED';
      else if (activeTab === 'unconfirmed') params.status = 'UNCONFIRMED'; // assuming this exists for now
      else if (activeTab === 'recurrig') params.paymentStatus = 'Paid'; // Mock example

      const response = await bookingsApi.getAll(params);
      setBookings(response.data);
    } catch (error) {
      console.error('Error fetching bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return format(date, 'EEE, d MMM');
  };

  const formatTimeRange = (startStr, duration) => {
    if (!startStr) return '';
    const start = new Date(startStr);
    const end = new Date(start.getTime() + duration * 60000);
    return `${format(start, 'h:mma')} - ${format(end, 'h:mma')}`; // 3:30pm - 3:45pm
  };

  const handleCancel = async (id) => {
    if (window.confirm('Are you sure you want to cancel this booking?')) {
      try {
        await bookingsApi.cancel(id, 'Cancelled by Admin');
        alert('Booking cancelled successfully.');
        fetchBookings();
      } catch (error) {
        console.error('Error cancelling booking:', error);
        alert('Failed to cancel booking: ' + (error.response?.data?.error || error.message));
      }
    }
  };

  return (
    <div className="bookings-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Bookings</h1>
          <p className="page-subtitle">See upcoming and past events booked through your event type links.</p>
        </div>
      </div>

      <div className="bookings-toolbar">
        <div className="bookings-tabs">
          {['Upcoming', 'Unconfirmed', 'Recurring', 'Past', 'Canceled'].map((tab) => (
            <button
              key={tab}
              className={`tab-btn ${activeTab === tab.toLowerCase() ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.toLowerCase())}
            >
              {tab}
            </button>
          ))}
        </div>
        <button className="btn btn-secondary btn-filter">
          <Filter size={14} /> Filter
        </button>
      </div>

      {loading ? (
        <div className="loading-state">Loading...</div>
      ) : (
        <div className="bookings-list">
          {bookings.length > 0 && <div className="list-header-label">NEXT</div>}

          {bookings.map((booking) => (
            <div key={booking.id} className="booking-card">
              <div className="booking-left">
                <div className="booking-date">{formatDate(booking.startTime)}</div>
                <div className="booking-time">
                  {formatTimeRange(booking.startTime, booking.eventType?.duration || 30)}
                </div>
                <div className="booking-location">
                  <Video size={14} className="video-icon" />
                  <span>Join Cal Video</span>
                </div>
              </div>

              <div className="booking-center">
                <h3 className="booking-title">
                  {booking.eventType?.title} between You and {booking.bookerName}
                </h3>
                {booking.notes && <p className="booking-notes">{booking.notes}</p>}
                <p className="booking-people">
                  You and {booking.bookerName}
                </p>
              </div>

              <div className="booking-right">
                {booking.status === 'CONFIRMED' && (
                  <button
                    className="icon-btn-simple btn-cancel"
                    onClick={() => handleCancel(booking.id)}
                    title="Cancel Booking"
                  >
                    <XCircle size={20} />
                  </button>
                )}
              </div>
            </div>
          ))}

          {bookings.length === 0 && (
            <div className="empty-state">
              <Calendar size={48} className="empty-icon" />
              <h3>No bookings found</h3>
              <p>You don't have any {activeTab} bookings yet.</p>
            </div>
          )}
        </div>
      )}

      <div className="pagination-footer">
        <div className="rows-per-page">
          <select className="rows-select">
            <option>10</option>
            <option>20</option>
            <option>50</option>
          </select>
          <span>rows per page</span>
        </div>
        <div className="page-nav">
          <span className="page-info">1-{bookings.length} of {bookings.length}</span>
          <div className="nav-arrows">
            <button className="nav-arrow disabled"><ChevronLeft size={16} /></button>
            <button className="nav-arrow disabled"><ChevronRight size={16} /></button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Bookings;
