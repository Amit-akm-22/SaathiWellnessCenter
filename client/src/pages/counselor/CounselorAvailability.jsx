import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import CounselorNav from '../../components/CounselorNav';
import { counselorAPI } from '../../api';
import {
  LuClock,
  LuCalendar,
  LuCircleCheck,
  LuBan,
  LuUser,
  LuRefreshCw,
  LuCircleAlert,
  LuChevronLeft,
  LuChevronRight,
  LuSparkles,
  LuShieldAlert,
} from 'react-icons/lu';

const CounselorAvailability = () => {
  const { isDark } = useTheme();

  const getTodayStr = () => new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState(getTodayStr());
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [availabilityData, setAvailabilityData] = useState(null);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('success');

  const showToast = (msg, type = 'success') => {
    setToastMessage(msg);
    setToastType(type);
    setTimeout(() => setToastMessage(''), 3500);
  };

  const fetchAvailability = useCallback(async (dateStr) => {
    setLoading(true);
    try {
      const res = await counselorAPI.getAvailability(dateStr);
      setAvailabilityData(res.data.data);
    } catch {
      showToast('Failed to load availability for this date.', 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAvailability(selectedDate);
  }, [selectedDate, fetchAvailability]);

  // Toggle slot free / busy
  const handleToggleSlot = async (slot, currentStatus) => {
    const willBeFree = currentStatus === 'busy';
    setActionLoading(true);
    try {
      const res = await counselorAPI.toggleSlotAvailability({
        date: selectedDate,
        slot,
        isFree: willBeFree,
        reason: willBeFree ? '' : 'Counselor Busy',
      });
      showToast(res.data.message || (willBeFree ? 'Slot marked Free.' : 'Slot marked Busy.'));
      await fetchAvailability(selectedDate);
    } catch {
      showToast('Failed to update slot status.', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  // Toggle whole day block / unblock
  const handleToggleDay = async () => {
    const isCurrentlyBlocked = availabilityData?.isDayBlocked;
    const willBlock = !isCurrentlyBlocked;
    setActionLoading(true);
    try {
      const res = await counselorAPI.toggleDayAvailability({
        date: selectedDate,
        isBlocked: willBlock,
        reason: willBlock ? 'Counselor Out of Office / Leave' : '',
      });
      showToast(res.data.message || (willBlock ? 'Day marked Blocked.' : 'Day marked Available.'));
      await fetchAvailability(selectedDate);
    } catch {
      showToast('Failed to update day availability.', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  // Date navigation helpers
  const changeDateByDays = (days) => {
    const current = new Date(selectedDate + 'T00:00:00');
    current.setDate(current.getDate() + days);
    setSelectedDate(current.toISOString().split('T')[0]);
  };

  const formattedDateHeader = () => {
    try {
      const dateObj = new Date(selectedDate + 'T00:00:00');
      return dateObj.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return selectedDate;
    }
  };

  // Generate next 7 quick dates
  const quickDates = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    const str = d.toISOString().split('T')[0];
    const isToday = i === 0;
    const dayLabel = isToday
      ? 'Today'
      : i === 1
      ? 'Tomorrow'
      : d.toLocaleDateString('en-US', { weekday: 'short' });
    const dayNum = d.getDate();
    return { str, dayLabel, dayNum };
  });

  const slots = availabilityData?.slots || [];
  const freeCount = slots.filter((s) => s.status === 'free').length;
  const busyCount = slots.filter((s) => s.status === 'busy').length;
  const bookedCount = slots.filter((s) => s.status === 'booked').length;

  return (
    <div className={`min-h-screen transition-colors duration-200 ${isDark ? 'bg-[#101C28]' : 'bg-[#FBF9F4]'}`}>
      <CounselorNav />

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div
          className={`fixed top-20 right-5 z-50 flex items-center gap-2.5 px-4 py-3 rounded-2xl shadow-2xl text-xs sm:text-sm font-bold border transition-all animate-bounce ${
            toastType === 'error'
              ? 'bg-rose-500 text-white border-rose-400'
              : 'bg-[#A7F477] text-[#102D4F] border-[#A7F477]'
          }`}
        >
          {toastType === 'error' ? <LuAlertCircle className="w-5 h-5" /> : <LuCheckCircle2 className="w-5 h-5" />}
          <span>{toastMessage}</span>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider mb-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className={isDark ? 'text-[#A7F477]' : 'text-[#075E50]'}>Counselor Schedule Controller</span>
            </div>
            <h1 className={`text-2xl sm:text-3xl font-extrabold tracking-tight ${isDark ? 'text-[#F7F8FA]' : 'text-[#102D4F]'}`}>
              Time Slot & Availability Manager
            </h1>
            <p className={`text-xs sm:text-sm mt-1 ${isDark ? 'text-[#CBD5E1]' : 'text-[#526579]'}`}>
              Configure your daily working hours, mark yourself free or busy, and prevent students from booking blocked slots.
            </p>
          </div>

          {/* Quick Date Selector & Refresh */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => fetchAvailability(selectedDate)}
              disabled={loading || actionLoading}
              className={`p-2.5 rounded-xl border transition-all ${
                isDark
                  ? 'bg-[#172431] border-[#243547] text-[#A7F477] hover:bg-[#1F3041]'
                  : 'bg-white border-[#DFE4E6] text-[#075E50] hover:bg-slate-50 shadow-sm'
              }`}
              title="Refresh Slots"
            >
              <LuRefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className={`px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold border outline-none ${
                isDark
                  ? 'bg-[#172431] border-[#243547] text-[#F7F8FA]'
                  : 'bg-white border-[#DFE4E6] text-[#102D4F] shadow-sm'
              }`}
            />
          </div>
        </div>

        {/* Quick Date Strip (Next 7 Days) */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          <button
            onClick={() => changeDateByDays(-1)}
            className={`p-2.5 rounded-xl border shrink-0 ${
              isDark ? 'bg-[#172431] border-[#243547] text-slate-300' : 'bg-white border-[#DFE4E6] text-slate-600'
            }`}
          >
            <LuChevronLeft className="w-4 h-4" />
          </button>

          {quickDates.map((item) => {
            const isSelected = item.str === selectedDate;
            return (
              <button
                key={item.str}
                onClick={() => setSelectedDate(item.str)}
                className={`flex flex-col items-center justify-center min-w-[76px] py-2.5 px-3 rounded-2xl border text-xs font-bold transition-all shrink-0 ${
                  isSelected
                    ? isDark
                      ? 'bg-[#A7F477] text-[#102D4F] border-[#A7F477] shadow-lg shadow-[#A7F477]/20 scale-105'
                      : 'bg-[#075E50] text-white border-[#075E50] shadow-lg shadow-[#075E50]/20 scale-105'
                    : isDark
                    ? 'bg-[#172431] border-[#243547] text-[#CBD5E1] hover:bg-[#1F3041]'
                    : 'bg-white border-[#DFE4E6] text-[#526579] hover:bg-slate-50'
                }`}
              >
                <span className="text-[10px] uppercase font-semibold opacity-80">{item.dayLabel}</span>
                <span className="text-base font-extrabold">{item.dayNum}</span>
              </button>
            );
          })}

          <button
            onClick={() => changeDateByDays(1)}
            className={`p-2.5 rounded-xl border shrink-0 ${
              isDark ? 'bg-[#172431] border-[#243547] text-slate-300' : 'bg-white border-[#DFE4E6] text-slate-600'
            }`}
          >
            <LuChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Date Status Summary Banner */}
        <div
          className={`p-6 rounded-3xl border shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6 transition-colors ${
            isDark ? 'bg-[#172431] border-[#243547]' : 'bg-[#FCFBF8] border-[#DFE4E6]'
          }`}
        >
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <LuCalendar className={`w-5 h-5 ${isDark ? 'text-[#A7F477]' : 'text-[#075E50]'}`} />
              <h2 className={`text-lg sm:text-xl font-extrabold ${isDark ? 'text-white' : 'text-[#102D4F]'}`}>
                {formattedDateHeader()}
              </h2>
              {availabilityData?.isDayBlocked && (
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/30">
                  Day Blocked
                </span>
              )}
            </div>
            <p className={`text-xs sm:text-sm ${isDark ? 'text-[#CBD5E1]' : 'text-[#526579]'}`}>
              {availabilityData?.isDayBlocked
                ? `Reason: ${availabilityData.dayBlockedReason || 'Out of Office / Leave'}. Students cannot book any slots today.`
                : 'Manage each individual time slot below to allow or restrict student wellness bookings.'}
            </p>
          </div>

          {/* Counts & Action */}
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-3 text-xs font-bold">
              <span className="px-3 py-1.5 rounded-xl border bg-emerald-500/10 text-emerald-400 border-emerald-500/30 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                {freeCount} Free
              </span>
              <span className="px-3 py-1.5 rounded-xl border bg-blue-500/10 text-blue-400 border-blue-500/30 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-blue-400"></span>
                {bookedCount} Booked
              </span>
              <span className="px-3 py-1.5 rounded-xl border bg-rose-500/10 text-rose-400 border-rose-500/30 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-rose-400"></span>
                {busyCount} Busy
              </span>
            </div>

            <button
              onClick={handleToggleDay}
              disabled={actionLoading}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
                availabilityData?.isDayBlocked
                  ? isDark
                    ? 'bg-[#A7F477] text-[#102D4F] border-[#A7F477] hover:bg-[#B5FF91]'
                    : 'bg-[#075E50] text-white border-[#075E50] hover:bg-[#064E43]'
                  : 'bg-rose-500/10 text-rose-400 border-rose-500/30 hover:bg-rose-500/20'
              }`}
            >
              {availabilityData?.isDayBlocked ? 'Unblock Entire Day' : 'Block Entire Day (Leave / Meeting)'}
            </button>
          </div>
        </div>

        {/* Time Slot Grid */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className={`text-base font-extrabold flex items-center gap-2 ${isDark ? 'text-white' : 'text-[#102D4F]'}`}>
              <LuClock className={`w-4 h-4 ${isDark ? 'text-[#A7F477]' : 'text-[#075E50]'}`} />
              Counseling Slots ({slots.length} Daily Slots)
            </h3>
            <span className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Click slot actions to switch between Free and Busy
            </span>
          </div>

          {loading ? (
            <div className="py-20 text-center">
              <LuRefreshCw className={`w-8 h-8 mx-auto animate-spin mb-3 ${isDark ? 'text-[#A7F477]' : 'text-[#075E50]'}`} />
              <p className={`text-xs font-semibold ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                Loading slot schedule...
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {slots.map((s) => {
                const isBooked = s.status === 'booked';
                const isBusy = s.status === 'busy';
                const isFree = s.status === 'free';

                return (
                  <div
                    key={s.slot}
                    className={`rounded-2xl p-5 border shadow-md flex flex-col justify-between transition-all ${
                      isBooked
                        ? isDark
                          ? 'bg-[#17283c] border-blue-500/40 ring-1 ring-blue-500/20'
                          : 'bg-blue-50/50 border-blue-200'
                        : isBusy
                        ? isDark
                          ? 'bg-[#1e2029] border-rose-500/30 opacity-90'
                          : 'bg-rose-50/50 border-rose-200 opacity-90'
                        : isDark
                        ? 'bg-[#172431] border-[#243547] hover:border-[#A7F477]/40'
                        : 'bg-white border-[#DFE4E6] hover:border-[#075E50]/40'
                    }`}
                  >
                    {/* Top Row: Time & Status Badge */}
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <div>
                        <span className={`text-sm font-extrabold flex items-center gap-1.5 ${isDark ? 'text-white' : 'text-[#102D4F]'}`}>
                          <LuClock className="w-4 h-4 text-slate-400" />
                          {s.slot}
                        </span>
                        <p className={`text-[11px] mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                          Standard Session: 45 Mins
                        </p>
                      </div>

                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${
                          isBooked
                            ? 'bg-blue-500/10 text-blue-400 border-blue-500/30'
                            : isBusy
                            ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                            : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                        }`}
                      >
                        {isBooked ? 'Booked' : isBusy ? 'Busy / Blocked' : 'Free / Available'}
                      </span>
                    </div>

                    {/* Middle Content */}
                    <div className="py-2 min-h-[70px]">
                      {isBooked && s.appointment ? (
                        <div
                          className={`p-3 rounded-xl border text-xs space-y-1.5 ${
                            isDark ? 'bg-[#101C28]/80 border-blue-500/30' : 'bg-white border-blue-200'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className={`font-bold flex items-center gap-1 ${isDark ? 'text-white' : 'text-[#102D4F]'}`}>
                              <LuUser className="w-3.5 h-3.5 text-blue-400" />
                              {s.appointment.name}
                            </span>
                            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
                              {s.appointment.enrollmentNo || 'MITS'}
                            </span>
                          </div>
                          <p className={`text-[11px] truncate ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                            {s.appointment.branch} • {s.appointment.issueCategory || 'General Wellness'}
                          </p>
                          <div className="flex items-center justify-between pt-1">
                            <span className="text-[10px] font-semibold text-blue-400 uppercase tracking-wider">
                              Status: {s.appointment.status}
                            </span>
                            <Link
                              to="/counselor/appointments"
                              className="text-[10px] font-bold text-blue-400 hover:underline"
                            >
                              Manage Appointment →
                            </Link>
                          </div>
                        </div>
                      ) : isBusy ? (
                        <div
                          className={`p-3 rounded-xl border text-xs flex items-center gap-2 ${
                            isDark ? 'bg-[#101C28]/60 border-rose-500/20 text-rose-300' : 'bg-white border-rose-200 text-rose-700'
                          }`}
                        >
                          <LuBan className="w-4 h-4 text-rose-400 shrink-0" />
                          <span className="leading-snug">
                            {s.blockedReason || 'Marked unavailable by counselor.'} Students cannot book.
                          </span>
                        </div>
                      ) : (
                        <div
                          className={`p-3 rounded-xl border text-xs flex items-center gap-2 ${
                            isDark ? 'bg-[#101C28]/60 border-emerald-500/20 text-emerald-300' : 'bg-white border-emerald-200 text-emerald-700'
                          }`}
                        >
                          <LuCircleCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                          <span className="leading-snug">
                            Slot is completely free. Students can select and book on Saathi Portal.
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Bottom Action Button */}
                    <div className="pt-3 border-t border-slate-700/40 mt-2">
                      {isBooked ? (
                        <Link
                          to="/counselor/queue"
                          className={`w-full py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 border transition-all ${
                            isDark
                              ? 'bg-blue-500/10 text-blue-400 border-blue-500/30 hover:bg-blue-500/20'
                              : 'bg-blue-50 text-blue-600 border-blue-200 hover:bg-blue-100'
                          }`}
                        >
                          <span>Open in Today's Queue</span>
                        </Link>
                      ) : isBusy ? (
                        <button
                          onClick={() => handleToggleSlot(s.slot, s.status)}
                          disabled={actionLoading}
                          className={`w-full py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all border ${
                            isDark
                              ? 'bg-[#A7F477] text-[#102D4F] border-[#A7F477] hover:bg-[#B5FF91]'
                              : 'bg-[#075E50] text-white border-[#075E50] hover:bg-[#064E43]'
                          }`}
                        >
                          <LuCircleCheck className="w-4 h-4" />
                          <span>Mark Slot as Free</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => handleToggleSlot(s.slot, s.status)}
                          disabled={actionLoading}
                          className="w-full py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 border border-rose-500/30 bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 transition-all"
                        >
                          <LuBan className="w-4 h-4" />
                          <span>Mark as Busy (Block)</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Operational Guideline Strip */}
        <div
          className={`p-5 rounded-2xl border text-xs space-y-2 ${
            isDark ? 'bg-[#101C28]/80 border-[#243547] text-[#CBD5E1]' : 'bg-[#EAF5ED] border-[#DFE4E6] text-[#102D4F]'
          }`}
        >
          <div className="flex items-center gap-2 font-bold text-sm">
            <LuSparkles className={isDark ? 'text-[#A7F477]' : 'text-[#075E50]'} />
            Counselor Availability Policy
          </div>
          <p>
            • Slots marked <strong>Free</strong> appear directly in the student appointment booking page.
          </p>
          <p>
            • Slots marked <strong>Busy</strong> are instantly locked to prevent any student from reserving that time.
          </p>
          <p>
            • Active appointments cannot be overridden by availability toggles without formal rescheduling.
          </p>
        </div>
      </div>
    </div>
  );
};

export default CounselorAvailability;
