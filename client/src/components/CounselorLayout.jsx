import { useState, useEffect } from 'react';
import { NavLink, Link, useLocation, useNavigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import {
  LuLayoutDashboard,
  LuCalendar,
  LuClock,
  LuTimer,
  LuUsers,
  LuFileText,
  LuTrendingUp,
  LuBell,
  LuChevronLeft,
  LuChevronRight,
  LuMenu,
  LuX,
  LuSearch,
  LuSun,
  LuMoon,
  LuLogOut,
  LuExternalLink,
  LuHeartHandshake,
} from 'react-icons/lu';

const SaathiCounselorLogo = ({ size = 28 }) => (
  <div style={{ width: size, height: size }} className="relative flex items-center justify-center shrink-0">
    <svg viewBox="0 0 32 32" fill="none" className="w-full h-full drop-shadow-[0_2px_4px_rgba(7,94,80,0.35)]">
      <defs>
        <linearGradient id="counselorLogoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#14B8A6" />
          <stop offset="50%" stopColor="#0D9488" />
          <stop offset="100%" stopColor="#075E50" />
        </linearGradient>
      </defs>
      <path
        d="M16 28C16 28 4 20.5 4 11.5C4 7 7.5 3.5 12 3.5C14.5 3.5 16 5 16 5C16 5 17.5 3.5 20 3.5C24.5 3.5 28 7 28 11.5C28 20.5 16 28 16 28Z"
        fill="url(#counselorLogoGrad)"
      />
    </svg>
  </div>
);

const CounselorLayout = ({ children }) => {
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();

  const [collapsed, setCollapsed] = useState(() => {
    return localStorage.getItem('saathi_counselor_collapsed') === 'true';
  });
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    localStorage.setItem('saathi_counselor_collapsed', collapsed.toString());
  }, [collapsed]);

  // Close mobile drawer on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  const navSections = [
    {
      title: 'CLINICAL OPERATIONS',
      items: [
        { to: '/counselor/dashboard', label: 'Dashboard', icon: LuLayoutDashboard, badge: 'Live' },
        { to: '/counselor/appointments', label: 'Appointments', icon: LuCalendar, badge: 'All' },
        { to: '/counselor/availability', label: 'Slot Availability', icon: LuClock, badge: 'Slots' },
        { to: '/counselor/queue', label: "Today's Queue", icon: LuTimer, badge: 'Queue' },
      ],
    },
    {
      title: 'STUDENT CARE & RECORDS',
      items: [
        { to: '/counselor/students', label: 'Student Directory', icon: LuUsers },
        { to: '/counselor/reports', label: 'Session Reports', icon: LuFileText },
        { to: '/counselor/analytics', label: 'Clinical Analytics', icon: LuTrendingUp },
      ],
    },
    {
      title: 'COMMUNICATIONS',
      items: [
        { to: '/counselor/notifications', label: 'Delivery Logs', icon: LuBell },
      ],
    },
  ];

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  // Determine current page title for breadcrumb
  const getCurrentPageTitle = () => {
    for (const section of navSections) {
      for (const item of section.items) {
        if (location.pathname === item.to) {
          return item.label;
        }
      }
    }
    return 'Counselor Portal';
  };

  // Theme-aware styles
  const sidebarBg = isDark ? 'bg-[#101C28] border-[#1F2E3E]' : 'bg-[#FFFFFF] border-slate-200';
  const topbarBg = isDark ? 'bg-[#172431] border-[#1F2E3E]' : 'bg-[#FFFFFF] border-slate-200';
  const mainContentBg = isDark ? 'bg-[#0B131D]' : 'bg-[#F8FAFC]';
  const textPrimary = isDark ? 'text-[#F7F8FA]' : 'text-slate-900';
  const textSecondary = isDark ? 'text-[#94A3B8]' : 'text-slate-500';

  return (
    <div className={`min-h-screen flex ${mainContentBg} transition-colors duration-200 font-sans`}>
      {/* Mobile Backdrop Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-xs transition-opacity"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* ===================================================== */}
      {/* SIDEBAR                                              */}
      {/* ===================================================== */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 flex flex-col border-r transition-all duration-300 ease-in-out ${sidebarBg} ${
          mobileOpen ? 'translate-x-0 w-64' : '-translate-x-full lg:translate-x-0'
        } ${collapsed ? 'lg:w-20' : 'lg:w-64'}`}
      >
        {/* Brand & Toggle Header */}
        <div className={`h-16 flex items-center px-4 border-b ${isDark ? 'border-[#1F2E3E]' : 'border-slate-200'} justify-between shrink-0`}>
          <Link to="/counselor/dashboard" className="flex items-center gap-3 overflow-hidden group">
            <SaathiCounselorLogo size={32} />
            {(!collapsed || mobileOpen) && (
              <div className="flex flex-col leading-none">
                <span className={`text-base font-bold tracking-tight ${textPrimary} group-hover:text-teal-500 transition-colors`}>
                  Saathi Counselor
                </span>
                <span className="text-[10px] font-semibold text-teal-600 dark:text-teal-400 tracking-wider uppercase mt-0.5">
                  Wellness Center
                </span>
              </div>
            )}
          </Link>

          {/* Collapse Toggle for Desktop */}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className={`hidden lg:flex p-1.5 rounded-lg border transition-colors ${
              isDark
                ? 'bg-white/5 border-white/10 text-slate-300 hover:text-teal-400 hover:bg-white/10'
                : 'bg-slate-100 border-slate-200 text-slate-600 hover:text-teal-700 hover:bg-slate-200'
            }`}
            title={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
            aria-label="Toggle Sidebar"
          >
            {collapsed ? <LuChevronRight className="w-4 h-4" /> : <LuChevronLeft className="w-4 h-4" />}
          </button>

          {/* Close button for Mobile */}
          <button
            onClick={() => setMobileOpen(false)}
            className={`lg:hidden p-1.5 rounded-lg ${textSecondary} hover:${textPrimary}`}
            aria-label="Close Mobile Sidebar"
          >
            <LuX className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Portal Status Badge */}
        {(!collapsed || mobileOpen) && (
          <div className="px-3 pt-3 pb-1 shrink-0">
            <div className={`px-3 py-2 rounded-xl text-xs flex items-center justify-between border ${
              isDark ? 'bg-[#172431] border-[#243547] text-slate-300' : 'bg-teal-50 border-teal-200 text-teal-900'
            }`}>
              <span className="font-semibold flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse" />
                Counselor Mode
              </span>
              <span className="text-[10px] font-mono uppercase bg-teal-500/20 px-1.5 py-0.5 rounded text-teal-600 dark:text-teal-400 font-bold">
                CLINICAL
              </span>
            </div>
          </div>
        )}

        {/* Navigation Items (Scrollable) */}
        <div className="flex-1 overflow-y-auto px-3 py-3 space-y-5 select-none no-scrollbar">
          {navSections.map((section, idx) => (
            <div key={idx} className="space-y-1">
              {(!collapsed || mobileOpen) && (
                <p className="px-3 text-[10px] font-bold tracking-widest uppercase text-slate-400 mb-1.5">
                  {section.title}
                </p>
              )}
              {section.items.map((item) => {
                const IconComponent = item.icon;

                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    title={collapsed && !mobileOpen ? item.label : undefined}
                    className={({ isActive }) =>
                      `relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-all group ${
                        isActive
                          ? isDark
                            ? 'bg-teal-500/20 text-teal-300 font-semibold border border-teal-500/30 shadow-xs'
                            : 'bg-teal-600 text-white font-semibold shadow-sm'
                          : isDark
                          ? 'text-slate-300 hover:text-white hover:bg-white/5'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                      } ${collapsed && !mobileOpen ? 'justify-center px-2' : ''}`
                    }
                  >
                    <IconComponent className="w-4 h-4 shrink-0 transition-transform group-hover:scale-110" />
                    {(!collapsed || mobileOpen) && (
                      <span className="truncate flex-1">{item.label}</span>
                    )}
                    {(!collapsed || mobileOpen) && item.badge && (
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider ${
                        location.pathname === item.to
                          ? isDark
                            ? 'bg-teal-400 text-[#102D4F]'
                            : 'bg-white text-teal-800'
                          : isDark
                          ? 'bg-white/10 text-slate-300'
                          : 'bg-slate-200 text-slate-700'
                      }`}>
                        {item.badge}
                      </span>
                    )}
                  </NavLink>
                );
              })}
            </div>
          ))}

          {/* Shortcuts */}
          <div className={`pt-3 border-t ${isDark ? 'border-[#1F2E3E]' : 'border-slate-200'} space-y-1`}>
            {(!collapsed || mobileOpen) && (
              <p className="px-3 text-[10px] font-bold tracking-widest uppercase text-slate-400 mb-1.5">
                SHORTCUTS
              </p>
            )}

            {user?.role === 'admin' && (
              <Link
                to="/admin/dashboard"
                title={collapsed && !mobileOpen ? 'Switch to Admin Panel' : undefined}
                className={`flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium transition-colors ${
                  isDark
                    ? 'text-emerald-300 hover:bg-emerald-950/40 hover:text-emerald-200 border border-emerald-500/20'
                    : 'text-emerald-700 hover:bg-emerald-50 border border-emerald-200'
                } ${collapsed && !mobileOpen ? 'justify-center px-2' : ''}`}
              >
                <span className="text-sm shrink-0">🛡️</span>
                {(!collapsed || mobileOpen) && (
                  <span className="truncate flex-1">Admin Panel</span>
                )}
              </Link>
            )}

            <Link
              to="/"
              title={collapsed && !mobileOpen ? 'Main Portal' : undefined}
              className={`flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium transition-colors ${
                isDark
                  ? 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              } ${collapsed && !mobileOpen ? 'justify-center px-2' : ''}`}
            >
              <LuExternalLink className="w-4 h-4 shrink-0" />
              {(!collapsed || mobileOpen) && (
                <span className="truncate flex-1">Student Portal</span>
              )}
            </Link>
          </div>
        </div>

        {/* Sidebar Footer: Counselor Profile & Logout */}
        <div className={`p-3 border-t ${isDark ? 'border-[#1F2E3E] bg-[#0E1722]' : 'border-slate-200 bg-slate-50'} shrink-0`}>
          <div className={`flex items-center gap-3 ${collapsed && !mobileOpen ? 'justify-center' : 'justify-between'}`}>
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="w-8 h-8 rounded-full bg-teal-600 text-white font-bold flex items-center justify-center text-xs shrink-0 shadow-sm">
                {user?.name ? user.name.charAt(0).toUpperCase() : 'C'}
              </div>
              {(!collapsed || mobileOpen) && (
                <div className="truncate flex flex-col leading-tight">
                  <span className={`text-xs font-bold truncate ${textPrimary}`}>
                    {user?.name || 'Counselor'}
                  </span>
                  <span className={`text-[10px] truncate ${textSecondary}`}>
                    {user?.email || 'counselor@mits.edu'}
                  </span>
                </div>
              )}
            </div>

            {(!collapsed || mobileOpen) && (
              <button
                onClick={handleLogout}
                className={`p-1.5 rounded-lg transition-colors ${
                  isDark ? 'text-slate-400 hover:text-red-400 hover:bg-white/5' : 'text-slate-500 hover:text-red-600 hover:bg-red-50'
                }`}
                title="Logout from Counselor Portal"
                aria-label="Logout"
              >
                <LuLogOut className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </aside>

      {/* ===================================================== */}
      {/* MAIN VIEW AREA                                        */}
      {/* ===================================================== */}
      <div
        className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${
          collapsed ? 'lg:pl-20' : 'lg:pl-64'
        }`}
      >
        {/* Top Header Bar */}
        <header
          className={`h-16 sticky top-0 z-30 border-b flex items-center justify-between px-4 sm:px-6 lg:px-8 ${topbarBg} transition-colors duration-200 shadow-xs`}
        >
          {/* Left: Mobile hamburger & Breadcrumb */}
          <div className="flex items-center gap-3 sm:gap-4">
            <button
              onClick={() => setMobileOpen(true)}
              className={`p-2 rounded-lg border lg:hidden ${
                isDark ? 'bg-white/5 border-white/10 text-white' : 'bg-slate-100 border-slate-200 text-slate-800'
              }`}
              aria-label="Open Sidebar Menu"
            >
              <LuMenu className="w-5 h-5" />
            </button>

            <div>
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <span>Counselor</span>
                <span>/</span>
                <span className={`font-semibold ${isDark ? 'text-teal-400' : 'text-teal-700'}`}>
                  {getCurrentPageTitle()}
                </span>
              </div>
              <h1 className={`text-base sm:text-lg font-bold leading-none mt-0.5 ${textPrimary}`}>
                {getCurrentPageTitle()}
              </h1>
            </div>
          </div>

          {/* Right Controls: Quick Search, Status, Theme, Notifications */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Quick Search */}
            <div className="hidden md:flex items-center relative">
              <LuSearch className={`w-3.5 h-3.5 absolute left-3 ${textSecondary} pointer-events-none`} />
              <input
                type="text"
                placeholder="Search appointments & students..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`pl-9 pr-3 py-1.5 rounded-xl text-xs w-48 lg:w-60 border focus:outline-none focus:ring-2 transition-all ${
                  isDark
                    ? 'bg-[#101C28] border-[#243547] text-white placeholder-slate-500 focus:ring-teal-400'
                    : 'bg-slate-100 border-slate-200 text-slate-900 placeholder-slate-400 focus:ring-teal-500 focus:bg-white'
                }`}
              />
            </div>

            {/* Online Status Pill */}
            <div className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium border ${
              isDark ? 'bg-teal-950/40 border-teal-500/30 text-teal-400' : 'bg-teal-50 border-teal-200 text-teal-800'
            }`}>
              <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse" />
              <span>Counseling Node Active</span>
            </div>

            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className={`p-2 rounded-xl border transition-all duration-200 flex items-center justify-center ${
                isDark
                  ? 'bg-white/10 hover:bg-white/20 border-white/20 text-[#A7F477]'
                  : 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-700'
              }`}
              title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              aria-label="Toggle Theme"
            >
              {isDark ? <LuSun className="w-4 h-4" /> : <LuMoon className="w-4 h-4" />}
            </button>

            {/* Delivery Logs / Notifications Button */}
            <button
              onClick={() => navigate('/counselor/notifications')}
              className={`relative p-2 rounded-xl border transition-colors ${
                isDark ? 'bg-white/5 border-white/10 text-slate-300 hover:text-white' : 'bg-slate-100 border-slate-200 text-slate-600 hover:text-slate-900'
              }`}
              title="Notifications & Delivery Logs"
              aria-label="Notifications"
            >
              <LuBell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-teal-500 rounded-full" />
            </button>
          </div>
        </header>

        {/* Content Body */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          {children || <Outlet />}
        </main>
      </div>
    </div>
  );
};

export default CounselorLayout;
