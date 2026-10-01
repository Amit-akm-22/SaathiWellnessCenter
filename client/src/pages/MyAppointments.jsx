import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { studentAPI } from '../api';

const STATUS_COLORS = {
  pending: 'bg-yellow-100 text-yellow-700',
  approved: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-700',
  completed: 'bg-blue-100 text-blue-700',
  cancelled: 'bg-gray-100 text-gray-500',
  rescheduled: 'bg-purple-100 text-purple-700',
};

const MyAppointments = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cancellingId, setCancellingId] = useState(null);
  const [feedbackModal, setFeedbackModal] = useState(null);
  const [feedbackData, setFeedbackData] = useState({ rating: 0, comment: '', wasHelpful: null });
  const [feedbackSubmitting, setFeedbackSubmitting] = useState(false);
  const [feedbackError, setFeedbackError] = useState('');

  const statusFilter = searchParams.get('status') || 'all';

  useEffect(() => {
    fetchAppointments();
  }, [statusFilter]);

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const res = await studentAPI.getAppointments(statusFilter !== 'all' ? statusFilter : '');
      setAppointments(res.data.data.appointments);
    } catch {
      setError('Failed to load appointments.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this appointment?')) return;
    setCancellingId(id);
    try {
      await studentAPI.cancelAppointment(id);
      fetchAppointments();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to cancel.');
    } finally {
      setCancellingId(null);
    }
  };

  const handleFeedbackSubmit = async () => {
    if (feedbackData.rating === 0) {
      setFeedbackError('Please select a rating.');
      return;
    }
    setFeedbackSubmitting(true);
    setFeedbackError('');
    try {
      await studentAPI.submitFeedback(feedbackModal._id, feedbackData);
      setFeedbackModal(null);
      setFeedbackData({ rating: 0, comment: '', wasHelpful: null });
      fetchAppointments();
    } catch (err) {
      setFeedbackError(err.response?.data?.message || 'Failed to submit feedback.');
    } finally {
      setFeedbackSubmitting(false);
    }
  };

  const canCancel = (apt) => {
    if (!['pending', 'approved', 'rescheduled'].includes(apt.status)) return false;
    const slotStart = apt.timeSlot.split('-')[0];
    const [h, m] = slotStart.split(':').map(Number);
    const aptDate = new Date(apt.date);
    aptDate.setHours(h, m, 0, 0);
    const twoHoursBefore = new Date(aptDate.getTime() - 2 * 60 * 60 * 1000);
    return new Date() < twoHoursBefore;
  };

  const canGiveFeedback = (apt) => {
    return apt.status === 'completed' && (!apt.feedback || !apt.feedback.submittedAt);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">My Appointments</h1>

      {/* Status filter */}
      <div className="flex flex-wrap gap-2 mb-6">
        {['all', 'pending', 'approved', 'rescheduled', 'completed', 'cancelled', 'rejected'].map((s) => (
          <button
            key={s}
            onClick={() => setSearchParams(s === 'all' ? {} : { status: s })}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
              statusFilter === s
                ? 'bg-teal-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {s.charAt(0).toUpperCase() + s.slice(1)}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-teal-600 mx-auto"></div>
        </div>
      ) : error ? (
        <div className="bg-red-50 text-red-700 p-4 rounded-lg">{error}</div>
      ) : appointments.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <div className="text-4xl mb-3">📋</div>
          <p>No appointments found.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {appointments.map((apt) => {
            const meetLink = apt.meetingLink || apt.meeting?.link;
            const isOnline = apt.meetingMode === 'online' || apt.meeting?.mode === 'online';

            return (
              <div key={apt._id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 space-y-3">
                <div className="flex flex-wrap justify-between items-start gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-3">
                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[apt.status] || 'bg-gray-100'}`}>
                        {apt.status.charAt(0).toUpperCase() + apt.status.slice(1)}
                      </span>
                      {apt.isUrgent && (
                        <span className="text-xs text-red-500 font-medium">🚨 Urgent</span>
                      )}
                      {isOnline && (
                        <span className="text-xs text-blue-600 font-medium">🌐 Online Session</span>
                      )}
                    </div>
                    <p className="text-sm text-gray-800">
                      <span className="font-medium">
                        {new Date(apt.date).toLocaleDateString('en-IN', {
                          weekday: 'short', year: 'numeric', month: 'short', day: 'numeric'
                        })}
                      </span>
                      {' · '}
                      {apt.timeSlot}
                    </p>
                    <p className="text-sm text-gray-500">{apt.issueCategory}{apt.customCategory ? ` — ${apt.customCategory}` : ''}</p>
                    {apt.description && (
                      <p className="text-xs text-gray-400 mt-1 max-w-md">{apt.description}</p>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {/* Rejection reason */}
                    {apt.status === 'rejected' && apt.rejectionReason && (
                      <div className="text-xs text-red-600 bg-red-50 px-3 py-1.5 rounded-lg max-w-xs">
                        Reason: {apt.rejectionReason}
                      </div>
                    )}
                    {/* Meeting link */}
                    {['approved', 'in_progress', 'rescheduled'].includes(apt.status) && isOnline && meetLink && (
                      <a
                        href={meetLink}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs bg-blue-50 text-blue-600 px-3 py-1.5 rounded-lg hover:bg-blue-100 font-semibold flex items-center gap-1"
                      >
                        🔗 Join Online Meeting
                      </a>
                    )}
                    {/* Cancel button */}
                    {canCancel(apt) && (
                      <button
                        onClick={() => handleCancel(apt._id)}
                        disabled={cancellingId === apt._id}
                        className="text-xs bg-red-50 text-red-600 px-3 py-1.5 rounded-lg hover:bg-red-100 disabled:opacity-50"
                      >
                        {cancellingId === apt._id ? 'Cancelling...' : 'Cancel'}
                      </button>
                    )}
                    {/* Feedback button */}
                    {canGiveFeedback(apt) && (
                      <button
                        onClick={() => setFeedbackModal(apt)}
                        className="text-xs bg-amber-50 text-amber-600 px-3 py-1.5 rounded-lg hover:bg-amber-100"
                      >
                        ⭐ Give Feedback
                      </button>
                    )}
                    {/* Feedback already submitted */}
                    {apt.feedback?.submittedAt && (
                      <span className="text-xs text-green-600 bg-green-50 px-3 py-1.5 rounded-lg">
                        ✓ Feedback submitted
                      </span>
                    )}
                  </div>
                </div>

                {/* DELAY BANNER */}
                {apt.delayMinutes > 0 && ['approved', 'rescheduled'].includes(apt.status) && (
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-2.5 text-xs text-amber-900">
                    <span className="text-base shrink-0">⏳</span>
                    <div>
                      <p className="font-bold">Delayed by {apt.delayMinutes} min</p>
                      <p className="text-amber-800 mt-0.5">
                        {apt.delayMessage
                          ? `Counselor Message: "${apt.delayMessage}"`
                          : 'The counselor is running late on the previous session. Please wait before arriving.'}
                      </p>
                    </div>
                  </div>
                )}

                {/* RESCHEDULED INFO */}
                {apt.rescheduleHistory && apt.rescheduleHistory.length > 0 && (
                  <div className="p-2.5 bg-purple-50/70 border border-purple-100 rounded-lg text-xs text-purple-900">
                    <span className="font-semibold">Session Rescheduled:</span> Originally booked for{' '}
                    {new Date(apt.rescheduleHistory[apt.rescheduleHistory.length - 1].oldDate).toLocaleDateString()} at{' '}
                    {apt.rescheduleHistory[apt.rescheduleHistory.length - 1].oldSlot}.
                    {apt.rescheduleHistory[apt.rescheduleHistory.length - 1].reason && (
                      <span className="block text-purple-700 italic mt-0.5">
                        Note: {apt.rescheduleHistory[apt.rescheduleHistory.length - 1].reason}
                      </span>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Feedback Modal */}
      {feedbackModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h2 className="text-lg font-bold text-gray-800 mb-4">Session Feedback</h2>
            <p className="text-sm text-gray-500 mb-4">
              How was your session on{' '}
              {new Date(feedbackModal.date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}?
            </p>

            {/* Star rating */}
            <div className="flex gap-2 mb-4">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setFeedbackData((p) => ({ ...p, rating: star }))}
                  className={`text-2xl transition-transform hover:scale-110 ${
                    feedbackData.rating >= star ? 'text-amber-400' : 'text-gray-300'
                  }`}
                >
                  ★
                </button>
              ))}
            </div>

            {/* Was helpful */}
            <div className="mb-4">
              <p className="text-sm text-gray-700 mb-2">Was this session helpful?</p>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setFeedbackData((p) => ({ ...p, wasHelpful: true }))}
                  className={`px-4 py-1.5 rounded-lg text-sm border ${
                    feedbackData.wasHelpful === true
                      ? 'bg-green-100 border-green-300 text-green-700'
                      : 'bg-white border-gray-200 text-gray-600'
                  }`}
                >
                  👍 Yes
                </button>
                <button
                  type="button"
                  onClick={() => setFeedbackData((p) => ({ ...p, wasHelpful: false }))}
                  className={`px-4 py-1.5 rounded-lg text-sm border ${
                    feedbackData.wasHelpful === false
                      ? 'bg-red-100 border-red-300 text-red-700'
                      : 'bg-white border-gray-200 text-gray-600'
                  }`}
                >
                  👎 No
                </button>
              </div>
            </div>

            {/* Comment */}
            <textarea
              value={feedbackData.comment}
              onChange={(e) => setFeedbackData((p) => ({ ...p, comment: e.target.value }))}
              maxLength={300}
              rows={3}
              placeholder="Any comments? (optional)"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-teal-500 resize-none mb-2"
            />
            <p className="text-xs text-gray-400 mb-4">{feedbackData.comment.length}/300</p>

            {feedbackError && (
              <div className="bg-red-50 text-red-700 px-3 py-2 rounded-lg mb-4 text-sm">
                {feedbackError}
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={handleFeedbackSubmit}
                disabled={feedbackSubmitting}
                className="flex-1 bg-teal-600 hover:bg-teal-700 text-white py-2 rounded-lg font-medium text-sm disabled:opacity-50"
              >
                {feedbackSubmitting ? 'Submitting...' : 'Submit Feedback'}
              </button>
              <button
                onClick={() => {
                  setFeedbackModal(null);
                  setFeedbackData({ rating: 0, comment: '', wasHelpful: null });
                  setFeedbackError('');
                }}
                className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg text-sm hover:bg-gray-200"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyAppointments;
