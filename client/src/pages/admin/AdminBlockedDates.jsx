import { useState, useEffect } from 'react';
import AdminNav from '../../components/AdminNav';
import { adminAPI } from '../../api';

const AdminBlockedDates = () => {
  const [blockedDates, setBlockedDates] = useState([]);
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    date: '',
    slot: '',
    reason: '',
  });

  const fetchBlockedDates = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await adminAPI.getBlockedDates();
      setBlockedDates(res.data.data.blockedDates || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch blocked dates.');
    } finally {
      setLoading(false);
    }
  };

  const fetchSlots = async () => {
    try {
      const res = await adminAPI.getSettings();
      setSlots(res.data.data.settings?.slots?.filter((s) => s.isActive) || []);
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    fetchBlockedDates();
    fetchSlots();
  }, []);

  const showToast = (msg) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  const handleAddBlockedDate = async (e) => {
    e.preventDefault();
    if (!form.date) return;
    setSubmitting(true);
    setError('');
    try {
      await adminAPI.addBlockedDate({
        date: form.date,
        slot: form.slot || null,
        reason: form.reason.trim() || 'Holiday / Center Closed',
      });
      showToast('Date blocked successfully.');
      setForm({ date: '', slot: '', reason: '' });
      fetchBlockedDates();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to block date.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRemoveBlockedDate = async (id, label) => {
    if (!window.confirm(`Unblock ${label}? Students will be able to book appointments again.`)) {
      return;
    }
    try {
      await adminAPI.removeBlockedDate(id);
      showToast('Blocked date removed.');
      fetchBlockedDates();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to remove blocked date.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <AdminNav />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Blocked Dates & Holidays</h1>
          <p className="text-sm text-slate-500">
            Designate campus holidays or block specific time slots. Blocked dates prevent students from scheduling appointments.
          </p>
        </div>

        {successMsg && (
          <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-sm flex items-center justify-between">
            <span className="flex items-center gap-2">
              <span>✅</span>
              <span>{successMsg}</span>
            </span>
            <button onClick={() => setSuccessMsg('')} className="text-emerald-600">✕</button>
          </div>
        )}

        {error && (
          <div className="p-3.5 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm flex items-center justify-between">
            <span className="flex items-center gap-2">
              <span>⚠️</span>
              <span>{error}</span>
            </span>
            <button onClick={() => setError('')} className="text-red-500">✕</button>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Block Date Form Card */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 space-y-4">
            <h2 className="font-bold text-slate-900 text-base flex items-center gap-2 border-b pb-3">
              <span>🚫</span>
              <span>Block a Date or Slot</span>
            </h2>

            <form onSubmit={handleAddBlockedDate} className="space-y-3.5 text-xs sm:text-sm">
              <div>
                <label className="block text-slate-700 font-medium mb-1">Select Date *</label>
                <input
                  type="date"
                  required
                  value={form.date}
                  onChange={(e) => setForm({ ...form, date: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">Scope</label>
                <select
                  value={form.slot}
                  onChange={(e) => setForm({ ...form, slot: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-teal-500 bg-white"
                >
                  <option value="">Full Day (All Slots Blocked)</option>
                  {slots.map((s) => (
                    <option key={s.start} value={`${s.start}-${s.end}`}>
                      Slot: {s.start} - {s.end} ({s.label})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">Reason / Holiday Name</label>
                <input
                  type="text"
                  placeholder="e.g. Gandhi Jayanti / Staff Development Day"
                  value={form.reason}
                  onChange={(e) => setForm({ ...form, reason: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-teal-500"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-medium transition shadow-sm disabled:opacity-50"
              >
                {submitting ? 'Blocking...' : 'Confirm Block'}
              </button>
            </form>
          </div>

          {/* Blocked Dates List Table */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Currently Blocked Dates ({blockedDates.length})
              </span>
            </div>

            {loading ? (
              <div className="py-16 text-center text-slate-400 text-sm">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600 mx-auto mb-2"></div>
                Loading blocked dates...
              </div>
            ) : blockedDates.length === 0 ? (
              <div className="py-16 text-center text-slate-400 text-sm">
                No dates are currently blocked. The center operates on normal schedule.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs sm:text-sm">
                  <thead className="bg-slate-50 text-slate-600 font-semibold border-b">
                    <tr>
                      <th className="py-3 px-4">Date</th>
                      <th className="py-3 px-4">Blocked Slot</th>
                      <th className="py-3 px-4">Reason</th>
                      <th className="py-3 px-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {blockedDates.map((b) => (
                      <tr key={b._id} className="hover:bg-slate-50/70 transition">
                        <td className="py-3 px-4 font-semibold text-slate-900 font-mono">
                          {b.date}
                        </td>
                        <td className="py-3 px-4">
                          {b.slot ? (
                            <span className="px-2 py-0.5 rounded text-xs font-mono font-medium bg-amber-100 text-amber-800">
                              {b.slot}
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded text-xs font-semibold bg-rose-100 text-rose-800">
                              Full Day
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-slate-700">
                          {b.reason}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={() => handleRemoveBlockedDate(b._id, `${b.date} (${b.slot || 'Full Day'})`)}
                            className="px-2.5 py-1 rounded bg-slate-100 hover:bg-rose-50 hover:text-rose-700 text-slate-600 text-xs font-medium transition"
                          >
                            Unblock
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminBlockedDates;
