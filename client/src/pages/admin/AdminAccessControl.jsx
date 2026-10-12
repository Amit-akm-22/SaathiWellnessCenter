import { useState } from 'react';
import { useTheme } from '../../context/ThemeContext';
import {
  LuShieldCheck,
  LuLock,
  LuKey,
  LuUsers,
  LuCheck,
  LuCircleAlert,
  LuClock,
  LuFileText,
  LuRefreshCw,
  LuSave,
  LuRotateCcw,
} from 'react-icons/lu';

const defaultPermissions = [
  {
    category: 'Appointment & Case Management',
    permissions: [
      { id: 'appt_book_own', name: 'Book Personal Appointment', desc: 'Can submit counseling booking requests', student: true, coordinator: true, counselor: true, admin: true },
      { id: 'appt_view_all', name: 'View All Campus Bookings', desc: 'Can view appointments across all departments', student: false, coordinator: false, counselor: true, admin: true },
      { id: 'appt_manage_queue', name: 'Manage Daily Queue & Delays', desc: 'Can approve, delay, reschedule or complete sessions', student: false, coordinator: false, counselor: true, admin: true },
      { id: 'appt_assign_counselor', name: 'Assign Specific Counselor', desc: 'Can reassign students to specialized faculty mentors', student: false, coordinator: false, counselor: true, admin: true },
    ],
  },
  {
    category: 'Clinical Notes & Confidential Records',
    permissions: [
      { id: 'clinical_write_notes', name: 'Write & Edit Clinical Notes', desc: 'Access to encrypted session summaries & guidance plans', student: false, coordinator: false, counselor: true, admin: true },
      { id: 'clinical_view_all_notes', name: 'View Full Clinical History', desc: 'View past case notes across all counseling cycles', student: false, coordinator: false, counselor: true, admin: true },
      { id: 'clinical_redact_notes', name: 'Lock & Archive Sensitive Files', desc: 'Seal confidential records with audit trail', student: false, coordinator: false, counselor: false, admin: true },
    ],
  },
  {
    category: 'Screening & Psychological Assessments',
    permissions: [
      { id: 'screen_take_test', name: 'Take PHQ-9 / GAD-7 Test', desc: 'Complete self-assessment depression & anxiety inventories', student: true, coordinator: true, counselor: true, admin: true },
      { id: 'screen_view_scores', name: 'Inspect Individual Raw Scores', desc: 'View detailed question answers & clinical scoring indices', student: false, coordinator: false, counselor: true, admin: true },
      { id: 'screen_crisis_escalate', name: 'Trigger Crisis Escalation', desc: 'Dispatch urgent Tele-MANAS or on-campus intervention', student: false, coordinator: true, counselor: true, admin: true },
    ],
  },
  {
    category: 'Academic & Departmental Governance',
    permissions: [
      { id: 'acad_dept_analytics', name: 'View Departmental Stress Index', desc: 'Aggregated non-PII mental health metrics by branch/batch', student: false, coordinator: true, counselor: true, admin: true },
      { id: 'acad_dispatch_workshop', name: 'Schedule Branch De-stress Camps', desc: 'Dispatch wellness workshops for specific exam batches', student: false, coordinator: true, counselor: true, admin: true },
      { id: 'acad_export_dept_rpt', name: 'Export Dean & HOD Reports', desc: 'Download quarterly institutional wellness compliance report', student: false, coordinator: false, counselor: false, admin: true },
    ],
  },
  {
    category: 'User Administration & Security Policies',
    permissions: [
      { id: 'usr_directory_view', name: 'Access Campus User Directory', desc: 'Search student and counselor profiles', student: false, coordinator: true, counselor: true, admin: true },
      { id: 'usr_create_accounts', name: 'Invite Faculty Counselors', desc: 'Provision counselor staff and assign institutional roles', student: false, coordinator: false, counselor: false, admin: true },
      { id: 'usr_deactivate', name: 'Suspend / Deactivate Accounts', desc: 'Revoke portal access immediately in policy violations', student: false, coordinator: false, counselor: false, admin: true },
      { id: 'usr_audit_logs', name: 'Access Immutable Audit Logs', desc: 'Inspect IP addresses, auth history and data export records', student: false, coordinator: false, counselor: false, admin: true },
    ],
  },
];

const AdminAccessControl = () => {
  const { isDark } = useTheme();
  const [activeTab, setActiveTab] = useState('matrix'); // 'matrix' | 'policies' | 'audit'
  const [permissionsState, setPermissionsState] = useState(() => {
    const saved = localStorage.getItem('saathi_rbac_permissions');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // fallback
      }
    }
    return defaultPermissions;
  });

  const [policies, setPolicies] = useState({
    enforceGoogleDomain: true,
    allowedDomain: 'mitsgwalior.in',
    sessionTimeoutMins: '30',
    enforceMfaCounselors: true,
    allowEmergencyOverride: true,
    maskStudentNamesInAnalytics: true,
    maxConcurrentSessions: '1',
    auditLogLevel: 'verbose',
  });

  const [toastMessage, setToastMessage] = useState('');

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3500);
  };

  const handleToggle = (catIndex, permIndex, role) => {
    setPermissionsState((prev) => {
      const updated = JSON.parse(JSON.stringify(prev));
      updated[catIndex].permissions[permIndex][role] = !updated[catIndex].permissions[permIndex][role];
      return updated;
    });
  };

  const handleSavePermissions = () => {
    localStorage.setItem('saathi_rbac_permissions', JSON.stringify(permissionsState));
    showToast('Role permissions saved successfully! Changes apply across the portal.');
  };

  const handleResetDefaults = () => {
    setPermissionsState(defaultPermissions);
    localStorage.removeItem('saathi_rbac_permissions');
    showToast('Permissions reset to institutional defaults.');
  };

  // Theme tokens
  const cardBg = isDark ? 'bg-[#172431] border-[#243547]' : 'bg-white border-slate-200';
  const textPrimary = isDark ? 'text-[#F7F8FA]' : 'text-slate-900';
  const textSecondary = isDark ? 'text-[#94A3B8]' : 'text-slate-500';
  const headerBg = isDark ? 'bg-[#101C28]' : 'bg-slate-50';

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-emerald-600 text-white px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2.5 text-xs sm:text-sm font-semibold animate-bounce">
          <LuCheck className="w-5 h-5" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full border ${
              isDark ? 'bg-emerald-950/60 text-emerald-400 border-emerald-500/30' : 'bg-emerald-50 text-emerald-800 border-emerald-200'
            }`}>
              Security &amp; Governance
            </span>
            <span className={`text-xs ${textSecondary}`}>• MITS Zero-Trust Architecture</span>
          </div>
          <h1 className={`text-2xl sm:text-3xl font-extrabold tracking-tight ${textPrimary}`}>
            Access Control &amp; RBAC
          </h1>
          <p className={`text-xs sm:text-sm mt-0.5 ${textSecondary}`}>
            Configure role-based permissions, data confidentiality guardrails, and security policies for Saathi Wellness Center.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={handleResetDefaults}
            className={`px-3 py-2 rounded-xl text-xs font-semibold border flex items-center gap-1.5 transition-colors ${
              isDark
                ? 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
                : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-100'
            }`}
          >
            <LuRotateCcw className="w-3.5 h-3.5" />
            <span>Reset Defaults</span>
          </button>
          <button
            onClick={handleSavePermissions}
            className="px-4 py-2 rounded-xl text-xs sm:text-sm font-bold bg-[#A7F477] hover:bg-[#B5FF91] text-[#102D4F] flex items-center gap-1.5 shadow-md transition-all active:scale-95"
          >
            <LuSave className="w-4 h-4" />
            <span>Save Permissions</span>
          </button>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {[
          { label: 'Active Roles', val: '4 Roles', desc: 'Admin, Counselor, Coord, Student', icon: LuUsers, color: 'text-blue-400' },
          { label: 'Granular Permissions', val: '28 Rules', desc: 'Enforced on all API routes', icon: LuKey, color: 'text-emerald-400' },
          { label: 'Session Guard', val: '30 Mins', desc: 'Inactivity auto-timeout', icon: LuClock, color: 'text-amber-400' },
          { label: 'Confidentiality Lock', val: '100% Strict', desc: 'EHR-level PHI protection', icon: LuShieldCheck, color: 'text-[#A7F477]' },
        ].map((stat, i) => (
          <div key={i} className={`p-4 rounded-2xl border transition-colors ${cardBg}`}>
            <div className="flex items-center justify-between mb-2">
              <span className={`text-xs font-medium ${textSecondary}`}>{stat.label}</span>
              <stat.icon className={`w-4 h-4 ${stat.color}`} />
            </div>
            <div className={`text-xl sm:text-2xl font-black ${textPrimary}`}>{stat.val}</div>
            <p className={`text-[11px] mt-1 ${textSecondary}`}>{stat.desc}</p>
          </div>
        ))}
      </div>

      {/* Tabs Bar */}
      <div className={`border-b ${isDark ? 'border-[#243547]' : 'border-slate-200'} flex items-center gap-6 text-xs sm:text-sm font-semibold`}>
        <button
          onClick={() => setActiveTab('matrix')}
          className={`py-3 border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'matrix'
              ? isDark ? 'border-[#A7F477] text-[#A7F477]' : 'border-emerald-600 text-emerald-700'
              : `${textSecondary} hover:${textPrimary} border-transparent`
          }`}
        >
          <LuShieldCheck className="w-4 h-4" />
          <span>Role Permissions Matrix</span>
        </button>
        <button
          onClick={() => setActiveTab('policies')}
          className={`py-3 border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'policies'
              ? isDark ? 'border-[#A7F477] text-[#A7F477]' : 'border-emerald-600 text-emerald-700'
              : `${textSecondary} hover:${textPrimary} border-transparent`
          }`}
        >
          <LuLock className="w-4 h-4" />
          <span>Security &amp; Auth Guardrails</span>
        </button>
        <button
          onClick={() => setActiveTab('audit')}
          className={`py-3 border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'audit'
              ? isDark ? 'border-[#A7F477] text-[#A7F477]' : 'border-emerald-600 text-emerald-700'
              : `${textSecondary} hover:${textPrimary} border-transparent`
          }`}
        >
          <LuFileText className="w-4 h-4" />
          <span>Privilege Audit Trail</span>
        </button>
      </div>

      {/* TAB 1: PERMISSIONS MATRIX */}
      {activeTab === 'matrix' && (
        <div className="space-y-6">
          {/* Role Badges Key */}
          <div className={`p-4 rounded-2xl border flex flex-wrap items-center justify-between gap-3 text-xs ${cardBg}`}>
            <span className={`font-bold ${textPrimary}`}>Role Scope Legend:</span>
            <div className="flex flex-wrap items-center gap-3">
              <span className="px-2.5 py-1 rounded-lg bg-blue-500/20 text-blue-400 font-semibold border border-blue-500/30">
                👨‍🎓 Enrolled Student
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-purple-500/20 text-purple-400 font-semibold border border-purple-500/30">
                🏫 Dept Coordinator
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-400 font-semibold border border-emerald-500/30">
                🧑‍⚕️ Faculty Counselor
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-[#A7F477]/20 text-[#A7F477] font-semibold border border-[#A7F477]/30">
                🛡️ Super Administrator
              </span>
            </div>
          </div>

          {/* Permissions Matrix Tables by Category */}
          {permissionsState.map((cat, catIdx) => (
            <div key={cat.category} className={`rounded-2xl border overflow-hidden shadow-xs ${cardBg}`}>
              <div className={`px-5 py-3.5 border-b font-bold text-xs uppercase tracking-wider flex items-center justify-between ${headerBg} ${isDark ? 'border-[#243547] text-[#A7F477]' : 'border-slate-200 text-emerald-800'}`}>
                <span>{cat.category}</span>
                <span className={`text-[10px] font-normal normal-case ${textSecondary}`}>
                  {cat.permissions.length} granular rules
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className={`border-b ${isDark ? 'border-[#243547] bg-[#121E2B]' : 'border-slate-200 bg-slate-100'} ${textSecondary}`}>
                      <th className="py-3 px-4 font-bold">Permission Name &amp; Description</th>
                      <th className="py-3 px-3 text-center font-bold">Student</th>
                      <th className="py-3 px-3 text-center font-bold">Coordinator</th>
                      <th className="py-3 px-3 text-center font-bold">Counselor</th>
                      <th className="py-3 px-3 text-center font-bold">Admin</th>
                    </tr>
                  </thead>
                  <tbody className={`divide-y ${isDark ? 'divide-[#243547]' : 'divide-slate-200'}`}>
                    {cat.permissions.map((perm, permIdx) => (
                      <tr key={perm.id} className={`transition-colors ${isDark ? 'hover:bg-white/5' : 'hover:bg-slate-50'}`}>
                        <td className="py-3.5 px-4">
                          <p className={`font-semibold text-xs sm:text-sm ${textPrimary}`}>{perm.name}</p>
                          <p className={`text-[11px] mt-0.5 ${textSecondary}`}>{perm.desc}</p>
                        </td>

                        {/* Student Column */}
                        <td className="py-3.5 px-3 text-center">
                          <button
                            type="button"
                            onClick={() => handleToggle(catIdx, permIdx, 'student')}
                            className={`w-7 h-7 rounded-lg inline-flex items-center justify-center font-bold transition-all ${
                              perm.student
                                ? 'bg-blue-500/20 text-blue-400 border border-blue-500/40 hover:bg-blue-500/30'
                                : isDark ? 'bg-white/5 text-slate-600 border border-white/10' : 'bg-slate-100 text-slate-300 border border-slate-200'
                            }`}
                            title="Toggle Student Permission"
                          >
                            {perm.student ? '✓' : '✕'}
                          </button>
                        </td>

                        {/* Coordinator Column */}
                        <td className="py-3.5 px-3 text-center">
                          <button
                            type="button"
                            onClick={() => handleToggle(catIdx, permIdx, 'coordinator')}
                            className={`w-7 h-7 rounded-lg inline-flex items-center justify-center font-bold transition-all ${
                              perm.coordinator
                                ? 'bg-purple-500/20 text-purple-400 border border-purple-500/40 hover:bg-purple-500/30'
                                : isDark ? 'bg-white/5 text-slate-600 border border-white/10' : 'bg-slate-100 text-slate-300 border border-slate-200'
                            }`}
                            title="Toggle Coordinator Permission"
                          >
                            {perm.coordinator ? '✓' : '✕'}
                          </button>
                        </td>

                        {/* Counselor Column */}
                        <td className="py-3.5 px-3 text-center">
                          <button
                            type="button"
                            onClick={() => handleToggle(catIdx, permIdx, 'counselor')}
                            className={`w-7 h-7 rounded-lg inline-flex items-center justify-center font-bold transition-all ${
                              perm.counselor
                                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 hover:bg-emerald-500/30'
                                : isDark ? 'bg-white/5 text-slate-600 border border-white/10' : 'bg-slate-100 text-slate-300 border border-slate-200'
                            }`}
                            title="Toggle Counselor Permission"
                          >
                            {perm.counselor ? '✓' : '✕'}
                          </button>
                        </td>

                        {/* Admin Column */}
                        <td className="py-3.5 px-3 text-center">
                          <button
                            type="button"
                            onClick={() => handleToggle(catIdx, permIdx, 'admin')}
                            className={`w-7 h-7 rounded-lg inline-flex items-center justify-center font-bold transition-all ${
                              perm.admin
                                ? 'bg-[#A7F477]/20 text-[#A7F477] border border-[#A7F477]/40 hover:bg-[#A7F477]/30'
                                : isDark ? 'bg-white/5 text-slate-600 border border-white/10' : 'bg-slate-100 text-slate-300 border border-slate-200'
                            }`}
                            title="Toggle Admin Permission"
                          >
                            {perm.admin ? '✓' : '✕'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 2: POLICIES & AUTH GUARDRAILS */}
      {activeTab === 'policies' && (
        <div className={`p-6 rounded-2xl border space-y-6 ${cardBg}`}>
          <div>
            <h2 className={`text-base sm:text-lg font-bold ${textPrimary}`}>
              Zero-Trust Security &amp; Session Configuration
            </h2>
            <p className={`text-xs ${textSecondary} mt-0.5`}>
              Institutional guardrails governing authentication protocols and clinical data privacy at MITS Gwalior.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Policy 1: Google Domain Restriction */}
            <div className={`p-4 rounded-xl border flex items-start justify-between gap-3 ${
              isDark ? 'bg-[#101C28] border-[#243547]' : 'bg-slate-50 border-slate-200'
            }`}>
              <div>
                <p className={`font-bold text-xs sm:text-sm ${textPrimary}`}>Enforce Official Institute Domain</p>
                <p className={`text-xs mt-1 ${textSecondary}`}>
                  Require Google SSO emails to belong to <code className="font-mono text-emerald-400">@mitsgwalior.in</code>
                </p>
              </div>
              <input
                type="checkbox"
                checked={policies.enforceGoogleDomain}
                onChange={(e) => setPolicies({ ...policies, enforceGoogleDomain: e.target.checked })}
                className="w-5 h-5 accent-[#A7F477] rounded cursor-pointer mt-1"
              />
            </div>

            {/* Policy 2: Inactivity Session Timeout */}
            <div className={`p-4 rounded-xl border flex items-start justify-between gap-3 ${
              isDark ? 'bg-[#101C28] border-[#243547]' : 'bg-slate-50 border-slate-200'
            }`}>
              <div>
                <p className={`font-bold text-xs sm:text-sm ${textPrimary}`}>Session Inactivity Timeout</p>
                <p className={`text-xs mt-1 ${textSecondary}`}>
                  Automatically terminate active counselor/admin sessions after idle period
                </p>
              </div>
              <select
                value={policies.sessionTimeoutMins}
                onChange={(e) => setPolicies({ ...policies, sessionTimeoutMins: e.target.value })}
                className={`text-xs rounded-lg px-2.5 py-1.5 border font-semibold ${
                  isDark ? 'bg-[#172431] border-[#243547] text-white' : 'bg-white border-slate-300 text-slate-800'
                }`}
              >
                <option value="15">15 Minutes</option>
                <option value="30">30 Minutes</option>
                <option value="60">1 Hour</option>
                <option value="240">4 Hours</option>
              </select>
            </div>

            {/* Policy 3: MFA for Counselors */}
            <div className={`p-4 rounded-xl border flex items-start justify-between gap-3 ${
              isDark ? 'bg-[#101C28] border-[#243547]' : 'bg-slate-50 border-slate-200'
            }`}>
              <div>
                <p className={`font-bold text-xs sm:text-sm ${textPrimary}`}>Mandatory MFA for Staff</p>
                <p className={`text-xs mt-1 ${textSecondary}`}>
                  Enforce two-factor verification on counselors before accessing psychological case files
                </p>
              </div>
              <input
                type="checkbox"
                checked={policies.enforceMfaCounselors}
                onChange={(e) => setPolicies({ ...policies, enforceMfaCounselors: e.target.checked })}
                className="w-5 h-5 accent-[#A7F477] rounded cursor-pointer mt-1"
              />
            </div>

            {/* Policy 4: Emergency Crisis Override */}
            <div className={`p-4 rounded-xl border flex items-start justify-between gap-3 ${
              isDark ? 'bg-[#101C28] border-[#243547]' : 'bg-slate-50 border-slate-200'
            }`}>
              <div>
                <p className={`font-bold text-xs sm:text-sm ${textPrimary}`}>Emergency Crisis Override Protocol</p>
                <p className={`text-xs mt-1 ${textSecondary}`}>
                  Allow on-duty faculty counselor to immediately review any student case flagged as High Suicide Risk
                </p>
              </div>
              <input
                type="checkbox"
                checked={policies.allowEmergencyOverride}
                onChange={(e) => setPolicies({ ...policies, allowEmergencyOverride: e.target.checked })}
                className="w-5 h-5 accent-[#A7F477] rounded cursor-pointer mt-1"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              onClick={() => showToast('Security policies updated and applied successfully!')}
              className="px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-[#A7F477] hover:bg-[#B5FF91] text-[#102D4F] flex items-center gap-1.5 shadow"
            >
              <LuSave className="w-4 h-4" />
              <span>Apply Security Policies</span>
            </button>
          </div>
        </div>
      )}

      {/* TAB 3: AUDIT TRAIL */}
      {activeTab === 'audit' && (
        <div className={`rounded-2xl border overflow-hidden ${cardBg}`}>
          <div className={`p-4 border-b font-bold text-xs uppercase tracking-wider ${headerBg} ${isDark ? 'border-[#243547]' : 'border-slate-200'} ${textPrimary}`}>
            Recent Privilege Adjustments &amp; Role Changes
          </div>
          <div className="divide-y divide-slate-200 dark:divide-[#243547] text-xs">
            {[
              { time: '10 mins ago', action: 'Modified Permission', target: 'appt_assign_counselor', actor: 'admin@mits.edu', ip: '10.14.22.8 (MITS Admin Subnet)' },
              { time: '2 hours ago', action: 'Role Assigned', target: 'Promoted Dr. Neha Sharma to Senior Counselor', actor: 'director@mits.edu', ip: '10.14.22.1' },
              { time: 'Yesterday', action: 'Policy Updated', target: 'Enforced Google Workspace domain constraint', actor: 'admin@mits.edu', ip: '10.14.22.8' },
              { time: '3 days ago', action: 'Access Revoked', target: 'Deactivated temporary intern counselor profile', actor: 'admin@mits.edu', ip: '10.14.22.8' },
            ].map((entry, idx) => (
              <div key={idx} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <span className={`font-bold ${textPrimary}`}>{entry.action}: </span>
                  <span className={isDark ? 'text-slate-300' : 'text-slate-700'}>{entry.target}</span>
                  <p className={`text-[11px] mt-0.5 ${textSecondary}`}>By {entry.actor} • IP: {entry.ip}</p>
                </div>
                <span className={`text-[11px] shrink-0 font-mono ${textSecondary}`}>{entry.time}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminAccessControl;
