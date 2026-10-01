import { useState, useEffect } from 'react';
import { counselorAPI } from '../../api';
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
  rescheduled: 'bg-purple-50 text-purple-700 border-purple-200',
  rejected: 'bg-red-50 text-red-600 border-red-200',
  no_show: 'bg-slate-100 text-slate-600 border-slate-200',
};

const CounselorStudents = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Filters
  const [gender, setGender] = useState('all');
  const [branch, setBranch] = useState('all');
  const [year, setYear] = useState('all');
  const [severity, setSeverity] = useState('all');
  const [status, setStatus] = useState('all');
  const [urgent, setUrgent] = useState(false);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  // Profile modal / detail
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [studentDetails, setStudentDetails] = useState(null);
  const [studentLoading, setStudentLoading] = useState(false);
  const [notesModalApt, setNotesModalApt] = useState(null);

  useEffect(() => {
    fetchStudents();
  }, [gender, branch, year, severity, status, urgent, search, page]);

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const params = {
        gender: gender !== 'all' ? gender : undefined,
        branch: branch !== 'all' ? branch : undefined,
        year: year !== 'all' ? year : undefined,
        severity: severity !== 'all' ? severity : undefined,
        status: status !== 'all' ? status : undefined,
        urgent: urgent ? 'true' : undefined,
        search: search.trim() || undefined,
        page,
        limit: 12,
      };

      const res = await counselorAPI.getStudents(params);
      setStudents(res.data.data.students);
      setTotalPages(res.data.data.totalPages);
      setTotalCount(res.data.data.total);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load students.');
    } finally {
      setLoading(false);
    }
  };

  const openStudentProfile = async (studentId) => {
    setSelectedStudent(studentId);
    setStudentLoading(true);
    try {
      const res = await counselorAPI.getStudent(studentId);
      setStudentDetails(res.data.data);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to load student profile.');
    } finally {
      setStudentLoading(false);
    }
  };

  const closeProfile = () => {
    setSelectedStudent(null);
    setStudentDetails(null);
  };

  return (
    <div className="min-h-screen bg-slate-50/50 pb-20">
      <CounselorNav />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
              <span>👥</span> Student Directory & Longitudinal Records
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
              Unique students registered with counseling services. Track appointment volume, severity trends, and prior notes. ({totalCount} students)
            </p>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="bg-white rounded-2xl border border-gray-100 p-4 sm:p-5 shadow-xs space-y-3">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
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

            <div>
              <label className="block text-[11px] font-semibold text-gray-500 uppercase mb-1">Latest Severity</label>
              <select
                value={severity}
                onChange={(e) => { setSeverity(e.target.value); setPage(1); }}
                className="w-full text-xs border border-gray-200 rounded-lg px-2 py-1.5 bg-white outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value="all">All Severities</option>
                <option value="Severe">Severe</option>
                <option value="Moderate">Moderate</option>
                <option value="Mild">Mild</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-gray-500 uppercase mb-1">Latest Status</label>
              <select
                value={status}
                onChange={(e) => { setStatus(e.target.value); setPage(1); }}
                className="w-full text-xs border border-gray-200 rounded-lg px-2 py-1.5 bg-white outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value="all">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="completed">Completed</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>

            <div className="flex items-end pb-1.5">
              <label className="flex items-center gap-1.5 text-xs font-semibold text-rose-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={urgent}
                  onChange={(e) => { setUrgent(e.target.checked); setPage(1); }}
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
                placeholder="Search student by name, enrollment no, or email..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                className="w-full pl-8 pr-3 py-1.5 text-xs border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-teal-500"
              />
              <span className="absolute left-2.5 top-2 text-gray-400 text-xs">🔍</span>
            </div>

            {(branch !== 'all' || year !== 'all' || gender !== 'all' || severity !== 'all' || status !== 'all' || urgent || search) && (
              <button
                onClick={() => {
                  setBranch('all');
                  setYear('all');
                  setGender('all');
                  setSeverity('all');
                  setStatus('all');
                  setUrgent(false);
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

        {/* Students Cards Grid */}
        {loading ? (
          <div className="py-20 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600 mx-auto mb-2"></div>
            <p className="text-gray-400 text-xs">Loading students...</p>
          </div>
        ) : students.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-gray-100 shadow-xs">
            <p className="text-3xl mb-1">👥</p>
            <h3 className="font-semibold text-gray-800 text-sm">No students match the criteria</h3>
            <p className="text-xs text-gray-400 mt-1">Adjust your search or filter options.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {students.map((st) => (
              <div
                key={st._id}
                onClick={() => openStudentProfile(st._id)}
                className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs hover:border-teal-300 hover:shadow-sm cursor-pointer transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-bold text-gray-900 text-sm">{st.name}</h3>
                      <p className="text-xs text-gray-500 font-mono mt-0.5">{st.enrollmentNo}</p>
                    </div>
                    <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${SEVERITY_COLORS[st.latestSeverity] || 'bg-gray-100'}`}>
                      {st.latestSeverity || 'N/A'}
                    </span>
                  </div>

                  <div className="mt-3 space-y-1.5 text-xs text-gray-600">
                    <p>
                      <span className="text-gray-400">Class:</span> {st.branch} · {st.year} Year · {st.gender}
                    </p>
                    <p>
                      <span className="text-gray-400">Email:</span> {st.email}
                    </p>
                    <p>
                      <span className="text-gray-400">Total Consultations:</span>{' '}
                      <span className="font-bold text-teal-700">{st.totalAppointments}</span>
                    </p>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-xs">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${STATUS_COLORS[st.latestStatus] || 'bg-gray-100'}`}>
                    Latest: {st.latestStatus?.toUpperCase()}
                  </span>
                  <span className="text-teal-600 font-semibold hover:underline">
                    View Complete Profile →
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="p-4 bg-white rounded-2xl border border-gray-100 flex items-center justify-between text-xs">
            <span className="text-gray-500">
              Page {page} of {totalPages} ({totalCount} students)
            </span>
            <div className="flex items-center gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage(page - 1)}
                className="px-3 py-1 border border-gray-200 rounded-lg disabled:opacity-40"
              >
                Previous
              </button>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage(page + 1)}
                className="px-3 py-1 border border-gray-200 rounded-lg disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* STUDENT PROFILE & HISTORY MODAL */}
      {selectedStudent && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-3xl w-full p-6 shadow-2xl border border-gray-100 max-h-[90vh] overflow-y-auto space-y-6 animate-in zoom-in-95 duration-200">
            {studentLoading || !studentDetails ? (
              <div className="py-20 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600 mx-auto"></div>
                <p className="text-xs text-gray-400 mt-2">Loading student profile...</p>
              </div>
            ) : (
              <>
                <div className="flex items-start justify-between pb-4 border-b border-gray-100">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">
                      {studentDetails.student.name}
                    </h2>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {studentDetails.student.enrollmentNo} · {studentDetails.student.branch} ({studentDetails.student.year} Year) · {studentDetails.student.gender}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      Email: {studentDetails.student.email} · Phone: {studentDetails.student.phone || 'Not registered'}
                    </p>
                  </div>
                  <button
                    onClick={closeProfile}
                    className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-100"
                  >
                    ✕
                  </button>
                </div>

                {/* Longitudinal Session History */}
                <div>
                  <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-3">
                    Consultation History & Counselor Notes ({studentDetails.appointments.length})
                  </h3>

                  {studentDetails.appointments.length === 0 ? (
                    <p className="text-xs text-gray-400 italic">No appointment history found.</p>
                  ) : (
                    <div className="space-y-4">
                      {studentDetails.appointments.map((apt) => (
                        <div
                          key={apt._id}
                          className="bg-slate-50 p-4 rounded-xl border border-gray-100 space-y-2 text-xs"
                        >
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-gray-900">
                                {new Date(apt.date).toLocaleDateString('en-IN', {
                                  month: 'short', day: 'numeric', year: 'numeric'
                                })} at {apt.timeSlot}
                              </span>
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${STATUS_COLORS[apt.status] || 'bg-gray-100'}`}>
                                {apt.status.toUpperCase()}
                              </span>
                              {apt.severity && (
                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${SEVERITY_COLORS[apt.severity]}`}>
                                  {apt.severity}
                                </span>
                              )}
                            </div>
                            <span className="text-[11px] font-medium text-gray-500">
                              Duration: {apt.actualDurationMins || 45} mins
                            </span>
                          </div>

                          <p className="text-gray-700">
                            <strong>Issue:</strong> {apt.issueCategory} {apt.customCategory ? `(${apt.customCategory})` : ''}
                          </p>

                          {apt.description && (
                            <p className="text-gray-500 italic bg-white/70 p-2 rounded-lg border border-gray-100">
                              "{apt.description}"
                            </p>
                          )}

                          {/* Notes */}
                          {apt.sessionNotes?.summary ? (
                            <div className="bg-white p-3 rounded-lg border border-teal-100 space-y-1 mt-2">
                              <div className="flex justify-between items-center">
                                <span className="font-bold text-teal-800 text-[11px]">Counselor Session Notes</span>
                                <button
                                  onClick={() => setNotesModalApt(apt)}
                                  className="text-[11px] text-teal-600 hover:text-teal-800"
                                >
                                  Edit ✏️
                                </button>
                              </div>
                              <p className="text-gray-700"><strong>Discussion:</strong> {apt.sessionNotes.summary}</p>
                              <p className="text-gray-700"><strong>Advice:</strong> {apt.sessionNotes.advice}</p>
                              {apt.sessionNotes.forwarded && (
                                <p className="text-amber-800 bg-amber-50 p-2 rounded border border-amber-200 mt-1">
                                  <strong>Forwarded to {apt.sessionNotes.forwardedTo}:</strong> {apt.sessionNotes.forwardedReason}
                                </p>
                              )}
                            </div>
                          ) : (
                            <div className="flex justify-end pt-1">
                              <button
                                onClick={() => setNotesModalApt(apt)}
                                className="text-xs text-teal-600 hover:text-teal-800 font-medium"
                              >
                                + Add Notes for this session
                              </button>
                            </div>
                          )}

                          {/* Student Feedback */}
                          {apt.feedback?.rating && (
                            <div className="bg-amber-50/70 p-2 rounded-lg border border-amber-100 text-[11px] text-amber-900 mt-1 flex justify-between">
                              <span>⭐ Student Rating: {apt.feedback.rating}/5 {apt.feedback.wasHelpful ? '(Helpful ✓)' : ''}</span>
                              {apt.feedback.comment && <span className="italic">"{apt.feedback.comment}"</span>}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* NOTES MODAL */}
      <SessionNotesModal
        appointment={notesModalApt}
        isOpen={Boolean(notesModalApt)}
        onClose={() => setNotesModalApt(null)}
        onSaved={() => {
          if (selectedStudent) openStudentProfile(selectedStudent);
          fetchStudents();
        }}
      />
    </div>
  );
};

export default CounselorStudents;
