import { useState, useEffect } from 'react';
import { counselorAPI } from '../api';

const FORWARD_OPTIONS = [
  'Psychiatrist',
  'Head of Department (HOD)',
  'Parent / Guardian',
  'Hostel Warden',
  'Medical Officer',
  'Other',
];

const SessionNotesModal = ({ appointment, isOpen, onClose, onSaved }) => {
  const [summary, setSummary] = useState('');
  const [advice, setAdvice] = useState('');
  const [followUpNeeded, setFollowUpNeeded] = useState(false);
  const [followUpDate, setFollowUpDate] = useState('');
  const [forwarded, setForwarded] = useState(false);
  const [forwardedTo, setForwardedTo] = useState('Psychiatrist');
  const [customForwardedTo, setCustomForwardedTo] = useState('');
  const [forwardedReason, setForwardedReason] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (appointment?.sessionNotes) {
      const n = appointment.sessionNotes;
      setSummary(n.summary || '');
      setAdvice(n.advice || '');
      setFollowUpNeeded(Boolean(n.followUpNeeded));
      setFollowUpDate(n.followUpDate ? new Date(n.followUpDate).toISOString().split('T')[0] : '');
      setForwarded(Boolean(n.forwarded));
      if (FORWARD_OPTIONS.includes(n.forwardedTo)) {
        setForwardedTo(n.forwardedTo || 'Psychiatrist');
      } else if (n.forwardedTo) {
        setForwardedTo('Other');
        setCustomForwardedTo(n.forwardedTo);
      }
      setForwardedReason(n.forwardedReason || '');
    } else {
      setSummary('');
      setAdvice('');
      setFollowUpNeeded(false);
      setFollowUpDate('');
      setForwarded(false);
      setForwardedTo('Psychiatrist');
      setCustomForwardedTo('');
      setForwardedReason('');
    }
    setError('');
  }, [appointment, isOpen]);

  if (!isOpen || !appointment) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!summary.trim()) {
      setError('Summary of discussion is required.');
      return;
    }
    if (!advice.trim()) {
      setError('Advice given is required.');
      return;
    }

    const finalForwardedTo = forwardedTo === 'Other' ? customForwardedTo.trim() : forwardedTo;
    if (forwarded) {
      if (!finalForwardedTo) {
        setError('Please specify who this case is forwarded to.');
        return;
      }
      if (!forwardedReason.trim()) {
        setError('Please provide a reason for forwarding the case.');
        return;
      }
    }

    setSaving(true);
    try {
      const payload = {
        summary: summary.trim(),
        advice: advice.trim(),
        followUpNeeded,
        followUpDate: followUpNeeded && followUpDate ? followUpDate : null,
        forwarded,
        forwardedTo: forwarded ? finalForwardedTo : '',
        forwardedReason: forwarded ? forwardedReason.trim() : '',
      };
      const res = await counselorAPI.saveNotes(appointment._id, payload);
      if (onSaved) onSaved(res.data.data.sessionNotes);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save session notes.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-gray-100 max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between pb-4 border-b border-gray-100">
          <div>
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <span>📝</span> Session Notes
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Confidential to counselors only. Student: <strong className="text-gray-700">{appointment.name}</strong> ({appointment.branch} {appointment.year} Yr)
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-100"
          >
            ✕
          </button>
        </div>

        {error && (
          <div className="mt-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm border border-red-200">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
              Summary of Discussion <span className="text-red-500">*</span>
            </label>
            <textarea
              required
              rows={4}
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              placeholder="Key concerns discussed, emotional state, academic/personal context..."
              className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
              Advice & Recommendations <span className="text-red-500">*</span>
            </label>
            <textarea
              required
              rows={3}
              value={advice}
              onChange={(e) => setAdvice(e.target.value)}
              placeholder="Actionable coping strategies, exercises suggested, study routines..."
              className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none"
            />
          </div>

          <div className="bg-gray-50/70 p-4 rounded-xl space-y-3 border border-gray-100">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-800 flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={followUpNeeded}
                  onChange={(e) => setFollowUpNeeded(e.target.checked)}
                  className="rounded text-teal-600 focus:ring-teal-500 h-4 w-4"
                />
                Follow-up session needed?
              </label>
              {followUpNeeded && (
                <input
                  type="date"
                  value={followUpDate}
                  onChange={(e) => setFollowUpDate(e.target.value)}
                  className="text-xs px-3 py-1.5 border border-gray-200 rounded-lg bg-white outline-none focus:ring-2 focus:ring-teal-500"
                />
              )}
            </div>

            <div className="border-t border-gray-200/60 pt-3">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-800 flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={forwarded}
                    onChange={(e) => setForwarded(e.target.checked)}
                    className="rounded text-teal-600 focus:ring-teal-500 h-4 w-4"
                  />
                  Forwarded to someone? (e.g. Psychiatrist, HOD, Warden)
                </label>
              </div>

              {forwarded && (
                <div className="mt-3 space-y-3 pl-6 border-l-2 border-teal-500">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Forwarded To <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={forwardedTo}
                      onChange={(e) => setForwardedTo(e.target.value)}
                      className="w-full px-3 py-1.5 text-sm border border-gray-200 rounded-lg bg-white focus:ring-2 focus:ring-teal-500 outline-none"
                    >
                      {FORWARD_OPTIONS.map((opt) => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                    {forwardedTo === 'Other' && (
                      <input
                        type="text"
                        placeholder="Specify person / role..."
                        value={customForwardedTo}
                        onChange={(e) => setCustomForwardedTo(e.target.value)}
                        className="mt-2 w-full px-3 py-1.5 text-sm border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-teal-500"
                      />
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Reason for Forwarding <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Symptoms require medical diagnosis and prescription..."
                      value={forwardedReason}
                      onChange={(e) => setForwardedReason(e.target.value)}
                      className="w-full px-3 py-1.5 text-sm border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-xl font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2 text-sm bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-medium shadow-xs disabled:opacity-50 flex items-center gap-1.5"
            >
              {saving ? 'Saving Notes...' : '💾 Save Notes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SessionNotesModal;
