import { useState, useEffect } from 'react';
import { NavLink, Link, useLocation, useNavigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import {
  LuLayoutDashboard,
  LuShieldCheck,
  LuGraduationCap,
  LuUsers,
  LuCalendar,
  LuCalendarOff,
  LuCircleHelp,
  LuFileText,
  LuDownload,
  LuSettings,
  LuChevronLeft,
  LuChevronRight,
  LuMenu,
  LuX,
  LuSearch,
  LuBell,
  LuSun,
  LuMoon,
  LuLogOut,
  LuExternalLink,
} from 'react-icons/lu';

const SaathiLogo = ({ size = 28 }) => (
  <div style={{ width: size, height: size }} className="relative flex items-center justify-center shrink-0">
    <svg viewBox="0 0 32 32" fill="none" className="w-full h-full drop-shadow-[0_2px_4px_rgba(167,244,119,0.35)]">
      <defs>
        <linearGradient id="adminLogoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#B5FF91" />
          <stop offset="45%" stopColor="#A7F477" />
          <stop offset="100%" stopColor="#7CD94B" />
        </linearGradient>
      </defs>
      <path
        d="M16 28C16 28 4 20.5 4 11.5C4 7 7.5 3.5 12 3.5C14.5 3.5 16 5 16 5C16 5 17.5 3.5 20 3.5C24.5 3.5 28 7 28 11.5C28 20.5 16 28 16 28Z"
        fill="url(#adminLogoGrad)"
      />
    </svg>
  </div>
);

const AdminLayout = ({ children }) => {
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();

  const [collapsed, setCollapsed] = useState(() => {
    return localStorage.getItem('saathi_admin_collapsed') === 'true';
  });
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    localStorage.setItem('saathi_admin_collapsed', collapsed.toString());
  }, [collapsed]);

  // Close mobile drawer on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  const navSections = [
    {
      title: 'OVERVIEW',
      items: [
        { to: '/admin/dashboard', label: 'Dashboard', icon: LuLayoutDashboard, badge: 'Live' },
      ],
    },
    {
      title: 'SECURITY & GOVERNANCE',
      items: [
        { to: '/admin/access-control', label: 'Access Control', icon: LuShieldCheck, badge: 'RBAC' },
        { to: '/admin/logs', label: 'Audit & Security Logs', icon: LuFileText },
      ],
    },
    {
      title: 'ACADEMIC & USERS',
      items: [
        { to: '/admin/academic-programs', label: 'Academic Programs', icon: LuGraduationCap, badge: 'MITS' },
        { to: '/admin/users', label: 'User Directory', icon: LuUsers },
      ],
    },
    {
      title: 'WELLNESS OPERATIONS',
      items: [
        { to: '/admin/appointments', label: 'Appointments & Queue', icon: LuCalendar },
        { to: '/admin/blocked-dates', label: 'Blocked Dates', icon: LuCalendarOff },
        { to: '/admin/faqs', label: 'FAQ Content', icon: LuCircleHelp },
      ],
    },
    {
      title: 'DATA & SYSTEM',
      items: [
        { to: '/admin/export', label: 'Export Data', icon: LuDownload },
        { to: '/admin/settings', label: 'System Settings', icon: LuSettings },
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
    return 'Admin Panel';
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
          <Link to="/admin/dashboard" className="flex items-center gap-3 overflow-hidden group">
            <SaathiLogo size={32} />
            {(!collapsed || mobileOpen) && (
              <div className="flex flex-col leading-none">
                <span className={`text-base font-bold tracking-tight ${textPrimary} group-hover:text-[#A7F477] transition-colors`}>
                  Saathi Admin
                </span>
                <span className="text-[10px] font-semibold text-emerald-500 tracking-wider uppercase mt-0.5">
                  MITS Gwalior
                </span>
              </div>
            )}
          </Link>

          {/* Collapse Toggle for Desktop */}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className={`hidden lg:flex p-1.5 rounded-lg border transition-colors ${
              isDark
                ? 'bg-white/5 border-white/10 text-slate-300 hover:text-[#A7F477] hover:bg-white/10'
                : 'bg-slate-100 border-slate-200 text-slate-600 hover:text-emerald-700 hover:bg-slate-200'
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

        {/* Quick Portal Switch Badge */}
        {(!collapsed || mobileOpen) && (
          <div className="px-3 pt-3 pb-1 shrink-0">
            <div className={`px-3 py-2 rounded-xl text-xs flex items-center justify-between border ${
              isDark ? 'bg-[#172431] border-[#243547] text-slate-300' : 'bg-emerald-50 border-emerald-200 text-emerald-900'
            }`}>
              <span className="font-semibold flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Administrative Mode
              </span>
              <span className="text-[10px] font-mono uppercase bg-emerald-500/20 px-1.5 py-0.5 rounded text-emerald-400 font-bold">
                ROOT
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
                const isActive = location.pathname === item.to;

                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    title={collapsed && !mobileOpen ? item.label : undefined}
                    className={({ isActive }) =>
                      `relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-all group ${
                        isActive
                          ? isDark
                            ? 'bg-[#A7F477]/15 text-[#A7F477] font-semibold border border-[#A7F477]/30 shadow-xs'
                            : 'bg-emerald-600 text-white font-semibold shadow-sm'
                          : isDark
                          ? 'text-slate-300 hover:text-white hover:bg-white/5'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                      } ${collapsed && !mobileOpen ? 'justify-center px-2' : ''}`
                    }
                  >
                    <IconComponent className={`w-4 h-4 shrink-0 transition-transform group-hover:scale-110 ${
                      isActive ? (isDark ? 'text-[#A7F477]' : 'text-white') : ''
                    }`} />
                    {(!collapsed || mobileOpen) && (
                      <span className="truncate flex-1">{item.label}</span>
                    )}
                    {(!collapsed || mobileOpen) && item.badge && (
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider ${
                        isActive
                          ? isDark
                            ? 'bg-[#A7F477] text-[#102D4F]'
                            : 'bg-white text-emerald-800'
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

          {/* Quick Cross-Portal Switch Links */}
          <div className={`pt-3 border-t ${isDark ? 'border-[#1F2E3E]' : 'border-slate-200'} space-y-1`}>
            {(!collapsed || mobileOpen) && (
              <p className="px-3 text-[10px] font-bold tracking-widest uppercase text-slate-400 mb-1.5">
                SHORTCUTS
              </p>
            )}
            <Link
              to="/counselor/dashboard"
              title={collapsed && !mobileOpen ? 'Switch to Counselor View' : undefined}
              className={`flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium transition-colors ${
                isDark
                  ? 'text-purple-300 hover:bg-purple-950/40 hover:text-purple-200 border border-purple-500/20'
                  : 'text-purple-700 hover:bg-purple-50 border border-purple-200'
              } ${collapsed && !mobileOpen ? 'justify-center px-2' : ''}`}
            >
              <span className="text-sm shrink-0">🧑‍⚕️</span>
              {(!collapsed || mobileOpen) && (
                <span className="truncate flex-1">Counselor View</span>
              )}
            </Link>

            <Link
              to="/"
              title={collapsed && !mobileOpen ? 'Main Website' : undefined}
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

        {/* Sidebar Footer: Admin Profile & Logout */}
        <div className={`p-3 border-t ${isDark ? 'border-[#1F2E3E] bg-[#0E1722]' : 'border-slate-200 bg-slate-50'} shrink-0`}>
          <div className={`flex items-center gap-3 ${collapsed && !mobileOpen ? 'justify-center' : 'justify-between'}`}>
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="w-8 h-8 rounded-full bg-emerald-500 text-[#102D4F] font-bold flex items-center justify-center text-xs shrink-0 shadow-sm">
                {user?.name ? user.name.charAt(0).toUpperCase() : 'A'}
              </div>
              {(!collapsed || mobileOpen) && (
                <div className="truncate flex flex-col leading-tight">
                  <span className={`text-xs font-bold truncate ${textPrimary}`}>
                    {user?.name || 'Administrator'}
                  </span>
                  <span className={`text-[10px] truncate ${textSecondary}`}>
                    {user?.email || 'admin@mits.edu'}
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
                title="Logout from Admin Panel"
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
                <span>Admin</span>
                <span>/</span>
                <span className={`font-semibold ${isDark ? 'text-[#A7F477]' : 'text-emerald-700'}`}>
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
            {/* Quick Search input */}
            <div className="hidden md:flex items-center relative">
              <LuSearch className={`w-3.5 h-3.5 absolute left-3 ${textSecondary} pointer-events-none`} />
              <input
                type="text"
                placeholder="Search admin records..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`pl-9 pr-3 py-1.5 rounded-xl text-xs w-48 lg:w-60 border focus:outline-none focus:ring-2 transition-all ${
                  isDark
                    ? 'bg-[#101C28] border-[#243547] text-white placeholder-slate-500 focus:ring-[#A7F477]'
                    : 'bg-slate-100 border-slate-200 text-slate-900 placeholder-slate-400 focus:ring-emerald-500 focus:bg-white'
                }`}
              />
            </div>

            {/* Online Status Pill */}
            <div className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium border ${
              isDark ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-400' : 'bg-emerald-50 border-emerald-200 text-emerald-800'
            }`}>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>MITS Gwalior Node</span>
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

            {/* Notifications Button */}
            <button
              onClick={() => navigate('/admin/logs')}
              className={`relative p-2 rounded-xl border transition-colors ${
                isDark ? 'bg-white/5 border-white/10 text-slate-300 hover:text-white' : 'bg-slate-100 border-slate-200 text-slate-600 hover:text-slate-900'
              }`}
              title="System Alerts & Audit"
              aria-label="Notifications"
            >
              <LuBell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-emerald-400 rounded-full" />
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

export default AdminLayout;
