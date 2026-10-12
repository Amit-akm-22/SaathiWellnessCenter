import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { GoogleLogin } from '@react-oauth/google';
import heroImg from '../assets/student-hero.png';
import {
  LuLock,
  LuShieldCheck,
  LuCircleAlert,
  LuGraduationCap,
  LuArrowLeft,
  LuSun,
  LuMoon,
} from 'react-icons/lu';

const Login = () => {
  const { googleLogin } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleGoogleSuccess = async (credentialResponse) => {
    setError('');
    setLoading(true);
    try {
      const user = await googleLogin(credentialResponse.credential);
      const dashboards = {
        student: '/student/dashboard',
        counselor: '/counselor/dashboard',
        admin: '/admin/dashboard',
      };
      if (user.role === 'student' && !user.isProfileComplete) {
        navigate('/complete-profile');
      } else {
        navigate(dashboards[user.role] || '/');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Google Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={`h-screen max-h-screen w-full overflow-hidden flex flex-col justify-center items-center px-4 sm:px-6 lg:px-8 py-3 sm:py-4 transition-colors duration-200 select-none ${
        isDark ? 'bg-[#101C28]' : 'bg-[#FBF9F4]'
      }`}
    >
      <div className="w-full max-w-6xl xl:max-w-7xl h-full max-h-[92vh] flex flex-col justify-between my-auto">
        {/* Top Control Bar: Back to Home + Theme Toggle */}
        <div className="flex items-center justify-between mb-3 px-1 shrink-0">
          <Link
            to="/"
            className={`inline-flex items-center gap-2 text-xs sm:text-sm font-semibold transition-colors px-3 py-1.5 rounded-xl border ${
              isDark
                ? 'bg-[#172431] border-[#243547] text-[#CBD5E1] hover:text-[#A7F477] hover:border-[#A7F477]/40'
                : 'bg-white border-[#DFE4E6] text-[#526579] hover:text-[#075E50] hover:border-[#075E50]/40 shadow-sm'
            }`}
          >
            <LuArrowLeft className="w-4 h-4" />
            <span>Back to Home</span>
          </Link>

          <button
            onClick={toggleTheme}
            className={`p-2 rounded-xl border transition-all duration-200 flex items-center justify-center ${
              isDark
                ? 'bg-[#172431] hover:bg-[#1F3041] border-[#243547] text-[#A7F477]'
                : 'bg-white hover:bg-[#F0FDF4] border-[#DFE4E6] text-[#075E50] shadow-sm'
            }`}
            title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            aria-label="Toggle Theme"
          >
            {isDark ? <LuSun className="w-4 h-4" /> : <LuMoon className="w-4 h-4" />}
          </button>
        </div>

        {/* Two-panel Split Card (Full Height & Width, Fixed, No Scroll) */}
        <div
          className={`flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-12 rounded-3xl overflow-hidden border shadow-2xl transition-colors duration-200 ${
            isDark
              ? 'bg-[#172431] border-[#243547]'
              : 'bg-[#FCFBF8] border-[#DFE4E6]'
          }`}
        >
          {/* Left Column: Brand & Wellness Identity */}
          <div
            className={`lg:col-span-5 p-6 sm:p-8 lg:p-10 flex flex-col justify-between border-b lg:border-b-0 lg:border-r relative overflow-hidden transition-colors duration-200 ${
              isDark
                ? 'bg-[#172431] border-[#243547]'
                : 'bg-[#EAF5ED] border-[#DFE4E6]'
            }`}
          >
            <div>
              {/* Eyebrow */}
              <p
                className={`text-xs font-semibold tracking-[0.2em] uppercase mb-2 ${
                  isDark ? 'text-[#A7F477]' : 'text-[#075E50]'
                }`}
              >
                MENTAL WELLNESS &nbsp;•&nbsp; COLLEGE SUPPORT
              </p>

              {/* Heading */}
              <h2
                className={`text-2xl sm:text-3xl lg:text-4xl font-extrabold leading-tight mb-2.5 ${
                  isDark ? 'text-[#F7F8FA]' : 'text-[#102D4F]'
                }`}
              >
                You deserve support,
                <span className={`block ${isDark ? 'text-[#A7F477]' : 'text-[#075E50]'}`}>
                  not pressure.
                </span>
              </h2>

              {/* Description */}
              <p
                className={`text-xs sm:text-sm leading-relaxed max-w-md ${
                  isDark ? 'text-[#CBD5E1]' : 'text-[#526579]'
                }`}
              >
                Sign in to book free appointments with your college faculty counsellor,
                access self-assessments, and take a step towards a happier you.
              </p>
            </div>

            {/* 3D Student Illustration (Spacious & Scaled) */}
            <div className="flex-1 min-h-0 flex items-center justify-center my-2 sm:my-4 relative select-none">
              <div className="relative">
                <div className="absolute -top-3 left-1 -rotate-6 z-10 pointer-events-none">
                  <span className="font-handwritten text-lg sm:text-xl font-bold text-[#A7F477] drop-shadow-md block">
                    Better Days Ahead
                  </span>
                  <svg className="w-20 h-2.5 text-[#A7F477] -mt-1" viewBox="0 0 120 12" fill="none">
                    <path d="M2 7C35 2 85 3 118 8" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                  </svg>
                </div>
                <img
                  src={heroImg}
                  alt="Student Wellness Illustration"
                  className="w-auto h-auto max-h-[180px] sm:max-h-[220px] lg:max-h-[250px] object-contain rounded-xl shadow-md"
                />
              </div>
            </div>

            {/* Bottom Trust Highlights */}
            <div
              className={`rounded-2xl p-3.5 sm:p-4 space-y-2.5 border transition-colors ${
                isDark
                  ? 'bg-[#101C28]/90 border-[#243547]'
                  : 'bg-white/80 border-[#CFE3D4]'
              }`}
            >
              <div className="flex items-center gap-2.5 text-xs sm:text-sm">
                <LuLock className={`w-4 h-4 shrink-0 ${isDark ? 'text-[#A7F477]' : 'text-[#075E50]'}`} />
                <span className={isDark ? 'text-[#E2E8F0]' : 'text-[#102D4F]'}>
                  <strong>100% Confidential</strong> — Your privacy is our priority
                </span>
              </div>
              <div className="flex items-center gap-2.5 text-xs sm:text-sm">
                <LuShieldCheck className={`w-4 h-4 shrink-0 ${isDark ? 'text-[#A7F477]' : 'text-[#075E50]'}`} />
                <span className={isDark ? 'text-[#E2E8F0]' : 'text-[#102D4F]'}>
                  <strong>Trusted Faculty</strong> — Safe & non-judgmental care
                </span>
              </div>
            </div>
          </div>

          {/* Right Column: Google Sign In Only */}
          <div
            className={`lg:col-span-7 p-6 sm:p-8 lg:p-10 flex flex-col justify-between overflow-hidden transition-colors duration-200 ${
              isDark ? 'bg-[#101C28]' : 'bg-[#FCFBF8]'
            }`}
          >
            {/* Header */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-6 h-6 relative flex items-center justify-center">
                  <svg viewBox="0 0 32 32" fill="none" className="w-full h-full drop-shadow-sm">
                    <defs>
                      <linearGradient id="loginHeartGrad2" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#B5FF91" />
                        <stop offset="45%" stopColor="#A7F477" />
                        <stop offset="100%" stopColor="#7CD94B" />
                      </linearGradient>
                    </defs>
                    <path
                      d="M16 28C16 28 4 20.5 4 11.5C4 7 7.5 3.5 12 3.5C14.5 3.5 16 5 16 5C16 5 17.5 3.5 20 3.5C24.5 3.5 28 7 28 11.5C28 20.5 16 28 16 28Z"
                      fill="url(#loginHeartGrad2)"
                    />
                  </svg>
                </div>
                <span
                  className={`text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                    isDark
                      ? 'bg-[#A7F477]/20 text-[#A7F477] border border-[#A7F477]/30'
                      : 'bg-[#EAF5ED] text-[#075E50] border border-[#CFE3D4]'
                  }`}
                >
                  Saathi Portal
                </span>
              </div>
              <h1
                className={`text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight ${
                  isDark ? 'text-[#F7F8FA]' : 'text-[#102D4F]'
                }`}
              >
                Welcome to Saathi
              </h1>
              <p className={`text-xs sm:text-sm mt-1 ${isDark ? 'text-[#CBD5E1]' : 'text-[#526579]'}`}>
                Sign in with your Google account to access your wellness dashboard
              </p>
            </div>

            {/* Error Banner */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2.5 rounded-xl my-2 text-xs sm:text-sm flex items-start gap-2.5">
                <LuCircleAlert className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                <span className="leading-snug">{error}</span>
              </div>
            )}

            {/* Google Sign-In Primary Action Card */}
            <div
              className={`p-5 sm:p-7 rounded-2xl border text-center transition-colors my-2 sm:my-3 ${
                isDark
                  ? 'bg-[#172431] border-[#243547]'
                  : 'bg-white border-[#DFE4E6] shadow-sm'
              }`}
            >
              <div className="flex items-center justify-center gap-1.5 mb-3">
                <span
                  className={`text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full border ${
                    isDark
                      ? 'bg-[#A7F477]/10 text-[#A7F477] border-[#A7F477]/30'
                      : 'bg-[#EAF5ED] text-[#075E50] border-[#CFE3D4]'
                  }`}
                >
                  Single Sign-On (SSO)
                </span>
              </div>

              {loading ? (
                <div className="py-4 flex flex-col items-center justify-center gap-2.5">
                  <div className="w-8 h-8 border-3 border-[#A7F477] border-t-transparent rounded-full animate-spin"></div>
                  <p className={`text-sm font-semibold ${isDark ? 'text-[#F7F8FA]' : 'text-[#102D4F]'}`}>
                    Authenticating with Google...
                  </p>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center gap-2">
                  <div className="flex justify-center w-full my-1">
                    <GoogleLogin
                      onSuccess={handleGoogleSuccess}
                      onError={() => setError('Google Login failed. Please try again.')}
                      theme={isDark ? 'filled_black' : 'outline'}
                      shape="pill"
                      size="large"
                      text="signin_with"
                      width="340"
                    />
                  </div>
                  <p className={`text-xs sm:text-sm mt-1 ${isDark ? 'text-[#94A3B8]' : 'text-[#64748B]'}`}>
                    Click above to sign in with your college or Google account.
                  </p>
                </div>
              )}
            </div>

            {/* Info Highlights */}
            <div className="space-y-2.5 sm:space-y-3">
              <div
                className={`p-3 sm:p-3.5 rounded-xl border flex items-start gap-3 transition-colors ${
                  isDark
                    ? 'bg-[#172431]/60 border-[#243547]'
                    : 'bg-[#F4F8F5] border-[#D5E5D8]'
                }`}
              >
                <LuGraduationCap
                  className={`w-5 h-5 shrink-0 mt-0.5 ${
                    isDark ? 'text-[#A7F477]' : 'text-[#075E50]'
                  }`}
                />
                <div>
                  <p className={`text-xs sm:text-sm font-bold ${isDark ? 'text-[#F7F8FA]' : 'text-[#102D4F]'}`}>
                    Instant Student Access
                  </p>
                  <p className={`text-xs sm:text-sm leading-relaxed mt-0.5 ${isDark ? 'text-[#94A3B8]' : 'text-[#526579]'}`}>
                    No separate registration needed. Signing in with Google automatically connects you to your student profile and appointments.
                  </p>
                </div>
              </div>

              <div
                className={`p-3 sm:p-3.5 rounded-xl border flex items-start gap-3 transition-colors ${
                  isDark
                    ? 'bg-[#172431]/60 border-[#243547]'
                    : 'bg-[#F4F8F5] border-[#D5E5D8]'
                }`}
              >
                <LuShieldCheck
                  className={`w-5 h-5 shrink-0 mt-0.5 ${
                    isDark ? 'text-[#A7F477]' : 'text-[#075E50]'
                  }`}
                />
                <div>
                  <p className={`text-xs sm:text-sm font-bold ${isDark ? 'text-[#F7F8FA]' : 'text-[#102D4F]'}`}>
                    100% Confidential &amp; Protected
                  </p>
                  <p className={`text-xs sm:text-sm leading-relaxed mt-0.5 ${isDark ? 'text-[#94A3B8]' : 'text-[#526579]'}`}>
                    Your mental health consultations, screening tests, and appointments are confidential and accessible only to you and your assigned counselor.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
