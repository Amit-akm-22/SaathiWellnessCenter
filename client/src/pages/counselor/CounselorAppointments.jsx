import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { counselorAPI, slotAPI } from '../../api';
import CounselorNav from '../../components/CounselorNav';
import SessionNotesModal from '../../components/SessionNotesModal';

const SEVERITY_COLORS = {
  Mild: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  Moderate: 'bg-amber-50 text-amber-700 border-amber-200',
  Severe: 'bg-rose-50 text-rose-700 border-rose-200 font-bold',
};

const STATUS_COLORS = {
  pending: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  approved: 'bg-teal-50 text-teal-700 border-teal-200',
  in_progress: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  completed: 'bg-blue-50 text-blue-700 border-blue-200',
  cancelled: 'bg-gray-100 text-gray-500 border-gray-200',
  rejected: 'bg-red-50 text-red-600 border-red-200',
  rescheduled: 'bg-purple-50 text-purple-700 border-purple-200',
  no_show: 'bg-slate-100 text-slate-600 border-slate-200',
};

const QUICK_REASONS = [
  'Counselor unavailable due to mandatory administrative duty',
  'Please choose another slot; this timing has unexpected conflict',
  'Referred to university medical centre / psychiatric services',
  'Scheduled outside active counseling consultation hours',
];

const CounselorAppointments = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Filter state
  const [status, setStatus] = useState(searchParams.get('status') || 'all');
  const [severity, setSeverity] = useState(searchParams.get('severity') || 'all');
  const [issueCategory, setIssueCategory] = useState(searchParams.get('issueCategory') || 'all');
  const [branch, setBranch] = useState(searchParams.get('branch') || 'all');
  const [year, setYear] = useState(searchParams.get('year') || 'all');
  const [gender, setGender] = useState(searchParams.get('gender') || 'all');
  const [isUrgent, setIsUrgent] = useState(searchParams.get('isUrgent') === 'true');
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [sortBy, setSortBy] = useState(searchParams.get('sortBy') || 'priority');
  const [page, setPage] = useState(parseInt(searchParams.get('page'), 10) || 1);

  // Drawer & Modal States
  const [selectedAptId, setSelectedAptId] = useState(null);
  const [drawerData, setDrawerData] = useState(null);
  const [drawerLoading, setDrawerLoading] = useState(false);

  // Reject Modal
  const [rejectModalApt, setRejectModalApt] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [rejectSubmitting, setRejectSubmitting] = useState(false);

  // Reschedule Modal
  const [rescheduleModalApt, setRescheduleModalApt] = useState(null);
  const [rescheduleDate, setRescheduleDate] = useState('');
  const [rescheduleSlot, setRescheduleSlot] = useState('');
  const [rescheduleReason, setRescheduleReason] = useState('');
  const [availableSlots, setAvailableSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [rescheduleSubmitting, setRescheduleSubmitting] = useState(false);

  // Notes Modal
  const [notesModalApt, setNotesModalApt] = useState(null);

  useEffect(() => {
    fetchAppointments();
  }, [status, severity, issueCategory, branch, year, gender, isUrgent, search, sortBy, page]);

  const fetchAppointments = async () => {
    setLoading(true);
    setError('');
    try {
      const params = {
        status: status !== 'all' ? status : undefined,
        severity: severity !== 'all' ? severity : undefined,
        issueCategory: issueCategory !== 'all' ? issueCategory : undefined,
        branch: branch !== 'all' ? branch : undefined,
        year: year !== 'all' ? year : undefined,
        gender: gender !== 'all' ? gender : undefined,
        isUrgent: isUrgent ? 'true' : undefined,
        search: search.trim() || undefined,
        sortBy,
        page,
        limit: 12,
      };

      const res = await counselorAPI.getAppointments(params);
      setAppointments(res.data.data.appointments);
      setTotalPages(res.data.data.totalPages);
      setTotalCount(res.data.data.total);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch appointments.');
    } finally {
      setLoading(false);
    }
  };

  const openDrawer = async (aptId) => {
    setSelectedAptId(aptId);
    setDrawerLoading(true);
    try {
      const res = await counselorAPI.getAppointment(aptId);
      setDrawerData(res.data.data);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to load details.');
    } finally {
      setDrawerLoading(false);
    }
  };

  const closeDrawer = () => {
    setSelectedAptId(null);
    setDrawerData(null);
  };

  const handleApprove = async (apt) => {
    if (!window.confirm(`Approve appointment for ${apt.name} on ${new Date(apt.date).toLocaleDateString()} at ${apt.timeSlot}?`)) return;
    try {
      await counselorAPI.approveAppointment(apt._id);
      fetchAppointments();
      if (selectedAptId === apt._id) openDrawer(apt._id);
    } catch (err) {
      alert(err.response?.data?.message || 'Approval failed.');
    }
  };

  const handleUrgentApprove = async (apt) => {
    if (!window.confirm(`Handle Urgent: Approve immediately with Online Meeting for ${apt.name}?`)) return;
    try {
      await counselorAPI.handleUrgent(apt._id);
      fetchAppointments();
      if (selectedAptId === apt._id) openDrawer(apt._id);
    } catch (err) {
      alert(err.response?.data?.message || 'Urgent approval failed.');
    }
  };

  const submitReject = async (e) => {
    e.preventDefault();
    if (!rejectReason.trim() || rejectReason.trim().length < 10) {
      alert('Please provide a rejection reason of at least 10 characters.');
      return;
    }
    setRejectSubmitting(true);
    try {
      await counselorAPI.rejectAppointment(rejectModalApt._id, { reason: rejectReason.trim() });
      setRejectModalApt(null);
      setRejectReason('');
      fetchAppointments();
      if (selectedAptId === rejectModalApt._id) openDrawer(rejectModalApt._id);
    } catch (err) {
      alert(err.response?.data?.message || 'Rejection failed.');
    } finally {
      setRejectSubmitting(false);
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
      alert('New date, slot, and reason are required.');
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
      fetchAppointments();
      if (selectedAptId === rescheduleModalApt._id) openDrawer(rescheduleModalApt._id);
    } catch (err) {
      alert(err.response?.data?.message || 'Rescheduling failed.');
    } finally {
      setRescheduleSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/50 pb-20">
      <CounselorNav />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
              Appointment Requests & Consultations
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
              Review screening results, approve or reject requests, and view student history. ({totalCount} found)
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="text-xs bg-white border border-gray-200 rounded-lg px-2.5 py-1.5 font-medium outline-none focus:ring-2 focus:ring-teal-500"
            >
              <option value="priority">Priority (Urgent & Severe First)</option>
              <option value="date_asc">Earliest Date</option>
              <option value="date_desc">Latest Date</option>
              <option value="created_desc">Recently Requested</option>
            </select>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="bg-white rounded-2xl border border-gray-100 p-4 sm:p-5 shadow-xs space-y-3">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-2.5">
            <div>
              <label className="block text-[11px] font-semibold text-gray-500 uppercase mb-1">Status</label>
              <select
                value={status}
                onChange={(e) => { setStatus(e.target.value); setPage(1); }}
                className="w-full text-xs border border-gray-200 rounded-lg px-2 py-1.5 bg-white outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value="all">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="rescheduled">Rescheduled</option>
                <option value="rejected">Rejected</option>
                <option value="no_show">No-Show</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-gray-500 uppercase mb-1">Severity</label>
              <select
                value={severity}
                onChange={(e) => { setSeverity(e.target.value); setPage(1); }}
                className="w-full text-xs border border-gray-200 rounded-lg px-2 py-1.5 bg-white outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value="all">All Severities</option>
                <option value="Severe">Severe (Red)</option>
                <option value="Moderate">Moderate (Amber)</option>
                <option value="Mild">Mild (Green)</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-gray-500 uppercase mb-1">Category</label>
              <select
                value={issueCategory}
                onChange={(e) => { setIssueCategory(e.target.value); setPage(1); }}
                className="w-full text-xs border border-gray-200 rounded-lg px-2 py-1.5 bg-white outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value="all">All Categories</option>
                <option value="Academic Stress">Academic Stress</option>
                <option value="Anxiety / Panic">Anxiety / Panic</option>
                <option value="Depression / Low Mood">Depression / Low Mood</option>
                <option value="Relationship / Heartbreak">Relationship / Heartbreak</option>
                <option value="Loneliness / Social Issues">Loneliness / Social Issues</option>
                <option value="Career Confusion">Career Confusion</option>
                <option value="Family Issues">Family Issues</option>
                <option value="Anger / Mood Swings">Anger / Mood Swings</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-gray-500 uppercase mb-1">Branch</label>
              <select
                value={branch}
                onChange={(e) => { setBranch(e.target.value); setPage(1); }}
                className="w-full text-xs border border-gray-200 rounded-lg px-2 py-1.5 bg-white outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value="all">All Branches</option>
                <option value="CSE">CSE</option>
                <option value="IT">IT</option>
                <option value="ECE">ECE</option>
                <option value="EE">EE</option>
                <option value="Mechanical">Mechanical</option>
                <option value="Civil">Civil</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-gray-500 uppercase mb-1">Year</label>
              <select
                value={year}
                onChange={(e) => { setYear(e.target.value); setPage(1); }}
                className="w-full text-xs border border-gray-200 rounded-lg px-2 py-1.5 bg-white outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value="all">All Years</option>
                <option value="1st">1st Year</option>
                <option value="2nd">2nd Year</option>
                <option value="3rd">3rd Year</option>
                <option value="4th">4th Year</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-gray-500 uppercase mb-1">Gender</label>
              <select
                value={gender}
                onChange={(e) => { setGender(e.target.value); setPage(1); }}
                className="w-full text-xs border border-gray-200 rounded-lg px-2 py-1.5 bg-white outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value="all">All Genders</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="flex items-end pb-1.5">
              <label className="flex items-center gap-1.5 text-xs font-semibold text-rose-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isUrgent}
                  onChange={(e) => { setIsUrgent(e.target.checked); setPage(1); }}
                  className="rounded text-rose-600 focus:ring-rose-500 h-4 w-4"
                />
                Urgent Only 🚨
              </label>
            </div>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-gray-100">
            <div className="relative flex-1 max-w-md">
              <input
                type="text"
                placeholder="Search by student name, enrollment no, email..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                className="w-full pl-8 pr-3 py-1.5 text-xs border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-teal-500"
              />
              <span className="absolute left-2.5 top-2 text-gray-400 text-xs">🔍</span>
            </div>

            {(status !== 'all' || severity !== 'all' || issueCategory !== 'all' || branch !== 'all' || year !== 'all' || gender !== 'all' || isUrgent || search) && (
              <button
                onClick={() => {
                  setStatus('all');
                  setSeverity('all');
                  setIssueCategory('all');
                  setBranch('all');
                  setYear('all');
                  setGender('all');
                  setIsUrgent(false);
                  setSearch('');
                  setPage(1);
                }}
                className="text-xs text-teal-600 hover:text-teal-800 font-medium"
              >
                Clear Filters
              </button>
            )}
          </div>
        </div>

        {error && (
          <div className="p-4 bg-red-50 text-red-700 rounded-xl text-sm border border-red-200">
            {error}
          </div>
        )}

        {/* Appointments Table / Cards */}
        {loading ? (
          <div className="py-20 text-center">
            <div className="animate-spin rounded-full h-9 w-9 border-b-2 border-teal-600 mx-auto mb-2"></div>
            <p className="text-gray-400 text-xs">Loading appointments...</p>
          </div>
        ) : appointments.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-gray-100 shadow-xs">
            <p className="text-4xl mb-2">📋</p>
            <h3 className="font-semibold text-gray-800 text-sm">No matching appointments found</h3>
            <p className="text-xs text-gray-400 mt-1">Try relaxing or clearing your filter criteria.</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-gray-100 text-gray-500 uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="py-3 px-4">Student</th>
                    <th className="py-3 px-3">Date & Slot</th>
                    <th className="py-3 px-3">Category</th>
                    <th className="py-3 px-3">Severity</th>
                    <th className="py-3 px-3">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {appointments.map((apt) => (
                    <tr
                      key={apt._id}
                      onClick={() => openDrawer(apt._id)}
                      className="hover:bg-teal-50/40 cursor-pointer transition-colors"
                    >
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-gray-900">{apt.name}</span>
                          {(apt.isUrgent || apt.urgentFlag) && (
                            <span className="text-[10px] bg-red-100 text-red-700 px-1.5 py-0.5 rounded font-bold">
                              URGENT
                            </span>
                          )}
                        </div>
                        <p className="text-gray-500 text-[11px] mt-0.5">
                          {apt.enrollmentNo} · {apt.branch} ({apt.year} Yr) · {apt.gender}
                        </p>
                      </td>

                      <td className="py-3.5 px-3">
                        <p className="font-medium text-gray-800">
                          {new Date(apt.date).toLocaleDateString('en-IN', {
                            month: 'short', day: 'numeric', year: 'numeric'
                          })}
                        </p>
                        <p className="text-gray-500 text-[11px]">{apt.timeSlot}</p>
                      </td>

                      <td className="py-3.5 px-3">
                        <span className="font-medium text-gray-800">{apt.issueCategory}</span>
                        {apt.customCategory && (
                          <p className="text-[11px] text-gray-500 truncate max-w-[140px]">
                            {apt.customCategory}
                          </p>
                        )}
                      </td>

                      <td className="py-3.5 px-3">
                        <span className={`inline-block px-2 py-0.5 rounded-full text-[11px] border ${SEVERITY_COLORS[apt.severity] || 'bg-gray-100 text-gray-600'}`}>
                          {apt.severity || 'N/A'}
                        </span>
                      </td>

                      <td className="py-3.5 px-3">
                        <span className={`inline-block px-2 py-0.5 rounded-full text-[11px] font-semibold border ${STATUS_COLORS[apt.status] || 'bg-gray-100'}`}>
                          {apt.status.toUpperCase()}
                        </span>
                        {apt.meetingMode === 'online' && (
                          <span className="block text-[10px] text-blue-600 mt-0.5 font-medium">
                            🌐 Online Meet
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1.5">
                          {apt.status === 'pending' && (
                            <>
                              <button
                                onClick={() => handleApprove(apt)}
                                className="px-2.5 py-1 bg-teal-600 hover:bg-teal-700 text-white font-medium rounded-lg text-xs"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => { setRejectModalApt(apt); setRejectReason(''); }}
                                className="px-2.5 py-1 bg-red-50 hover:bg-red-100 text-red-600 font-medium rounded-lg text-xs"
                              >
                                Reject
                              </button>
                            </>
                          )}

                          {(apt.isUrgent || apt.urgentFlag) && apt.status === 'pending' && (
                            <button
                              onClick={() => handleUrgentApprove(apt)}
                              className="px-2 py-1 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-lg text-[11px]"
                            >
                              ⚡ Urgent
                            </button>
                          )}

                          {['approved', 'rescheduled'].includes(apt.status) && (
                            <button
                              onClick={() => {
                                setRescheduleModalApt(apt);
                                setRescheduleDate('');
                                setRescheduleSlot('');
                                setRescheduleReason('');
                              }}
                              className="px-2.5 py-1 bg-purple-50 hover:bg-purple-100 text-purple-700 font-medium rounded-lg text-xs"
                            >
                              Reschedule
                            </button>
                          )}

                          {['in_progress', 'completed'].includes(apt.status) && (
                            <button
                              onClick={() => setNotesModalApt(apt)}
                              className="px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-medium rounded-lg text-xs"
                            >
                              📝 Notes
                            </button>
                          )}

                          <button
                            onClick={() => openDrawer(apt._id)}
                            className="px-2 py-1 text-gray-500 hover:text-gray-800 rounded-lg text-xs"
                          >
                            View →
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="p-4 border-t border-gray-100 flex items-center justify-between">
                <span className="text-xs text-gray-500">
                  Page {page} of {totalPages} ({totalCount} total)
                </span>
                <div className="flex items-center gap-2">
                  <button
                    disabled={page <= 1}
                    onClick={() => setPage(page - 1)}
                    className="px-3 py-1 text-xs border border-gray-200 rounded-lg disabled:opacity-40"
                  >
                    Previous
                  </button>
                  <button
                    disabled={page >= totalPages}
                    onClick={() => setPage(page + 1)}
                    className="px-3 py-1 text-xs border border-gray-200 rounded-lg disabled:opacity-40"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* DETAIL DRAWER */}
      {selectedAptId && (
        <div className="fixed inset-0 z-50 overflow-hidden bg-black/40 backdrop-blur-xs flex justify-end">
          <div className="w-full max-w-xl bg-white h-full shadow-2xl overflow-y-auto flex flex-col animate-in slide-in-from-right duration-200">
            {drawerLoading || !drawerData ? (
              <div className="flex-1 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
              </div>
            ) : (
              <>
                {/* Drawer Header */}
                <div className="p-6 border-b border-gray-100 bg-slate-50 flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-lg font-bold text-gray-900">
                        {drawerData.appointment.name}
                      </h2>
                      <span className={`text-xs px-2.5 py-0.5 rounded-full border ${STATUS_COLORS[drawerData.appointment.status]}`}>
                        {drawerData.appointment.status.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {drawerData.appointment.branch} · {drawerData.appointment.year} Year · {drawerData.appointment.gender} · {drawerData.appointment.enrollmentNo}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      Email: {drawerData.appointment.email} · Phone: {drawerData.appointment.studentId?.phone || 'Not provided'}
                    </p>
                  </div>
                  <button
                    onClick={closeDrawer}
                    className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-200"
                  >
                    ✕
                  </button>
                </div>

                <div className="p-6 space-y-6 flex-1">
                  {/* Appointment info */}
                  <div className="bg-slate-50 p-4 rounded-xl space-y-2 border border-slate-100 text-xs">
                    <div className="flex justify-between">
                      <span className="text-gray-500 font-medium">Session Slot:</span>
                      <span className="font-semibold text-gray-800">
                        {new Date(drawerData.appointment.date).toLocaleDateString()} at {drawerData.appointment.timeSlot}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500 font-medium">Issue Category:</span>
                      <span className="font-semibold text-gray-800">
                        {drawerData.appointment.issueCategory}
                        {drawerData.appointment.customCategory ? ` (${drawerData.appointment.customCategory})` : ''}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500 font-medium">Screening Severity:</span>
                      <span className={`font-semibold px-2 py-0.5 rounded-full border ${SEVERITY_COLORS[drawerData.appointment.severity] || 'bg-gray-100'}`}>
                        {drawerData.appointment.severity || 'Unspecified'} (Score: {drawerData.appointment.screeningScore}/12)
                      </span>
                    </div>
                    {drawerData.appointment.meetingMode === 'online' && (
                      <div className="flex justify-between items-center pt-1 border-t border-slate-200/60">
                        <span className="text-blue-600 font-semibold">Online Meeting:</span>
                        <a
                          href={drawerData.appointment.meetingLink}
                          target="_blank"
                          rel="noreferrer"
                          className="text-blue-600 underline font-medium"
                        >
                          Join Meeting 🔗
                        </a>
                      </div>
                    )}
                  </div>

                  {/* Student Description */}
                  {drawerData.appointment.description && (
                    <div>
                      <h4 className="text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                        Student Description
                      </h4>
                      <p className="text-xs text-gray-700 bg-white p-3 rounded-xl border border-gray-200 italic">
                        "{drawerData.appointment.description}"
                      </p>
                    </div>
                  )}

                  {/* Full Screening Breakdown */}
                  <div>
                    <h4 className="text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2 flex items-center justify-between">
                      <span>Full Screening Assessment (5 Questions)</span>
                      <span className="text-[11px] text-gray-400 font-normal">Score: {drawerData.appointment.screeningScore}</span>
                    </h4>
                    <div className="space-y-2">
                      {drawerData.formattedScreening.map((item, idx) => (
                        <div
                          key={idx}
                          className={`p-3 rounded-xl text-xs border ${
                            idx === 4 && item.score > 0
                              ? 'bg-rose-50 border-rose-200 text-rose-900 font-semibold'
                              : 'bg-white border-gray-100 text-gray-800'
                          }`}
                        >
                          <div className="flex justify-between items-start gap-2">
                            <span>{idx + 1}. {item.question}</span>
                            <span className="font-bold shrink-0">{item.score} ({item.label})</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Current Session Notes */}
                  {drawerData.appointment.sessionNotes?.summary && (
                    <div className="border-t border-gray-100 pt-4">
                      <div className="flex justify-between items-center mb-2">
                        <h4 className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
                          Session Notes
                        </h4>
                        <button
                          onClick={() => setNotesModalApt(drawerData.appointment)}
                          className="text-xs text-teal-600 hover:text-teal-800 font-medium"
                        >
                          Edit Notes ✏️
                        </button>
                      </div>
                      <div className="bg-teal-50/50 border border-teal-100 p-3 rounded-xl space-y-2 text-xs">
                        <p><strong className="text-teal-900">Summary:</strong> {drawerData.appointment.sessionNotes.summary}</p>
                        <p><strong className="text-teal-900">Advice:</strong> {drawerData.appointment.sessionNotes.advice}</p>
                        {drawerData.appointment.sessionNotes.forwarded && (
                          <p className="text-amber-800 bg-amber-50 p-2 rounded-lg border border-amber-200">
                            <strong>Forwarded to {drawerData.appointment.sessionNotes.forwardedTo}:</strong> {drawerData.appointment.sessionNotes.forwardedReason}
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Previous Appointment History with Notes */}
                  <div className="border-t border-gray-100 pt-4">
                    <h4 className="text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
                      Previous Counseling History ({drawerData.studentHistory.length})
                    </h4>
                    {drawerData.studentHistory.length === 0 ? (
                      <p className="text-xs text-gray-400 italic">No earlier appointments for this student.</p>
                    ) : (
                      <div className="space-y-3">
                        {drawerData.studentHistory.map((hist) => (
                          <div key={hist._id} className="p-3 bg-slate-50 border border-gray-100 rounded-xl text-xs space-y-1">
                            <div className="flex justify-between items-center">
                              <span className="font-semibold text-gray-800">
                                {new Date(hist.date).toLocaleDateString()} · {hist.timeSlot}
                              </span>
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${STATUS_COLORS[hist.status]}`}>
                                {hist.status.toUpperCase()}
                              </span>
                            </div>
                            <p className="text-gray-600">{hist.issueCategory}</p>
                            {hist.sessionNotes?.summary && (
                              <p className="text-gray-500 text-[11px] bg-white p-2 rounded-md border border-gray-100">
                                <strong>Notes:</strong> {hist.sessionNotes.summary}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Drawer Footer Actions */}
                <div className="p-4 border-t border-gray-100 bg-slate-50 flex items-center justify-end gap-2">
                  {drawerData.appointment.status === 'pending' && (
                    <>
                      <button
                        onClick={() => handleApprove(drawerData.appointment)}
                        className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white font-medium rounded-xl text-xs shadow-xs"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => { setRejectModalApt(drawerData.appointment); setRejectReason(''); }}
                        className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 font-medium rounded-xl text-xs"
                      >
                        Reject
                      </button>
                    </>
                  )}
                  {['approved', 'rescheduled'].includes(drawerData.appointment.status) && (
                    <button
                      onClick={() => {
                        setRescheduleModalApt(drawerData.appointment);
                        setRescheduleDate('');
                        setRescheduleSlot('');
                        setRescheduleReason('');
                      }}
                      className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-xl text-xs"
                    >
                      Reschedule
                    </button>
                  )}
                  {['in_progress', 'completed'].includes(drawerData.appointment.status) && (
                    <button
                      onClick={() => setNotesModalApt(drawerData.appointment)}
                      className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white font-medium rounded-xl text-xs"
                    >
                      📝 Edit Session Notes
                    </button>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* REJECT MODAL */}
      {rejectModalApt && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-100 space-y-4">
            <h3 className="font-bold text-gray-900 text-base">
              Reject Appointment for {rejectModalApt.name}
            </h3>
            <p className="text-xs text-gray-500">
              A clear reason is required (min 10 chars). The slot will be freed atomically and the student will be notified.
            </p>

            <div className="space-y-1.5">
              <label className="block text-[11px] font-semibold text-gray-600 uppercase">Quick-Pick Reasons</label>
              <div className="space-y-1">
                {QUICK_REASONS.map((r, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setRejectReason(r)}
                    className="block w-full text-left text-xs p-2 rounded-lg bg-slate-50 hover:bg-teal-50 border border-slate-100 text-gray-700 transition-colors"
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>

            <form onSubmit={submitReject} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Reason for Rejection <span className="text-red-500">*</span>
                </label>
                <textarea
                  required
                  rows={3}
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="Explain why this slot cannot be fulfilled..."
                  className="w-full px-3 py-2 text-xs border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setRejectModalApt(null)}
                  className="px-3 py-1.5 text-xs text-gray-600 hover:bg-gray-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={rejectSubmitting || rejectReason.trim().length < 10}
                  className="px-4 py-1.5 text-xs bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg disabled:opacity-50"
                >
                  {rejectSubmitting ? 'Rejecting...' : 'Confirm Rejection'}
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
              Reschedule Session for {rescheduleModalApt.name}
            </h3>
            <p className="text-xs text-gray-500">
              Pick a new date and an available slot. Capacity is safely transferred without race conditions.
            </p>

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
                    Select Available Slot {loadingSlots && '(Checking capacity...)'}
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
                  placeholder="e.g. Counselor attending academic conference..."
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
                  className="px-4 py-1.5 text-xs bg-teal-600 hover:bg-teal-700 text-white font-medium rounded-lg disabled:opacity-50"
                >
                  {rescheduleSubmitting ? 'Rescheduling...' : 'Confirm Reschedule'}
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
        onSaved={() => {
          fetchAppointments();
          if (selectedAptId) openDrawer(selectedAptId);
        }}
      />
    </div>
  );
};

export default CounselorAppointments;
