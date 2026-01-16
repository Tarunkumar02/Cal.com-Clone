import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Trash2, Plus, Copy, Globe, MoreHorizontal } from 'lucide-react';
import { availabilityApi } from '../../services/api';
import './AvailabilityEdit.css';

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const generateTimeOptions = () => {
  const options = [];
  for (let i = 0; i < 24; i++) {
    for (let j = 0; j < 60; j += 15) {
      const hour = i;
      const minute = j;
      const ampm = hour >= 12 ? 'pm' : 'am';
      const h12 = hour % 12 || 12;
      const mSr = minute.toString().padStart(2, '0');
      const value = `${hour.toString().padStart(2, '0')}:${mSr}`;
      const label = `${h12}:${mSr}${ampm}`;
      options.push({ value, label });
    }
  }
  return options;
};

const TIME_OPTIONS = generateTimeOptions();

const AvailabilityEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isNew = id === 'new';

  const [loading, setLoading] = useState(!isNew);
  const [schedule, setSchedule] = useState({
    name: 'Working Hours',
    timezone: 'Asia/Kolkata',
    isDefault: false,
    availabilityRules: []
  });

  useEffect(() => {
    if (!isNew) {
      fetchSchedule();
    } else {
      // Default state for new
      setSchedule(prev => ({
        ...prev,
        availabilityRules: [1, 2, 3, 4, 5].map(day => ({
          dayOfWeek: day,
          startTime: '09:00',
          endTime: '17:00'
        }))
      }));
    }
  }, [id]);

  const fetchSchedule = async () => {
    try {
      const res = await availabilityApi.getAll(); // Ideally getById
      // Mocking getById since we only have getAll in api wrapper currently, 
      // but simpler to just find it or update api.
      // Let's assume we find it from getAll for now to save time, or simpler:
      const found = res.data.find(s => s.id === parseInt(id));
      if (found) setSchedule(found);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDayToggle = (dayIndex) => {
    setSchedule(prev => {
      const exists = prev.availabilityRules.find(r => r.dayOfWeek === dayIndex);
      let newRules;
      if (exists) {
        newRules = prev.availabilityRules.filter(r => r.dayOfWeek !== dayIndex);
      } else {
        newRules = [...prev.availabilityRules, { dayOfWeek: dayIndex, startTime: '09:00', endTime: '17:00' }];
      }
      return { ...prev, availabilityRules: newRules };
    });
  };

  const updateRuleTime = (dayIndex, field, value) => {
    setSchedule(prev => ({
      ...prev,
      availabilityRules: prev.availabilityRules.map(r =>
        r.dayOfWeek === dayIndex ? { ...r, [field]: value } : r
      )
    }));
  };

  const handleSave = async () => {
    try {
      if (isNew) {
        await availabilityApi.create(schedule);
      } else {
        await availabilityApi.update(id, schedule);
      }
      navigate('/admin/availability');
    } catch (error) {
      alert('Failed to save');
    }
  };

  const handleDelete = async () => {
    if (confirm('Delete this schedule?')) {
      await availabilityApi.delete(id);
      navigate('/admin/availability');
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="availability-edit-page">
      <div className="edit-header">
        <div className="header-left">
          <Link to="/admin/availability" className="back-btn">
            <ArrowLeft size={16} />
          </Link>
          <div className="title-section">
            <input
              type="text"
              value={schedule.name}
              onChange={(e) => setSchedule({ ...schedule, name: e.target.value })}
              className="title-input"
            />
            {/* Pencil icon could go here */}
          </div>
        </div>
        <div className="header-right">
          <div className="default-toggle-wrapper">
            <span className="label">Set as default</span>
            <div
              className={`toggle-switch ${schedule.isDefault ? 'active' : ''}`}
              onClick={() => setSchedule(p => ({ ...p, isDefault: !p.isDefault }))}
            >
              <div className="toggle-thumb" />
            </div>
          </div>
          <div className="separator"></div>
          {!isNew && (
            <button onClick={handleDelete} className="icon-btn-header">
              <Trash2 size={16} />
            </button>
          )}
          <button onClick={handleSave} className="btn btn-primary">Save</button>
        </div>
      </div>

      <div className="edit-content-grid">
        <div className="schedule-config-card">
          {DAYS.map((day, index) => {
            const rule = schedule.availabilityRules.find(r => r.dayOfWeek === index);
            const isActive = !!rule;

            return (
              <div key={index} className={`day-row ${isActive ? 'active' : ''}`}>
                <div className="day-control">
                  <div
                    className={`toggle-switch small ${isActive ? 'active' : ''}`}
                    onClick={() => handleDayToggle(index)}
                  >
                    <div className="toggle-thumb" />
                  </div>
                  <span className="day-name">{day}</span>
                </div>

                {isActive ? (
                  <div className="time-ranges">
                    <div className="time-range-inputs">
                      <select
                        value={rule.startTime}
                        onChange={(e) => updateRuleTime(index, 'startTime', e.target.value)}
                        className="time-select"
                      >
                        {TIME_OPTIONS.map(opt => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                      </select>
                      <span className="separator">-</span>
                      <select
                        value={rule.endTime}
                        onChange={(e) => updateRuleTime(index, 'endTime', e.target.value)}
                        className="time-select"
                      >
                        {TIME_OPTIONS.map(opt => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                      </select>
                      <button className="icon-action"><Plus size={14} /></button>
                      <button className="icon-action"><Copy size={14} /></button>
                    </div>
                  </div>
                ) : (
                  <div className="unavailable-text">Unavailable</div>
                )}
              </div>
            );
          })}
        </div>

        <div className="sidebar-config">
          <div className="config-section">
            <label className="sidebar-label">Timezone</label>
            <div className="timezone-display">
              <Globe size={14} />
              <select
                value={schedule.timezone}
                onChange={(e) => setSchedule({ ...schedule, timezone: e.target.value })}
                className="timezone-select"
              >
                <option value="Asia/Kolkata">Asia/Kolkata</option>
                <option value="America/New_York">America/New_York</option>
                <option value="UTC">UTC</option>
              </select>
            </div>
          </div>

          <div className="troubleshoot-box">
            <p>Something doesn't look right?</p>
            <button className="btn-outline">Launch troubleshooter</button>
          </div>
        </div>
      </div>

      <div className="date-overrides-section">
        <h3>Date overrides</h3>
        <p>Add dates when your availability changes from your daily hours.</p>
        <button className="btn btn-secondary mt-md">
          <Plus size={14} /> Add an override
        </button>
      </div>
    </div>
  );
};

export default AvailabilityEdit;
