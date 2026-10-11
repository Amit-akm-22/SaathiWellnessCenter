import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { studentAPI } from '../api';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import TrustStrip from '../components/TrustStrip';
import heroImg from '../assets/student-hero.png';
import {
  LuCalendar,
  LuCalendarPlus,
  LuCalendarCheck,
  LuCircleCheck,
  LuSparkles,
  LuClock,
  LuPhoneCall,
  LuArrowRight,
  LuClipboardList,
  LuCircleHelp,
  LuVideo,
} from 'react-icons/lu';

const StudentDashboard = () => {
  const { user } = useAuth();
  const { isDark } = useTheme();
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
      setError('Failed to load dashboard data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const pageBg = isDark ? 'bg-[#101C28]' : 'bg-[#FBF9F4]';
  const cardBg = isDark ? 'bg-[#172431] border-[#243547]' : 'bg-[#FCFBF8] border-[#DFE4E6]';
  const headingColor = isDark ? 'text-[#F7F8FA]' : 'text-[#102D4F]';
  const textColor = isDark ? 'text-[#CBD5E1]' : 'text-[#526579]';

  if (loading) {
    return (
      <div className={`min-h-[70vh] flex flex-col items-center justify-center gap-3 transition-colors duration-200 ${pageBg}`}>
        <div className={`animate-spin rounded-full h-10 w-10 border-b-2 ${isDark ? 'border-[#A7F477]' : 'border-[#075E50]'}`}></div>
        <p className={`text-sm font-medium ${textColor}`}>Loading your wellness dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`min-h-[60vh] py-12 px-4 transition-colors duration-200 ${pageBg}`}>
        <div className="max-w-xl mx-auto bg-red-50 border border-red-200 text-red-700 p-5 rounded-2xl text-center">
          <p className="font-semibold">{error}</p>
          <button
            onClick={fetchDashboard}
            className="mt-3 px-4 py-2 bg-[#102D4F] text-white text-xs font-semibold rounded-lg hover:bg-[#172431]"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const upcoming = dashboard?.upcomingAppointment;

  return (
    <div className={`min-h-[calc(100vh-64px)] py-8 sm:py-10 transition-colors duration-200 ${pageBg}`}>
      <div className="max-w-[1160px] mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* 1. Hero / Welcome Banner */}
        <div className="bg-[#172431] border border-[#243547] rounded-3xl p-6 sm:p-8 lg:p-10 shadow-xl relative overflow-hidden text-white">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            {/* Left Content */}
            <div className="lg:col-span-8 z-10">
              <p className="text-[11px] sm:text-xs font-semibold tracking-[0.2em] text-[#A7F477] uppercase mb-3">
                MENTAL WELLNESS &nbsp;•&nbsp; STUDENT PORTAL &nbsp;•&nbsp; SAATHI
              </p>
              
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight leading-tight mb-2 text-white">
                Welcome back,{' '}
                <span className="text-[#A7F477]">
                  {user?.name?.split(' ')[0] || 'Student'}
                </span>{' '}
                👋
              </h1>
              
              <p className="text-sm sm:text-base text-[#CBD5E1] leading-relaxed max-w-2xl mb-6">
                You deserve support, not pressure. This is your safe space to book free,
                confidential counselling with trained faculty counsellors, view your session history,
                and nurture your well-being.
              </p>

              <div className="flex flex-wrap items-center gap-3">
                <Link
                  to="/student/screening"
                  className="bg-[#A7F477] hover:bg-[#B5FF91] text-[#102D4F] font-bold text-sm px-5 py-3 rounded-xl inline-flex items-center gap-2 transition-all shadow-sm hover:shadow active:scale-95"
                >
                  <LuCalendar className="w-4 h-4 stroke-[2.2]" />
                  <span>Book an Appointment</span>
                  <LuArrowRight className="w-4 h-4 stroke-[2.2]" />
                </Link>

                <Link
                  to="/student/appointments"
                  className="bg-[#101C28] hover:bg-[#1a2d40] border border-[#243547] text-[#F7F8FA] font-medium text-sm px-5 py-3 rounded-xl inline-flex items-center gap-2 transition-all"
                >
                  <LuClipboardList className="w-4 h-4 text-[#A7F477]" />
                  <span>My Appointments</span>
                </Link>
              </div>
            </div>

            {/* Right Illustration Highlight */}
            <div className="lg:col-span-4 hidden lg:flex justify-end relative">
              <div className="relative max-w-[220px]">
                <div className="absolute -top-2 left-2 -rotate-6 z-10 pointer-events-none select-none">
                  <span className="font-handwritten text-lg font-bold text-[#A7F477] drop-shadow block">
                    Better Days Ahead
                  </span>
                  <svg className="w-20 h-2 text-[#A7F477] -mt-1" viewBox="0 0 120 12" fill="none">
                    <path d="M2 7C35 2 85 3 118 8" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                  </svg>
                </div>
                <img
                  src={heroImg}
                  alt="Student Wellness"
                  className="w-full h-auto object-contain rounded-2xl select-none shadow-xl"
                />
              </div>
            </div>
          </div>
        </div>

        {/* 2. Feedback Reminder (if pending) */}
        {dashboard?.pendingFeedback > 0 && (
          <div className={`rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm border transition-colors ${
            isDark
              ? 'bg-[#172431] border-[#A7F477]/40'
              : 'bg-[#EAF5ED] border-[#A7F477]'
          }`}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#A7F477]/40 flex items-center justify-center shrink-0 text-[#075E50]">
                <LuSparkles className="w-5 h-5" />
              </div>
              <div>
                <h4 className={`text-sm font-bold ${headingColor}`}>Feedback Pending</h4>
                <p className={`text-xs sm:text-sm ${textColor}`}>
                  You have <strong>{dashboard.pendingFeedback}</strong> completed session(s) waiting for your feedback.
                  Your thoughts help us improve student care.
                </p>
              </div>
            </div>
            <Link
              to="/student/appointments?status=completed"
              className="bg-[#075E50] hover:bg-[#0b7967] text-white px-4 py-2 rounded-xl text-xs font-semibold inline-flex items-center gap-1.5 transition-colors whitespace-nowrap"
            >
              <span>Give Feedback</span>
              <LuArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        )}

        {/* 3. Stats Overview Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {/* Card 1: Total Appointments */}
          <div className={`border rounded-2xl p-6 transition-all duration-200 hover:shadow-md flex items-center gap-4 ${cardBg}`}>
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 ${
              isDark ? 'bg-[#101C28] text-[#A7F477] border border-[#243547]' : 'bg-[#EAF5ED] text-[#075E50]'
            }`}>
              <LuCalendar className="w-7 h-7 stroke-[2]" />
            </div>
            <div>
              <div className={`text-3xl font-extrabold leading-tight ${headingColor}`}>
                {dashboard?.totalAppointments || 0}
              </div>
              <div className={`text-sm font-semibold mt-0.5 ${headingColor}`}>Total Appointments</div>
              <div className={`text-xs ${textColor}`}>All booked sessions</div>
            </div>
          </div>

          {/* Card 2: Completed Sessions */}
          <div className={`border rounded-2xl p-6 transition-all duration-200 hover:shadow-md flex items-center gap-4 ${cardBg}`}>
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 ${
              isDark ? 'bg-[#101C28] text-[#A7F477] border border-[#243547]' : 'bg-[#EAF5ED] text-[#075E50]'
            }`}>
              <LuCircleCheck className="w-7 h-7 stroke-[2]" />
            </div>
            <div>
              <div className={`text-3xl font-extrabold leading-tight ${headingColor}`}>
                {dashboard?.completedCount || 0}
              </div>
              <div className={`text-sm font-semibold mt-0.5 ${headingColor}`}>Completed Sessions</div>
              <div className={`text-xs ${textColor}`}>Consultations concluded</div>
            </div>
          </div>

          {/* Card 3: Pending Feedback */}
          <div className={`border rounded-2xl p-6 transition-all duration-200 hover:shadow-md flex items-center gap-4 ${cardBg}`}>
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 ${
              isDark ? 'bg-[#101C28] text-[#A7F477] border border-[#243547]' : 'bg-[#EAF5ED] text-[#075E50]'
            }`}>
              <LuSparkles className="w-7 h-7 stroke-[2]" />
            </div>
            <div>
              <div className={`text-3xl font-extrabold leading-tight ${headingColor}`}>
                {dashboard?.pendingFeedback || 0}
              </div>
              <div className={`text-sm font-semibold mt-0.5 ${headingColor}`}>Pending Feedback</div>
              <div className={`text-xs ${textColor}`}>
                {dashboard?.pendingFeedback > 0 ? 'Awaiting your review' : 'All reviews completed'}
              </div>
            </div>
          </div>
        </div>

        {/* 4. Upcoming Appointment Section */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className={`text-xl font-bold flex items-center gap-2 ${headingColor}`}>
              <LuCalendarCheck className={`w-5 h-5 ${isDark ? 'text-[#A7F477]' : 'text-[#075E50]'}`} />
              <span>Upcoming Appointment</span>
            </h2>
            <Link
              to="/student/appointments"
              className={`text-xs font-semibold inline-flex items-center gap-1 transition-colors ${
                isDark ? 'text-[#A7F477] hover:underline' : 'text-[#075E50] hover:text-[#0b7967]'
              }`}
            >
              <span>View All Appointments</span>
              <LuArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {upcoming ? (
            <div className={`border rounded-2xl p-6 sm:p-7 shadow-sm hover:shadow transition-shadow ${cardBg}`}>
              <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b ${
                isDark ? 'border-[#243547]' : 'border-[#DFE4E6]'
              }`}>
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${
                    isDark ? 'bg-[#101C28] text-[#A7F477]' : 'bg-[#EAF5ED] text-[#075E50]'
                  }`}>
                    <LuCalendar className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className={`font-bold text-base sm:text-lg ${headingColor}`}>
                      Session with Faculty Counsellor
                    </h3>
                    <p className={`text-xs mt-0.5 ${textColor}`}>
                      Confidential mental health guidance session
                    </p>
                  </div>
                </div>

                <div>
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                      upcoming.status === 'approved'
                        ? isDark
                          ? 'bg-[#A7F477]/20 text-[#A7F477] border border-[#A7F477]/40'
                          : 'bg-[#EAF5ED] text-[#075E50] border border-[#CFE3D4]'
                        : 'bg-amber-50 text-amber-800 border border-amber-200'
                    }`}
                  >
                    ● {upcoming.status}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-5">
                <div className="flex items-center gap-3">
                  <LuCalendar className={`w-4 h-4 shrink-0 ${isDark ? 'text-[#A7F477]' : 'text-[#075E50]'}`} />
                  <div>
                    <span className={`block text-[11px] font-semibold uppercase ${textColor}`}>Date</span>
                    <span className={`text-sm font-bold ${headingColor}`}>
                      {new Date(upcoming.date).toLocaleDateString('en-IN', {
                        weekday: 'short',
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <LuClock className={`w-4 h-4 shrink-0 ${isDark ? 'text-[#A7F477]' : 'text-[#075E50]'}`} />
                  <div>
                    <span className={`block text-[11px] font-semibold uppercase ${textColor}`}>Time Slot</span>
                    <span className={`text-sm font-bold ${headingColor}`}>
                      {upcoming.timeSlot}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className={`w-4 h-4 flex items-center justify-center shrink-0 ${isDark ? 'text-[#A7F477]' : 'text-[#075E50]'}`}>
                    📍
                  </div>
                  <div>
                    <span className={`block text-[11px] font-semibold uppercase ${textColor}`}>Mode</span>
                    <span className={`text-sm font-bold capitalize ${headingColor}`}>
                      {upcoming.meetingMode || 'In-Person'}
                    </span>
                  </div>
                </div>
              </div>

              {upcoming.status === 'approved' && upcoming.meetingMode === 'online' && upcoming.meetingLink && (
                <div className={`mt-6 pt-4 border-t flex items-center justify-between ${
                  isDark ? 'border-[#243547]' : 'border-[#DFE4E6]'
                }`}>
                  <span className={`text-xs ${textColor}`}>Online video consultation ready:</span>
                  <a
                    href={upcoming.meetingLink}
                    target="_blank"
                    rel="noreferrer"
                    className="bg-[#A7F477] hover:bg-[#B5FF91] text-[#102D4F] font-bold text-xs px-4 py-2 rounded-xl inline-flex items-center gap-2 transition-all shadow-sm"
                  >
                    <LuVideo className="w-4 h-4" />
                    <span>Join Meeting</span>
                  </a>
                </div>
              )}
            </div>
          ) : (
            <div className={`border rounded-2xl p-8 sm:p-10 text-center shadow-sm ${cardBg}`}>
              <div className={`w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4 ${
                isDark ? 'bg-[#101C28] text-[#A7F477] border border-[#243547]' : 'bg-[#EAF5ED] text-[#075E50]'
              }`}>
                <LuCalendarPlus className="w-7 h-7" />
              </div>
              <h3 className={`text-lg font-bold ${headingColor}`}>No Upcoming Appointments</h3>
              <p className={`text-sm mt-1.5 max-w-md mx-auto leading-relaxed ${textColor}`}>
                Take a step towards a healthier, happier you. You can schedule a confidential
                1-on-1 session with your college faculty counsellor at any time.
              </p>
              <div className="mt-5">
                <Link
                  to="/student/screening"
                  className="bg-[#A7F477] hover:bg-[#B5FF91] text-[#102D4F] font-bold text-sm px-6 py-3 rounded-xl inline-flex items-center gap-2 transition-all shadow-sm active:scale-95"
                >
                  <LuCalendar className="w-4 h-4" />
                  <span>Book Your First Appointment</span>
                  <LuArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* 5. Quick Actions Section */}
        <div>
          <div className="mb-4">
            <h2 className={`text-xl font-bold ${headingColor}`}>Quick Actions & Resources</h2>
            <p className={`text-xs sm:text-sm mt-0.5 ${textColor}`}>
              Everything you need for your mental health support in one safe place.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {/* Action 1: Book Appointment */}
            <Link
              to="/student/screening"
              className={`border rounded-2xl p-6 flex flex-col justify-between transition-all duration-200 hover:shadow-md group ${cardBg}`}
            >
              <div>
                <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-4 group-hover:scale-105 transition-transform ${
                  isDark ? 'bg-[#101C28] text-[#A7F477]' : 'bg-[#EAF5ED] text-[#075E50]'
                }`}>
                  <LuCalendarPlus className="w-6 h-6 stroke-[2]" />
                </div>
                <h3 className={`text-base font-bold ${headingColor}`}>Book Appointment</h3>
                <p className={`text-xs mt-2 leading-relaxed ${textColor}`}>
                  Start with a quick confidential wellness screening to choose your slot.
                </p>
              </div>
              <div className={`mt-5 pt-3 border-t flex items-center justify-between text-xs font-semibold ${
                isDark ? 'border-[#243547] text-[#A7F477]' : 'border-[#DFE4E6]/60 text-[#075E50]'
              }`}>
                <span>Book now</span>
                <LuArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>

            {/* Action 2: My Appointments */}
            <Link
              to="/student/appointments"
              className={`border rounded-2xl p-6 flex flex-col justify-between transition-all duration-200 hover:shadow-md group ${cardBg}`}
            >
              <div>
                <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-4 group-hover:scale-105 transition-transform ${
                  isDark ? 'bg-[#101C28] text-[#A7F477]' : 'bg-[#EAF5ED] text-[#075E50]'
                }`}>
                  <LuClipboardList className="w-6 h-6 stroke-[2]" />
                </div>
                <h3 className={`text-base font-bold ${headingColor}`}>My Appointments</h3>
                <p className={`text-xs mt-2 leading-relaxed ${textColor}`}>
                  Review your complete session records, approval statuses, and notes.
                </p>
              </div>
              <div className={`mt-5 pt-3 border-t flex items-center justify-between text-xs font-semibold ${
                isDark ? 'border-[#243547] text-[#A7F477]' : 'border-[#DFE4E6]/60 text-[#075E50]'
              }`}>
                <span>View history</span>
                <LuArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>

            {/* Action 3: FAQs */}
            <Link
              to="/faqs"
              className={`border rounded-2xl p-6 flex flex-col justify-between transition-all duration-200 hover:shadow-md group ${cardBg}`}
            >
              <div>
                <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-4 group-hover:scale-105 transition-transform ${
                  isDark ? 'bg-[#101C28] text-[#A7F477]' : 'bg-[#EAF5ED] text-[#075E50]'
                }`}>
                  <LuCircleHelp className="w-6 h-6 stroke-[2]" />
                </div>
                <h3 className={`text-base font-bold ${headingColor}`}>Wellness FAQs</h3>
                <p className={`text-xs mt-2 leading-relaxed ${textColor}`}>
                  Learn practical strategies for stress, exam anxiety, and daily mindfulness.
                </p>
              </div>
              <div className={`mt-5 pt-3 border-t flex items-center justify-between text-xs font-semibold ${
                isDark ? 'border-[#243547] text-[#A7F477]' : 'border-[#DFE4E6]/60 text-[#075E50]'
              }`}>
                <span>Explore FAQs</span>
                <LuArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>

            {/* Action 4: Crisis Helpline */}
            <a
              href="tel:14416"
              className={`border rounded-2xl p-6 flex flex-col justify-between transition-all duration-200 hover:shadow-md group ${cardBg}`}
            >
              <div>
                <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-4 group-hover:scale-105 transition-transform ${
                  isDark ? 'bg-[#101C28] text-[#A7F477]' : 'bg-[#EAF5ED] text-[#075E50]'
                }`}>
                  <LuPhoneCall className="w-6 h-6 stroke-[2]" />
                </div>
                <h3 className={`text-base font-bold ${headingColor}`}>Crisis Helpline</h3>
                <p className={`text-xs mt-2 leading-relaxed ${textColor}`}>
                  Tele-MANAS Government Mental Health helpline — Available 24/7.
                </p>
              </div>
              <div className={`mt-5 pt-3 border-t flex items-center justify-between text-xs font-bold ${
                isDark ? 'border-[#243547] text-[#A7F477]' : 'border-[#DFE4E6]/60 text-[#075E50]'
              }`}>
                <span>Call 14416</span>
                <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                  isDark ? 'bg-[#A7F477]/20 text-[#A7F477]' : 'bg-[#EAF5ED] text-[#075E50]'
                }`}>
                  Free
                </span>
              </div>
            </a>
          </div>
        </div>

        {/* 6. Trust and Reassurance Strip */}
        <div className="pt-2">
          <TrustStrip />
        </div>

      </div>
    </div>
  );
};

export default StudentDashboard;
