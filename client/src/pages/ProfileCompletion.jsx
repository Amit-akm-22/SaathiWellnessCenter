import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LuSave,
  LuRefreshCw,
  LuBookOpen,
  LuSmartphone,
  LuHeart,
  LuUser,
  LuMail,
  LuLock,
  LuCalendar,
  LuSun,
  LuMoon,
  LuShieldCheck,
  LuCheck,
} from 'react-icons/lu';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import usePrograms from '../hooks/usePrograms';
import useBatches from '../hooks/useBatches';
import { detectBatchFromRoll } from '../utils/batchOptions';

const ProfileCompletion = () => {
  const { user, updateUserDetails } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const { programs } = usePrograms();
  const { batches } = useBatches();

  const getDegreeFromProg = (p) => {
    const progName = p.program || p.name || '';
    return progName.includes(' - ') ? progName.split(' - ')[0].trim() : progName.trim();
  };

  const degrees = [...new Set(programs.map(getDegreeFromProg).filter(Boolean))].sort();

  const getRollFromName = (name) => {
    if (!name) return '';
    const firstPart = name.split(' ')[0] || '';
    return /\d/.test(firstPart) ? firstPart.toUpperCase() : '';
  };

  const getRollFromEmail = (email) => {
    if (!email) return '';
    const handle = email.split('@')[0] || '';
    return /\d/.test(handle) ? handle.toUpperCase() : '';
  };

  const getNameFromName = (name) => {
    if (!name) return '';
    const parts = name.split(' ');
    if (/\d/.test(parts[0])) {
      return parts.length > 1 ? parts.slice(1).join(' ') : name;
    }
    return name;
  };

  const formatDateForInput = (dateStr) => {
    if (!dateStr) return '';
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return dateStr;
    if (/^\d{2}-\d{2}-\d{4}$/.test(dateStr)) {
      const [d, m, y] = dateStr.split('-');
      return `${y}-${m}-${d}`;
    }
    if (/^\d{2}\/\d{2}\/\d{4}$/.test(dateStr)) {
      const [d, m, y] = dateStr.split('/');
      return `${y}-${m}-${d}`;
    }
    const d = new Date(dateStr);
    if (!isNaN(d.getTime())) {
      return d.toISOString().split('T')[0];
    }
    return dateStr;
  };

  const parseBranchString = (branchStr) => {
    if (!branchStr) return { degree: '', branch: branchStr || '' };
    if (branchStr.includes(' - ')) {
      const parts = branchStr.split(' - ');
      return { degree: parts[0].trim(), branch: parts.slice(1).join(' - ').trim() };
    }
    return { degree: '', branch: branchStr };
  };

  // Derive initial locked values
  const initialName = user?.name ? getNameFromName(user.name) : 'Student User';
  const initialRoll =
    user?.rollNumber ||
    user?.enrollmentNo ||
    getRollFromName(user?.name) ||
    getRollFromEmail(user?.email) ||
    (user?.email ? user.email.split('@')[0].toUpperCase() : '0901CS241022');

  const [formData, setFormData] = useState({
    name: initialName,
    personalEmail: user?.email || '',
    rollNumber: initialRoll,
    degree: user?.degree || 'B.Tech',
    department: user?.department || '',
    branch: user?.branch || '',
    mobile: user?.mobile || user?.phone || '',
    dob: formatDateForInput(user?.dob) || '',
    gender: user?.gender || '',
    fatherName: user?.fatherName || '',
    motherName: user?.motherName || '',
    address: user?.address || '',
    batch: user?.batch || '2024-2028',
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) return;

    // If profile is already marked complete, skip straight to dashboard
    if (user.isProfileComplete) {
      navigate('/student/dashboard');
      return;
    }

    const parsed = parseBranchString(user.branch);
    const resolvedDegree = user.degree || parsed.degree || 'B.Tech';
    const resolvedBranch = parsed.branch || '';

    const currentRoll =
      user.rollNumber ||
      user.enrollmentNo ||
      getRollFromName(user.name) ||
      getRollFromEmail(user.email) ||
      formData.rollNumber;

    const autoBatch = detectBatchFromRoll(
      currentRoll,
      resolvedDegree || formData.degree
    );

    setFormData((prev) => ({
      ...prev,
      name: user.name ? getNameFromName(user.name) : prev.name,
      personalEmail: user.email || prev.personalEmail,
      rollNumber: currentRoll || prev.rollNumber,
      degree: resolvedDegree || prev.degree,
      department: user.department || prev.department,
      branch: resolvedBranch || prev.branch,
      mobile: user.mobile || user.phone || prev.mobile,
      batch: user.batch || autoBatch || prev.batch,
      dob: formatDateForInput(user.dob) || prev.dob,
      gender: user.gender || prev.gender,
      fatherName: user.fatherName || prev.fatherName,
      motherName: user.motherName || prev.motherName,
      address: user.address || prev.address,
    }));
  }, [user, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Mobile number constraint: only numbers, max 10 digits
    if (name === 'mobile') {
      const numericValue = value.replace(/\D/g, '').slice(0, 10);
      setFormData((prev) => ({ ...prev, [name]: numericValue }));
      return;
    }

    setFormData((prev) => {
      const newData = { ...prev, [name]: value };
      if (name === 'degree') {
        newData.department = '';
        newData.branch = '';
      } else if (name === 'department') {
        newData.branch = '';
      }
      return newData;
    });
  };

  const availableDepartments = formData.degree
    ? [
        ...new Set(
          programs
            .filter((p) => getDegreeFromProg(p) === formData.degree)
            .map((p) => p.department)
            .filter(Boolean)
        ),
      ].sort()
    : [];

  const availableBranches = formData.department
    ? [
        ...new Set(
          programs
            .filter(
              (p) =>
                getDegreeFromProg(p) === formData.degree &&
                p.department === formData.department
            )
            .map((p) => p.branchName)
            .filter(Boolean)
        ),
      ].sort()
    : [];

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.department) {
      toast.error('Please select your department.');
      return;
    }

    if (!formData.branch) {
      toast.error('Please select your academic branch.');
      return;
    }

    if (formData.mobile && formData.mobile.length !== 10) {
      toast.error('Please enter a valid 10-digit mobile number.');
      return;
    }

    setSaving(true);
    const res = await updateUserDetails(formData);
    if (res.success) {
      toast.success('Profile completed successfully! Redirecting...');
      setTimeout(() => navigate('/student/dashboard'), 1500);
    } else {
      toast.error(res.msg || 'Failed to update profile.');
      setSaving(false);
    }
  };

  // Saathi Theme Input Classes (matching Login.jsx and Home.jsx)
  const inputClasses = `w-full px-4 py-2.5 rounded-xl border text-sm font-medium transition-all duration-200 outline-none ${
    isDark
      ? 'bg-[#101C28] border-[#243547] text-[#F7F8FA] placeholder-[#526579] focus:border-[#A7F477] focus:ring-1 focus:ring-[#A7F477]/30'
      : 'bg-white border-[#DFE4E6] text-[#102D4F] placeholder-slate-400 focus:border-[#075E50] focus:ring-1 focus:ring-[#075E50]/20 shadow-sm'
  }`;

  const labelClasses = `block text-xs font-bold mb-1.5 ${
    isDark ? 'text-[#CBD5E1]' : 'text-[#102D4F]'
  }`;

  // Name and Enrollment Number are strictly locked
  const isNameLocked = true;
  const isRollLocked = true;

  return (
    <div
      className={`min-h-screen py-6 px-4 sm:px-6 lg:px-8 transition-colors duration-200 flex flex-col justify-center items-center ${
        isDark ? 'bg-[#101C28] text-[#F7F8FA]' : 'bg-[#FBF9F4] text-[#102D4F]'
      }`}
    >
      <ToastContainer
        position="top-right"
        autoClose={3000}
        theme={isDark ? 'dark' : 'light'}
      />

      <div className="w-full max-w-4xl my-auto">
        {/* Top Control Bar (Clean Brand Pill + Theme Toggle, No Navbar) */}
        <div className="flex items-center justify-between mb-4 px-1">
          <div className="flex items-center gap-2">
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-extrabold uppercase tracking-wider border ${
                isDark
                  ? 'bg-[#172431] border-[#243547] text-[#A7F477]'
                  : 'bg-white border-[#DFE4E6] text-[#075E50] shadow-sm'
              }`}
            >
              <LuShieldCheck className="w-4 h-4" />
              Saathi Wellness • MITS Gwalior
            </span>
          </div>

          <button
            onClick={toggleTheme}
            className={`p-2 rounded-xl border transition-all duration-200 flex items-center justify-center ${
              isDark
                ? 'bg-[#172431] hover:bg-[#1F3041] border-[#243547] text-[#A7F477]'
                : 'bg-white hover:bg-[#F0FDF4] border-[#DFE4E6] text-[#075E50] shadow-sm'
            }`}
            title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            aria-label="Toggle Theme"
          >
            {isDark ? <LuSun className="w-4 h-4" /> : <LuMoon className="w-4 h-4" />}
          </button>
        </div>

        {/* Main Card (Styled exactly like Login & Home Cards) */}
        <div
          className={`rounded-3xl border shadow-2xl p-6 sm:p-8 lg:p-10 transition-colors duration-200 ${
            isDark
              ? 'bg-[#172431] border-[#243547]'
              : 'bg-[#FCFBF8] border-[#DFE4E6]'
          }`}
        >
          {/* Card Header */}
          <div className="mb-8">
            <p
              className={`text-xs font-semibold tracking-[0.2em] uppercase mb-2 ${
                isDark ? 'text-[#A7F477]' : 'text-[#075E50]'
              }`}
            >
              STUDENT ONBOARDING &nbsp;•&nbsp; ACADEMIC IDENTITY
            </p>
            <h1
              className={`text-2xl sm:text-3xl lg:text-4xl font-extrabold leading-tight mb-2 ${
                isDark ? 'text-[#F7F8FA]' : 'text-[#102D4F]'
              }`}
            >
              Complete your{' '}
              <span className={isDark ? 'text-[#A7F477]' : 'text-[#075E50]'}>
                Profile
              </span>
            </h1>
            <p
              className={`text-xs sm:text-sm leading-relaxed max-w-2xl ${
                isDark ? 'text-[#CBD5E1]' : 'text-[#526579]'
              }`}
            >
              Confirm your verified academic credentials to unlock appointment booking with college faculty counsellors, mental wellness self-assessments, and dedicated student support.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* 1. Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <div
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-bold uppercase tracking-wider ${
                    isDark
                      ? 'bg-[#101C28] border-[#243547] text-[#A7F477]'
                      : 'bg-[#EAF5ED] border-[#DFE4E6] text-[#075E50]'
                  }`}
                >
                  <LuUser className="w-4 h-4" />
                  <span>Basic Information</span>
                </div>
              </div>

              {/* Full Name (Locked) */}
              <div className="relative group">
                <label className={labelClasses}>Full Name (Locked) *</label>
                <div className="relative">
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    disabled={isNameLocked}
                    className={`${inputClasses} ${
                      isDark
                        ? 'bg-[#101C28]/60 border-[#243547]/60 text-[#CBD5E1] cursor-not-allowed pr-10'
                        : 'bg-slate-100 border-[#DFE4E6] text-[#526579] cursor-not-allowed pr-10'
                    }`}
                    placeholder="Your Name"
                  />
                  <LuLock
                    className={`w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 ${
                      isDark ? 'text-[#A7F477]/70' : 'text-[#075E50]/70'
                    }`}
                  />
                </div>
                <div
                  className={`absolute -top-7 left-0 hidden group-hover:block px-2 py-0.5 rounded text-[10px] font-bold z-50 border whitespace-nowrap shadow-md ${
                    isDark
                      ? 'bg-[#101C28] text-[#A7F477] border-[#243547]'
                      : 'bg-[#102D4F] text-[#A7F477] border-[#102D4F]'
                  }`}
                >
                  Verified Record · Unchangeable
                </div>
              </div>

              {/* Personal Email (Locked) */}
              <div className="relative group">
                <label className={labelClasses}>Personal Email (Locked) *</label>
                <div className="relative">
                  <input
                    type="email"
                    name="personalEmail"
                    value={formData.personalEmail}
                    onChange={handleChange}
                    required
                    disabled
                    className={`${inputClasses} ${
                      isDark
                        ? 'bg-[#101C28]/60 border-[#243547]/60 text-[#CBD5E1] cursor-not-allowed pr-10'
                        : 'bg-slate-100 border-[#DFE4E6] text-[#526579] cursor-not-allowed pr-10'
                    }`}
                    placeholder="your.email@gmail.com"
                  />
                  <LuLock
                    className={`w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 ${
                      isDark ? 'text-[#A7F477]/70' : 'text-[#075E50]/70'
                    }`}
                  />
                </div>
                <div
                  className={`absolute -top-7 left-0 hidden group-hover:block px-2 py-0.5 rounded text-[10px] font-bold z-50 border whitespace-nowrap shadow-md ${
                    isDark
                      ? 'bg-[#101C28] text-[#A7F477] border-[#243547]'
                      : 'bg-[#102D4F] text-[#A7F477] border-[#102D4F]'
                  }`}
                >
                  Synced from Google Auth
                </div>
              </div>
            </div>

            {/* Divider */}
            <div
              className={`h-px w-full ${isDark ? 'bg-[#243547]' : 'bg-[#DFE4E6]'}`}
            ></div>

            {/* 2. Academic Identity */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <div
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-bold uppercase tracking-wider ${
                    isDark
                      ? 'bg-[#101C28] border-[#243547] text-[#A7F477]'
                      : 'bg-[#EAF5ED] border-[#DFE4E6] text-[#075E50]'
                  }`}
                >
                  <LuBookOpen className="w-4 h-4" />
                  <span>Academic Identity</span>
                </div>
              </div>

              {/* Enrollment / Roll Number (Locked) */}
              <div className="relative group">
                <label className={labelClasses}>
                  Enrollment / Roll Number (Locked) *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    name="rollNumber"
                    value={formData.rollNumber}
                    onChange={handleChange}
                    required
                    disabled={isRollLocked}
                    className={`${inputClasses} font-mono tracking-wider ${
                      isDark
                        ? 'bg-[#101C28]/60 border-[#243547]/60 text-[#CBD5E1] cursor-not-allowed pr-10'
                        : 'bg-slate-100 border-[#DFE4E6] text-[#526579] cursor-not-allowed pr-10'
                    }`}
                    placeholder="0901CS241022"
                  />
                  <LuLock
                    className={`w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 ${
                      isDark ? 'text-[#A7F477]/70' : 'text-[#075E50]/70'
                    }`}
                  />
                </div>
                <div
                  className={`absolute -top-7 left-0 hidden group-hover:block px-2 py-0.5 rounded text-[10px] font-bold z-50 border whitespace-nowrap shadow-md ${
                    isDark
                      ? 'bg-[#101C28] text-[#A7F477] border-[#243547]'
                      : 'bg-[#102D4F] text-[#A7F477] border-[#102D4F]'
                  }`}
                >
                  Identity Record · Unchangeable
                </div>
              </div>

              {/* Degree */}
              <div className="relative group">
                <label className={labelClasses}>Degree Program *</label>
                <div className="relative">
                  <select
                    name="degree"
                    value={formData.degree}
                    onChange={handleChange}
                    required
                    className={inputClasses}
                  >
                    <option value="">Select Degree</option>
                    {degrees.map((deg, i) => (
                      <option key={deg || `deg-${i}`} value={deg}>
                        {deg}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Department */}
              <div className="relative group">
                <label className={labelClasses}>Department *</label>
                <div className="relative">
                  <select
                    name="department"
                    value={formData.department}
                    onChange={handleChange}
                    required
                    disabled={!formData.degree}
                    className={`${inputClasses} ${
                      !formData.degree ? 'opacity-60 cursor-not-allowed' : ''
                    }`}
                  >
                    <option value="">
                      {!formData.degree
                        ? 'Select Degree First'
                        : 'Select Department'}
                    </option>
                    {availableDepartments.map((dept, i) => (
                      <option key={dept || `dept-${i}`} value={dept}>
                        {dept}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Branch */}
              <div className="relative group">
                <label className={labelClasses}>Branch *</label>
                <div className="relative">
                  <select
                    name="branch"
                    value={formData.branch}
                    onChange={handleChange}
                    required
                    disabled={!formData.department}
                    className={`${inputClasses} ${
                      !formData.department ? 'opacity-60 cursor-not-allowed' : ''
                    }`}
                  >
                    <option value="">
                      {!formData.department
                        ? 'Select Department First'
                        : 'Select Branch'}
                    </option>
                    {availableBranches.map((branch, i) => (
                      <option key={branch || `br-${i}`} value={branch}>
                        {branch}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Batch */}
              <div className="relative group">
                <label className={labelClasses}>Batch (e.g. 2024-2028) *</label>
                <div className="relative">
                  <select
                    name="batch"
                    value={formData.batch}
                    onChange={handleChange}
                    required
                    className={inputClasses}
                  >
                    <option value="">Select Batch</option>
                    {batches.map((b) => (
                      <option key={b} value={b}>
                        {b}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Divider */}
            <div
              className={`h-px w-full ${isDark ? 'bg-[#243547]' : 'bg-[#DFE4E6]'}`}
            ></div>

            {/* 3. Personal & Contact Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <div
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-bold uppercase tracking-wider ${
                    isDark
                      ? 'bg-[#101C28] border-[#243547] text-[#A7F477]'
                      : 'bg-[#EAF5ED] border-[#DFE4E6] text-[#075E50]'
                  }`}
                >
                  <LuSmartphone className="w-4 h-4" />
                  <span>Personal & Contact Details</span>
                </div>
              </div>

              {/* Mobile */}
              <div className="relative group">
                <label className={labelClasses}>Mobile Number *</label>
                <div className="relative">
                  <input
                    type="tel"
                    name="mobile"
                    value={formData.mobile}
                    onChange={handleChange}
                    required
                    maxLength="10"
                    className={inputClasses}
                    placeholder="6264677098"
                  />
                </div>
              </div>

              {/* Date of Birth */}
              <div className="relative group">
                <label className={labelClasses}>Date of Birth *</label>
                <div className="relative">
                  <input
                    type="date"
                    name="dob"
                    value={formData.dob}
                    onChange={handleChange}
                    required
                    className={`${inputClasses} pr-10 [&::-webkit-calendar-picker-indicator]:cursor-pointer`}
                  />
                  <LuCalendar
                    className={`w-4 h-4 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none ${
                      isDark ? 'text-[#CBD5E1]' : 'text-[#526579]'
                    }`}
                  />
                </div>
              </div>

              {/* Gender */}
              <div>
                <label className={labelClasses}>Gender *</label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  required
                  className={inputClasses}
                >
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              {/* Address */}
              <div className="md:col-span-2">
                <label className={labelClasses}>Residential Address *</label>
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  required
                  rows="2"
                  className={`${inputClasses} min-h-[75px] resize-y`}
                  placeholder="Enter your current or residential address in Gwalior / Home"
                />
              </div>

              {/* Parental Details Header */}
              <div className="md:col-span-2">
                <div
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-bold uppercase tracking-wider ${
                    isDark
                      ? 'bg-[#101C28] border-[#243547] text-[#A7F477]'
                      : 'bg-[#EAF5ED] border-[#DFE4E6] text-[#075E50]'
                  }`}
                >
                  <LuHeart className="w-4 h-4" />
                  <span>Parental Details</span>
                </div>
              </div>

              <div>
                <label className={labelClasses}>Father's Name *</label>
                <input
                  type="text"
                  name="fatherName"
                  value={formData.fatherName}
                  onChange={handleChange}
                  required
                  className={inputClasses}
                  placeholder="Mr. Father Name"
                />
              </div>

              <div>
                <label className={labelClasses}>Mother's Name *</label>
                <input
                  type="text"
                  name="motherName"
                  value={formData.motherName}
                  onChange={handleChange}
                  required
                  className={inputClasses}
                  placeholder="Mrs. Mother Name"
                />
              </div>
            </div>

            {/* Submit Action */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={saving}
                className={`w-full py-3.5 px-6 rounded-2xl text-sm font-extrabold flex items-center justify-center gap-2.5 active:scale-[0.99] transition-all shadow-xl ${
                  saving
                    ? 'opacity-60 cursor-not-allowed'
                    : isDark
                    ? 'bg-[#A7F477] hover:bg-[#B5FF91] text-[#102D4F] shadow-[#A7F477]/20'
                    : 'bg-[#075E50] hover:bg-[#064E43] text-white shadow-[#075E50]/20'
                }`}
              >
                {saving ? (
                  <LuRefreshCw className="w-5 h-5 animate-spin" />
                ) : (
                  <LuCheck className="w-5 h-5 stroke-[2.5]" />
                )}
                <span>Synchronize Profile & Enter Wellness Dashboard</span>
              </button>

              <p
                className={`text-center mt-3.5 text-[11px] font-semibold tracking-wide ${
                  isDark ? 'text-[#CBD5E1]' : 'text-[#526579]'
                }`}
              >
                100% Confidential • Secured by MITS Institutional Identity Protocol
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProfileCompletion;
