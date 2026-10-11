import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { notificationAPI, adminAPI } from '../api';
import { LuSun, LuMoon } from 'react-icons/lu';

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [banner, setBanner] = useState({ text: '', isActive: false });
  const notifRef = useRef(null);

  useEffect(() => {
    adminAPI
      .getAnnouncement()
      .then((res) => {
        if (res.data?.data?.banner) {
          setBanner(res.data.data.banner);
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 20000);
      return () => clearInterval(interval);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    const handler = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setNotifOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await notificationAPI.getAll();
      setNotifications(res.data.data.notifications);
      setUnreadCount(res.data.data.unreadCount);
    } catch {
      // ignore
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationAPI.markAllRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch {
      // ignore
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const getDashboardLink = () => {
    if (!user) return '/';
    const map = {
      student: '/student/dashboard',
      counselor: '/counselor/dashboard',
      admin: '/admin/dashboard',
    };
    return map[user.role] || '/';
  };

  const isCounselorView = location.pathname.startsWith('/counselor');
  const isDashboardActive =
    location.pathname.includes('/dashboard') ||
    location.pathname.startsWith('/student/') ||
    location.pathname.startsWith('/counselor/') ||
    location.pathname.startsWith('/admin/');

  // Dynamic Theme Colors
  const navBg = isDark
    ? 'bg-[#172431] border-b border-[#243547]'
    : 'bg-[#FCFBF8] border-b border-[#DFE4E6] shadow-sm';
  const brandTextColor = isDark ? 'text-[#F7F8FA]' : 'text-[#102D4F]';
  const textPrimary = isDark ? 'text-[#F7F8FA]' : 'text-[#102D4F]';
  const textSecondary = isDark ? 'text-[#CBD5E1]' : 'text-[#526579]';
  const activeLink = isDark
    ? 'text-[#F7F8FA] font-semibold border-b-2 border-[#A7F477]'
    : 'text-[#102D4F] font-bold border-b-2 border-[#075E50]';
  const inactiveLink = isDark
    ? 'text-[#E2E8F0] hover:text-[#A7F477]'
    : 'text-[#526579] hover:text-[#075E50]';

  return (
    <>
      {/* Announcement Banner */}
      {banner.isActive && banner.text && (
        <div className="bg-amber-500 text-white text-xs sm:text-sm font-medium py-2 px-4 text-center shadow-inner flex items-center justify-center gap-2">
          <span>📢</span>
          <span>{banner.text}</span>
        </div>
      )}

      {/* Universal Responsive Navbar */}
      <nav className={`${navBg} sticky top-0 z-50 transition-colors duration-200`}>
        <div className="max-w-[1160px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            {/* Left side: 3D Heart Logo & Brand */}
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="w-7 h-7 sm:w-8 sm:h-8 relative flex items-center justify-center">
                <svg viewBox="0 0 32 32" fill="none" className="w-full h-full drop-shadow-[0_2px_4px_rgba(167,244,119,0.35)]">
                  <defs>
                    <linearGradient id="navHeartGradUnified" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#B5FF91" />
                      <stop offset="45%" stopColor="#A7F477" />
                      <stop offset="100%" stopColor="#7CD94B" />
                    </linearGradient>
                    <radialGradient id="navHeartHighlightUnified" cx="35%" cy="30%" r="50%">
                      <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.7" />
                      <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
                    </radialGradient>
                  </defs>
                  <path
                    d="M16 28C16 28 4 20.5 4 11.5C4 7 7.5 3.5 12 3.5C14.5 3.5 16 5 16 5C16 5 17.5 3.5 20 3.5C24.5 3.5 28 7 28 11.5C28 20.5 16 28 16 28Z"
                    fill="url(#navHeartGradUnified)"
                  />
                  <path
                    d="M16 26.5C16 26.5 5.5 19.5 5.5 11.5C5.5 8 8.2 5 12 5C14 5 15.4 6.2 15.4 6.2C15.4 6.2 16.8 5 18.8 5C22.6 5 25.3 8 25.3 11.5C25.3 19.5 16 26.5 16 26.5Z"
                    fill="url(#navHeartHighlightUnified)"
                  />
                </svg>
              </div>
              <span className={`text-xl sm:text-2xl font-bold tracking-tight ${brandTextColor}`}>
                Saathi
              </span>
              {user?.role && user.role !== 'student' && (
                <span className={`ml-1 text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                  isDark ? 'bg-[#A7F477]/20 text-[#A7F477] border-[#A7F477]/30' : 'bg-[#EAF5ED] text-[#075E50] border-[#CFE3D4]'
                }`}>
                  {user.role}
                </span>
              )}
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-5 lg:gap-6">
              <Link
                to="/"
                className={`text-sm font-medium transition-colors py-1 ${
                  location.pathname === '/' ? activeLink : inactiveLink
                }`}
              >
                Home
              </Link>

              {!isAuthenticated && (
                <a
                  href="/#support"
                  className={`text-sm font-medium transition-colors py-1 ${inactiveLink}`}
                >
                  Support
                </a>
              )}

              <Link
                to="/faqs"
                className={`text-sm font-medium transition-colors py-1 ${
                  location.pathname === '/faqs' ? activeLink : inactiveLink
                }`}
              >
                FAQs
              </Link>

              {/* Theme Toggle Button (Light / Dark) */}
              <button
                onClick={toggleTheme}
                className={`p-2 rounded-xl border transition-all duration-200 flex items-center justify-center ${
                  isDark
                    ? 'bg-white/10 hover:bg-white/20 border-white/20 text-[#A7F477] shadow-sm'
                    : 'bg-[#EAF5ED] hover:bg-[#D5EAD9] border-[#CFE3D4] text-[#075E50] shadow-sm'
                }`}
                title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                aria-label="Toggle Theme"
              >
                {isDark ? <LuSun className="w-4 h-4" /> : <LuMoon className="w-4 h-4" />}
              </button>

              {isAuthenticated ? (
                <>
                  <Link
                    to={getDashboardLink()}
                    className={`text-sm font-medium transition-colors py-1 ${
                      isDashboardActive ? activeLink : inactiveLink
                    }`}
                  >
                    Dashboard
                  </Link>

                  {/* Admin / Counselor View Switcher */}
                  {user?.role === 'admin' && (
                    <button
                      onClick={() =>
                        navigate(isCounselorView ? '/admin/dashboard' : '/counselor/dashboard')
                      }
                      className={`text-xs px-2.5 py-1.5 rounded-lg font-medium border flex items-center gap-1.5 transition-all ${
                        isCounselorView
                          ? 'border-purple-400 bg-purple-950/40 text-purple-200 hover:bg-purple-900/50'
                          : isDark
                          ? 'border-[#A7F477]/40 bg-[#A7F477]/10 text-[#A7F477] hover:bg-[#A7F477]/20'
                          : 'border-[#075E50]/40 bg-[#EAF5ED] text-[#075E50] hover:bg-[#D5EAD9]'
                      }`}
                      title={
                        isCounselorView
                          ? 'Click to switch back to Admin Panel'
                          : 'Click to open Counselor View as Admin'
                      }
                    >
                      <span>{isCounselorView ? '🛡️ Admin Panel' : '🧑‍⚕️ Counselor View'}</span>
                    </button>
                  )}

                  {/* Notifications Bell */}
                  <div className="relative" ref={notifRef}>
                    <button
                      onClick={() => {
                        setNotifOpen(!notifOpen);
                        if (!notifOpen) fetchNotifications();
                      }}
                      className={`relative transition-colors p-1.5 rounded-lg ${
                        isDark ? 'text-[#E2E8F0] hover:text-[#A7F477] hover:bg-white/5' : 'text-[#526579] hover:text-[#075E50] hover:bg-gray-100'
                      }`}
                      aria-label="Notifications"
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                        />
                      </svg>
                      {unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold rounded-full h-4 w-4 flex items-center justify-center shadow">
                          {unreadCount > 9 ? '9+' : unreadCount}
                        </span>
                      )}
                    </button>

                    {/* Notifications Dropdown */}
                    {notifOpen && (
                      <div className={`absolute right-0 mt-2 w-80 rounded-2xl shadow-2xl border max-h-96 overflow-y-auto z-50 text-left ${
                        isDark ? 'bg-[#172431] border-[#243547]' : 'bg-[#FCFBF8] border-[#DFE4E6]'
                      }`}>
                        <div className={`p-3.5 border-b flex justify-between items-center ${
                          isDark ? 'bg-[#101C28] border-[#243547]' : 'bg-[#FBF9F4] border-[#DFE4E6]'
                        }`}>
                          <span className={`font-bold text-sm ${textPrimary}`}>Notifications</span>
                          {unreadCount > 0 && (
                            <button
                              onClick={handleMarkAllRead}
                              className={`text-xs font-semibold hover:underline ${
                                isDark ? 'text-[#A7F477]' : 'text-[#075E50]'
                              }`}
                            >
                              Mark all read
                            </button>
                          )}
                        </div>
                        {notifications.length === 0 ? (
                          <div className={`p-6 text-center text-xs ${textSecondary}`}>
                            No notifications yet
                          </div>
                        ) : (
                          notifications.map((n) => {
                            const iconMap = {
                              appointment_delayed: '⏳',
                              meeting_link_shared: '🌐',
                              appointment_approved: '✅',
                              appointment_rejected: '❌',
                              appointment_rescheduled: '📅',
                              appointment_completed: '🎓',
                              feedback_reminder: '⭐',
                              urgent_alert: '🚨',
                              appointment_booked: '📝',
                              general: '🔔',
                            };
                            const icon = iconMap[n.type] || '🔔';

                            return (
                              <div
                                key={n._id}
                                className={`p-3 border-b text-xs flex items-start gap-2.5 transition-colors ${
                                  isDark
                                    ? n.isRead ? 'bg-[#172431] border-[#243547]' : 'bg-[#1F3041] border-[#243547]'
                                    : n.isRead ? 'bg-white border-[#DFE4E6]/60' : 'bg-[#EAF5ED]/60 border-[#DFE4E6]/60'
                                }`}
                              >
                                <span className="text-base shrink-0">{icon}</span>
                                <div className="flex-1">
                                  <p className={`leading-snug font-medium ${isDark ? 'text-[#F7F8FA]' : 'text-[#102D4F]'}`}>
                                    {n.message}
                                  </p>
                                  <p className={`text-[10px] mt-1 ${textSecondary}`}>
                                    {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} · {new Date(n.createdAt).toLocaleDateString()}
                                  </p>
                                </div>
                              </div>
                            );
                          })
                        )}
                      </div>
                    )}
                  </div>

                  {/* User greeting */}
                  <div className={`flex items-center gap-2 pl-2 border-l ${isDark ? 'border-white/20' : 'border-gray-200'}`}>
                    <span className={`text-xs sm:text-sm font-medium ${textSecondary}`}>
                      Hi, <strong className={textPrimary}>{user.name?.split(' ')[0]}</strong>
                    </span>
                    <button
                      onClick={handleLogout}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                        isDark ? 'bg-white/10 hover:bg-white/20 text-[#F7F8FA]' : 'bg-gray-100 hover:bg-gray-200 text-[#102D4F]'
                      }`}
                    >
                      Logout
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div className={`w-[1px] h-4 mx-1 ${isDark ? 'bg-white/20' : 'bg-gray-200'}`}></div>
                  <Link
                    to="/login"
                    className="bg-[#A7F477] hover:bg-[#B5FF91] text-[#102D4F] px-4 py-2 rounded-lg text-sm font-semibold transition-all shadow-sm active:scale-95"
                  >
                    Login
                  </Link>
                </>
              )}
            </div>

            {/* Mobile Menu & Theme Button */}
            <div className="md:hidden flex items-center gap-2">
              <button
                onClick={toggleTheme}
                className={`p-2 rounded-lg border transition-colors ${
                  isDark ? 'bg-white/10 border-white/20 text-[#A7F477]' : 'bg-[#EAF5ED] border-[#CFE3D4] text-[#075E50]'
                }`}
                aria-label="Toggle Theme"
              >
                {isDark ? <LuSun className="w-4 h-4" /> : <LuMoon className="w-4 h-4" />}
              </button>

              <button
                className={`p-2 transition-colors ${isDark ? 'text-white' : 'text-[#102D4F]'}`}
                onClick={() => setMenuOpen(!menuOpen)}
                aria-label="Toggle navigation menu"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  {menuOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
            </div>
          </div>

          {/* Mobile Menu Dropdown */}
          {menuOpen && (
            <div className={`md:hidden py-4 border-t space-y-3 ${
              isDark ? 'border-[#243547] text-white' : 'border-[#DFE4E6] text-[#102D4F]'
            }`}>
              <Link
                to="/"
                className={`block px-3 py-2 text-sm rounded-lg ${
                  location.pathname === '/' ? activeLink : inactiveLink
                }`}
                onClick={() => setMenuOpen(false)}
              >
                Home
              </Link>
              <Link
                to="/faqs"
                className={`block px-3 py-2 text-sm rounded-lg ${
                  location.pathname === '/faqs' ? activeLink : inactiveLink
                }`}
                onClick={() => setMenuOpen(false)}
              >
                FAQs
              </Link>
              {isAuthenticated ? (
                <>
                  <Link
                    to={getDashboardLink()}
                    className={`block px-3 py-2 text-sm rounded-lg ${
                      isDashboardActive ? activeLink : inactiveLink
                    }`}
                    onClick={() => setMenuOpen(false)}
                  >
                    Dashboard
                  </Link>
                  <div className={`border-t pt-2 ${isDark ? 'border-[#243547]' : 'border-gray-200'}`}>
                    <p className={`px-3 text-xs mb-2 ${textSecondary}`}>Signed in as {user?.name}</p>
                    <button
                      onClick={() => {
                        handleLogout();
                        setMenuOpen(false);
                      }}
                      className="block w-full text-left px-3 py-2 text-red-500 hover:text-red-600 text-sm rounded-lg"
                    >
                      Logout
                    </button>
                  </div>
                </>
              ) : (
                <div className={`pt-2 border-t ${isDark ? 'border-[#243547]' : 'border-gray-200'}`}>
                  <Link
                    to="/login"
                    className="block px-4 py-2 bg-[#A7F477] text-[#102D4F] font-semibold rounded-lg text-center text-sm"
                    onClick={() => setMenuOpen(false)}
                  >
                    Login
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>
      </nav>
    </>
  );
};

export default Navbar;
