import { useState, useEffect } from 'react';
import AdminNav from '../../components/AdminNav';
import { adminAPI } from '../../api';

const AdminLogs = () => {
  const [activeTab, setActiveTab] = useState('audit'); // 'audit' | 'notifications'

  // Audit Logs State
  const [auditLogs, setAuditLogs] = useState([]);
  const [auditLoading, setAuditLoading] = useState(true);
  const [auditActionFilter, setAuditActionFilter] = useState('');
  const [auditEntityFilter, setAuditEntityFilter] = useState('');
  const [auditPage, setAuditPage] = useState(1);
  const [auditTotalPages, setAuditTotalPages] = useState(1);
  const [selectedAuditLog, setSelectedAuditLog] = useState(null);

  // Notification Logs State
  const [notifLogs, setNotifLogs] = useState([]);
  const [notifLoading, setNotifLoading] = useState(true);
  const [notifStatusFilter, setNotifStatusFilter] = useState('');
  const [notifChannelFilter, setNotifChannelFilter] = useState('');
  const [notifPage, setNotifPage] = useState(1);
  const [notifTotalPages, setNotifTotalPages] = useState(1);
  const [retryingId, setRetryingId] = useState(null);

  const [toastMsg, setToastMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 4000);
  };

  // Fetch Audit Logs
  const fetchAuditLogs = async () => {
    setAuditLoading(true);
    try {
      const params = {
        page: auditPage,
        limit: 15,
        action: auditActionFilter || undefined,
        entityType: auditEntityFilter || undefined,
      };
      const res = await adminAPI.getAuditLogs(params);
      setAuditLogs(res.data.data.logs || []);
      setAuditTotalPages(res.data.data.pagination?.pages || 1);
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to fetch audit logs.');
    } finally {
      setAuditLoading(false);
    }
  };

  // Fetch Notification Logs
  const fetchNotificationLogs = async () => {
    setNotifLoading(true);
    try {
      const params = {
        page: notifPage,
        limit: 15,
        status: notifStatusFilter || undefined,
        channel: notifChannelFilter || undefined,
      };
      const res = await adminAPI.getNotificationLogs(params);
      setNotifLogs(res.data.data.logs || []);
      setNotifTotalPages(res.data.data.pagination?.pages || 1);
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to fetch notification logs.');
    } finally {
      setNotifLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'audit') {
      fetchAuditLogs();
    } else {
      fetchNotificationLogs();
    }
  }, [activeTab, auditPage, auditActionFilter, auditEntityFilter, notifPage, notifStatusFilter, notifChannelFilter]);

  // Retry Notification
  const handleRetry = async (log) => {
    setRetryingId(log._id);
    try {
      await adminAPI.retryNotification(log._id);
      showToast('Notification re-queued for delivery.');
      fetchNotificationLogs();
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to retry notification.');
    } finally {
      setRetryingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <AdminNav />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Audit Trail & Notification Delivery</h1>
            <p className="text-sm text-slate-500">
              Immutable security audit logging of administrative changes and notification dispatch tracking.
            </p>
          </div>

          {/* Tab Switcher */}
          <div className="bg-slate-200 p-1 rounded-xl flex items-center gap-1 self-start sm:self-auto">
            <button
              onClick={() => setActiveTab('audit')}
              className={`px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition ${
                activeTab === 'audit'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              📜 Admin Audit Trail
            </button>
            <button
              onClick={() => setActiveTab('notifications')}
              className={`px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition ${
                activeTab === 'notifications'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              🔔 Notification Delivery Logs
            </button>
          </div>
        </div>

        {toastMsg && (
          <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-sm flex items-center justify-between">
            <span className="flex items-center gap-2">
              <span>✅</span>
              <span>{toastMsg}</span>
            </span>
            <button onClick={() => setToastMsg('')} className="text-emerald-600">✕</button>
          </div>
        )}

        {errorMsg && (
          <div className="p-3.5 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm flex items-center justify-between">
            <span className="flex items-center gap-2">
              <span>⚠️</span>
              <span>{errorMsg}</span>
            </span>
            <button onClick={() => setErrorMsg('')} className="text-red-500">✕</button>
          </div>
        )}

        {/* TAB 1: AUDIT TRAIL */}
        {activeTab === 'audit' && (
          <div className="space-y-4">
            {/* Filter Bar */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-wrap items-center gap-3">
              <div>
                <label className="block text-[11px] font-medium text-slate-500 mb-1">Filter Action</label>
                <input
                  type="text"
                  placeholder="e.g. USER_CREATED, OVERRIDE..."
                  value={auditActionFilter}
                  onChange={(e) => { setAuditActionFilter(e.target.value); setAuditPage(1); }}
                  className="px-3 py-1.5 text-xs border rounded-lg"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-500 mb-1">Entity Type</label>
                <select
                  value={auditEntityFilter}
                  onChange={(e) => { setAuditEntityFilter(e.target.value); setAuditPage(1); }}
                  className="px-3 py-1.5 text-xs border rounded-lg bg-white"
                >
                  <option value="">All Entities</option>
                  <option value="User">User</option>
                  <option value="Appointment">Appointment</option>
                  <option value="Settings">Settings</option>
                  <option value="BlockedDate">BlockedDate</option>
                  <option value="FAQ">FAQ</option>
                </select>
              </div>

              {(auditActionFilter || auditEntityFilter) && (
                <button
                  onClick={() => {
                    setAuditActionFilter('');
                    setAuditEntityFilter('');
                    setAuditPage(1);
                  }}
                  className="self-end px-3 py-1.5 text-xs text-rose-600 font-medium"
                >
                  Reset Filters
                </button>
              )}
            </div>

            {/* Audit Table */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              {auditLoading ? (
                <div className="py-16 text-center text-slate-400 text-sm">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600 mx-auto mb-2"></div>
                  Loading audit trail...
                </div>
              ) : auditLogs.length === 0 ? (
                <div className="py-16 text-center text-slate-400 text-sm">
                  No audit log records match the search filter.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs sm:text-sm">
                    <thead className="bg-slate-50 text-slate-600 font-semibold border-b">
                      <tr>
                        <th className="py-3 px-4">Timestamp</th>
                        <th className="py-3 px-4">Actor</th>
                        <th className="py-3 px-4">Action</th>
                        <th className="py-3 px-4">Entity</th>
                        <th className="py-3 px-4">Client IP</th>
                        <th className="py-3 px-4 text-right">Snapshot Diff</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-mono text-xs">
                      {auditLogs.map((log) => (
                        <tr key={log._id} className="hover:bg-slate-50/70 transition">
                          <td className="py-3 px-4 text-slate-500 whitespace-nowrap">
                            {new Date(log.createdAt).toLocaleString()}
                          </td>
                          <td className="py-3 px-4 font-sans">
                            <span className="font-semibold text-slate-900 block">
                              {log.actorId?.name || log.actorRole}
                            </span>
                            <span className="text-slate-400 text-[11px]">{log.actorId?.email || 'System'}</span>
                          </td>
                          <td className="py-3 px-4">
                            <span className="px-2 py-0.5 rounded font-bold text-[11px] bg-slate-100 text-slate-800 border">
                              {log.action}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-slate-600 font-sans">
                            <span className="font-medium text-slate-800">{log.entityType}</span>
                            {log.entityId && (
                              <span className="text-[10px] text-slate-400 block font-mono">
                                #{String(log.entityId).slice(-6)}
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-4 text-slate-400">
                            {log.ip || '127.0.0.1'}
                          </td>
                          <td className="py-3 px-4 text-right font-sans">
                            {(log.before || log.after) ? (
                              <button
                                onClick={() => setSelectedAuditLog(log)}
                                className="px-2.5 py-1 rounded bg-teal-50 hover:bg-teal-100 text-teal-700 text-xs font-medium"
                              >
                                View Diff →
                              </button>
                            ) : (
                              <span className="text-slate-400 text-xs">—</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {auditTotalPages > 1 && (
                <div className="p-4 border-t flex items-center justify-between text-xs text-slate-600">
                  <button
                    disabled={auditPage <= 1}
                    onClick={() => setAuditPage(auditPage - 1)}
                    className="px-3 py-1.5 border rounded disabled:opacity-40"
                  >
                    ← Previous
                  </button>
                  <span>
                    Page {auditPage} of {auditTotalPages}
                  </span>
                  <button
                    disabled={auditPage >= auditTotalPages}
                    onClick={() => setAuditPage(auditPage + 1)}
                    className="px-3 py-1.5 border rounded disabled:opacity-40"
                  >
                    Next →
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: NOTIFICATION DELIVERY LOGS */}
        {activeTab === 'notifications' && (
          <div className="space-y-4">
            {/* Filter Bar */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-wrap items-center gap-3">
              <div>
                <label className="block text-[11px] font-medium text-slate-500 mb-1">Status</label>
                <select
                  value={notifStatusFilter}
                  onChange={(e) => { setNotifStatusFilter(e.target.value); setNotifPage(1); }}
                  className="px-3 py-1.5 text-xs border rounded-lg bg-white"
                >
                  <option value="">All Statuses</option>
                  <option value="sent">Sent</option>
                  <option value="failed">Failed</option>
                  <option value="skipped">Skipped</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-500 mb-1">Channel</label>
                <select
                  value={notifChannelFilter}
                  onChange={(e) => { setNotifChannelFilter(e.target.value); setNotifPage(1); }}
                  className="px-3 py-1.5 text-xs border rounded-lg bg-white"
                >
                  <option value="">All Channels</option>
                  <option value="in_app">In-App Bell</option>
                  <option value="email">Email</option>
                  <option value="sms">SMS</option>
                </select>
              </div>

              {(notifStatusFilter || notifChannelFilter) && (
                <button
                  onClick={() => {
                    setNotifStatusFilter('');
                    setNotifChannelFilter('');
                    setNotifPage(1);
                  }}
                  className="self-end px-3 py-1.5 text-xs text-rose-600 font-medium"
                >
                  Reset
                </button>
              )}
            </div>

            {/* Notification Logs Table */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              {notifLoading ? (
                <div className="py-16 text-center text-slate-400 text-sm">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600 mx-auto mb-2"></div>
                  Loading notification logs...
                </div>
              ) : notifLogs.length === 0 ? (
                <div className="py-16 text-center text-slate-400 text-sm">
                  No notification logs found matching your filters.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs sm:text-sm">
                    <thead className="bg-slate-50 text-slate-600 font-semibold border-b">
                      <tr>
                        <th className="py-3 px-4">Timestamp</th>
                        <th className="py-3 px-4">Recipient</th>
                        <th className="py-3 px-4">Channel</th>
                        <th className="py-3 px-4">Subject & Body</th>
                        <th className="py-3 px-4">Delivery Status</th>
                        <th className="py-3 px-4 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {notifLogs.map((log) => (
                        <tr key={log._id} className="hover:bg-slate-50/70 transition">
                          <td className="py-3 px-4 text-slate-500 whitespace-nowrap text-xs font-mono">
                            {new Date(log.createdAt).toLocaleString()}
                          </td>
                          <td className="py-3 px-4">
                            <span className="font-semibold text-slate-900 block">
                              {log.userId?.name || 'User'}
                            </span>
                            <span className="text-slate-400 text-xs font-mono">{log.to}</span>
                          </td>
                          <td className="py-3 px-4">
                            <span className="px-2 py-0.5 rounded text-xs font-medium uppercase tracking-wider bg-slate-100 text-slate-700">
                              {log.channel}
                            </span>
                          </td>
                          <td className="py-3 px-4 max-w-sm">
                            <span className="font-medium text-slate-800 block">{log.subject}</span>
                            <p className="text-xs text-slate-400 truncate">{log.body}</p>
                            {log.error && (
                              <p className="text-[11px] text-rose-600 font-mono mt-0.5">
                                Error: {log.error}
                              </p>
                            )}
                          </td>
                          <td className="py-3 px-4">
                            <span
                              className={`px-2 py-0.5 rounded text-xs font-semibold uppercase tracking-wider ${
                                log.status === 'sent'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : log.status === 'failed'
                                  ? 'bg-rose-100 text-rose-800'
                                  : 'bg-slate-200 text-slate-700'
                              }`}
                            >
                              {log.status}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right">
                            {log.status === 'failed' && (
                              <button
                                onClick={() => handleRetry(log)}
                                disabled={retryingId === log._id}
                                className="px-2.5 py-1 rounded bg-teal-50 hover:bg-teal-100 text-teal-700 text-xs font-medium disabled:opacity-50"
                              >
                                {retryingId === log._id ? 'Retrying...' : '🔄 Retry'}
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {notifTotalPages > 1 && (
                <div className="p-4 border-t flex items-center justify-between text-xs text-slate-600">
                  <button
                    disabled={notifPage <= 1}
                    onClick={() => setNotifPage(notifPage - 1)}
                    className="px-3 py-1.5 border rounded disabled:opacity-40"
                  >
                    ← Previous
                  </button>
                  <span>
                    Page {notifPage} of {notifTotalPages}
                  </span>
                  <button
                    disabled={notifPage >= notifTotalPages}
                    onClick={() => setNotifPage(notifPage + 1)}
                    className="px-3 py-1.5 border rounded disabled:opacity-40"
                  >
                    Next →
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Modal: View Audit Diff Snapshot */}
        {selectedAuditLog && (
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-4 max-h-[85vh] overflow-y-auto">
              <div className="flex items-center justify-between border-b pb-3">
                <div>
                  <h3 className="font-bold text-slate-900 text-base">
                    Audit Snapshot: {selectedAuditLog.action}
                  </h3>
                  <span className="text-xs text-slate-500 font-mono">
                    Entity: {selectedAuditLog.entityType} #{String(selectedAuditLog.entityId).slice(-6)} · By {selectedAuditLog.actorId?.name || selectedAuditLog.actorRole}
                  </span>
                </div>
                <button onClick={() => setSelectedAuditLog(null)} className="text-slate-400 hover:text-slate-600">✕</button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
                {/* Before */}
                <div className="space-y-1">
                  <span className="font-bold text-rose-700 font-sans block">◀ State Before</span>
                  <pre className="p-3 bg-slate-900 text-slate-200 rounded-lg overflow-x-auto text-[11px] max-h-80">
                    {selectedAuditLog.before ? JSON.stringify(selectedAuditLog.before, null, 2) : '(none / newly created)'}
                  </pre>
                </div>

                {/* After */}
                <div className="space-y-1">
                  <span className="font-bold text-emerald-700 font-sans block">▶ State After</span>
                  <pre className="p-3 bg-slate-900 text-slate-200 rounded-lg overflow-x-auto text-[11px] max-h-80">
                    {selectedAuditLog.after ? JSON.stringify(selectedAuditLog.after, null, 2) : '(none / deleted)'}
                  </pre>
                </div>
              </div>

              <div className="pt-3 border-t text-right">
                <button
                  onClick={() => setSelectedAuditLog(null)}
                  className="px-4 py-1.5 bg-slate-800 text-white rounded-lg text-xs"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminLogs;
