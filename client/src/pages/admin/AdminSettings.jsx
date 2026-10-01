import { useState, useEffect } from 'react';
import AdminNav from '../../components/AdminNav';
import { adminAPI } from '../../api';

const AdminSettings = () => {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Test Notification State
  const [testChannel, setTestChannel] = useState('in_app');
  const [testRecipient, setTestRecipient] = useState('');
  const [testingNotif, setTestingNotif] = useState(false);
  const [testResult, setTestResult] = useState('');

  // New Slot Form
  const [newSlot, setNewSlot] = useState({
    start: '17:00',
    end: '17:45',
    label: '05:00 PM - 05:45 PM',
    maxCapacity: 3,
  });

  // New Category Form
  const [newCategory, setNewCategory] = useState({
    name: '',
    description: '',
  });

  const fetchSettings = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await adminAPI.getSettings();
      setSettings(res.data.data.settings);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load system settings.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const showToast = (msg) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  const handleSaveSettings = async (e) => {
    if (e) e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const res = await adminAPI.updateSettings(settings);
      setSettings(res.data.data.settings);
      showToast('System settings saved successfully!');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save settings.');
    } finally {
      setSaving(false);
    }
  };

  // Toggle Slot Active
  const toggleSlotActive = (index) => {
    const updatedSlots = [...settings.slots];
    updatedSlots[index].isActive = !updatedSlots[index].isActive;
    setSettings({ ...settings, slots: updatedSlots });
  };

  // Update Slot Capacity
  const updateSlotCapacity = (index, val) => {
    const updatedSlots = [...settings.slots];
    updatedSlots[index].maxCapacity = Number(val) || 1;
    setSettings({ ...settings, slots: updatedSlots });
  };

  // Remove Slot
  const removeSlot = (index) => {
    if (settings.slots.length <= 1) {
      alert('You must have at least one slot in the system.');
      return;
    }
    const updatedSlots = settings.slots.filter((_, i) => i !== index);
    setSettings({ ...settings, slots: updatedSlots });
  };

  // Add Slot
  const handleAddSlot = (e) => {
    e.preventDefault();
    if (!newSlot.start || !newSlot.end) return;
    const label = `${newSlot.start} - ${newSlot.end}`;
    setSettings({
      ...settings,
      slots: [
        ...settings.slots,
        {
          start: newSlot.start,
          end: newSlot.end,
          label,
          maxCapacity: Number(newSlot.maxCapacity) || 3,
          isActive: true,
        },
      ],
    });
    setNewSlot({ start: '', end: '', label: '', maxCapacity: 3 });
  };

  // Add Category
  const handleAddCategory = (e) => {
    e.preventDefault();
    if (!newCategory.name.trim()) return;
    setSettings({
      ...settings,
      issueCategories: [
        ...settings.issueCategories,
        {
          name: newCategory.name.trim(),
          description: newCategory.description.trim(),
          isActive: true,
        },
      ],
    });
    setNewCategory({ name: '', description: '' });
  };

  // Toggle Category Active
  const toggleCategoryActive = (index) => {
    const updated = [...settings.issueCategories];
    updated[index].isActive = !updated[index].isActive;
    setSettings({ ...settings, issueCategories: updated });
  };

  // Remove Category
  const removeCategory = (index) => {
    const updated = settings.issueCategories.filter((_, i) => i !== index);
    setSettings({ ...settings, issueCategories: updated });
  };

  // Test Notification
  const handleSendTestNotification = async (e) => {
    e.preventDefault();
    setTestingNotif(true);
    setTestResult('');
    try {
      const res = await adminAPI.testNotification({
        channel: testChannel,
        to: testRecipient || undefined,
      });
      setTestResult(`Test notification sent! Status: ${res.data.data?.status || 'sent'}`);
    } catch (err) {
      setTestResult(err.response?.data?.message || 'Failed to send test notification.');
    } finally {
      setTestingNotif(false);
    }
  };

  if (loading || !settings) {
    return (
      <div className="min-h-screen bg-slate-50">
        <AdminNav />
        <div className="py-24 text-center text-slate-400">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-teal-600 mx-auto mb-3"></div>
          Loading system settings...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-16">
      <AdminNav />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">System Settings</h1>
            <p className="text-sm text-slate-500">
              Live DB-driven configuration. Adjust slot timings, capacities, issue tags, thresholds, and announcements.
            </p>
          </div>

          <button
            onClick={handleSaveSettings}
            disabled={saving}
            className="px-5 py-2.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white font-medium text-sm transition shadow flex items-center gap-2 disabled:opacity-50"
          >
            <span>💾</span>
            <span>{saving ? 'Saving Settings...' : 'Save All Settings'}</span>
          </button>
        </div>

        {successMsg && (
          <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-sm flex items-center gap-2">
            <span>✅</span>
            <span>{successMsg}</span>
          </div>
        )}

        {error && (
          <div className="p-3.5 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Column 1 & 2: Main Configurations */}
          <div className="lg:col-span-2 space-y-6">
            {/* Card 1: Operating Slots & Capacity */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 space-y-4">
              <div className="flex items-center justify-between border-b pb-3">
                <h2 className="font-bold text-slate-900 text-base flex items-center gap-2">
                  <span>⏰</span>
                  <span>Daily Slots & Capacity Management</span>
                </h2>
                <span className="text-xs text-slate-500">
                  {settings.slots.filter((s) => s.isActive).length} active slots
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div>
                  <label className="text-slate-600 block font-medium mb-1">Session Duration (min)</label>
                  <input
                    type="number"
                    value={settings.sessionDurationMins || 45}
                    onChange={(e) =>
                      setSettings({ ...settings, sessionDurationMins: Number(e.target.value) })
                    }
                    className="w-full px-2.5 py-1.5 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="text-slate-600 block font-medium mb-1">Buffer Time (min)</label>
                  <input
                    type="number"
                    value={settings.bufferMins || 15}
                    onChange={(e) =>
                      setSettings({ ...settings, bufferMins: Number(e.target.value) })
                    }
                    className="w-full px-2.5 py-1.5 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="text-slate-600 block font-medium mb-1">Opening Time</label>
                  <input
                    type="text"
                    value={settings.operatingHours?.start || '10:00'}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        operatingHours: { ...settings.operatingHours, start: e.target.value },
                      })
                    }
                    className="w-full px-2.5 py-1.5 border rounded-lg font-mono"
                  />
                </div>
                <div>
                  <label className="text-slate-600 block font-medium mb-1">Closing Time</label>
                  <input
                    type="text"
                    value={settings.operatingHours?.end || '17:00'}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        operatingHours: { ...settings.operatingHours, end: e.target.value },
                      })
                    }
                    className="w-full px-2.5 py-1.5 border rounded-lg font-mono"
                  />
                </div>
              </div>

              {/* Slot Table */}
              <div className="overflow-x-auto border rounded-lg">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-50 text-slate-600 font-semibold border-b">
                    <tr>
                      <th className="py-2.5 px-3">Slot Time Range</th>
                      <th className="py-2.5 px-3">Label</th>
                      <th className="py-2.5 px-3">Max Capacity</th>
                      <th className="py-2.5 px-3">Active</th>
                      <th className="py-2.5 px-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {settings.slots.map((s, idx) => (
                      <tr key={idx} className={!s.isActive ? 'bg-slate-50/60 opacity-60' : ''}>
                        <td className="py-2.5 px-3 font-mono font-medium">
                          {s.start} - {s.end}
                        </td>
                        <td className="py-2.5 px-3 text-slate-700">{s.label}</td>
                        <td className="py-2.5 px-3">
                          <input
                            type="number"
                            min="1"
                            max="10"
                            value={s.maxCapacity || 3}
                            onChange={(e) => updateSlotCapacity(idx, e.target.value)}
                            className="w-16 px-2 py-1 border rounded text-xs text-center"
                          />
                        </td>
                        <td className="py-2.5 px-3">
                          <input
                            type="checkbox"
                            checked={s.isActive}
                            onChange={() => toggleSlotActive(idx)}
                            className="rounded text-teal-600 focus:ring-teal-500 cursor-pointer"
                          />
                        </td>
                        <td className="py-2.5 px-3 text-right">
                          <button
                            type="button"
                            onClick={() => removeSlot(idx)}
                            className="text-rose-600 hover:text-rose-800 text-xs"
                          >
                            ✕
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Add New Slot Inline */}
              <form onSubmit={handleAddSlot} className="flex flex-wrap items-center gap-2 pt-2 text-xs">
                <input
                  type="time"
                  required
                  value={newSlot.start}
                  onChange={(e) => setNewSlot({ ...newSlot, start: e.target.value })}
                  className="px-2.5 py-1.5 border rounded-lg"
                />
                <span>to</span>
                <input
                  type="time"
                  required
                  value={newSlot.end}
                  onChange={(e) => setNewSlot({ ...newSlot, end: e.target.value })}
                  className="px-2.5 py-1.5 border rounded-lg"
                />
                <input
                  type="number"
                  min="1"
                  max="10"
                  placeholder="Cap"
                  value={newSlot.maxCapacity}
                  onChange={(e) => setNewSlot({ ...newSlot, maxCapacity: e.target.value })}
                  className="w-16 px-2 py-1.5 border rounded-lg text-center"
                />
                <button
                  type="submit"
                  className="px-3 py-1.5 bg-slate-800 text-white rounded-lg hover:bg-slate-900 font-medium"
                >
                  + Add Slot
                </button>
              </form>
            </div>

            {/* Card 2: Issue Categories */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 space-y-4">
              <div className="flex items-center justify-between border-b pb-3">
                <h2 className="font-bold text-slate-900 text-base flex items-center gap-2">
                  <span>🏷️</span>
                  <span>Mental Health Issue Categories</span>
                </h2>
                <span className="text-xs text-slate-500">
                  {settings.issueCategories?.length || 0} categories
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {settings.issueCategories?.map((cat, idx) => (
                  <div
                    key={idx}
                    className={`p-3 rounded-lg border flex items-center justify-between text-xs ${
                      cat.isActive ? 'bg-teal-50/40 border-teal-200' : 'bg-slate-50 border-slate-200 opacity-60'
                    }`}
                  >
                    <div>
                      <span className="font-semibold text-slate-800 block">{cat.name}</span>
                      {cat.description && (
                        <span className="text-slate-400 text-[11px] block">{cat.description}</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={cat.isActive}
                        onChange={() => toggleCategoryActive(idx)}
                        className="rounded text-teal-600"
                        title="Toggle Active"
                      />
                      <button
                        type="button"
                        onClick={() => removeCategory(idx)}
                        className="text-rose-600 hover:text-rose-800"
                        title="Delete Category"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Add Category Form */}
              <form onSubmit={handleAddCategory} className="flex gap-2 pt-2 text-xs">
                <input
                  type="text"
                  placeholder="New category name..."
                  value={newCategory.name}
                  onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                  className="flex-1 px-3 py-1.5 border rounded-lg"
                />
                <button
                  type="submit"
                  className="px-3.5 py-1.5 bg-slate-800 text-white rounded-lg hover:bg-slate-900 font-medium"
                >
                  + Add
                </button>
              </form>
            </div>

            {/* Card 3: Screening Scoring Rules */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 space-y-4">
              <h2 className="font-bold text-slate-900 text-base flex items-center gap-2 border-b pb-3">
                <span>📊</span>
                <span>Mental Health Screening Severity Thresholds</span>
              </h2>

              <p className="text-xs text-slate-500">
                Determines how the 5-question PHQ-4 based screening answers (0-4 each, max score 20) are categorized into risk tiers.
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-200">
                  <span className="font-bold text-emerald-800 uppercase block mb-1">Mild Tier</span>
                  <div className="flex items-center gap-1">
                    <span>Max:</span>
                    <input
                      type="number"
                      value={settings.screeningThresholds?.mildMax || 4}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          screeningThresholds: {
                            ...settings.screeningThresholds,
                            mildMax: Number(e.target.value),
                          },
                        })
                      }
                      className="w-14 px-2 py-1 border rounded text-center bg-white"
                    />
                  </div>
                </div>

                <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                  <span className="font-bold text-yellow-800 uppercase block mb-1">Moderate Tier</span>
                  <div className="flex items-center gap-1">
                    <span>Max:</span>
                    <input
                      type="number"
                      value={settings.screeningThresholds?.moderateMax || 9}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          screeningThresholds: {
                            ...settings.screeningThresholds,
                            moderateMax: Number(e.target.value),
                          },
                        })
                      }
                      className="w-14 px-2 py-1 border rounded text-center bg-white"
                    />
                  </div>
                </div>

                <div className="p-3 bg-orange-50 rounded-lg border border-orange-200">
                  <span className="font-bold text-orange-800 uppercase block mb-1">High Tier</span>
                  <div className="flex items-center gap-1">
                    <span>Max:</span>
                    <input
                      type="number"
                      value={settings.screeningThresholds?.highMax || 14}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          screeningThresholds: {
                            ...settings.screeningThresholds,
                            highMax: Number(e.target.value),
                          },
                        })
                      }
                      className="w-14 px-2 py-1 border rounded text-center bg-white"
                    />
                  </div>
                </div>

                <div className="p-3 bg-rose-50 rounded-lg border border-rose-200">
                  <span className="font-bold text-rose-800 uppercase block mb-1">Severe Tier</span>
                  <div className="flex items-center gap-1">
                    <span>Trigger:</span>
                    <span className="font-bold text-rose-900">
                      &gt; {settings.screeningThresholds?.highMax || 14}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Column 3: Global Announcements & Notification Testing */}
          <div className="space-y-6">
            {/* Card 4: Announcement Banner */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 space-y-3">
              <h2 className="font-bold text-slate-900 text-base flex items-center gap-2 border-b pb-2">
                <span>📢</span>
                <span>Portal Announcement Banner</span>
              </h2>
              <p className="text-xs text-slate-500">
                Shown prominently at the top of the student & counselor portal when active.
              </p>

              <label className="flex items-center gap-2 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={settings.announcementBanner?.isActive || false}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      announcementBanner: {
                        ...settings.announcementBanner,
                        isActive: e.target.checked,
                      },
                    })
                  }
                  className="rounded text-amber-600 focus:ring-amber-500"
                />
                <span className="text-xs font-semibold text-slate-800">
                  Enable Announcement Banner
                </span>
              </label>

              <textarea
                rows="3"
                placeholder="e.g. Exam Week: Special evening counseling sessions available until 8 PM."
                value={settings.announcementBanner?.text || ''}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    announcementBanner: {
                      ...settings.announcementBanner,
                      text: e.target.value,
                    },
                  })
                }
                className="w-full px-3 py-2 text-xs border rounded-lg focus:ring-amber-500"
              />
            </div>

            {/* Card 5: Notification Channels Config */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 space-y-3">
              <h2 className="font-bold text-slate-900 text-base flex items-center gap-2 border-b pb-2">
                <span>🔔</span>
                <span>Notification Channels</span>
              </h2>

              <div className="space-y-2 text-xs">
                <label className="flex items-center justify-between p-2 rounded bg-slate-50 border">
                  <span className="font-medium text-slate-700">In-App Bell Alerts</span>
                  <input
                    type="checkbox"
                    checked={settings.notificationChannels?.inApp !== false}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        notificationChannels: {
                          ...settings.notificationChannels,
                          inApp: e.target.checked,
                        },
                      })
                    }
                    className="rounded text-teal-600"
                  />
                </label>

                <label className="flex items-center justify-between p-2 rounded bg-slate-50 border">
                  <div>
                    <span className="font-medium text-slate-700 block">Email (SMTP) Alerts</span>
                    <span className="text-[10px] text-slate-400">Requires SMTP env variables</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.notificationChannels?.email || false}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        notificationChannels: {
                          ...settings.notificationChannels,
                          email: e.target.checked,
                        },
                      })
                    }
                    className="rounded text-teal-600"
                  />
                </label>

                <label className="flex items-center justify-between p-2 rounded bg-slate-50 border">
                  <div>
                    <span className="font-medium text-slate-700 block">SMS Alerts</span>
                    <span className="text-[10px] text-slate-400">Mock / Twilio gateway</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.notificationChannels?.sms || false}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        notificationChannels: {
                          ...settings.notificationChannels,
                          sms: e.target.checked,
                        },
                      })
                    }
                    className="rounded text-teal-600"
                  />
                </label>
              </div>
            </div>

            {/* Card 6: Test Notification */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 space-y-3">
              <h2 className="font-bold text-slate-900 text-base flex items-center gap-2 border-b pb-2">
                <span>🧪</span>
                <span>Send Test Notification</span>
              </h2>

              <p className="text-xs text-slate-500">
                Trigger an instantaneous test alert to verify notification service dispatch.
              </p>

              <form onSubmit={handleSendTestNotification} className="space-y-2.5 text-xs">
                <div>
                  <label className="block text-slate-600 mb-1">Channel</label>
                  <select
                    value={testChannel}
                    onChange={(e) => setTestChannel(e.target.value)}
                    className="w-full px-2.5 py-1.5 border rounded-lg bg-white"
                  >
                    <option value="in_app">In-App Bell</option>
                    <option value="email">Email</option>
                    <option value="sms">SMS</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-600 mb-1">Recipient (optional)</label>
                  <input
                    type="text"
                    placeholder="Defaults to your email"
                    value={testRecipient}
                    onChange={(e) => setTestRecipient(e.target.value)}
                    className="w-full px-2.5 py-1.5 border rounded-lg"
                  />
                </div>

                <button
                  type="submit"
                  disabled={testingNotif}
                  className="w-full py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-lg font-medium transition disabled:opacity-50"
                >
                  {testingNotif ? 'Dispatching...' : 'Dispatch Test Alert'}
                </button>

                {testResult && (
                  <p className="p-2 bg-slate-100 rounded text-[11px] text-slate-700 font-mono">
                    {testResult}
                  </p>
                )}
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminSettings;
