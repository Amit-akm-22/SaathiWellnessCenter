import { useState, useEffect } from 'react';
import { counselorAPI, slotAPI } from '../../api';
import CounselorNav from '../../components/CounselorNav';
import SessionNotesModal from '../../components/SessionNotesModal';

const STATUS_BADGES = {
  approved: 'bg-teal-50 text-teal-700 border-teal-200',
  in_progress: 'bg-indigo-50 text-indigo-700 border-indigo-200 font-bold',
  completed: 'bg-blue-50 text-blue-700 border-blue-200',
  rescheduled: 'bg-purple-50 text-purple-700 border-purple-200',
  no_show: 'bg-slate-100 text-slate-600 border-slate-200',
};

const CounselorQueue = () => {
  const [queue, setQueue] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Live timer for active session
  const [elapsedMinutes, setElapsedMinutes] = useState(0);

  // Notes Modal
  const [notesModalApt, setNotesModalApt] = useState(null);

  // Delay Modal
  const [delayModalApt, setDelayModalApt] = useState(null);
  const [delayMinutes, setDelayMinutes] = useState(10);
  const [customDelay, setCustomDelay] = useState('');
  const [delayMessage, setDelayMessage] = useState('');
  const [delaySubmitting, setDelaySubmitting] = useState(false);

  // Reschedule Modal
  const [rescheduleModalApt, setRescheduleModalApt] = useState(null);
  const [rescheduleDate, setRescheduleDate] = useState('');
  const [rescheduleSlot, setRescheduleSlot] = useState('');
  const [rescheduleReason, setRescheduleReason] = useState('');
  const [availableSlots, setAvailableSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [rescheduleSubmitting, setRescheduleSubmitting] = useState(false);

  // Online Meeting Modal
  const [onlineModalApt, setOnlineModalApt] = useState(null);
  const [manualMeetLink, setManualMeetLink] = useState('');
  const [onlineSubmitting, setOnlineSubmitting] = useState(false);

  useEffect(() => {
    fetchQueue();
  }, []);

  const fetchQueue = async () => {
    setLoading(true);
    try {
      const res = await counselorAPI.getDashboard();
      const q = res.data.data.todayQueue || [];
      setQueue(q);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load queue.');
    } finally {
      setLoading(false);
    }
  };

  // Timer calculation for currently active session
  const activeSession = queue.find((a) => a.status === 'in_progress');

  useEffect(() => {
    if (!activeSession?.sessionStartedAt) return;
    const calculateElapsed = () => {
      const started = new Date(activeSession.sessionStartedAt).getTime();
      const now = Date.now();
      const mins = Math.floor((now - started) / 60000);
      setElapsedMinutes(mins);
    };

    calculateElapsed();
    const interval = setInterval(calculateElapsed, 10000); // update every 10s
    return () => clearInterval(interval);
  }, [activeSession]);

  const handleStartSession = async (apt) => {
    if (!window.confirm(`Start session for ${apt.name} (${apt.timeSlot})?`)) return;
    try {
      await counselorAPI.startSession(apt._id);
      fetchQueue();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to start session.');
    }
  };

  const handleEndSession = async (apt) => {
    if (!window.confirm(`End session for ${apt.name}? Duration will be computed and student notified.`)) return;
    try {
      const res = await counselorAPI.endSession(apt._id);
      await fetchQueue();
      // Prompt for session notes immediately!
      setNotesModalApt(res.data.data.appointment);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to end session.');
    }
  };

  const handleMarkNoShow = async (apt) => {
    if (!window.confirm(`Mark ${apt.name} as No-Show for slot ${apt.timeSlot}?`)) return;
    try {
      await counselorAPI.markNoShow(apt._id);
      fetchQueue();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to mark no-show.');
    }
  };

  const submitDelay = async (e) => {
    e.preventDefault();
    const finalMinutes = delayMinutes === 'custom' ? parseInt(customDelay, 10) : parseInt(delayMinutes, 10);
    if (!finalMinutes || finalMinutes <= 0) {
      alert('Please specify valid delay minutes.');
      return;
    }

    setDelaySubmitting(true);
    try {
      await counselorAPI.delaySession(delayModalApt._id, {
        delayMinutes: finalMinutes,
        delayMessage: delayMessage.trim(),
      });
      setDelayModalApt(null);
      setDelayMessage('');
      fetchQueue();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to send delay notification.');
    } finally {
      setDelaySubmitting(false);
    }
  };

  const handleDateChangeForReschedule = async (newDate) => {
    setRescheduleDate(newDate);
    setRescheduleSlot('');
    if (!newDate) return;
    setLoadingSlots(true);
    try {
      const res = await slotAPI.getAvailable(newDate);
      setAvailableSlots(res.data.data.slots || []);
    } catch {
      setAvailableSlots([]);
    } finally {
      setLoadingSlots(false);
    }
  };

  const submitReschedule = async (e) => {
    e.preventDefault();
    if (!rescheduleDate || !rescheduleSlot || !rescheduleReason.trim()) {
      alert('Date, slot, and reason are required.');
      return;
    }
    setRescheduleSubmitting(true);
    try {
      await counselorAPI.reschedule(rescheduleModalApt._id, {
        newDate: rescheduleDate,
        newSlot: rescheduleSlot,
        reason: rescheduleReason.trim(),
      });
      setRescheduleModalApt(null);
      setRescheduleDate('');
      setRescheduleSlot('');
      setRescheduleReason('');
      fetchQueue();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to reschedule.');
    } finally {
      setRescheduleSubmitting(false);
    }
  };

  const submitOnlineMeet = async (e) => {
    e.preventDefault();
    setOnlineSubmitting(true);
    try {
      await counselorAPI.setOnlineMeeting(onlineModalApt._id, {
        meetingLink: manualMeetLink.trim(),
      });
      setOnlineModalApt(null);
      setManualMeetLink('');
      fetchQueue();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to switch to online meeting.');
    } finally {
      setOnlineSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/50 pb-20">
      <CounselorNav />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
              <span>⏱️</span> Today's Live Consultation Queue
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
              Manage in-progress sessions, monitor planned vs actual durations, and trigger overrun alerts for waiting students.
            </p>
          </div>
          <button
            onClick={fetchQueue}
            className="self-start px-3 py-1.5 text-xs bg-white border border-gray-200 hover:border-teal-400 text-gray-700 font-medium rounded-xl shadow-xs transition-all"
          >
            🔄 Refresh Queue
          </button>
        </div>

        {error && (
          <div className="p-4 bg-red-50 text-red-700 rounded-xl text-sm border border-red-200">
            {error}
          </div>
        )}

        {/* ACTIVE SESSION BANNER WITH LIVE TIMER */}
        {activeSession && (
          <div className={`p-5 rounded-2xl border shadow-sm transition-all ${
            elapsedMinutes > 45
              ? 'bg-rose-50/90 border-rose-300'
              : 'bg-indigo-50/90 border-indigo-200'
          }`}>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></span>
                  <span className="text-xs font-bold uppercase tracking-wider text-indigo-900">
                    Live Session In Progress
                  </span>
                  {elapsedMinutes > 45 && (
                    <span className="px-2 py-0.5 rounded-full bg-rose-600 text-white font-bold text-[11px] animate-pulse">
                      ⚠️ OVERRUNNING (+{elapsedMinutes - 45} mins)
                    </span>
                  )}
                </div>

                <h3 className="text-lg font-bold text-gray-900">
                  {activeSession.name} ({activeSession.branch} {activeSession.year} Yr)
                </h3>
                <p className="text-xs text-gray-600">
                  Category: <span className="font-semibold text-gray-800">{activeSession.issueCategory}</span> · Slot: {activeSession.timeSlot}
                </p>
              </div>

              {/* Live Timer Meter */}
              <div className="flex items-center gap-4 bg-white/80 backdrop-blur-xs p-3.5 rounded-xl border border-indigo-100">
                <div className="text-center">
                  <p className="text-2xl font-black text-indigo-900 font-mono">
                    {elapsedMinutes}m
                  </p>
                  <p className="text-[10px] text-gray-500 font-semibold uppercase">Elapsed</p>
                </div>
                <div className="h-8 w-px bg-gray-200"></div>
                <div className="text-center">
                  <p className="text-2xl font-black text-gray-500 font-mono">45m</p>
                  <p className="text-[10px] text-gray-500 font-semibold uppercase">Planned</p>
                </div>
                <div className="h-8 w-px bg-gray-200"></div>
                <button
                  onClick={() => handleEndSession(activeSession)}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs"
                >
                  ✓ End Session & Take Notes
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Queue List */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="font-bold text-gray-800 text-sm">
              Today's Scheduled Consultations ({queue.length})
            </h2>
            <span className="text-xs text-gray-400">Times ordered chronologically</span>
          </div>

          {loading ? (
            <div className="py-16 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600 mx-auto mb-2"></div>
              <p className="text-xs text-gray-400">Loading queue...</p>
            </div>
          ) : queue.length === 0 ? (
            <div className="py-16 text-center text-gray-400 text-xs">
              <p className="text-3xl mb-1">☕</p>
              No appointments scheduled for today.
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {queue.map((apt, index) => {
                const isInProgress = apt.status === 'in_progress';
                const isApproved = ['approved', 'rescheduled'].includes(apt.status);
                const isCompleted = apt.status === 'completed';

                return (
                  <div
                    key={apt._id}
                    className={`p-4 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                      isInProgress ? 'bg-indigo-50/50' : 'hover:bg-slate-50/60'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`px-3 py-2 rounded-xl text-center min-w-[100px] border ${
                        isInProgress
                          ? 'bg-indigo-600 text-white border-indigo-600 font-bold'
                          : 'bg-slate-100 text-slate-700 border-slate-200 font-semibold'
                      }`}>
                        <span className="text-xs block">{apt.timeSlot}</span>
                        <span className="text-[10px] block opacity-80 mt-0.5">Seat 1</span>
                      </div>

                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-bold text-sm text-gray-900">{apt.name}</span>
                          <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${STATUS_BADGES[apt.status] || 'bg-gray-100'}`}>
                            {apt.status.toUpperCase()}
                          </span>
                          {apt.meetingMode === 'online' && (
                            <span className="text-[11px] font-medium bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full border border-blue-200">
                              🌐 Online
                            </span>
                          )}
                          {apt.delayMinutes > 0 && (
                            <span className="text-[11px] font-semibold bg-amber-100 text-amber-900 px-2 py-0.5 rounded-full">
                              ⏳ Delayed by {apt.delayMinutes} min
                            </span>
                          )}
                        </div>

                        <p className="text-xs text-gray-500">
                          {apt.enrollmentNo} · {apt.branch} {apt.year} Yr · {apt.gender} · {apt.issueCategory}
                        </p>

                        {apt.delayMessage && (
                          <p className="text-[11px] text-amber-800 bg-amber-50 px-2.5 py-1 rounded-md max-w-lg">
                            📢 Delay Note: "{apt.delayMessage}"
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex flex-wrap items-center justify-end gap-2 shrink-0">
                      {isApproved && (
                        <>
                          <button
                            onClick={() => handleStartSession(apt)}
                            className="px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs rounded-xl shadow-xs"
                          >
                            ▶ Start Session
                          </button>

                          <button
                            onClick={() => {
                              setDelayModalApt(apt);
                              setDelayMinutes(10);
                              setCustomDelay('');
                              setDelayMessage('');
                            }}
                            className="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 font-semibold text-xs rounded-xl border border-amber-200"
                          >
                            ⏱️ Notify Delay
                          </button>

                          <button
                            onClick={() => {
                              setRescheduleModalApt(apt);
                              setRescheduleDate('');
                              setRescheduleSlot('');
                              setRescheduleReason('');
                            }}
                            className="px-2.5 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-700 font-medium text-xs rounded-xl"
                          >
                            Reschedule
                          </button>

                          <button
                            onClick={() => handleMarkNoShow(apt)}
                            className="px-2 py-1.5 text-gray-400 hover:text-red-600 text-xs rounded-lg"
                          >
                            No-Show
                          </button>
                        </>
                      )}

                      {isInProgress && (
                        <button
                          onClick={() => handleEndSession(apt)}
                          className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs"
                        >
                          ⏹ End Session
                        </button>
                      )}

                      {/* Online Meet Link */}
                      {apt.meetingMode === 'online' && apt.meetingLink ? (
                        <a
                          href={apt.meetingLink}
                          target="_blank"
                          rel="noreferrer"
                          className="px-3 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 font-semibold text-xs rounded-xl"
                        >
                          Join Meet 🔗
                        </a>
                      ) : (
                        isApproved && (
                          <button
                            onClick={() => {
                              setOnlineModalApt(apt);
                              setManualMeetLink('');
                            }}
                            className="px-2.5 py-1.5 text-xs text-blue-600 hover:bg-blue-50 rounded-xl"
                          >
                            + Online Link
                          </button>
                        )
                      )}

                      {/* Notes button */}
                      {(isCompleted || isInProgress) && (
                        <button
                          onClick={() => setNotesModalApt(apt)}
                          className="px-3 py-1.5 bg-teal-50 hover:bg-teal-100 text-teal-800 font-medium text-xs rounded-xl"
                        >
                          📝 {apt.sessionNotes?.summary ? 'Edit Notes' : 'Add Notes'}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* DELAY MODAL (NOTIFY NEXT STUDENT) */}
      {delayModalApt && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-100 space-y-4">
            <h3 className="font-bold text-gray-900 text-base">
              Notify {delayModalApt.name} of Overrun / Delay
            </h3>
            <p className="text-xs text-gray-500">
              The student will receive an in-app banner and email/SMS alert to wait before arriving.
            </p>

            <form onSubmit={submitDelay} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">Select Delay</label>
                <div className="grid grid-cols-4 gap-2">
                  {[5, 10, 15, 20].map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => { setDelayMinutes(m); setCustomDelay(''); }}
                      className={`py-2 text-xs font-semibold rounded-xl border text-center transition-all ${
                        delayMinutes === m
                          ? 'bg-amber-600 text-white border-amber-600'
                          : 'bg-white text-gray-700 border-gray-200 hover:border-amber-400'
                      }`}
                    >
                      +{m} mins
                    </button>
                  ))}
                </div>

                <div className="mt-2 flex items-center gap-2">
                  <span className="text-xs text-gray-500">Or custom mins:</span>
                  <input
                    type="number"
                    min="1"
                    placeholder="e.g. 25"
                    value={customDelay}
                    onChange={(e) => {
                      setCustomDelay(e.target.value);
                      setDelayMinutes('custom');
                    }}
                    className="w-24 px-2 py-1 text-xs border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Optional Message to Student
                </label>
                <input
                  type="text"
                  placeholder="e.g. Current session running long. Please grab a seat in the waiting lounge."
                  value={delayMessage}
                  onChange={(e) => setDelayMessage(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setDelayModalApt(null)}
                  className="px-3 py-1.5 text-xs text-gray-600 hover:bg-gray-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={delaySubmitting}
                  className="px-4 py-1.5 text-xs bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl disabled:opacity-50"
                >
                  {delaySubmitting ? 'Sending Alert...' : '📢 Send Delay Alert'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* RESCHEDULE MODAL */}
      {rescheduleModalApt && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-100 space-y-4">
            <h3 className="font-bold text-gray-900 text-base">
              Reschedule Appointment for {rescheduleModalApt.name}
            </h3>

            <form onSubmit={submitReschedule} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Target Date</label>
                <input
                  type="date"
                  required
                  min={new Date().toISOString().split('T')[0]}
                  value={rescheduleDate}
                  onChange={(e) => handleDateChangeForReschedule(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              {rescheduleDate && (
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Select Available Slot {loadingSlots && '(Checking...)'}
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {availableSlots.map((s) => (
                      <button
                        key={s.slot}
                        type="button"
                        disabled={s.isFull}
                        onClick={() => setRescheduleSlot(s.slot)}
                        className={`p-2 text-xs rounded-xl border text-center font-medium transition-all ${
                          rescheduleSlot === s.slot
                            ? 'bg-teal-600 text-white border-teal-600'
                            : s.isFull
                            ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                            : 'bg-white text-gray-700 border-gray-200 hover:border-teal-400'
                        }`}
                      >
                        {s.slot}
                        <span className="block text-[10px] mt-0.5 opacity-80">
                          {s.isFull ? 'Full' : `${s.remaining} left`}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Reason for Rescheduling <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Extended session overrun; moved to next available slot."
                  value={rescheduleReason}
                  onChange={(e) => setRescheduleReason(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setRescheduleModalApt(null)}
                  className="px-3 py-1.5 text-xs text-gray-600 hover:bg-gray-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={rescheduleSubmitting || !rescheduleDate || !rescheduleSlot || !rescheduleReason.trim()}
                  className="px-4 py-1.5 text-xs bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl disabled:opacity-50"
                >
                  {rescheduleSubmitting ? 'Rescheduling...' : 'Confirm Reschedule'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ONLINE MEETING LINK MODAL */}
      {onlineModalApt && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-100 space-y-4">
            <h3 className="font-bold text-gray-900 text-base">
              Switch to Online Meeting for {onlineModalApt.name}
            </h3>
            <p className="text-xs text-gray-500">
              Provide a Google Meet or Zoom link, or leave blank to auto-generate a meeting link.
            </p>

            <form onSubmit={submitOnlineMeet} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Meeting Link (Optional)
                </label>
                <input
                  type="url"
                  placeholder="https://meet.google.com/xyz-abcd-efg"
                  value={manualMeetLink}
                  onChange={(e) => setManualMeetLink(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setOnlineModalApt(null)}
                  className="px-3 py-1.5 text-xs text-gray-600 hover:bg-gray-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={onlineSubmitting}
                  className="px-4 py-1.5 text-xs bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl disabled:opacity-50"
                >
                  {onlineSubmitting ? 'Saving...' : 'Set Online & Notify Student'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SESSION NOTES MODAL */}
      <SessionNotesModal
        appointment={notesModalApt}
        isOpen={Boolean(notesModalApt)}
        onClose={() => setNotesModalApt(null)}
        onSaved={() => fetchQueue()}
      />
    </div>
  );
};

export default CounselorQueue;
