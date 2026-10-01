import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { notificationAPI, adminAPI } from '../api';

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [banner, setBanner] = useState({ text: '', isActive: false });
  const notifRef = useRef(null);

  useEffect(() => {
    // Fetch announcement banner
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
      // Poll every 20 seconds so real-time notifications arrive without refresh
      const interval = setInterval(fetchNotifications, 20000);
      return () => clearInterval(interval);
    }
  }, [isAuthenticated]);

  // Close dropdown on outside click
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

  return (
    <>
      {/* Announcement Banner */}
      {banner.isActive && banner.text && (
        <div className="bg-amber-500 text-white text-xs sm:text-sm font-medium py-2 px-4 text-center shadow-inner flex items-center justify-center gap-2">
          <span>📢</span>
          <span>{banner.text}</span>
        </div>
      )}

      <nav className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2">
              <span className="text-2xl">🤝</span>
              <span className="text-xl font-bold text-teal-700">Saathi</span>
              {user?.role === 'admin' && (
                <span className="ml-1 text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-purple-100 text-purple-700">
                  Admin
                </span>
              )}
            </Link>

            {/* Desktop nav */}
            <div className="hidden md:flex items-center gap-5">
              <Link to="/" className="text-gray-600 hover:text-teal-600 transition-colors text-sm font-medium">
                Home
              </Link>
              <Link to="/faqs" className="text-gray-600 hover:text-teal-600 transition-colors text-sm font-medium">
                FAQs
              </Link>

              {isAuthenticated ? (
                <>
                  <Link
                    to={getDashboardLink()}
                    className="text-gray-600 hover:text-teal-600 transition-colors text-sm font-medium"
                  >
                    Dashboard
                  </Link>

                  {/* Admin / Counselor View Switcher */}
                  {user?.role === 'admin' && (
                    <button
                      onClick={() =>
                        navigate(isCounselorView ? '/admin/dashboard' : '/counselor/dashboard')
                      }
                      className={`text-xs px-3 py-1.5 rounded-md font-medium border flex items-center gap-1.5 transition-all ${
                        isCounselorView
                          ? 'border-purple-300 bg-purple-50 text-purple-700 hover:bg-purple-100'
                          : 'border-teal-300 bg-teal-50 text-teal-700 hover:bg-teal-100'
                      }`}
                      title={
                        isCounselorView
                          ? 'Click to switch back to Admin Panel'
                          : 'Click to open Counselor View as Admin'
                      }
                    >
                      {isCounselorView ? (
                        <>
                          <span>🛡️</span>
                          <span>Admin Panel</span>
                        </>
                      ) : (
                        <>
                          <span>🧑‍⚕️</span>
                          <span>Counselor View</span>
                        </>
                      )}
                    </button>
                  )}

                  {/* Notifications bell */}
                  <div className="relative" ref={notifRef}>
                  <button
                    onClick={() => {
                      setNotifOpen(!notifOpen);
                      if (!notifOpen) fetchNotifications();
                    }}
                    className="relative text-gray-600 hover:text-teal-600 transition-colors p-1"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                    </svg>
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </button>

                  {notifOpen && (
                    <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-100 max-h-96 overflow-y-auto">
                      <div className="p-3 border-b flex justify-between items-center">
                        <span className="font-semibold text-sm text-gray-700">Notifications</span>
                        {unreadCount > 0 && (
                          <button
                            onClick={handleMarkAllRead}
                            className="text-xs text-teal-600 hover:text-teal-800"
                          >
                            Mark all read
                          </button>
                        )}
                      </div>
                      {notifications.length === 0 ? (
                        <div className="p-4 text-center text-gray-400 text-sm">
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
                              className={`p-3 border-b text-xs sm:text-sm flex items-start gap-2.5 ${
                                n.isRead ? 'bg-white' : 'bg-teal-50/70'
                              }`}
                            >
                              <span className="text-base shrink-0">{icon}</span>
                              <div className="flex-1">
                                <p className="text-gray-800 leading-snug">{n.message}</p>
                                <p className="text-[11px] text-gray-400 mt-1">
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

                <span className="text-sm text-gray-500">
                  Hi, {user.name?.split(' ')[0]}
                </span>
                <button
                  onClick={handleLogout}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-teal-600 hover:text-teal-800 text-sm font-medium transition-colors"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  Register
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2 text-gray-600"
            onClick={() => setMenuOpen(!menuOpen)}
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

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden pb-4 space-y-2">
            <Link to="/" className="block px-3 py-2 text-gray-600 hover:bg-gray-50 rounded" onClick={() => setMenuOpen(false)}>Home</Link>
            <Link to="/faqs" className="block px-3 py-2 text-gray-600 hover:bg-gray-50 rounded" onClick={() => setMenuOpen(false)}>FAQs</Link>
            {isAuthenticated ? (
              <>
                <Link to={getDashboardLink()} className="block px-3 py-2 text-gray-600 hover:bg-gray-50 rounded" onClick={() => setMenuOpen(false)}>Dashboard</Link>
                <button onClick={() => { handleLogout(); setMenuOpen(false); }} className="block w-full text-left px-3 py-2 text-gray-600 hover:bg-gray-50 rounded">Logout</button>
              </>
            ) : (
              <>
                <Link to="/login" className="block px-3 py-2 text-teal-600 hover:bg-gray-50 rounded" onClick={() => setMenuOpen(false)}>Login</Link>
                <Link to="/register" className="block px-3 py-2 bg-teal-600 text-white rounded text-center" onClick={() => setMenuOpen(false)}>Register</Link>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
    </>
  );
};

export default Navbar;
