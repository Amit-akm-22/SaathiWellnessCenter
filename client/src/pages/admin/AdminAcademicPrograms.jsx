import { useState, useMemo } from 'react';
import { useTheme } from '../../context/ThemeContext';
import {
  LuSearch,
  LuPlus,
  LuCalendar,
  LuPencil,
  LuTrash2,
  LuRotateCcw,
  LuX,
  LuCheck,
  LuBuilding,
  LuGraduationCap,
  LuFilter,
} from 'react-icons/lu';

const defaultDepartmentsData = [
  {
    id: 1,
    deptName: 'Centre for Artificial Intelligence',
    branches: [
      { id: 'b1-1', degree: 'B.Tech', code: 'AD', name: 'Artificial Intelligence (AI) and Data Science', duration: '8 Sem' },
      { id: 'b1-2', degree: 'B.Tech', code: 'AM', name: 'Artificial Intelligence and Machine Learning', duration: '8 Sem' },
      { id: 'b1-3', degree: 'B.Tech', code: 'AI', name: 'Artificial Intelligence(AI)', duration: '8 Sem' },
      { id: 'b1-4', degree: 'B.Tech', code: 'IR', name: 'IT (Artificial Intelligence and Robotics)', duration: '8 Sem' },
    ],
  },
  {
    id: 2,
    deptName: 'Centre for Computer Science and Technology',
    branches: [
      { id: 'b2-1', degree: 'B.Tech', code: 'CB', name: 'Computer Science and Business Systems', duration: '8 Sem' },
      { id: 'b2-2', degree: 'B.Tech', code: 'CT', name: 'Computer science and Technology', duration: '8 Sem' },
    ],
  },
  {
    id: 3,
    deptName: 'Centre for Internet of Things',
    branches: [
      { id: 'b3-1', degree: 'B.Tech', code: 'EC', name: 'Electrical and Computer Engineering', duration: '8 Sem' },
      { id: 'b3-2', degree: 'B.Tech', code: 'EO', name: 'Internet of Things', duration: '8 Sem' },
      { id: 'b3-3', degree: 'B.Tech', code: 'IO', name: 'Internet of Things (IoT)', duration: '8 Sem' },
    ],
  },
  {
    id: 4,
    deptName: 'Computer Science and Design',
    branches: [
      { id: 'b4-1', degree: 'B.Tech', code: 'CD', name: 'Computer Science and Design', duration: '8 Sem' },
    ],
  },
  {
    id: 5,
    deptName: 'Electrical Engineering',
    branches: [
      { id: 'b5-1', degree: 'PhD', code: 'PDEE', name: 'Electrical Engineering', duration: '8 Sem' },
    ],
  },
  {
    id: 6,
    deptName: 'School of Architecture',
    branches: [
      { id: 'b6-1', degree: 'B.Arch', code: 'AR', name: 'Bachelor of Architecture', duration: '10 Sem' },
      { id: 'b6-2', degree: 'MUP', code: 'MUP', name: 'Urban Planning', duration: '4 Sem' },
    ],
  },
  {
    id: 7,
    deptName: 'School of Chemical Engineering',
    branches: [
      { id: 'b7-1', degree: 'B.Tech', code: 'CM', name: 'Chemical Engineering', duration: '8 Sem' },
    ],
  },
  {
    id: 8,
    deptName: 'School of Civil Engineering',
    branches: [
      { id: 'b8-1', degree: 'B.Tech', code: 'CE', name: 'Civil Engineering', duration: '8 Sem' },
      { id: 'b8-2', degree: 'M.Tech', code: 'MTCTM', name: 'Construction Technology & Management', duration: '4 Sem' },
      { id: 'b8-3', degree: 'M.Tech', code: 'EN', name: 'Environment Engineering', duration: '4 Sem' },
      { id: 'b8-4', degree: 'M.Tech', code: 'MTSD', name: 'Structural Design', duration: '4 Sem' },
    ],
  },
  {
    id: 9,
    deptName: 'School of Computer Science & Engineering',
    branches: [
      { id: 'b9-1', degree: 'PhD', code: 'PDCE', name: 'Computer Science & Engineering', duration: '8 Sem' },
      { id: 'b9-2', degree: 'B.Tech', code: 'CS', name: 'Computer Science and Engineering', duration: '8 Sem' },
      { id: 'b9-3', degree: 'M.Tech', code: 'MTCS', name: 'Computer Science and Engineering', duration: '4 Sem' },
    ],
  },
  {
    id: 10,
    deptName: 'School of Electrical Engineering',
    branches: [
      { id: 'b10-1', degree: 'B.Tech', code: 'EE', name: 'Electrical Engineering', duration: '8 Sem' },
      { id: 'b10-2', degree: 'M.Tech', code: 'MTISD', name: 'Industrial Systems & Drives', duration: '4 Sem' },
    ],
  },
  {
    id: 11,
    deptName: 'School of Electronics and Communication Engineering',
    branches: [
      { id: 'b11-1', degree: 'M.Tech', code: 'CN', name: 'Communication Control and Networking', duration: '4 Sem' },
      { id: 'b11-2', degree: 'B.Tech', code: 'ET', name: 'Electronics and Telecommunications', duration: '8 Sem' },
      { id: 'b11-3', degree: 'B.Tech', code: 'EL', name: 'Electronics Engineering', duration: '8 Sem' },
      { id: 'b11-4', degree: 'M.Tech', code: 'MTEC', name: 'Microwave Engineering', duration: '4 Sem' },
    ],
  },
  {
    id: 12,
    deptName: 'School of Engineering Mathematics & Computing',
    branches: [
      { id: 'b12-1', degree: 'PhD', code: 'PDCA', name: 'Computer Application', duration: '8 Sem' },
      { id: 'b12-2', degree: 'MCA', code: 'CA', name: 'Master of Computer Applications', duration: '4 Sem' },
      { id: 'b12-3', degree: 'B.Tech', code: 'MC', name: 'Mathematics and Computing', duration: '8 Sem' },
    ],
  },
  {
    id: 13,
    deptName: 'School of Humanities and Management',
    branches: [
      { id: 'b13-1', degree: 'MBA', code: 'MBA', name: 'Masters of Business Administration', duration: '4 Sem' },
    ],
  },
  {
    id: 14,
    deptName: 'School of Information Technology',
    branches: [
      { id: 'b14-1', degree: 'B.Tech', code: 'IT', name: 'Information Technology', duration: '8 Sem' },
      { id: 'b14-2', degree: 'M.Tech', code: 'MTIT', name: 'Information Technology', duration: '4 Sem' },
    ],
  },
  {
    id: 15,
    deptName: 'School of Mechanical Engineering',
    branches: [
      { id: 'b15-1', degree: 'B.Tech', code: 'AU', name: 'AUTOMOBILE ENGINEERING', duration: '8 Sem' },
      { id: 'b15-2', degree: 'B.Tech', code: 'ME', name: 'Mechanical Engineering', duration: '8 Sem' },
      { id: 'b15-3', degree: 'PhD', code: 'PDME', name: 'Mechanical Engineering', duration: '8 Sem' },
      { id: 'b15-4', degree: 'M.Tech', code: 'PE', name: 'Production Engineering', duration: '4 Sem' },
    ],
  },
];

const AdminAcademicPrograms = () => {
  const { isDark } = useTheme();

  // Load from localStorage or use default
  const [departments, setDepartments] = useState(() => {
    try {
      const saved = localStorage.getItem('saathi_mits_academic_departments');
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return defaultDepartmentsData;
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDegree, setSelectedDegree] = useState('ALL');
  const [toastMessage, setToastMessage] = useState('');

  // Modals state
  const [showAddDeptModal, setShowAddDeptModal] = useState(false);
  const [newDeptName, setNewDeptName] = useState('');

  const [branchModalData, setBranchModalData] = useState({
    isOpen: false,
    mode: 'add', // 'add' or 'edit'
    deptId: null,
    branchId: null,
    degree: 'B.Tech',
    code: '',
    name: '',
    duration: '8 Sem',
  });

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  const saveDepartments = (updatedList) => {
    setDepartments(updatedList);
    try {
      localStorage.setItem('saathi_mits_academic_departments', JSON.stringify(updatedList));
    } catch (e) {
      console.error('Failed to save to localStorage:', e);
    }
  };

  const handleResetDefaults = () => {
    if (window.confirm('Reset all departments and branches to official MITS institute defaults?')) {
      saveDepartments(defaultDepartmentsData);
      showToast('Reset to official MITS departments and branches.');
    }
  };

  // Add Department
  const handleAddDepartment = (e) => {
    e.preventDefault();
    if (!newDeptName.trim()) return;

    const newId = departments.length ? Math.max(...departments.map((d) => d.id)) + 1 : 1;
    const newDept = {
      id: newId,
      deptName: newDeptName.trim(),
      branches: [],
    };

    const updated = [...departments, newDept];
    saveDepartments(updated);
    setNewDeptName('');
    setShowAddDeptModal(false);
    showToast(`Department "${newDept.deptName}" added successfully.`);
  };

  // Delete Department
  const handleDeleteDepartment = (deptId, deptName) => {
    if (window.confirm(`Delete department "${deptName}" and all its branches?`)) {
      const updated = departments.filter((d) => d.id !== deptId);
      saveDepartments(updated);
      showToast(`Department "${deptName}" removed.`);
    }
  };

  // Open Add Branch Modal
  const handleOpenAddBranch = (deptId) => {
    setBranchModalData({
      isOpen: true,
      mode: 'add',
      deptId,
      branchId: null,
      degree: 'B.Tech',
      code: '',
      name: '',
      duration: '8 Sem',
    });
  };

  // Open Edit Branch Modal
  const handleOpenEditBranch = (deptId, branch) => {
    setBranchModalData({
      isOpen: true,
      mode: 'edit',
      deptId,
      branchId: branch.id,
      degree: branch.degree,
      code: branch.code,
      name: branch.name,
      duration: branch.duration,
    });
  };

  // Save Branch (Add or Edit)
  const handleSaveBranch = (e) => {
    e.preventDefault();
    const { deptId, branchId, degree, code, name, duration, mode } = branchModalData;
    if (!code.trim() || !name.trim()) return;

    const updated = departments.map((dept) => {
      if (dept.id !== deptId) return dept;

      if (mode === 'add') {
        const newBranch = {
          id: `b${deptId}-${Date.now()}`,
          degree: degree.trim(),
          code: code.trim().toUpperCase(),
          name: name.trim(),
          duration: duration.trim(),
        };
        return {
          ...dept,
          branches: [...dept.branches, newBranch],
        };
      } else {
        return {
          ...dept,
          branches: dept.branches.map((b) =>
            b.id === branchId
              ? {
                  ...b,
                  degree: degree.trim(),
                  code: code.trim().toUpperCase(),
                  name: name.trim(),
                  duration: duration.trim(),
                }
              : b
          ),
        };
      }
    });

    saveDepartments(updated);
    setBranchModalData({ ...branchModalData, isOpen: false });
    showToast(mode === 'add' ? 'Branch added successfully.' : 'Branch updated successfully.');
  };

  // Delete Branch
  const handleDeleteBranch = (deptId, branchId) => {
    if (window.confirm('Are you sure you want to delete this branch?')) {
      const updated = departments.map((dept) => {
        if (dept.id !== deptId) return dept;
        return {
          ...dept,
          branches: dept.branches.filter((b) => b.id !== branchId),
        };
      });
      saveDepartments(updated);
      showToast('Branch deleted.');
    }
  };

  // Degree Options for filter and select
  const allDegrees = ['ALL', 'B.Tech', 'M.Tech', 'PhD', 'MCA', 'MBA', 'B.Arch', 'MUP'];

  // Filtered List
  const filteredDepartments = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return departments
      .map((dept) => {
        // Filter branches if degree filter or search query is applied
        const matchedBranches = dept.branches.filter((b) => {
          const matchDegree = selectedDegree === 'ALL' || b.degree.toLowerCase() === selectedDegree.toLowerCase();
          const matchQuery =
            !q ||
            dept.deptName.toLowerCase().includes(q) ||
            b.name.toLowerCase().includes(q) ||
            b.code.toLowerCase().includes(q) ||
            b.degree.toLowerCase().includes(q);
          return matchDegree && matchQuery;
        });

        // Keep department if department name matches search or any branch matches
        const deptMatchesQuery = !q || dept.deptName.toLowerCase().includes(q);

        if (deptMatchesQuery && selectedDegree === 'ALL' && !q) {
          return dept;
        }

        if (matchedBranches.length > 0 || (deptMatchesQuery && selectedDegree === 'ALL')) {
          return {
            ...dept,
            branches: matchedBranches,
          };
        }
        return null;
      })
      .filter(Boolean);
  }, [departments, searchQuery, selectedDegree]);

  const totalBranchesCount = useMemo(() => {
    return departments.reduce((acc, d) => acc + (d.branches?.length || 0), 0);
  }, [departments]);

  return (
    <div className="space-y-6 pb-12">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl bg-emerald-500 text-slate-950 font-semibold shadow-xl border border-emerald-400 text-sm animate-fade-in">
          <LuCheck className="w-5 h-5" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Header & Action Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-blue-400 uppercase tracking-wider mb-1">
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
            Institutional Academic Mapping
          </div>
          <h1 className={`text-2xl lg:text-3xl font-extrabold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
            Academic Programs & Departments
          </h1>
          <p className={`text-sm mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            MITS Gwalior official departmental matrix ({departments.length} Departments • {totalBranchesCount} Branches)
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setShowAddDeptModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs lg:text-sm bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-500/20 transition-all"
          >
            <LuPlus className="w-4 h-4" />
            Add Department
          </button>
          <button
            onClick={handleResetDefaults}
            title="Reset to Official MITS Structure"
            className={`inline-flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-semibold border transition-all ${
              isDark
                ? 'bg-slate-800/80 border-slate-700 hover:bg-slate-700 text-slate-300'
                : 'bg-white border-slate-300 hover:bg-slate-100 text-slate-700 shadow-sm'
            }`}
          >
            <LuRotateCcw className="w-3.5 h-3.5" />
            Reset Defaults
          </button>
        </div>
      </div>

      {/* Search & Degree Filters */}
      <div className={`p-4 rounded-2xl border flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 ${
        isDark ? 'bg-[#0a1120] border-slate-800/80' : 'bg-white border-slate-200 shadow-sm'
      }`}>
        {/* Search */}
        <div className="relative flex-1">
          <LuSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search department or branch (e.g. AI, B.Tech, Mechanical, Robotics, CS)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`w-full pl-10 pr-4 py-2 rounded-xl text-xs lg:text-sm border focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
              isDark
                ? 'bg-[#0f172a] border-slate-700 text-slate-100 placeholder-slate-500'
                : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400'
            }`}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
            >
              <LuX className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Degree Filter Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          <span className="text-xs font-bold text-slate-400 flex items-center gap-1 pl-1 pr-2">
            <LuFilter className="w-3.5 h-3.5" />
            Degree:
          </span>
          {allDegrees.map((deg) => (
            <button
              key={deg}
              onClick={() => setSelectedDegree(deg)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
                selectedDegree === deg
                  ? 'bg-blue-600 text-white shadow-sm'
                  : isDark
                  ? 'bg-slate-800/60 text-slate-300 hover:bg-slate-700/80'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {deg}
            </button>
          ))}
        </div>
      </div>

      {/* Main Table: # | DEPARTMENT | BRANCHES | TOTAL */}
      <div className={`rounded-2xl border overflow-hidden shadow-2xl ${
        isDark ? 'bg-[#070d19] border-slate-800/80' : 'bg-white border-slate-200 shadow-sm'
      }`}>
        <div className="overflow-x-auto">
          <div className="min-w-[860px]">
            {/* Table Header */}
            <div className={`grid grid-cols-[56px_280px_1fr_96px] items-center px-6 py-4 border-b font-mono font-bold text-xs tracking-wider uppercase ${
              isDark ? 'bg-[#0b1324] border-slate-800/90 text-slate-400' : 'bg-slate-50 border-slate-200 text-slate-600'
            }`}>
              <div className="text-center">#</div>
              <div className="px-2">DEPARTMENT</div>
              <div className="px-3">BRANCHES</div>
              <div className="text-center">TOTAL</div>
            </div>

            {/* Table Rows */}
            {filteredDepartments.length === 0 ? (
              <div className="text-center py-16 px-4">
                <LuBuilding className="w-12 h-12 text-slate-500 mx-auto mb-3 opacity-40" />
                <h3 className={`text-base font-bold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                  No matching departments or branches found
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Try adjusting your search query or degree filter.
                </p>
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedDegree('ALL');
                  }}
                  className="mt-4 px-4 py-2 rounded-xl text-xs font-bold bg-blue-600 text-white"
                >
                  Clear Filters
                </button>
              </div>
            ) : (
              filteredDepartments.map((dept, index) => (
                <div
                  key={dept.id}
                  className={`grid grid-cols-[56px_280px_1fr_96px] items-start px-6 py-6 border-b transition-colors ${
                    isDark
                      ? 'border-slate-800/60 hover:bg-[#0c1629]/50'
                      : 'border-slate-100 hover:bg-slate-50/70'
                  }`}
                >
                  {/* Column 1: # */}
                  <div className={`text-center font-semibold text-sm pt-1 ${
                    isDark ? 'text-slate-400' : 'text-slate-500'
                  }`}>
                    {index + 1}
                  </div>

                  {/* Column 2: DEPARTMENT */}
                  <div className="pr-4 space-y-1">
                    <div className="flex items-center gap-1.5 text-[11px] font-bold text-blue-400 tracking-wider uppercase">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                      <span>DEPARTMENT</span>
                    </div>
                    <h3 className={`text-sm lg:text-[15px] font-bold leading-snug tracking-tight ${
                      isDark ? 'text-slate-100' : 'text-slate-900'
                    }`}>
                      {dept.deptName}
                    </h3>

                    {/* Department Quick Actions */}
                    <div className="pt-2 flex items-center gap-2">
                      <button
                        onClick={() => handleOpenAddBranch(dept.id)}
                        className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-1 rounded-md border transition-colors ${
                          isDark
                            ? 'border-blue-500/30 text-blue-400 bg-blue-500/10 hover:bg-blue-500/20'
                            : 'border-blue-200 text-blue-600 bg-blue-50 hover:bg-blue-100'
                        }`}
                      >
                        <LuPlus className="w-3 h-3" />
                        Add Branch
                      </button>
                      <button
                        onClick={() => handleDeleteDepartment(dept.id, dept.deptName)}
                        title="Delete entire department"
                        className="text-slate-500 hover:text-rose-400 p-1 rounded transition-colors"
                      >
                        <LuTrash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Column 3: BRANCHES */}
                  <div className="px-2">
                    {dept.branches.length === 0 ? (
                      <div className={`p-4 rounded-xl border border-dashed text-xs text-center ${
                        isDark ? 'border-slate-800 text-slate-500' : 'border-slate-200 text-slate-400'
                      }`}>
                        No branches registered under this department yet.{' '}
                        <button
                          onClick={() => handleOpenAddBranch(dept.id)}
                          className="text-blue-400 font-semibold underline ml-1 hover:text-blue-300"
                        >
                          Add one now
                        </button>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-3">
                        {dept.branches.map((branch) => (
                          <div
                            key={branch.id}
                            className={`group relative rounded-xl p-3.5 flex flex-col justify-between border transition-all duration-150 shadow-sm ${
                              isDark
                                ? 'bg-[#0d162a] hover:bg-[#111d38] border-slate-800/80 hover:border-slate-700'
                                : 'bg-slate-50 hover:bg-white border-slate-200 hover:border-blue-300'
                            }`}
                          >
                            {/* Card Top: Degree Pill & Branch Code */}
                            <div className="flex items-center justify-between gap-2 mb-2">
                              <span className="text-[10px] font-black uppercase tracking-wider text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-2 py-0.5 rounded">
                                {branch.degree}
                              </span>
                              <span className={`text-[11px] font-mono font-bold px-2 py-0.5 rounded border ${
                                isDark
                                  ? 'text-slate-300 bg-slate-800/90 border-slate-700/60'
                                  : 'text-slate-700 bg-white border-slate-200'
                              }`}>
                                {branch.code}
                              </span>
                            </div>

                            {/* Card Middle: Branch Name */}
                            <div className={`text-xs font-semibold leading-snug line-clamp-2 min-h-[36px] mb-3 ${
                              isDark ? 'text-slate-200' : 'text-slate-800'
                            }`}>
                              {branch.name}
                            </div>

                            {/* Card Bottom: Duration & Edit/Delete Icons */}
                            <div className={`flex items-center justify-between pt-2 border-t ${
                              isDark ? 'border-slate-800/60' : 'border-slate-200'
                            }`}>
                              <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded">
                                <LuCalendar className="w-3 h-3 text-emerald-400" />
                                {branch.duration}
                              </span>

                              <div className="flex items-center gap-1 opacity-70 group-hover:opacity-100 transition-opacity">
                                <button
                                  onClick={() => handleOpenEditBranch(dept.id, branch)}
                                  title="Edit Branch"
                                  className={`p-1 rounded transition-colors ${
                                    isDark
                                      ? 'text-slate-400 hover:text-blue-400 hover:bg-blue-500/10'
                                      : 'text-slate-500 hover:text-blue-600 hover:bg-blue-50'
                                  }`}
                                >
                                  <LuPencil className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => handleDeleteBranch(dept.id, branch.id)}
                                  title="Delete Branch"
                                  className={`p-1 rounded transition-colors ${
                                    isDark
                                      ? 'text-slate-400 hover:text-rose-400 hover:bg-rose-500/10'
                                      : 'text-slate-500 hover:text-rose-600 hover:bg-rose-50'
                                  }`}
                                >
                                  <LuTrash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Column 4: TOTAL */}
                  <div className="flex flex-col items-center justify-center pt-1 text-center">
                    <div className={`w-8 h-8 rounded-full font-extrabold text-xs flex items-center justify-center mb-1 border ${
                      isDark
                        ? 'bg-blue-500/15 border-blue-500/30 text-blue-400'
                        : 'bg-blue-50 border-blue-200 text-blue-600'
                    }`}>
                      {dept.branches.length}
                    </div>
                    <span className={`text-[10px] font-bold uppercase tracking-wider ${
                      isDark ? 'text-slate-400' : 'text-slate-500'
                    }`}>
                      BRANCHES
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* MODAL 1: Add Department */}
      {showAddDeptModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className={`w-full max-w-md rounded-2xl border p-6 shadow-2xl animate-fade-in ${
            isDark ? 'bg-[#0f172a] border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
          }`}>
            <div className="flex items-center justify-between pb-3 border-b border-slate-700/50 mb-4">
              <div className="flex items-center gap-2">
                <LuBuilding className="w-5 h-5 text-blue-400" />
                <h3 className="font-extrabold text-base">Add New Department</h3>
              </div>
              <button
                onClick={() => setShowAddDeptModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <LuX className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddDepartment} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold mb-1 text-slate-300">Department Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Centre for Quantum Computing"
                  value={newDeptName}
                  onChange={(e) => setNewDeptName(e.target.value)}
                  className={`w-full px-3.5 py-2.5 rounded-xl border focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    isDark ? 'bg-[#131d35] border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                  }`}
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-700/50">
                <button
                  type="button"
                  onClick={() => setShowAddDeptModal(false)}
                  className="px-4 py-2 rounded-xl font-semibold border border-slate-700 hover:bg-slate-800 text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl font-bold bg-blue-600 hover:bg-blue-500 text-white shadow"
                >
                  Create Department
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Add / Edit Branch */}
      {branchModalData.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className={`w-full max-w-lg rounded-2xl border p-6 shadow-2xl animate-fade-in ${
            isDark ? 'bg-[#0f172a] border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
          }`}>
            <div className="flex items-center justify-between pb-3 border-b border-slate-700/50 mb-4">
              <div className="flex items-center gap-2">
                <LuGraduationCap className="w-5 h-5 text-indigo-400" />
                <h3 className="font-extrabold text-base">
                  {branchModalData.mode === 'add' ? 'Add Branch' : 'Edit Branch'}
                </h3>
              </div>
              <button
                onClick={() => setBranchModalData({ ...branchModalData, isOpen: false })}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <LuX className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveBranch} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold mb-1 text-slate-300">Degree Program</label>
                  <select
                    value={branchModalData.degree}
                    onChange={(e) => setBranchModalData({ ...branchModalData, degree: e.target.value })}
                    className={`w-full px-3 py-2 rounded-xl border focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      isDark ? 'bg-[#131d35] border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                    }`}
                  >
                    <option value="B.Tech">B.Tech</option>
                    <option value="M.Tech">M.Tech</option>
                    <option value="PhD">PhD</option>
                    <option value="MCA">MCA</option>
                    <option value="MBA">MBA</option>
                    <option value="B.Arch">B.Arch</option>
                    <option value="MUP">MUP</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold mb-1 text-slate-300">Branch Code</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. AD, CS, EE, PDEE"
                    value={branchModalData.code}
                    onChange={(e) => setBranchModalData({ ...branchModalData, code: e.target.value })}
                    className={`w-full px-3 py-2 rounded-xl border focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      isDark ? 'bg-[#131d35] border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                    }`}
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold mb-1 text-slate-300">Full Branch Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Artificial Intelligence (AI) and Data Science"
                  value={branchModalData.name}
                  onChange={(e) => setBranchModalData({ ...branchModalData, name: e.target.value })}
                  className={`w-full px-3.5 py-2.5 rounded-xl border focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    isDark ? 'bg-[#131d35] border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                  }`}
                />
              </div>

              <div>
                <label className="block font-bold mb-1 text-slate-300">Duration (Semesters)</label>
                <select
                  value={branchModalData.duration}
                  onChange={(e) => setBranchModalData({ ...branchModalData, duration: e.target.value })}
                  className={`w-full px-3.5 py-2 rounded-xl border focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    isDark ? 'bg-[#131d35] border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                  }`}
                >
                  <option value="8 Sem">8 Sem</option>
                  <option value="4 Sem">4 Sem</option>
                  <option value="10 Sem">10 Sem</option>
                  <option value="6 Sem">6 Sem</option>
                  <option value="2 Sem">2 Sem</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-700/50">
                <button
                  type="button"
                  onClick={() => setBranchModalData({ ...branchModalData, isOpen: false })}
                  className="px-4 py-2 rounded-xl font-semibold border border-slate-700 hover:bg-slate-800 text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl font-bold bg-blue-600 hover:bg-blue-500 text-white shadow"
                >
                  {branchModalData.mode === 'add' ? 'Add Branch' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminAcademicPrograms;
