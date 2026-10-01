import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AdminNav from '../../components/AdminNav';
import { adminAPI } from '../../api';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [recalculating, setRecalculating] = useState(false);
  const [recalcMsg, setRecalcMsg] = useState('');

  const fetchDashboard = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await adminAPI.getDashboard();
      setData(res.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load admin dashboard.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const handleRecalculateCapacity = async () => {
    setRecalculating(true);
    setRecalcMsg('');
    try {
      const res = await adminAPI.recalculateCapacity();
      setRecalcMsg(res.data.message || 'Capacity recalculated successfully!');
      setTimeout(() => setRecalcMsg(''), 4000);
    } catch (err) {
      setRecalcMsg(err.response?.data?.message || 'Recalculation failed.');
    } finally {
      setRecalculating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <AdminNav />
        <div className="flex items-center justify-center py-24">
          <div className="flex flex-col items-center gap-3">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
            <p className="text-sm text-slate-500 font-medium">Loading system metrics...</p>
          </div>
        </div>
      </div>
    );
  }

  const { stats = {}, urgentAlerts = [], recentAppointments = [], recentAudit = [] } = data || {};

  return (
    <div className="min-h-screen bg-slate-50">
      <AdminNav />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Header with Quick Actions */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
                System Administration
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
                System Active
              </span>
            </div>
            <p className="text-sm text-slate-500 mt-1">
              Overall health, user oversight, appointments state machine, and global configurations.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleRecalculateCapacity}
              disabled={recalculating}
              className="px-3.5 py-2 rounded-lg bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 text-xs sm:text-sm font-medium transition shadow-sm flex items-center gap-1.5 disabled:opacity-50"
            >
              <span>🔄</span>
              <span>{recalculating ? 'Syncing...' : 'Sync Slot Capacity'}</span>
            </button>

            <Link
              to="/admin/users"
              className="px-3.5 py-2 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-xs sm:text-sm font-medium transition shadow-sm flex items-center gap-1.5"
            >
              <span>➕</span>
              <span>Add User</span>
            </Link>

            <Link
              to="/counselor/dashboard"
              className="px-3.5 py-2 rounded-lg bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 text-xs sm:text-sm font-medium transition shadow-sm flex items-center gap-1.5"
            >
              <span>🧑‍⚕️</span>
              <span>Counselor View</span>
            </Link>
          </div>
        </div>

        {recalcMsg && (
          <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-sm flex items-center gap-2">
            <span>✅</span>
            <span>{recalcMsg}</span>
          </div>
        )}

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
            {error}
          </div>
        )}

        {/* Urgent High-Risk Alerts Banner */}
        {urgentAlerts.length > 0 && (
          <div className="bg-rose-50 border-l-4 border-rose-600 p-4 sm:p-5 rounded-r-xl shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-rose-800 font-bold text-base sm:text-lg">
                <span className="text-xl animate-bounce">🚨</span>
                <span>High-Risk / Urgent Cases Requiring Oversight ({urgentAlerts.length})</span>
              </div>
              <Link
                to="/admin/appointments?urgency=urgent"
                className="text-xs font-semibold text-rose-700 hover:text-rose-900 underline"
              >
                View all in Appointments →
              </Link>
            </div>
            <p className="text-xs sm:text-sm text-rose-700">
              The following appointments were flagged as urgent or high/severe during mental health screening:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {urgentAlerts.map((apt) => (
                <div
                  key={apt._id}
                  className="bg-white p-3 rounded-lg border border-rose-200 shadow-sm flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-800 text-sm">{apt.name}</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-rose-100 text-rose-800">
                        {apt.severity || 'Urgent'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {apt.enrollmentNo || apt.email} · {apt.branch} ({apt.year})
                    </p>
                    <p className="text-xs text-rose-600 font-medium mt-1">
                      {apt.issueCategory} · {apt.date} ({apt.timeSlot})
                    </p>
                  </div>
                  <div className="mt-3 flex items-center justify-between border-t pt-2 text-xs">
                    <span className="text-slate-500">Status: <strong className="text-slate-700">{apt.status}</strong></span>
                    <button
                      onClick={() => navigate(`/admin/appointments?search=${apt.name}`)}
                      className="text-teal-600 hover:text-teal-800 font-medium"
                    >
                      Override / Manage →
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Primary KPI Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
            <span className="text-xs font-medium text-slate-500 block">Total Students</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-bold text-slate-900">{stats.totalStudents || 0}</span>
              <span className="text-xs text-emerald-600 font-medium">Enrolled</span>
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
            <span className="text-xs font-medium text-slate-500 block">Active Counselors</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-bold text-slate-900">{stats.totalCounselors || 0}</span>
              <span className="text-xs text-teal-600 font-medium">On Duty</span>
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
            <span className="text-xs font-medium text-slate-500 block">Total Appointments</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-bold text-slate-900">{stats.totalAppointments || 0}</span>
              <span className="text-xs text-slate-500 font-medium">All Time</span>
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
            <span className="text-xs font-medium text-slate-500 block">Completed Sessions</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-bold text-emerald-600">{stats.completedAppointments || 0}</span>
              <span className="text-xs text-emerald-700 font-medium">Finished</span>
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
            <span className="text-xs font-medium text-slate-500 block">No-Show Rate</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-bold text-amber-600">
                {stats.noShowRate !== undefined ? `${stats.noShowRate}%` : '0%'}
              </span>
              <span className="text-xs text-amber-700 font-medium">Missed</span>
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
            <span className="text-xs font-medium text-slate-500 block">Avg Student Rating</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-bold text-yellow-500">
                ★ {stats.avgRating ? Number(stats.avgRating).toFixed(1) : '4.8'}
              </span>
              <span className="text-xs text-slate-400 font-medium">/ 5.0</span>
            </div>
          </div>
        </div>

        {/* Secondary Status Counts */}
        <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-500 mb-3">
            Appointment Distribution by Status
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
            <div className="bg-amber-50 border border-amber-200 p-3 rounded-lg text-center">
              <span className="text-xs text-amber-700 font-medium block">Pending</span>
              <span className="text-lg font-bold text-amber-900">{stats.pending || 0}</span>
            </div>
            <div className="bg-blue-50 border border-blue-200 p-3 rounded-lg text-center">
              <span className="text-xs text-blue-700 font-medium block">Approved</span>
              <span className="text-lg font-bold text-blue-900">{stats.approved || 0}</span>
            </div>
            <div className="bg-purple-50 border border-purple-200 p-3 rounded-lg text-center">
              <span className="text-xs text-purple-700 font-medium block">In Progress</span>
              <span className="text-lg font-bold text-purple-900">{stats.inProgress || 0}</span>
            </div>
            <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-lg text-center">
              <span className="text-xs text-emerald-700 font-medium block">Completed</span>
              <span className="text-lg font-bold text-emerald-900">{stats.completed || 0}</span>
            </div>
            <div className="bg-rose-50 border border-rose-200 p-3 rounded-lg text-center">
              <span className="text-xs text-rose-700 font-medium block">Rejected</span>
              <span className="text-lg font-bold text-rose-900">{stats.rejected || 0}</span>
            </div>
            <div className="bg-slate-100 border border-slate-200 p-3 rounded-lg text-center">
              <span className="text-xs text-slate-600 font-medium block">Cancelled</span>
              <span className="text-lg font-bold text-slate-800">{stats.cancelled || 0}</span>
            </div>
            <div className="bg-orange-50 border border-orange-200 p-3 rounded-lg text-center">
              <span className="text-xs text-orange-700 font-medium block">No Show</span>
              <span className="text-lg font-bold text-orange-900">{stats.noShow || 0}</span>
            </div>
          </div>
        </div>

        {/* Quick Admin Actions & Nav Cards */}
        <div>
          <h2 className="text-base font-bold text-slate-900 mb-4">Administration Modules</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link
              to="/admin/users"
              className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:border-teal-500 transition group"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-2xl p-2 rounded-lg bg-teal-50 text-teal-600">👥</span>
                <span className="text-xs font-semibold text-teal-600 group-hover:translate-x-0.5 transition-transform">
                  Manage →
                </span>
              </div>
              <h3 className="font-semibold text-slate-900 text-base">User Management</h3>
              <p className="text-xs text-slate-500 mt-1">
                Create users, reset passwords, bulk CSV import, deactivate, and view student profiles.
              </p>
            </Link>

            <Link
              to="/admin/appointments"
              className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:border-teal-500 transition group"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-2xl p-2 rounded-lg bg-blue-50 text-blue-600">📅</span>
                <span className="text-xs font-semibold text-blue-600 group-hover:translate-x-0.5 transition-transform">
                  Override →
                </span>
              </div>
              <h3 className="font-semibold text-slate-900 text-base">Appointment Override</h3>
              <p className="text-xs text-slate-500 mt-1">
                Force state transitions, reassign counselors, moderate feedback, and sync slot capacity.
              </p>
            </Link>

            <Link
              to="/admin/settings"
              className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:border-teal-500 transition group"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-2xl p-2 rounded-lg bg-purple-50 text-purple-600">⚙️</span>
                <span className="text-xs font-semibold text-purple-600 group-hover:translate-x-0.5 transition-transform">
                  Configure →
                </span>
              </div>
              <h3 className="font-semibold text-slate-900 text-base">System Settings</h3>
              <p className="text-xs text-slate-500 mt-1">
                Adjust operating slots, buffer time, issue categories, screening thresholds, and banners.
              </p>
            </Link>

            <Link
              to="/admin/blocked-dates"
              className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:border-teal-500 transition group"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-2xl p-2 rounded-lg bg-amber-50 text-amber-600">🚫</span>
                <span className="text-xs font-semibold text-amber-600 group-hover:translate-x-0.5 transition-transform">
                  Holidays →
                </span>
              </div>
              <h3 className="font-semibold text-slate-900 text-base">Blocked Dates</h3>
              <p className="text-xs text-slate-500 mt-1">
                Block whole college holidays or specific appointment slots with custom reasons.
              </p>
            </Link>

            <Link
              to="/admin/faqs"
              className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:border-teal-500 transition group"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-2xl p-2 rounded-lg bg-emerald-50 text-emerald-600">❓</span>
                <span className="text-xs font-semibold text-emerald-600 group-hover:translate-x-0.5 transition-transform">
                  Edit FAQs →
                </span>
              </div>
              <h3 className="font-semibold text-slate-900 text-base">FAQ Content</h3>
              <p className="text-xs text-slate-500 mt-1">
                Manage mental health and campus life questions, toggle published status, and reorder.
              </p>
            </Link>

            <Link
              to="/admin/logs"
              className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:border-teal-500 transition group"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-2xl p-2 rounded-lg bg-slate-100 text-slate-700">📜</span>
                <span className="text-xs font-semibold text-slate-700 group-hover:translate-x-0.5 transition-transform">
                  Audit Trail →
                </span>
              </div>
              <h3 className="font-semibold text-slate-900 text-base">Audit & Delivery Logs</h3>
              <p className="text-xs text-slate-500 mt-1">
                Trace all admin actions, inspect state mutation diffs, and retry failed notifications.
              </p>
            </Link>

            <Link
              to="/admin/export"
              className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:border-teal-500 transition group"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-2xl p-2 rounded-lg bg-indigo-50 text-indigo-600">📥</span>
                <span className="text-xs font-semibold text-indigo-600 group-hover:translate-x-0.5 transition-transform">
                  Export CSV →
                </span>
              </div>
              <h3 className="font-semibold text-slate-900 text-base">Data Export</h3>
              <p className="text-xs text-slate-500 mt-1">
                Download student rosters, full appointment history, and administrative audit trails.
              </p>
            </Link>

            <Link
              to="/counselor/dashboard"
              className="bg-gradient-to-br from-purple-50 to-indigo-50 p-5 rounded-xl border border-purple-200 shadow-sm hover:shadow-md hover:border-purple-400 transition group"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-2xl p-2 rounded-lg bg-purple-100 text-purple-700">🧑‍⚕️</span>
                <span className="text-xs font-semibold text-purple-700 group-hover:translate-x-0.5 transition-transform">
                  Switch →
                </span>
              </div>
              <h3 className="font-semibold text-slate-900 text-base">Counselor View</h3>
              <p className="text-xs text-slate-600 mt-1">
                Experience the counselor portal as supreme admin: approve slots, write notes, start sessions.
              </p>
            </Link>
          </div>
        </div>

        {/* Recent System Activity & Audits */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Appointments */}
          <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <span>📅</span>
                <span>Recent Appointments</span>
              </h3>
              <Link to="/admin/appointments" className="text-xs text-teal-600 font-medium hover:underline">
                View all →
              </Link>
            </div>
            {recentAppointments.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">No recent appointments.</p>
            ) : (
              <div className="divide-y divide-slate-100">
                {recentAppointments.slice(0, 5).map((apt) => (
                  <div key={apt._id} className="py-2.5 flex items-center justify-between text-xs sm:text-sm">
                    <div>
                      <p className="font-semibold text-slate-800">{apt.name}</p>
                      <p className="text-slate-400 text-xs">
                        {apt.date} · {apt.timeSlot} · {apt.issueCategory}
                      </p>
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded text-xs font-semibold ${
                        apt.status === 'completed'
                          ? 'bg-emerald-100 text-emerald-800'
                          : apt.status === 'in_progress'
                          ? 'bg-purple-100 text-purple-800'
                          : apt.status === 'approved'
                          ? 'bg-blue-100 text-blue-800'
                          : apt.status === 'rejected'
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {apt.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent Audit Trail */}
          <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <span>📜</span>
                <span>Recent Audit Trail</span>
              </h3>
              <Link to="/admin/logs" className="text-xs text-teal-600 font-medium hover:underline">
                View full audit log →
              </Link>
            </div>
            {recentAudit.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">No audit logs recorded yet.</p>
            ) : (
              <div className="divide-y divide-slate-100">
                {recentAudit.slice(0, 5).map((log) => (
                  <div key={log._id} className="py-2.5 flex items-start justify-between text-xs">
                    <div>
                      <span className="font-semibold text-slate-700 font-mono text-[11px] bg-slate-100 px-1.5 py-0.5 rounded">
                        {log.action}
                      </span>
                      <p className="text-slate-500 mt-1">
                        By <span className="font-medium text-slate-700">{log.actorId?.name || log.actorRole}</span> · Entity: {log.entityType}
                      </p>
                    </div>
                    <span className="text-[11px] text-slate-400 whitespace-nowrap">
                      {new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
