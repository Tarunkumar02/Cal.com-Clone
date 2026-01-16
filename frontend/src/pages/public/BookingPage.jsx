import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { publicApi } from '../../services/api';
import { format, addMinutes, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, isSameDay, isToday } from 'date-fns';
import { Clock, Globe, Video, ChevronLeft, ChevronRight, Menu, HelpCircle, Calendar as CalendarIcon, User } from 'lucide-react';
import './BookingPage.css';

const BookingPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();

  const [step, setStep] = useState('date-time'); // 'date-time' | 'form'
  const [eventType, setEventType] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date('2026-01-17')); // Mocking to match screenshot date
  const [currentMonth, setCurrentMonth] = useState(new Date('2026-01-01')); // Mocking to match screenshot
  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeFormat, setTimeFormat] = useState('12h');

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    notes: '',
    guests: []
  });

  useEffect(() => {
    fetchEventType();
  }, [slug]);

  const fetchEventType = async () => {
    try {
      const response = await publicApi.getEventType(slug);
      setEventType(response.data);
      // Fetch slots for the initial date
      fetchSlots(selectedDate);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSlots = async (date) => {
    try {
      const dateStr = format(date, 'yyyy-MM-dd');
      const response = await publicApi.getAvailableSlots(slug, dateStr);
      // API returns [{ time: '10:00', available: true }], we need just strings for now
      const slotsData = response.data.slots || [];
      const timeStrings = slotsData.map(s => s.time);
      setAvailableSlots(timeStrings);
    } catch (error) {
      console.error('Error fetching slots:', error);
      setAvailableSlots([]);
    }
  };

  const handleDateClick = (date) => {
    setSelectedDate(date);
    fetchSlots(date);
    setSelectedSlot(null);
  };

  const handleSlotClick = (slot) => {
    setSelectedSlot(slot);
    setStep('form');
  };

  const handleConfirm = async () => {
    try {
      await publicApi.createBooking(slug, {
        name: formData.name,
        email: formData.email,
        date: format(selectedDate, 'yyyy-MM-dd'),
        time: selectedSlot,
        timezone: eventType.timezone || 'Asia/Kolkata',
        notes: formData.notes
      });

      const startTime = `${format(selectedDate, 'yyyy-MM-dd')}T${selectedSlot}:00`;

      navigate('/booking/confirmation', {
        state: {
          booking: {
            eventType,
            startTime,
            // Calculate end time roughly for display (real calculation happened on backend)
            endTime: addMinutes(new Date(startTime), eventType.duration).toISOString(),
            attendeeName: formData.name,
            attendeeEmail: formData.email,
            notes: formData.notes
          }
        }
      });
    } catch (error) {
      console.error(error);
      alert('Booking failed: ' + (error.response?.data?.error || error.message));
    }
  };

  // Calendar Grid Generation
  const renderCalendar = () => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    const dateFormat = "d";
    const rows = [];
    let days = [];
    let day = startDate;
    let formattedDate = "";

    while (day <= endDate) {
      for (let i = 0; i < 7; i++) {
        formattedDate = format(day, dateFormat);
        const cloneDay = day;
        const isSelected = isSameDay(day, selectedDate);
        const isCurrentMonth = isSameMonth(day, monthStart);

        days.push(
          <div
            className={`col cell ${!isCurrentMonth ? "disabled" : ""} ${isSelected ? "selected" : ""}`}
            key={day}
            onClick={() => handleDateClick(cloneDay)}
          >
            <span className="number">{formattedDate}</span>
            {isToday(day) && <span className="today-dot"></span>}
          </div>
        );
        day = addMinutes(day, 24 * 60);
      }
      rows.push(
        <div className="row" key={day}>
          {days}
        </div>
      );
      days = [];
    }
    return <div className="calendar-body">{rows}</div>;
  };

  if (loading || !eventType) return <div className="loading-screen">Loading...</div>;

  return (
    <div className="booking-page-container">
      <div className="booking-card-layout">

        {/* LEFT PANEL */}
        <div className="booking-info-panel">
          {step === 'form' && (
            <button className="back-arrow-btn" onClick={() => setStep('date-time')}>
              <ChevronLeft size={20} />
            </button>
          )}

          <div className="host-info">
            <div className="host-avatar">C</div>
            <p className="host-name">{eventType.hostName || 'Cal.com Clone'}</p>
            <h1 className="event-title">{eventType.title}</h1>
          </div>

          <div className="event-details-list">
            {step === 'form' && (
              <div className="detail-item">
                <CalendarIcon size={16} />
                <span>
                  {format(selectedDate, 'EEEE, MMMM d, yyyy')}<br />
                  {selectedSlot && format(new Date(`2000-01-01T${selectedSlot}`), 'h:mm')} -
                  {selectedSlot && format(addMinutes(new Date(`2000-01-01T${selectedSlot}`), eventType.duration), 'h:mm a')}
                </span>
              </div>
            )}

            <div className="detail-item">
              <Clock size={16} />
              <span>{eventType.duration}m</span>
            </div>
            <div className="detail-item">
              <Video size={16} />
              <span>Cal Video</span>
            </div>
            <div className="detail-item">
              <Globe size={16} />
              <span>Asia/Kolkata</span>
            </div>
          </div>

          <div className="footer-copyright">
            Cal.com
          </div>
        </div>

        {/* RIGHT PANEL - DATE & TIME */}
        {step === 'date-time' && (
          <div className="booking-calendar-panel">
            <div className="calendar-section">
              <div className="calendar-header">
                <span className="month-label">{format(currentMonth, 'MMMM yyyy')}</span>
                <div className="nav-buttons">
                  <button onClick={() => setCurrentMonth(addMinutes(currentMonth, -43200))}><ChevronLeft size={16} /></button>
                  <button onClick={() => setCurrentMonth(addMinutes(currentMonth, 43200))}><ChevronRight size={16} /></button>
                </div>
              </div>

              <div className="calendar-grid">
                <div className="calendar-days-header">
                  <div>SUN</div><div>MON</div><div>TUE</div><div>WED</div><div>THU</div><div>FRI</div><div>SAT</div>
                </div>
                {renderCalendar()}
              </div>
            </div>

            <div className="time-slots-section">
              <div className="slots-header">
                <span className="slots-date-label">{format(selectedDate, 'EEE d')}</span>
                <div className="format-toggle">
                  <span className={timeFormat === '12h' ? 'active' : ''} onClick={() => setTimeFormat('12h')}>12h</span>
                  <span className={timeFormat === '24h' ? 'active' : ''} onClick={() => setTimeFormat('24h')}>24h</span>
                </div>
              </div>

              <div className="slots-list">
                {availableSlots.length > 0 ? (
                  availableSlots.map(slot => (
                    <button key={slot} className="time-slot-btn" onClick={() => handleSlotClick(slot)}>
                      {timeFormat === '12h'
                        ? format(new Date(`2000-01-01T${slot}`), 'h:mma')
                        : slot}
                    </button>
                  ))
                ) : (
                  <div className="no-slots-message">All slots booked</div>
                )}
              </div>
            </div>

            <div className="top-right-actions">
              <button className="help-btn">Need help?</button>
            </div>
          </div>
        )}

        {/* RIGHT PANEL - FORM */}
        {step === 'form' && (
          <div className="booking-form-panel">
            <div className="form-header">
              {/* Image 2 shows "Your name *" label style */}
            </div>

            <div className="form-fields">
              <div className="form-group">
                <label>Your name *</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Email address *</label>
                <input
                  type="email"
                  className="form-input"
                  value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Additional notes</label>
                <textarea
                  className="form-textarea"
                  value={formData.notes}
                  onChange={e => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Please share anything that will help prepare for our meeting."
                />
              </div>

              <button className="btn-ghost-sm">
                <User size={14} /> Add guests
              </button>
            </div>

            <div className="form-actions">
              <button className="btn-ghost" onClick={() => setStep('date-time')}>Back</button>
              <button className="btn btn-primary" onClick={handleConfirm}>Confirm</button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default BookingPage;
