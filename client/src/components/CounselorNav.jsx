import { NavLink } from 'react-router-dom';

const CounselorNav = () => {
  const navItems = [
    { name: 'Dashboard', path: '/counselor/dashboard', icon: '📊' },
    { name: 'Appointments', path: '/counselor/appointments', icon: '📅' },
    { name: "Today's Queue", path: '/counselor/queue', icon: '⏱️' },
    { name: 'Student Directory', path: '/counselor/students', icon: '👥' },
    { name: 'Reports', path: '/counselor/reports', icon: '📄' },
    { name: 'Analytics', path: '/counselor/analytics', icon: '📈' },
    { name: 'Delivery Logs', path: '/counselor/notifications', icon: '🔔' },
  ];

  return (
    <div className="bg-white border-b border-teal-100 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between py-2.5 overflow-x-auto gap-2">
          <div className="flex items-center gap-1 min-w-max">
            <span className="px-2.5 py-1 bg-teal-50 text-teal-800 text-xs font-semibold rounded-md border border-teal-200 mr-2 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse"></span>
              Counselor Portal
            </span>
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all flex items-center gap-1.5 ${
                    isActive
                      ? 'bg-teal-600 text-white shadow-xs'
                      : 'text-gray-600 hover:text-teal-700 hover:bg-teal-50/60'
                  }`
                }
              >
                <span>{item.icon}</span>
                <span>{item.name}</span>
              </NavLink>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CounselorNav;
