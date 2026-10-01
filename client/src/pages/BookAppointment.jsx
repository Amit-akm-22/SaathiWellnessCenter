import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { studentAPI, slotAPI } from '../api';

const ISSUE_CATEGORIES = [
  'Academic Stress',
  'Anxiety / Panic',
  'Depression / Low Mood',
  'Relationship / Heartbreak',
  'Loneliness / Social Issues',
  'Anger / Mood Swings',
  'Family Issues',
  'Career Confusion',
  'Other',
];

const BookAppointment = () => {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const screeningAnswers = location.state?.screeningAnswers;

  const [formData, setFormData] = useState({
    branch: user?.branch || '',
    year: user?.year || '',
    gender: user?.gender || '',
    date: '',
    timeSlot: '',
    issueCategory: '',
    customCategory: '',
    description: '',
    isUrgent: false,
  });
  const [slots, setSlots] = useState([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // If no screening answers, redirect to screening
  useEffect(() => {
    if (!screeningAnswers) {
      navigate('/student/screening', { replace: true });
    }
  }, [screeningAnswers, navigate]);

  // Fetch available slots when date changes
  useEffect(() => {
    if (formData.date) {
      fetchSlots(formData.date);
    }
  }, [formData.date]);

  const fetchSlots = async (date) => {
    setSlotsLoading(true);
    try {
      const res = await slotAPI.getAvailable(date);
      setSlots(res.data.data.slots);
      // Reset slot selection if previously selected slot is now full
      const selectedStillAvailable = res.data.data.slots.find(
        (s) => s.slot === formData.timeSlot && !s.isFull
      );
      if (!selectedStillAvailable) {
        setFormData((prev) => ({ ...prev, timeSlot: '' }));
      }
    } catch (err) {
      setSlots([]);
      if (err.response?.data?.message) {
        setError(err.response.data.message);
      }
    } finally {
      setSlotsLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    setError('');
  };

  // Get min/max dates
  const getMinDate = () => {
    const d = new Date();
    d.setDate(d.getDate() + 1); // tomorrow at minimum
    return d.toISOString().split('T')[0];
  };

  const getMaxDate = () => {
    const d = new Date();
    d.setDate(d.getDate() + 30);
    return d.toISOString().split('T')[0];
  };

  const isSunday = (dateStr) => {
    if (!dateStr) return false;
    const d = new Date(dateStr + 'T00:00:00');
    return d.getDay() === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!formData.date || !formData.timeSlot || !formData.issueCategory) {
      setError('Please fill all required fields.');
      return;
    }

    if (!formData.branch || !formData.year || !formData.gender) {
      setError('Please select your branch, year, and gender.');
      return;
    }

    if (formData.issueCategory === 'Other' && !formData.customCategory.trim()) {
      setError('Please specify the issue category when selecting "Other".');
      return;
    }

    if (isSunday(formData.date)) {
      setError('Cannot book on Sundays.');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        ...formData,
        screeningAnswers,
      };

      await studentAPI.bookAppointment(payload);
      setSuccess('Appointment booked successfully! 🎉');
      setTimeout(() => navigate('/student/appointments'), 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to book appointment.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!screeningAnswers) return null;

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Book Appointment</h1>
        <p className="text-gray-500">Fill in the details below to schedule your session.</p>
      </div>

      {success && (
        <div className="bg-green-50 text-green-700 px-4 py-3 rounded-lg mb-6 text-sm font-medium">
          {success}
        </div>
      )}

      {error && (
        <div className="bg-red-50 text-red-700 px-4 py-3 rounded-lg mb-6 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-5">
        {/* Read-only user fields */}
        <div className="bg-gray-50 rounded-lg p-4 space-y-3">
          <p className="text-xs text-gray-400 uppercase tracking-wide font-medium">Your Details (from your account)</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Name</label>
              <input type="text" value={user?.name || ''} disabled className="w-full px-3 py-2 bg-gray-100 border border-gray-200 rounded-lg text-gray-600 text-sm cursor-not-allowed" />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Email</label>
              <input type="text" value={user?.email || ''} disabled className="w-full px-3 py-2 bg-gray-100 border border-gray-200 rounded-lg text-gray-600 text-sm cursor-not-allowed" />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Enrollment No.</label>
              <input type="text" value={user?.enrollmentNo || ''} disabled className="w-full px-3 py-2 bg-gray-100 border border-gray-200 rounded-lg text-gray-600 text-sm cursor-not-allowed" />
            </div>
          </div>
        </div>

        {/* Branch, Year, Gender */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Branch *</label>
            <select name="branch" value={formData.branch} onChange={handleChange} required className="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none text-sm">
              <option value="">Select</option>
              {['CSE', 'IT', 'ECE', 'EE', 'Mechanical', 'Civil', 'Other'].map((b) => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Year *</label>
            <select name="year" value={formData.year} onChange={handleChange} required className="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none text-sm">
              <option value="">Select</option>
              {['1st', '2nd', '3rd', '4th'].map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Gender *</label>
            <select name="gender" value={formData.gender} onChange={handleChange} required className="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none text-sm">
              <option value="">Select</option>
              {['Male', 'Female', 'Other', 'Prefer not to say'].map((g) => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Date */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Preferred Date *</label>
          <input
            type="date"
            name="date"
            value={formData.date}
            onChange={(e) => {
              handleChange(e);
              if (isSunday(e.target.value)) {
                setError('Sundays are not available. Please select another day.');
              }
            }}
            min={getMinDate()}
            max={getMaxDate()}
            className="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none text-sm"
          />
          {formData.date && isSunday(formData.date) && (
            <p className="text-red-500 text-xs mt-1">Sundays are not available.</p>
          )}
        </div>

        {/* Time Slots */}
        {formData.date && !isSunday(formData.date) && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Time Slot *</label>
            {slotsLoading ? (
              <div className="flex items-center gap-2 text-gray-400 text-sm">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-teal-600"></div>
                Loading slots...
              </div>
            ) : slots.length === 0 ? (
              <p className="text-gray-400 text-sm">No slots available for this date.</p>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {slots.map((s) => (
                  <button
                    key={s.slot}
                    type="button"
                    disabled={s.isFull}
                    onClick={() => setFormData((prev) => ({ ...prev, timeSlot: s.slot }))}
                    className={`px-3 py-2.5 rounded-lg text-sm border transition-all ${
                      formData.timeSlot === s.slot
                        ? 'bg-teal-600 text-white border-teal-600'
                        : s.isFull
                        ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                        : 'bg-white text-gray-700 border-gray-200 hover:border-teal-300'
                    }`}
                  >
                    {s.slot}
                    {s.isFull && (
                      <span className="block text-xs text-red-400">Full</span>
                    )}
                    {!s.isFull && (
                      <span className="block text-xs text-gray-400">{s.remaining} seat(s) left</span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Issue Category */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Issue Category *</label>
          <select name="issueCategory" value={formData.issueCategory} onChange={handleChange} required className="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none text-sm">
            <option value="">Select category</option>
            {ISSUE_CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        {/* Custom category if "Other" */}
        {formData.issueCategory === 'Other' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Specify Issue *</label>
            <input
              type="text"
              name="customCategory"
              value={formData.customCategory}
              onChange={handleChange}
              required
              maxLength={200}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none text-sm"
              placeholder="Please describe your concern"
            />
          </div>
        )}

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Additional Details <span className="text-gray-400 font-normal">(optional, max 500 chars)</span>
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            maxLength={500}
            rows={3}
            className="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none text-sm resize-none"
            placeholder="Tell us more about what you're going through (this will only be seen by the counsellor)..."
          />
          <p className="text-xs text-gray-400 mt-1">{formData.description.length}/500</p>
        </div>

        {/* Urgent checkbox */}
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            name="isUrgent"
            checked={formData.isUrgent}
            onChange={handleChange}
            className="mt-0.5 h-4 w-4 text-teal-600 border-gray-300 rounded focus:ring-teal-500"
          />
          <div>
            <span className="text-sm font-medium text-gray-700">This is urgent — I need help as soon as possible</span>
            <p className="text-xs text-gray-400">This will prioritize your booking.</p>
          </div>
        </label>

        <button
          type="submit"
          disabled={submitting || isSunday(formData.date)}
          className="w-full bg-teal-600 hover:bg-teal-700 text-white py-3 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {submitting ? 'Booking...' : 'Book Appointment'}
        </button>
      </form>
    </div>
  );
};

export default BookAppointment;
