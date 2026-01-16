import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { eventTypesApi, availabilityApi } from '../../services/api';
import './EventTypeForm.css';

const EventTypeForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = Boolean(id);

  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    slug: '',
    duration: 30,
    bufferTimeBefore: 0,
    bufferTimeAfter: 0,
    color: '#6366f1',
    availabilityScheduleId: '',
    bookingQuestions: [],
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const schedulesRes = await availabilityApi.getAll();
        setSchedules(schedulesRes.data);

        if (isEditing) {
          const eventRes = await eventTypesApi.getById(id);
          const event = eventRes.data;
          setFormData({
            title: event.title,
            description: event.description || '',
            slug: event.slug,
            duration: event.duration,
            bufferTimeBefore: event.bufferTimeBefore,
            bufferTimeAfter: event.bufferTimeAfter,
            color: event.color,
            availabilityScheduleId: event.availabilityScheduleId || '',
            bookingQuestions: event.bookingQuestions?.map(q => ({
              question: q.question,
              type: q.type,
              isRequired: q.isRequired,
              options: q.options ? JSON.parse(q.options) : [],
            })) || [],
          });
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, isEditing]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const generateSlug = (title) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  const handleTitleChange = (e) => {
    const title = e.target.value;
    setFormData(prev => ({
      ...prev,
      title,
      slug: isEditing ? prev.slug : generateSlug(title),
    }));
  };

  const addQuestion = () => {
    setFormData(prev => ({
      ...prev,
      bookingQuestions: [
        ...prev.bookingQuestions,
        { question: '', type: 'TEXT', isRequired: false, options: [] },
      ],
    }));
  };

  const updateQuestion = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      bookingQuestions: prev.bookingQuestions.map((q, i) =>
        i === index ? { ...q, [field]: value } : q
      ),
    }));
  };

  const removeQuestion = (index) => {
    setFormData(prev => ({
      ...prev,
      bookingQuestions: prev.bookingQuestions.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const payload = {
        ...formData,
        duration: parseInt(formData.duration),
        bufferTimeBefore: parseInt(formData.bufferTimeBefore),
        bufferTimeAfter: parseInt(formData.bufferTimeAfter),
        availabilityScheduleId: formData.availabilityScheduleId || null,
      };

      if (isEditing) {
        await eventTypesApi.update(id, payload);
      } else {
        await eventTypesApi.create(payload);
      }
      navigate('/admin/event-types');
    } catch (error) {
      console.error('Error saving event type:', error);
      alert(error.response?.data?.error || 'Failed to save event type');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="event-type-form-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">{isEditing ? 'Edit Event Type' : 'New Event Type'}</h1>
          <p className="page-subtitle">
            {isEditing ? 'Update your event type settings.' : 'Create a new event type for bookings.'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="event-form card">
        <div className="card-body">
          <div className="form-section">
            <h2 className="form-section-title">Basic Information</h2>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Title *</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleTitleChange}
                  className="form-input"
                  placeholder="30 Minute Meeting"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">URL Slug *</label>
                <div className="input-with-prefix">
                  <span className="input-prefix">/book/</span>
                  <input
                    type="text"
                    name="slug"
                    value={formData.slug}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="30min"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                className="form-textarea"
                placeholder="A brief description of this event..."
                rows={3}
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Duration (minutes) *</label>
                <select
                  name="duration"
                  value={formData.duration}
                  onChange={handleChange}
                  className="form-select"
                >
                  <option value={15}>15 minutes</option>
                  <option value={30}>30 minutes</option>
                  <option value={45}>45 minutes</option>
                  <option value={60}>60 minutes</option>
                  <option value={90}>90 minutes</option>
                  <option value={120}>120 minutes</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Color</label>
                <div className="color-picker">
                  {['#6366f1', '#8b5cf6', '#ec4899', '#ef4444', '#f59e0b', '#10b981', '#06b6d4'].map(color => (
                    <button
                      key={color}
                      type="button"
                      className={`color-option ${formData.color === color ? 'active' : ''}`}
                      style={{ backgroundColor: color }}
                      onClick={() => setFormData(prev => ({ ...prev, color }))}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="form-section">
            <h2 className="form-section-title">Buffer Time</h2>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Before event (minutes)</label>
                <input
                  type="number"
                  name="bufferTimeBefore"
                  value={formData.bufferTimeBefore}
                  onChange={handleChange}
                  className="form-input"
                  min={0}
                  max={60}
                />
              </div>

              <div className="form-group">
                <label className="form-label">After event (minutes)</label>
                <input
                  type="number"
                  name="bufferTimeAfter"
                  value={formData.bufferTimeAfter}
                  onChange={handleChange}
                  className="form-input"
                  min={0}
                  max={60}
                />
              </div>
            </div>
          </div>

          <div className="form-section">
            <h2 className="form-section-title">Availability</h2>

            <div className="form-group">
              <label className="form-label">Availability Schedule</label>
              <select
                name="availabilityScheduleId"
                value={formData.availabilityScheduleId}
                onChange={handleChange}
                className="form-select"
              >
                <option value="">Select a schedule...</option>
                {schedules.map(schedule => (
                  <option key={schedule.id} value={schedule.id}>
                    {schedule.name} {schedule.isDefault ? '(Default)' : ''}
                  </option>
                ))}
              </select>
              <p className="form-helper">
                Choose when you're available for this event type.
              </p>
            </div>
          </div>

          <div className="form-section">
            <div className="form-section-header">
              <h2 className="form-section-title">Booking Questions</h2>
              <button type="button" onClick={addQuestion} className="btn btn-secondary btn-sm">
                + Add Question
              </button>
            </div>

            {formData.bookingQuestions.length === 0 ? (
              <p className="text-muted">No custom questions. Add questions to collect info from bookers.</p>
            ) : (
              <div className="questions-list">
                {formData.bookingQuestions.map((q, index) => (
                  <div key={index} className="question-item">
                    <div className="question-fields">
                      <input
                        type="text"
                        value={q.question}
                        onChange={(e) => updateQuestion(index, 'question', e.target.value)}
                        className="form-input"
                        placeholder="Your question..."
                      />
                      <select
                        value={q.type}
                        onChange={(e) => updateQuestion(index, 'type', e.target.value)}
                        className="form-select"
                      >
                        <option value="TEXT">Short Text</option>
                        <option value="TEXTAREA">Long Text</option>
                        <option value="SELECT">Dropdown</option>
                      </select>
                      <label className="checkbox-label">
                        <input
                          type="checkbox"
                          checked={q.isRequired}
                          onChange={(e) => updateQuestion(index, 'isRequired', e.target.checked)}
                        />
                        Required
                      </label>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeQuestion(index)}
                      className="btn btn-ghost btn-sm text-danger"
                    >
                      🗑️
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="card-footer">
          <button type="button" onClick={() => navigate('/admin/event-types')} className="btn btn-secondary">
            Cancel
          </button>
          <button type="submit" disabled={saving} className="btn btn-primary">
            {saving ? 'Saving...' : (isEditing ? 'Update Event Type' : 'Create Event Type')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EventTypeForm;
