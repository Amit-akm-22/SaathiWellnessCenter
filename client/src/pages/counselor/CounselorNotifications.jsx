import { useState, useEffect } from 'react';
import { counselorAPI } from '../../api';
import CounselorNav from '../../components/CounselorNav';

const STATUS_BADGES = {
  sent: 'bg-emerald-50 text-emerald-700 border-emerald-200 font-semibold',
  skipped: 'bg-amber-50 text-amber-700 border-amber-200 font-medium',
  failed: 'bg-rose-50 text-rose-700 border-rose-200 font-bold',
};

const CHANNEL_BADGES = {
  in_app: 'bg-teal-50 text-teal-800 border-teal-200',
  email: 'bg-blue-50 text-blue-800 border-blue-200',
  sms: 'bg-purple-50 text-purple-800 border-purple-200',
};

const CounselorNotifications = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [channel, setChannel] = useState('all');
  const [status, setStatus] = useState('all');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    fetchLogs();
  }, [channel, status, search, page]);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const params = {
        channel: channel !== 'all' ? channel : undefined,
        status: status !== 'all' ? status : undefined,
        search: search.trim() || undefined,
        page,
        limit: 20,
      };

      const res = await counselorAPI.getNotificationLogs(params);
      setLogs(res.data.data.logs);
      setTotalPages(res.data.data.totalPages);
      setTotalCount(res.data.data.total);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load notification logs.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/50 pb-20">
      <CounselorNav />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
              <span>🔔</span> Notification Delivery & Audit Log
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
              Multi-channel delivery status (In-App, Email, SMS). Logs unconfigured channels cleanly as 'skipped'. ({totalCount} entries)
            </p>
          </div>
          <button
            onClick={fetchLogs}
            className="self-start px-3 py-1.5 text-xs bg-white border border-gray-200 hover:border-teal-400 text-gray-700 font-medium rounded-xl shadow-xs"
          >
            🔄 Refresh Logs
          </button>
        </div>

        {/* Filter Bar */}
        <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-xs flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-semibold text-gray-500">Channel:</span>
              <select
                value={channel}
                onChange={(e) => { setChannel(e.target.value); setPage(1); }}
                className="text-xs border border-gray-200 rounded-lg px-2.5 py-1.5 bg-white outline-none focus:ring-2 focus:ring-teal-500 font-medium"
              >
                <option value="all">All Channels</option>
                <option value="in_app">In-App Notification</option>
                <option value="email">Email (SMTP)</option>
                <option value="sms">SMS Gateway</option>
              </select>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="text-xs font-semibold text-gray-500">Status:</span>
              <select
                value={status}
                onChange={(e) => { setStatus(e.target.value); setPage(1); }}
                className="text-xs border border-gray-200 rounded-lg px-2.5 py-1.5 bg-white outline-none focus:ring-2 focus:ring-teal-500 font-medium"
              >
                <option value="all">All Statuses</option>
                <option value="sent">Sent</option>
                <option value="skipped">Skipped (Unconfigured)</option>
                <option value="failed">Failed</option>
              </select>
            </div>
          </div>

          <div className="relative w-full sm:w-72">
            <input
              type="text"
              placeholder="Search recipient or content..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="w-full pl-8 pr-3 py-1.5 text-xs border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-teal-500"
            />
            <span className="absolute left-2.5 top-2 text-gray-400 text-xs">🔍</span>
          </div>
        </div>

        {error && (
          <div className="p-4 bg-red-50 text-red-700 rounded-xl text-sm border border-red-200">
            {error}
          </div>
        )}

        {/* Logs Table */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-xs overflow-hidden">
          {loading ? (
            <div className="py-20 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600 mx-auto mb-2"></div>
              <p className="text-xs text-gray-400">Loading delivery logs...</p>
            </div>
          ) : logs.length === 0 ? (
            <div className="p-12 text-center text-gray-400 text-xs">
              No notification logs found.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-gray-500 uppercase tracking-wider text-[11px] border-b border-gray-100">
                  <tr>
                    <th className="py-3 px-4">Timestamp</th>
                    <th className="py-3 px-3">Channel</th>
                    <th className="py-3 px-3">Recipient</th>
                    <th className="py-3 px-4">Subject & Content</th>
                    <th className="py-3 px-3">Status</th>
                    <th className="py-3 px-4">Diagnostics / Reason</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {logs.map((log) => (
                    <tr key={log._id} className="hover:bg-slate-50/70">
                      <td className="py-3 px-4 whitespace-nowrap text-gray-500">
                        {new Date(log.createdAt).toLocaleString('en-IN', {
                          month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                        })}
                      </td>

                      <td className="py-3 px-3 whitespace-nowrap">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border uppercase ${CHANNEL_BADGES[log.channel] || 'bg-gray-100'}`}>
                          {log.channel.replace('_', '-')}
                        </span>
                      </td>

                      <td className="py-3 px-3">
                        <span className="font-semibold text-gray-800 block">{log.userId?.name || 'User'}</span>
                        <span className="text-[11px] text-gray-500 font-mono">{log.to}</span>
                      </td>

                      <td className="py-3 px-4 max-w-sm">
                        {log.subject && (
                          <p className="font-semibold text-gray-900 truncate">{log.subject}</p>
                        )}
                        <p className="text-gray-600 text-[11px] line-clamp-2">{log.body}</p>
                      </td>

                      <td className="py-3 px-3 whitespace-nowrap">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] border uppercase ${STATUS_BADGES[log.status] || 'bg-gray-100'}`}>
                          {log.status}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-gray-500 text-[11px]">
                        {log.error ? (
                          <span className="text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                            {log.error}
                          </span>
                        ) : (
                          <span className="text-emerald-700">✓ Delivered successfully</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {totalPages > 1 && (
            <div className="p-4 border-t border-gray-100 flex items-center justify-between text-xs">
              <span className="text-gray-500">
                Page {page} of {totalPages} ({totalCount} total)
              </span>
              <div className="flex items-center gap-2">
                <button
                  disabled={page <= 1}
                  onClick={() => setPage(page - 1)}
                  className="px-3 py-1 border border-gray-200 rounded-lg disabled:opacity-40"
                >
                  Previous
                </button>
                <button
                  disabled={page >= totalPages}
                  onClick={() => setPage(page + 1)}
                  className="px-3 py-1 border border-gray-200 rounded-lg disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CounselorNotifications;
