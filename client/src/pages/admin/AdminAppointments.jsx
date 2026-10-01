import { useState, useEffect } from 'react';
import AdminNav from '../../components/AdminNav';
import { adminAPI } from '../../api';

const AdminAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [counselors, setCounselors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Filters
  const [statusFilter, setStatusFilter] = useState('');
  const [severityFilter, setSeverityFilter] = useState('');
  const [urgentFilter, setUrgentFilter] = useState('');
  const [counselorFilter, setCounselorFilter] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Modals
  const [selectedApt, setSelectedApt] = useState(null);
  const [showOverrideModal, setShowOverrideModal] = useState(false);
  const [showReassignModal, setShowReassignModal] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  // Forms
  const [overrideForm, setOverrideForm] = useState({
    status: '',
    reason: '',
    rejectionReason: '',
  });

  const [reassignForm, setReassignForm] = useState({
    counselorId: '',
    reason: '',
  });

  const [feedbackForm, setFeedbackForm] = useState({
    isHidden: false,
    reason: '',
  });

  const [recalculating, setRecalculating] = useState(false);

  const fetchAppointments = async () => {
    setLoading(true);
    setError('');
    try {
      const params = {
        page,
        limit: 15,
        status: statusFilter || undefined,
        severity: severityFilter || undefined,
        urgent: urgentFilter ? (urgentFilter === 'urgent') : undefined,
        counselorId: counselorFilter || undefined,
        search: search.trim() || undefined,
      };
      const res = await adminAPI.getAppointments(params);
      setAppointments(res.data.data.appointments);
      setTotalPages(res.data.data.pagination.pages || 1);
      setTotalCount(res.data.data.pagination.total || 0);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch appointments.');
    } finally {
      setLoading(false);
    }
  };

  const fetchCounselors = async () => {
    try {
      const res = await adminAPI.getUsers({ role: 'counselor', limit: 50 });
      setCounselors(res.data.data.users || []);
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, [page, statusFilter, severityFilter, urgentFilter, counselorFilter]);

  useEffect(() => {
    fetchCounselors();
  }, []);

  const showToast = (msg) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchAppointments();
  };

  const handleRecalculateCapacity = async () => {
    setRecalculating(true);
    try {
      const res = await adminAPI.recalculateCapacity();
      showToast(res.data.message || 'Capacity recalculated successfully!');
    } catch (err) {
      setError(err.response?.data?.message || 'Recalculation failed.');
    } finally {
      setRecalculating(false);
    }
  };

  // Open Override Modal
  const openOverrideModal = (apt) => {
    setSelectedApt(apt);
    setOverrideForm({
      status: apt.status,
      reason: '',
      rejectionReason: apt.rejectionReason || '',
    });
    setShowOverrideModal(true);
  };

  // Submit Override
  const handleOverrideSubmit = async (e) => {
    e.preventDefault();
    if (!overrideForm.reason.trim()) {
      alert('An administrative override reason is required for audit compliance.');
      return;
    }
    setActionLoading(true);
    try {
      await adminAPI.overrideAppointment(selectedApt._id, overrideForm);
      setShowOverrideModal(false);
      showToast(`Appointment status updated to ${overrideForm.status}.`);
      fetchAppointments();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to override appointment.');
    } finally {
      setActionLoading(false);
    }
  };

  // Open Reassign Modal
  const openReassignModal = (apt) => {
    setSelectedApt(apt);
    setReassignForm({
      counselorId: apt.counselor?._id || apt.counselor || '',
      reason: '',
    });
    setShowReassignModal(true);
  };

  // Submit Reassign
  const handleReassignSubmit = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      await adminAPI.overrideAppointment(selectedApt._id, {
        counselorId: reassignForm.counselorId || null,
        reason: reassignForm.reason || 'Admin reassigned counselor.',
      });
      setShowReassignModal(false);
      showToast('Counselor reassigned successfully.');
      fetchAppointments();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reassign counselor.');
    } finally {
      setActionLoading(false);
    }
  };

  // Open Moderate Feedback Modal
  const openFeedbackModal = (apt) => {
    setSelectedApt(apt);
    setFeedbackForm({
      isHidden: apt.feedback?.isHidden || false,
      reason: apt.feedback?.moderationReason || '',
    });
    setShowFeedbackModal(true);
  };

  // Submit Moderate Feedback
  const handleFeedbackSubmit = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      await adminAPI.moderateFeedback(selectedApt._id, feedbackForm);
      setShowFeedbackModal(false);
      showToast('Feedback moderation updated.');
      fetchAppointments();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to moderate feedback.');
    } finally {
      setActionLoading(false);
    }
  };

  // Delete Appointment
  const handleDeleteAppointment = async (apt) => {
    if (
      !window.confirm(
        `Are you sure you want to permanently delete appointment #${apt._id.slice(-6)} for ${
          apt.name
        }? Slot capacity will be automatically freed.`
      )
    ) {
      return;
    }
    try {
      await adminAPI.deleteAppointment(apt._id);
      showToast('Appointment deleted and slot capacity updated.');
      fetchAppointments();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete appointment.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <AdminNav />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Appointment Oversight</h1>
            <p className="text-sm text-slate-500">
              Supreme override control: force state transitions, reassign counselors, moderate feedback, and manage slots.
            </p>
          </div>

          <button
            onClick={handleRecalculateCapacity}
            disabled={recalculating}
            className="px-3.5 py-2 rounded-lg bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 text-xs sm:text-sm font-medium transition shadow-sm flex items-center gap-1.5 disabled:opacity-50"
          >
            <span>🔄</span>
            <span>{recalculating ? 'Recalculating...' : 'Recalculate Capacities'}</span>
          </button>
        </div>

        {/* Alerts */}
        {successMsg && (
          <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-sm flex items-center justify-between">
            <span className="flex items-center gap-2">
              <span>✅</span>
              <span>{successMsg}</span>
            </span>
            <button onClick={() => setSuccessMsg('')} className="text-emerald-600 hover:text-emerald-800">✕</button>
          </div>
        )}

        {error && (
          <div className="p-3.5 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm flex items-center justify-between">
            <span className="flex items-center gap-2">
              <span>⚠️</span>
              <span>{error}</span>
            </span>
            <button onClick={() => setError('')} className="text-red-500 hover:text-red-700">✕</button>
          </div>
        )}

        {/* Filter Bar */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col md:flex-row gap-3 items-center justify-between">
          <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 w-full md:w-72">
            <input
              type="text"
              placeholder="Search student or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
            <button
              type="submit"
              className="px-3 py-2 bg-slate-800 hover:bg-slate-900 text-white text-xs sm:text-sm font-medium rounded-lg"
            >
              Go
            </button>
          </form>

          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
              className="px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-teal-500 bg-white"
            >
              <option value="">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="rejected">Rejected</option>
              <option value="cancelled">Cancelled</option>
              <option value="no_show">No Show</option>
            </select>

            <select
              value={severityFilter}
              onChange={(e) => { setSeverityFilter(e.target.value); setPage(1); }}
              className="px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-teal-500 bg-white"
            >
              <option value="">All Severities</option>
              <option value="mild">Mild (0-4)</option>
              <option value="moderate">Moderate (5-9)</option>
              <option value="high">High (10-14)</option>
              <option value="severe">Severe (15-20)</option>
            </select>

            <select
              value={urgentFilter}
              onChange={(e) => { setUrgentFilter(e.target.value); setPage(1); }}
              className="px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-teal-500 bg-white"
            >
              <option value="">All Urgencies</option>
              <option value="urgent">Urgent Only 🚨</option>
            </select>

            <select
              value={counselorFilter}
              onChange={(e) => { setCounselorFilter(e.target.value); setPage(1); }}
              className="px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-teal-500 bg-white"
            >
              <option value="">All Counselors</option>
              {counselors.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name}
                </option>
              ))}
            </select>

            {(search || statusFilter || severityFilter || urgentFilter || counselorFilter) && (
              <button
                onClick={() => {
                  setSearch('');
                  setStatusFilter('');
                  setSeverityFilter('');
                  setUrgentFilter('');
                  setCounselorFilter('');
                  setPage(1);
                }}
                className="px-2 py-1.5 text-xs text-rose-600 hover:text-rose-800 font-medium"
              >
                Reset
              </button>
            )}
          </div>
        </div>

        {/* Appointments Table */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Appointments ({totalCount})
            </span>
          </div>

          {loading ? (
            <div className="py-16 text-center text-slate-400 text-sm">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600 mx-auto mb-2"></div>
              Loading appointments...
            </div>
          ) : appointments.length === 0 ? (
            <div className="py-16 text-center text-slate-400 text-sm">
              No appointments found matching your criteria.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">Student</th>
                    <th className="py-3 px-4">Date & Slot</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Counselor</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Severity</th>
                    <th className="py-3 px-4">Feedback</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {appointments.map((apt) => (
                    <tr key={apt._id} className="hover:bg-slate-50/70 transition">
                      <td className="py-3 px-4">
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-semibold text-slate-900">{apt.name}</span>
                            {apt.isUrgent && (
                              <span className="text-[10px] px-1.5 py-0.5 rounded bg-rose-100 text-rose-700 font-bold uppercase animate-pulse">
                                Urgent
                              </span>
                            )}
                          </div>
                          <span className="text-xs text-slate-400 block">{apt.email}</span>
                          {apt.enrollmentNo && (
                            <span className="text-[11px] text-teal-600 block font-mono">
                              #{apt.enrollmentNo} · {apt.branch}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-medium text-slate-800 block">{apt.date}</span>
                        <span className="text-xs text-slate-500 font-mono">{apt.timeSlot}</span>
                      </td>
                      <td className="py-3 px-4 text-slate-700 font-medium">
                        {apt.issueCategory}
                      </td>
                      <td className="py-3 px-4 text-slate-600">
                        {apt.counselor?.name || <span className="text-slate-400 italic">Unassigned</span>}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider ${
                            apt.status === 'completed'
                              ? 'bg-emerald-100 text-emerald-800'
                              : apt.status === 'in_progress'
                              ? 'bg-purple-100 text-purple-800'
                              : apt.status === 'approved'
                              ? 'bg-blue-100 text-blue-800'
                              : apt.status === 'rejected'
                              ? 'bg-rose-100 text-rose-800'
                              : apt.status === 'cancelled'
                              ? 'bg-slate-200 text-slate-700'
                              : apt.status === 'no_show'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}
                        >
                          {apt.status}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider ${
                            apt.severity === 'severe'
                              ? 'bg-rose-100 text-rose-800'
                              : apt.severity === 'high'
                              ? 'bg-orange-100 text-orange-800'
                              : apt.severity === 'moderate'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}
                        >
                          {apt.severity || 'mild'}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        {apt.feedback?.rating ? (
                          <div className="flex items-center gap-1">
                            <span className="text-yellow-500 font-bold">★ {apt.feedback.rating}</span>
                            {apt.feedback.isHidden && (
                              <span className="text-[10px] px-1 rounded bg-slate-200 text-slate-600">
                                Hidden
                              </span>
                            )}
                            <button
                              onClick={() => openFeedbackModal(apt)}
                              className="text-[11px] text-teal-600 hover:underline ml-1"
                            >
                              Mod
                            </button>
                          </div>
                        ) : (
                          <span className="text-slate-400 text-xs">—</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => {
                              setSelectedApt(apt);
                              setShowDetailModal(true);
                            }}
                            className="px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs"
                            title="View all details"
                          >
                            👁️
                          </button>
                          <button
                            onClick={() => openOverrideModal(apt)}
                            className="px-2 py-1 rounded bg-teal-50 hover:bg-teal-100 text-teal-700 text-xs font-medium"
                            title="Override status"
                          >
                            ⚡ Override
                          </button>
                          <button
                            onClick={() => openReassignModal(apt)}
                            className="px-2 py-1 rounded bg-purple-50 hover:bg-purple-100 text-purple-700 text-xs font-medium"
                            title="Reassign counselor"
                          >
                            👤 Assign
                          </button>
                          <button
                            onClick={() => handleDeleteAppointment(apt)}
                            className="px-2 py-1 rounded bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-medium"
                            title="Delete appointment"
                          >
                            🗑️
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="p-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
              <button
                disabled={page <= 1}
                onClick={() => setPage(page - 1)}
                className="px-3 py-1.5 border border-slate-300 rounded disabled:opacity-40"
              >
                ← Previous
              </button>
              <span>
                Page {page} of {totalPages}
              </span>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage(page + 1)}
                className="px-3 py-1.5 border border-slate-300 rounded disabled:opacity-40"
              >
                Next →
              </button>
            </div>
          )}
        </div>

        {/* Modal 1: Override Status */}
        {showOverrideModal && selectedApt && (
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
              <div className="flex items-center justify-between border-b pb-3">
                <h3 className="font-bold text-slate-900 text-base">
                  Override Appointment Status
                </h3>
                <button onClick={() => setShowOverrideModal(false)} className="text-slate-400 hover:text-slate-600">✕</button>
              </div>

              <div className="text-xs text-slate-600 bg-slate-50 p-3 rounded-lg border">
                <p><strong>Student:</strong> {selectedApt.name} ({selectedApt.email})</p>
                <p><strong>Current Status:</strong> <span className="font-semibold uppercase text-teal-700">{selectedApt.status}</span></p>
                <p><strong>Date & Slot:</strong> {selectedApt.date} · {selectedApt.timeSlot}</p>
              </div>

              <form onSubmit={handleOverrideSubmit} className="space-y-3 text-xs sm:text-sm">
                <div>
                  <label className="block text-slate-700 font-medium mb-1">New Status *</label>
                  <select
                    value={overrideForm.status}
                    onChange={(e) => setOverrideForm({ ...overrideForm, status: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-teal-500 bg-white"
                  >
                    <option value="pending">pending</option>
                    <option value="approved">approved</option>
                    <option value="in_progress">in_progress</option>
                    <option value="completed">completed</option>
                    <option value="rejected">rejected</option>
                    <option value="cancelled">cancelled</option>
                    <option value="no_show">no_show</option>
                  </select>
                </div>

                {overrideForm.status === 'rejected' && (
                  <div>
                    <label className="block text-slate-700 font-medium mb-1">Rejection Reason</label>
                    <input
                      type="text"
                      placeholder="e.g. Rescheduled per counselor emergency"
                      value={overrideForm.rejectionReason}
                      onChange={(e) => setOverrideForm({ ...overrideForm, rejectionReason: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-slate-700 font-medium mb-1">
                    Administrative Reason * (Logged for Audit Compliance)
                  </label>
                  <textarea
                    required
                    rows="3"
                    placeholder="Provide a justification for overriding the state machine..."
                    value={overrideForm.reason}
                    onChange={(e) => setOverrideForm({ ...overrideForm, reason: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-teal-500"
                  />
                </div>

                <div className="pt-3 border-t flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowOverrideModal(false)}
                    className="px-4 py-2 border rounded-lg text-slate-600"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={actionLoading}
                    className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-medium disabled:opacity-50"
                  >
                    {actionLoading ? 'Saving...' : 'Apply Override'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal 2: Reassign Counselor */}
        {showReassignModal && selectedApt && (
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
              <div className="flex items-center justify-between border-b pb-3">
                <h3 className="font-bold text-slate-900 text-base">Reassign Counselor</h3>
                <button onClick={() => setShowReassignModal(false)} className="text-slate-400 hover:text-slate-600">✕</button>
              </div>

              <form onSubmit={handleReassignSubmit} className="space-y-3 text-xs sm:text-sm">
                <div>
                  <label className="block text-slate-700 font-medium mb-1">Select Counselor</label>
                  <select
                    value={reassignForm.counselorId}
                    onChange={(e) => setReassignForm({ ...reassignForm, counselorId: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-teal-500 bg-white"
                  >
                    <option value="">Unassigned (Remove Counselor)</option>
                    {counselors.map((c) => (
                      <option key={c._id} value={c._id}>
                        {c.name} ({c.email})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-medium mb-1">Admin Reason</label>
                  <input
                    type="text"
                    placeholder="e.g. Caseload rebalancing"
                    value={reassignForm.reason}
                    onChange={(e) => setReassignForm({ ...reassignForm, reason: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>

                <div className="pt-3 border-t flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowReassignModal(false)}
                    className="px-4 py-2 border rounded-lg text-slate-600"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={actionLoading}
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium disabled:opacity-50"
                  >
                    {actionLoading ? 'Assigning...' : 'Confirm Assignment'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal 3: Moderate Feedback */}
        {showFeedbackModal && selectedApt && (
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
              <div className="flex items-center justify-between border-b pb-3">
                <h3 className="font-bold text-slate-900 text-base">Moderate Student Feedback</h3>
                <button onClick={() => setShowFeedbackModal(false)} className="text-slate-400 hover:text-slate-600">✕</button>
              </div>

              <div className="bg-slate-50 p-3 rounded-lg border text-xs space-y-1">
                <p><strong>Rating:</strong> ★ {selectedApt.feedback?.rating} / 5</p>
                <p><strong>Comment:</strong> "{selectedApt.feedback?.comment || 'No comment provided'}"</p>
                <p><strong>Was Helpful:</strong> {selectedApt.feedback?.wasHelpful ? 'Yes' : 'No'}</p>
              </div>

              <form onSubmit={handleFeedbackSubmit} className="space-y-3 text-xs sm:text-sm">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={feedbackForm.isHidden}
                    onChange={(e) => setFeedbackForm({ ...feedbackForm, isHidden: e.target.checked })}
                    className="rounded text-teal-600 focus:ring-teal-500"
                  />
                  <span className="text-slate-800 font-medium">Hide feedback from public reports</span>
                </label>

                <div>
                  <label className="block text-slate-700 font-medium mb-1">Moderation Reason</label>
                  <input
                    type="text"
                    placeholder="e.g. Contains profanity or irrelevant complaint"
                    value={feedbackForm.reason}
                    onChange={(e) => setFeedbackForm({ ...feedbackForm, reason: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>

                <div className="pt-3 border-t flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowFeedbackModal(false)}
                    className="px-4 py-2 border rounded-lg text-slate-600"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={actionLoading}
                    className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-medium disabled:opacity-50"
                  >
                    Save Moderation
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal 4: Appointment Details */}
        {showDetailModal && selectedApt && (
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 max-h-[85vh] overflow-y-auto">
              <div className="flex items-center justify-between border-b pb-3">
                <h3 className="font-bold text-slate-900 text-base">
                  Appointment Details #{selectedApt._id.slice(-6)}
                </h3>
                <button onClick={() => setShowDetailModal(false)} className="text-slate-400 hover:text-slate-600">✕</button>
              </div>

              <div className="space-y-3 text-xs sm:text-sm">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-slate-400 text-xs block">Student</span>
                    <span className="font-semibold text-slate-900">{selectedApt.name}</span>
                    <span className="text-xs text-slate-500 block">{selectedApt.email}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-xs block">Assigned Counselor</span>
                    <span className="font-semibold text-slate-900">
                      {selectedApt.counselor?.name || 'Unassigned'}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 p-2.5 bg-slate-50 rounded-lg">
                  <div>
                    <span className="text-slate-400 text-[11px] block">Date</span>
                    <span className="font-semibold text-slate-800">{selectedApt.date}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[11px] block">Slot</span>
                    <span className="font-semibold text-slate-800 font-mono">{selectedApt.timeSlot}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[11px] block">Status</span>
                    <span className="font-semibold text-teal-700 uppercase">{selectedApt.status}</span>
                  </div>
                </div>

                <div>
                  <span className="text-slate-400 text-xs block">Screening Severity & Answers</span>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="px-2 py-0.5 rounded text-xs font-bold uppercase bg-rose-100 text-rose-800">
                      {selectedApt.severity || 'Mild'}
                    </span>
                    <span className="text-slate-600 text-xs">
                      Answers: [{selectedApt.screeningAnswers?.join(', ') || 'N/A'}]
                    </span>
                  </div>
                </div>

                {selectedApt.counselorNotes && (
                  <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
                    <span className="text-purple-800 font-semibold text-xs block mb-1">
                      🔒 Counselor Session Notes (Admin View)
                    </span>
                    <p className="text-xs text-slate-700">
                      <strong>Summary:</strong> {selectedApt.counselorNotes.summary || 'None'}
                    </p>
                    <p className="text-xs text-slate-700 mt-1">
                      <strong>Advice:</strong> {selectedApt.counselorNotes.advice || 'None'}
                    </p>
                  </div>
                )}

                {selectedApt.meetingLink && (
                  <div>
                    <span className="text-slate-400 text-xs block">Online Meeting Link</span>
                    <a
                      href={selectedApt.meetingLink}
                      target="_blank"
                      rel="noreferrer"
                      className="text-teal-600 hover:underline font-mono text-xs break-all"
                    >
                      {selectedApt.meetingLink}
                    </a>
                  </div>
                )}
              </div>

              <div className="pt-3 border-t text-right">
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="px-4 py-1.5 bg-slate-800 text-white rounded-lg text-xs"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminAppointments;
