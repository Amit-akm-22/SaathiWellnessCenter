import { useState, useEffect } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  CartesianGrid,
} from 'recharts';
import { counselorAPI } from '../../api';
import CounselorNav from '../../components/CounselorNav';

const COLORS = [
  '#0d9488', // teal-600
  '#6366f1', // indigo-500
  '#f59e0b', // amber-500
  '#ec4899', // pink-500
  '#3b82f6', // blue-500
  '#8b5cf6', // purple-500
  '#10b981', // emerald-500
  '#f43f5e', // rose-500
  '#64748b', // slate-500
];

const SEVERITY_COLORS_MAP = {
  Mild: '#10b981',
  Moderate: '#f59e0b',
  Severe: '#e11d48',
  Unspecified: '#94a3b8',
};

const CounselorAnalytics = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Range and filter controls
  const [range, setRange] = useState('30d');
  const [filterType, setFilterType] = useState('none'); // 'none' | 'branch' | 'year'
  const [filterValue, setFilterValue] = useState('all');

  useEffect(() => {
    fetchAnalytics();
  }, [range, filterType, filterValue]);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const params = { range };
      if (filterType === 'branch' && filterValue !== 'all') {
        params.branch = filterValue;
      } else if (filterType === 'year' && filterValue !== 'all') {
        params.year = filterValue;
      }

      const res = await counselorAPI.getAnalytics(params);
      setData(res.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load analytics.');
    } finally {
      setLoading(false);
    }
  };

  const {
    issueCategories = [],
    severities = [],
    genderCounts = [],
    yearCounts = [],
    branchCounts = [],
    trends = [],
    statusFunnel = [],
    peakSlots = [],
    feedbackStats = {},
    insights = {},
  } = data || {};

  return (
    <div className="min-h-screen bg-slate-50/50 pb-20">
      <CounselorNav />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Header & Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
              <span>📈</span> Student Mental Health Analytics Dashboard
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
              Aggregated insights from real screening, appointment volume, and feedback data.
            </p>
          </div>

          {/* Range & Filter Selectors */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Date range */}
            <div className="bg-white border border-gray-200 rounded-xl p-1 flex items-center text-xs shadow-xs">
              {[
                { id: '7d', label: '7 Days' },
                { id: '30d', label: '30 Days' },
                { id: '6m', label: '6 Months' },
              ].map((r) => (
                <button
                  key={r.id}
                  onClick={() => setRange(r.id)}
                  className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                    range === r.id
                      ? 'bg-teal-600 text-white shadow-xs'
                      : 'text-gray-600 hover:text-teal-700'
                  }`}
                >
                  {r.label}
                </button>
              ))}
            </div>

            {/* Branch or Year Filter */}
            <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-xl px-2.5 py-1 text-xs shadow-xs">
              <span className="text-gray-400 font-medium">Filter by:</span>
              <select
                value={filterType}
                onChange={(e) => {
                  setFilterType(e.target.value);
                  setFilterValue('all');
                }}
                className="bg-transparent font-semibold text-gray-700 outline-none"
              >
                <option value="none">All Students</option>
                <option value="branch">Branch</option>
                <option value="year">Year</option>
              </select>

              {filterType === 'branch' && (
                <select
                  value={filterValue}
                  onChange={(e) => setFilterValue(e.target.value)}
                  className="bg-slate-50 border border-gray-200 rounded-md px-1.5 py-0.5 ml-1 outline-none text-xs"
                >
                  <option value="all">All Branches</option>
                  <option value="CSE">CSE</option>
                  <option value="IT">IT</option>
                  <option value="ECE">ECE</option>
                  <option value="EE">EE</option>
                  <option value="Mechanical">Mechanical</option>
                  <option value="Civil">Civil</option>
                </select>
              )}

              {filterType === 'year' && (
                <select
                  value={filterValue}
                  onChange={(e) => setFilterValue(e.target.value)}
                  className="bg-slate-50 border border-gray-200 rounded-md px-1.5 py-0.5 ml-1 outline-none text-xs"
                >
                  <option value="all">All Years</option>
                  <option value="1st">1st Year</option>
                  <option value="2nd">2nd Year</option>
                  <option value="3rd">3rd Year</option>
                  <option value="4th">4th Year</option>
                </select>
              )}
            </div>
          </div>
        </div>

        {error && (
          <div className="p-4 bg-red-50 text-red-700 rounded-xl text-sm border border-red-200">
            {error}
          </div>
        )}

        {/* 4 Top Insight Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Top Primary Issue</p>
            <p className="text-lg sm:text-xl font-extrabold text-teal-800 mt-2 truncate">
              {insights.mostCommonIssue || 'None'}
            </p>
            <p className="text-xs text-gray-400 mt-1">Leading category in period</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Severe Cases</p>
            <p className="text-2xl sm:text-3xl font-extrabold text-rose-600 mt-2">
              {insights.severePercentage}%
            </p>
            <p className="text-xs text-gray-400 mt-1">Of total consultations</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Urgent Cases</p>
            <p className="text-2xl sm:text-3xl font-extrabold text-amber-600 mt-2">
              {insights.urgentCasesCount || 0}
            </p>
            <p className="text-xs text-gray-400 mt-1">Triggered crisis / high flag</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Feedback Satisfaction</p>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-2xl sm:text-3xl font-extrabold text-indigo-700">
                {feedbackStats.averageRating || 0}★
              </span>
              <span className="text-xs text-emerald-600 font-bold">
                ({feedbackStats.helpfulPercentage || 100}% helpful)
              </span>
            </div>
            <p className="text-xs text-gray-400 mt-1">From {feedbackStats.totalRated || 0} reviews</p>
          </div>
        </div>

        {loading ? (
          <div className="py-24 text-center">
            <div className="animate-spin rounded-full h-9 w-9 border-b-2 border-teal-600 mx-auto mb-2"></div>
            <p className="text-xs text-gray-400">Loading Recharts data...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 1. Issue Category Distribution */}
            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs space-y-3">
              <h3 className="font-bold text-gray-900 text-sm flex items-center justify-between">
                <span>1. Issue Category Distribution</span>
                <span className="text-xs text-gray-400 font-normal">{issueCategories.length} categories</span>
              </h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={issueCategories} layout="vertical" margin={{ left: 40, right: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                    <XAxis type="number" fontSize={11} stroke="#94a3b8" />
                    <YAxis type="category" dataKey="category" fontSize={10} stroke="#64748b" width={90} />
                    <Tooltip />
                    <Bar dataKey="count" fill="#0d9488" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* 2. Severity Distribution Donut */}
            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs space-y-3">
              <h3 className="font-bold text-gray-900 text-sm flex items-center justify-between">
                <span>2. Screening Severity Distribution</span>
                <span className="text-xs text-gray-400 font-normal">Mild / Moderate / Severe</span>
              </h3>
              <div className="h-64 flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={severities}
                      dataKey="count"
                      nameKey="severity"
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={4}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {severities.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={SEVERITY_COLORS_MAP[entry.severity] || COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend verticalAlign="bottom" height={36} iconType="circle" />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* 3. Trend Over Time */}
            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs space-y-3">
              <h3 className="font-bold text-gray-900 text-sm">
                3. Appointments Trend Over Time
              </h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={trends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="date" fontSize={10} stroke="#94a3b8" />
                    <YAxis fontSize={10} stroke="#94a3b8" allowDecimals={false} />
                    <Tooltip />
                    <Line type="monotone" dataKey="count" stroke="#0d9488" strokeWidth={2.5} dot={{ r: 3 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* 4. Status Funnel */}
            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs space-y-3">
              <h3 className="font-bold text-gray-900 text-sm">
                4. Status Lifecycle Funnel
              </h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={statusFunnel} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="status" fontSize={10} stroke="#94a3b8" />
                    <YAxis fontSize={10} stroke="#94a3b8" allowDecimals={false} />
                    <Tooltip />
                    <Bar dataKey="count" fill="#6366f1" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* 5. Branch & Year Demographics */}
            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs space-y-3">
              <h3 className="font-bold text-gray-900 text-sm">
                5. Demographics (Branch & Year)
              </h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={branchCounts} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="branch" fontSize={10} stroke="#94a3b8" />
                    <YAxis fontSize={10} stroke="#94a3b8" allowDecimals={false} />
                    <Tooltip />
                    <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* 6. Peak Time Slots Heatmap/Bar */}
            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs space-y-3">
              <h3 className="font-bold text-gray-900 text-sm">
                6. Peak Counseling Time Slots
              </h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={peakSlots} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="slot" fontSize={10} stroke="#94a3b8" />
                    <YAxis fontSize={10} stroke="#94a3b8" allowDecimals={false} />
                    <Tooltip />
                    <Bar dataKey="count" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CounselorAnalytics;
