import { useEffect, useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Check, Calendar, Video, MapPin, Clock } from 'lucide-react';
import { format } from 'date-fns';
import './BookingConfirmation.css';

const BookingConfirmation = () => {
  const { state } = useLocation();
  const [booking, setBooking] = useState(state?.booking);

  useEffect(() => {
    // If no state (e.g. refresh), ideally fetch usage params ID
    // logic omitted for brevity
  }, [state]);

  if (!booking) {
    return (
      <div className="confirmation-page empty">
        <p>No booking details found.</p>
        <Link to="/book/30min" className="btn btn-primary">Book a meeting</Link>
      </div>
    );
  }

  const { eventType, startTime, endTime, attendeeName, attendeeEmail, notes } = booking;
  const hostName = eventType?.user?.name || 'Host'; // Fallback
  const hostEmail = eventType?.user?.email || 'host@example.com';

  const formattedDate = startTime ? format(new Date(startTime), 'EEEE, MMMM d, yyyy') : '';
  const formattedTime = startTime ?
    `${format(new Date(startTime), 'h:mm a')} - ${format(new Date(endTime), 'h:mm a')}` : '';

  return (
    <div className="confirmation-page">
      <div className="confirmation-card">
        <div className="success-header">
          <div className="check-circle">
            <Check size={32} strokeWidth={3} />
          </div>
          <h1 className="success-title">This meeting is scheduled</h1>
          <p className="success-subtitle">
            We sent an email with a calendar invitation with the details to everyone.
          </p>
        </div>

        <div className="details-grid">
          {/* What */}
          <div className="detail-row">
            <div className="detail-label">What</div>
            <div className="detail-value">
              {eventType?.title} between {hostName} and {attendeeName}
            </div>
          </div>

          {/* When */}
          <div className="detail-row">
            <div className="detail-label">When</div>
            <div className="detail-value">
              {formattedDate}<br />
              {formattedTime} (India Standard Time)
            </div>
          </div>

          {/* Who */}
          <div className="detail-row">
            <div className="detail-label">Who</div>
            <div className="detail-value who-list">
              <div className="participant">
                <span>{hostName}</span>
                <span className="badge-host">Host</span>
                <div className="participant-email">{hostEmail}</div>
              </div>
              <div className="participant mt-sm">
                <span>{attendeeName}</span>
                <div className="participant-email">{attendeeEmail}</div>
              </div>
            </div>
          </div>

          {/* Where */}
          <div className="detail-row">
            <div className="detail-label">Where</div>
            <div className="detail-value flex items-center gap-2">
              <Video size={16} /> Cal Video <ExternalLinkIcon />
            </div>
          </div>

          {/* Notes */}
          {notes && (
            <div className="detail-row">
              <div className="detail-label">Additional notes</div>
              <div className="detail-value">{notes}</div>
            </div>
          )}
        </div>

        <div className="action-footer">
          <p>Need to make a change? <a href="#" className="link-action">Reschedule</a> or <a href="#" className="link-action">Cancel</a></p>
        </div>
      </div>

      <div className="calendar-options">
        <span className="calendar-label">Add to calendar</span>
        <div className="calendar-icons">
          <button className="cal-icon-btn">G</button> {/* Google */}
          <button className="cal-icon-btn">O</button> {/* Outlook */}
          <button className="cal-icon-btn">365</button> {/* Office 365 */}
          <button className="cal-icon-btn">iCal</button> {/* Apple */}
        </div>
      </div>
    </div>
  );
};

// Simple Icon component helper
const ExternalLinkIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
    <polyline points="15 3 21 3 21 9"></polyline>
    <line x1="10" y1="14" x2="21" y2="3"></line>
  </svg>
);

export default BookingConfirmation;
