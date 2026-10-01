import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { studentAPI } from '../api';
import { useAuth } from '../context/AuthContext';

const StudentDashboard = () => {
  const { user } = useAuth();
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const res = await studentAPI.getDashboard();
      setDashboard(res.data.data);
    } catch {
      setError('Failed to load dashboard.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-teal-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-10">
        <div className="bg-red-50 text-red-700 p-4 rounded-lg">{error}</div>
      </div>
    );
  }

  const upcoming = dashboard?.upcomingAppointment;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Welcome */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800">
          Welcome back, {user?.name?.split(' ')[0]} 👋
        </h1>
        <p className="text-gray-500 mt-1">Here's what's happening with your wellness journey.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
          <div className="text-3xl font-bold text-teal-600">{dashboard?.totalAppointments || 0}</div>
          <div className="text-sm text-gray-500 mt-1">Total Appointments</div>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
          <div className="text-3xl font-bold text-green-600">{dashboard?.completedCount || 0}</div>
          <div className="text-sm text-gray-500 mt-1">Completed Sessions</div>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
          <div className="text-3xl font-bold text-amber-600">{dashboard?.pendingFeedback || 0}</div>
          <div className="text-sm text-gray-500 mt-1">Pending Feedback</div>
        </div>
      </div>

      {/* Upcoming Appointment */}
      {upcoming ? (
        <div className="bg-teal-50 border border-teal-200 rounded-xl p-6 mb-8">
          <h2 className="font-semibold text-teal-800 mb-3 flex items-center gap-2">
            <span>📅</span> Upcoming Appointment
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
            <div>
              <span className="text-gray-500">Date:</span>{' '}
              <span className="font-medium text-gray-800">
                {new Date(upcoming.date).toLocaleDateString('en-IN', {
                  weekday: 'short', year: 'numeric', month: 'short', day: 'numeric'
                })}
              </span>
            </div>
            <div>
              <span className="text-gray-500">Time:</span>{' '}
              <span className="font-medium text-gray-800">{upcoming.timeSlot}</span>
            </div>
            <div>
              <span className="text-gray-500">Status:</span>{' '}
              <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
                upcoming.status === 'approved'
                  ? 'bg-green-100 text-green-700'
                  : 'bg-yellow-100 text-yellow-700'
              }`}>
                {upcoming.status.charAt(0).toUpperCase() + upcoming.status.slice(1)}
              </span>
            </div>
          </div>
          {upcoming.status === 'approved' && upcoming.meetingMode === 'online' && upcoming.meetingLink && (
            <div className="mt-3 text-sm">
              <span className="text-gray-500">Meeting Link:</span>{' '}
              <a href={upcoming.meetingLink} target="_blank" rel="noreferrer" className="text-teal-600 underline">
                Join Meeting
              </a>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 mb-8 text-center">
          <p className="text-gray-500 mb-3">No upcoming appointments</p>
          <Link
            to="/student/screening"
            className="inline-block bg-teal-600 hover:bg-teal-700 text-white px-6 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            Book Your First Appointment
          </Link>
        </div>
      )}

      {/* Quick Actions */}
      <h2 className="text-lg font-semibold text-gray-800 mb-4">Quick Actions</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Link
          to="/student/screening"
          className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-shadow text-center"
        >
          <div className="text-3xl mb-2">📝</div>
          <div className="font-medium text-gray-800">Book Appointment</div>
          <div className="text-xs text-gray-500 mt-1">Start with a wellness check</div>
        </Link>
        <Link
          to="/student/appointments"
          className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-shadow text-center"
        >
          <div className="text-3xl mb-2">📋</div>
          <div className="font-medium text-gray-800">My Appointments</div>
          <div className="text-xs text-gray-500 mt-1">View history & status</div>
        </Link>
        <Link
          to="/faqs"
          className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-shadow text-center"
        >
          <div className="text-3xl mb-2">❓</div>
          <div className="font-medium text-gray-800">FAQs</div>
          <div className="text-xs text-gray-500 mt-1">Learn about mental health</div>
        </Link>
        <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm text-center">
          <div className="text-3xl mb-2">📞</div>
          <div className="font-medium text-gray-800">Crisis Helpline</div>
          <div className="text-sm text-teal-600 font-bold mt-1">14416</div>
          <div className="text-xs text-gray-500">Tele-MANAS (24/7)</div>
        </div>
      </div>

      {/* Pending feedback reminder */}
      {dashboard?.pendingFeedback > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800">
          <span className="font-medium">⭐ Reminder:</span> You have {dashboard.pendingFeedback} completed session(s) waiting for your feedback.{' '}
          <Link to="/student/appointments?status=completed" className="underline font-medium">
            Give Feedback
          </Link>
        </div>
      )}
    </div>
  );
};

export default StudentDashboard;
