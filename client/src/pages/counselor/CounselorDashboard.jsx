import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { counselorAPI } from '../../api';
import CounselorNav from '../../components/CounselorNav';

const SEVERITY_BADGES = {
  Mild: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  Moderate: 'bg-amber-50 text-amber-700 border-amber-200',
  Severe: 'bg-rose-50 text-rose-700 border-rose-200',
};

const STATUS_BADGES = {
  pending: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  approved: 'bg-teal-50 text-teal-700 border-teal-200',
  in_progress: 'bg-indigo-50 text-indigo-700 border-indigo-200 animate-pulse',
  completed: 'bg-blue-50 text-blue-700 border-blue-200',
  cancelled: 'bg-gray-100 text-gray-500 border-gray-200',
  rejected: 'bg-red-50 text-red-600 border-red-200',
  no_show: 'bg-purple-50 text-purple-700 border-purple-200',
};

const CounselorDashboard = () => {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    setLoading(true);
    try {
      const res = await counselorAPI.getDashboard();
      setData(res.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load dashboard metrics.');
    } finally {
      setLoading(false);
    }
  };

  const handleUrgentApprove = async (appointmentId) => {
    if (!window.confirm('Approve this urgent appointment and generate an online meeting link?')) return;
    setActionLoading(true);
    try {
      await counselorAPI.handleUrgent(appointmentId);
      await fetchDashboard();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to approve urgent request.');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div>
        <CounselorNav />
        <div className="max-w-7xl mx-auto px-4 py-20 text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-teal-600 mx-auto mb-3"></div>
          <p className="text-gray-500 text-sm">Loading counselor dashboard...</p>
        </div>
      </div>
    );
  }

  const { metrics, todayQueue = [], priorityAlerts = [] } = data || {};

  return (
    <div className="min-h-screen bg-slate-50/50 pb-16">
      <CounselorNav />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
              Counselor Wellness Hub
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Active counseling queue, urgent alerts, and student appointments.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              to="/counselor/queue"
              className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-sm font-medium shadow-xs transition-all flex items-center gap-2"
            >
              <span>⏱️</span> Live Session Queue
            </Link>
            <Link
              to="/counselor/appointments"
              className="px-4 py-2 bg-white border border-gray-200 hover:border-teal-300 text-gray-700 rounded-xl text-sm font-medium shadow-xs transition-all"
            >
              All Requests
            </Link>
          </div>
        </div>

        {error && (
          <div className="p-4 bg-red-50 text-red-700 rounded-xl border border-red-200 text-sm">
            {error}
          </div>
        )}

        {/* Priority Alert Strip (Unhandled urgent / severe cases) */}
        {priorityAlerts.length > 0 && (
          <div className="bg-gradient-to-r from-rose-50 via-red-50 to-amber-50 border border-rose-200 rounded-2xl p-5 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="flex h-3 w-3 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500"></span>
                </span>
                <h2 className="font-bold text-rose-900 text-base">
                  Priority Alerts: {priorityAlerts.length} Urgent / High Severity Cases Need Immediate Review
                </h2>
              </div>
              <span className="text-xs bg-rose-100 text-rose-800 font-semibold px-2.5 py-1 rounded-full">
                Attention Required
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {priorityAlerts.map((apt) => (
                <div
                  key={apt._id}
                  className="bg-white/90 backdrop-blur-xs rounded-xl p-4 border border-rose-100 shadow-xs flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-semibold text-gray-900 text-sm">{apt.name}</span>
                      <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${SEVERITY_BADGES[apt.severity] || 'bg-gray-100'}`}>
                        {apt.severity || 'Urgent'}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {apt.branch} {apt.year} · {apt.gender} · {apt.enrollmentNo}
                    </p>
                    <p className="text-xs font-medium text-rose-800 mt-2 bg-rose-50/70 px-2 py-1 rounded-md">
                      ⚠️ {apt.issueCategory}
                    </p>
                    {apt.description && (
                      <p className="text-xs text-gray-600 mt-1 line-clamp-2 italic">
                        "{apt.description}"
                      </p>
                    )}
                  </div>
                  <div className="flex items-center justify-end gap-2 mt-3 pt-3 border-t border-gray-100">
                    <button
                      onClick={() => navigate(`/counselor/appointments?search=${encodeURIComponent(apt.enrollmentNo)}`)}
                      className="text-xs text-gray-600 hover:text-gray-900 px-2.5 py-1.5 rounded-lg font-medium"
                    >
                      Review
                    </button>
                    <button
                      onClick={() => handleUrgentApprove(apt._id)}
                      disabled={actionLoading}
                      className="text-xs bg-rose-600 hover:bg-rose-700 text-white font-medium px-3 py-1.5 rounded-lg shadow-xs transition-colors"
                    >
                      Handle Urgent ⚡
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 5 KPI Metric Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Today's Sessions</p>
            <p className="text-2xl sm:text-3xl font-extrabold text-teal-700 mt-2">
              {metrics?.todaySessions || 0}
            </p>
            <p className="text-xs text-gray-400 mt-1">Scheduled for today</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Pending Requests</p>
            <p className="text-2xl sm:text-3xl font-extrabold text-amber-600 mt-2">
              {metrics?.pendingRequests || 0}
            </p>
            <p className="text-xs text-gray-400 mt-1">Awaiting approval</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Urgent Cases</p>
            <p className="text-2xl sm:text-3xl font-extrabold text-rose-600 mt-2">
              {metrics?.urgentCases || 0}
            </p>
            <p className="text-xs text-gray-400 mt-1">Self-harm / High severity</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Completed (Week)</p>
            <p className="text-2xl sm:text-3xl font-extrabold text-indigo-600 mt-2">
              {metrics?.completedThisWeek || 0}
            </p>
            <p className="text-xs text-gray-400 mt-1">Sessions closed</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs col-span-2 sm:col-span-1">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Avg Feedback</p>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-2xl sm:text-3xl font-extrabold text-teal-800">
                {metrics?.averageRating || 0}★
              </span>
              <span className="text-xs text-emerald-600 font-semibold">
                ({metrics?.helpfulPercentage || 100}% helpful)
              </span>
            </div>
            <p className="text-xs text-gray-400 mt-1">From student reviews</p>
          </div>
        </div>

        {/* Today's Queue Section */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-xs p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100">
            <div>
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <span>⏱️</span> Today's Queue ({todayQueue.length})
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Ordered by slot time. Live highlights on current active sessions.
              </p>
            </div>
            <Link
              to="/counselor/queue"
              className="text-xs font-semibold text-teal-600 hover:text-teal-800 flex items-center gap-1"
            >
              Open Full Live Queue →
            </Link>
          </div>

          {todayQueue.length === 0 ? (
            <div className="text-center py-12 text-gray-400 text-sm">
              <p className="text-3xl mb-2">☕</p>
              No sessions scheduled for today. Have a peaceful day!
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {todayQueue.map((apt) => {
                const isInProgress = apt.status === 'in_progress';
                return (
                  <div
                    key={apt._id}
                    className={`py-4 px-3 rounded-xl transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                      isInProgress
                        ? 'bg-indigo-50/70 border border-indigo-200'
                        : 'hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-start sm:items-center gap-3">
                      <div className={`px-2.5 py-1.5 rounded-lg text-xs font-bold text-center min-w-[90px] ${
                        isInProgress ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-700'
                      }`}>
                        {apt.timeSlot}
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-sm text-gray-900">{apt.name}</span>
                          <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${STATUS_BADGES[apt.status] || 'bg-gray-100'}`}>
                            {apt.status.toUpperCase()}
                          </span>
                          {apt.delayMinutes > 0 && (
                            <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                              Delayed by {apt.delayMinutes}m
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {apt.branch} {apt.year} Yr · {apt.issueCategory}
                          {apt.meetingMode === 'online' && ' · 🌐 Online Meet'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center">
                      {apt.meetingMode === 'online' && apt.meetingLink && (
                        <a
                          href={apt.meetingLink}
                          target="_blank"
                          rel="noreferrer"
                          className="px-3 py-1.5 bg-blue-50 text-blue-700 text-xs font-semibold rounded-lg hover:bg-blue-100"
                        >
                          Join Meet 🔗
                        </a>
                      )}
                      <Link
                        to="/counselor/queue"
                        className="px-3 py-1.5 bg-teal-50 text-teal-800 text-xs font-semibold rounded-lg hover:bg-teal-100"
                      >
                        Manage Session →
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Quick Modules Directory */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <Link
            to="/counselor/students"
            className="p-5 bg-white rounded-2xl border border-gray-100 shadow-xs hover:border-teal-300 transition-all group"
          >
            <div className="flex items-center gap-3 mb-2">
              <span className="text-2xl p-2 bg-teal-50 rounded-xl group-hover:bg-teal-100 transition-colors">👥</span>
              <div>
                <h3 className="font-bold text-gray-900 text-sm">Student Directory</h3>
                <p className="text-xs text-gray-500">Student counseling profiles & history</p>
              </div>
            </div>
            <p className="text-xs text-gray-400">Search students, view past notes, and track previous interventions.</p>
          </Link>

          <Link
            to="/counselor/reports"
            className="p-5 bg-white rounded-2xl border border-gray-100 shadow-xs hover:border-teal-300 transition-all group"
          >
            <div className="flex items-center gap-3 mb-2">
              <span className="text-2xl p-2 bg-purple-50 rounded-xl group-hover:bg-purple-100 transition-colors">📄</span>
              <div>
                <h3 className="font-bold text-gray-900 text-sm">Report Builder</h3>
                <p className="text-xs text-gray-500">Cross-tabs, multi-dim analysis & exports</p>
              </div>
            </div>
            <p className="text-xs text-gray-400">Export filtered data to CSV and formatted tables by branch, year, category.</p>
          </Link>

          <Link
            to="/counselor/analytics"
            className="p-5 bg-white rounded-2xl border border-gray-100 shadow-xs hover:border-teal-300 transition-all group"
          >
            <div className="flex items-center gap-3 mb-2">
              <span className="text-2xl p-2 bg-emerald-50 rounded-xl group-hover:bg-emerald-100 transition-colors">📈</span>
              <div>
                <h3 className="font-bold text-gray-900 text-sm">Interactive Analytics</h3>
                <p className="text-xs text-gray-500">Recharts visual trends & funnels</p>
              </div>
            </div>
            <p className="text-xs text-gray-400">Examine 30-day issue distributions, peak slot times, and severity splits.</p>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CounselorDashboard;
