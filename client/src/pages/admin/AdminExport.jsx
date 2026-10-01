import AdminNav from '../../components/AdminNav';
import { adminAPI } from '../../api';

const AdminExport = () => {
  const exportCards = [
    {
      type: 'users',
      title: 'Users & Rosters Data',
      icon: '👥',
      description:
        'Download complete CSV of registered students, counselor staff, and administrative users including enrollment numbers, branches, active status, and timestamps.',
      fields: [
        '_id',
        'name',
        'email',
        'enrollmentNo',
        'role',
        'branch',
        'year',
        'gender',
        'phone',
        'isActive',
        'createdAt',
        'lastLoginAt',
      ],
      url: adminAPI.exportUrl('users'),
      color: 'teal',
    },
    {
      type: 'appointments',
      title: 'Appointments Master Record',
      icon: '📅',
      description:
        'Download master log of all appointments across all stages (pending, approved, completed, rejected, cancelled, no-show) with issue categories, severity ratings, and urgent flags.',
      fields: [
        '_id',
        'name',
        'email',
        'enrollmentNo',
        'branch',
        'year',
        'date',
        'timeSlot',
        'issueCategory',
        'status',
        'severity',
        'isUrgent',
        'createdAt',
      ],
      url: adminAPI.exportUrl('appointments'),
      color: 'blue',
    },
    {
      type: 'audit-logs',
      title: 'Administrative Audit Trail',
      icon: '📜',
      description:
        'Full compliance and regulatory log capturing all state overrides, user modifications, settings updates, client IP addresses, and timestamps.',
      fields: [
        '_id',
        'actorEmail',
        'actorRole',
        'action',
        'entityType',
        'entityId',
        'ip',
        'createdAt',
      ],
      url: adminAPI.exportUrl('audit-logs'),
      color: 'purple',
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      <AdminNav />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Data Export Center</h1>
          <p className="text-sm text-slate-500">
            Generate and export university-wide wellness data in standard CSV format for reporting, analytics, and audits.
          </p>
        </div>

        {/* Security Notice */}
        <div className="p-4 bg-amber-50 border-l-4 border-amber-500 rounded-r-xl text-amber-900 text-xs sm:text-sm space-y-1">
          <p className="font-bold flex items-center gap-1.5">
            <span>🔒</span>
            <span>Student Privacy & Data Protection Notice</span>
          </p>
          <p className="text-amber-800">
            Exported spreadsheets contain university student records and mental health appointments. Please handle all downloaded files responsibly in compliance with campus data governance policies.
          </p>
        </div>

        {/* Export Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {exportCards.map((card) => (
            <div
              key={card.type}
              className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col justify-between hover:shadow-md transition"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-3xl p-3 rounded-xl bg-slate-50 border">{card.icon}</span>
                  <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                    CSV Format
                  </span>
                </div>

                <div>
                  <h3 className="font-bold text-slate-900 text-base">{card.title}</h3>
                  <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">{card.description}</p>
                </div>

                <div>
                  <span className="text-[11px] font-semibold text-slate-400 block uppercase tracking-wider mb-1.5">
                    Export Columns
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {card.fields.map((f) => (
                      <span
                        key={f}
                        className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 text-slate-600"
                      >
                        {f}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t mt-6">
                <a
                  href={card.url}
                  download
                  className="w-full py-2.5 px-4 rounded-lg bg-teal-600 hover:bg-teal-700 text-white font-medium text-xs sm:text-sm transition shadow-sm flex items-center justify-center gap-2"
                >
                  <span>📥</span>
                  <span>Download {card.type.replace('-', ' ').toUpperCase()} CSV</span>
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminExport;
