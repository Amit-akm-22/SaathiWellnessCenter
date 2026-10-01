import { NavLink } from 'react-router-dom';

const AdminNav = () => {
  const links = [
    { to: '/admin/dashboard', label: 'Dashboard', icon: '📊' },
    { to: '/admin/users', label: 'User Management', icon: '👥' },
    { to: '/admin/appointments', label: 'Appointments', icon: '📅' },
    { to: '/admin/settings', label: 'System Settings', icon: '⚙️' },
    { to: '/admin/blocked-dates', label: 'Blocked Dates', icon: '🚫' },
    { to: '/admin/faqs', label: 'FAQ Content', icon: '❓' },
    { to: '/admin/logs', label: 'Audit & Logs', icon: '📜' },
    { to: '/admin/export', label: 'Export Data', icon: '📥' },
  ];

  return (
    <div className="bg-slate-900 text-white shadow-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between py-2.5 overflow-x-auto no-scrollbar gap-2">
          <div className="flex items-center gap-1 shrink-0 mr-4">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
              Admin Control
            </span>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            {links.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  `px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all flex items-center gap-1.5 whitespace-nowrap ${
                    isActive
                      ? 'bg-teal-600 text-white shadow-sm'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800'
                  }`
                }
              >
                <span>{link.icon}</span>
                <span>{link.label}</span>
              </NavLink>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminNav;
