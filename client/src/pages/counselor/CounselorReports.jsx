import { useState, useEffect } from 'react';
import { counselorAPI } from '../../api';
import CounselorNav from '../../components/CounselorNav';

const DIMENSIONS = [
  { value: 'issueCategory', label: 'Issue Category' },
  { value: 'branch', label: 'Academic Branch' },
  { value: 'year', label: 'Year of Study' },
  { value: 'gender', label: 'Gender' },
  { value: 'severity', label: 'Screening Severity' },
  { value: 'status', label: 'Appointment Status' },
  { value: 'isUrgent', label: 'Urgency Flag' },
  { value: 'month', label: 'Month' },
];

const CounselorReports = () => {
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filters
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [gender, setGender] = useState('all');
  const [branch, setBranch] = useState('all');
  const [year, setYear] = useState('all');
  const [severity, setSeverity] = useState('all');
  const [status, setStatus] = useState('all');
  const [isUrgent, setIsUrgent] = useState(false);

  // Group By (1 or 2 dimensions)
  const [primaryDim, setPrimaryDim] = useState('issueCategory');
  const [secondaryDim, setSecondaryDim] = useState('');

  useEffect(() => {
    fetchReport();
  }, [startDate, endDate, gender, branch, year, severity, status, isUrgent, primaryDim, secondaryDim]);

  const fetchReport = async () => {
    setLoading(true);
    try {
      const groupByParam = secondaryDim ? `${primaryDim},${secondaryDim}` : primaryDim;
      const params = {
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        gender: gender !== 'all' ? gender : undefined,
        branch: branch !== 'all' ? branch : undefined,
        year: year !== 'all' ? year : undefined,
        severity: severity !== 'all' ? severity : undefined,
        status: status !== 'all' ? status : undefined,
        isUrgent: isUrgent ? 'true' : undefined,
        groupBy: groupByParam,
      };

      const res = await counselorAPI.getReports(params);
      setReportData(res.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to generate report.');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadCSV = () => {
    const params = {
      startDate: startDate || undefined,
      endDate: endDate || undefined,
      gender: gender !== 'all' ? gender : undefined,
      branch: branch !== 'all' ? branch : undefined,
      year: year !== 'all' ? year : undefined,
      severity: severity !== 'all' ? severity : undefined,
      status: status !== 'all' ? status : undefined,
      isUrgent: isUrgent ? 'true' : undefined,
    };
    const url = counselorAPI.exportCSVUrl(params);
    window.open(url, '_blank');
  };

  const handlePrintPDF = () => {
    window.print();
  };

  // Cross-tab structure builder for 2-dimension aggregation
  const buildCrossTab = () => {
    if (!reportData?.dim2 || !Array.isArray(reportData.reportData)) return null;

    const rowKeys = Array.from(new Set(reportData.reportData.map((d) => String(d._id.dim1 ?? 'N/A')))).sort();
    const colKeys = Array.from(new Set(reportData.reportData.map((d) => String(d._id.dim2 ?? 'N/A')))).sort();

    const matrix = {};
    rowKeys.forEach((r) => {
      matrix[r] = {};
      colKeys.forEach((c) => {
        matrix[r][c] = 0;
      });
    });

    reportData.reportData.forEach((d) => {
      const r = String(d._id.dim1 ?? 'N/A');
      const c = String(d._id.dim2 ?? 'N/A');
      if (matrix[r]) {
        matrix[r][c] = d.count;
      }
    });

    return { rowKeys, colKeys, matrix };
  };

  const crossTab = buildCrossTab();

  return (
    <div className="min-h-screen bg-slate-50/50 pb-20 print:bg-white print:p-0">
      <div className="print:hidden">
        <CounselorNav />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Header & Export Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
              <span>📄</span> Counseling Reports & Cross-Tabulations
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
              Aggregate data across multiple dimensions, generate cross-tabs, and export filtered reports.
            </p>
          </div>

          <div className="flex items-center gap-2 print:hidden">
            <button
              onClick={handleDownloadCSV}
              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs rounded-xl shadow-xs transition-all flex items-center gap-1.5"
            >
              <span>📥</span> Export CSV
            </button>
            <button
              onClick={handlePrintPDF}
              className="px-3.5 py-2 bg-white border border-gray-200 hover:border-teal-400 text-gray-700 font-medium text-xs rounded-xl shadow-xs transition-all flex items-center gap-1.5"
            >
              <span>🖨️</span> Print / PDF
            </button>
          </div>
        </div>

        {/* Filter & Dimension Controls */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-xs space-y-4 print:hidden">
          {/* Dimensions Selector */}
          <div className="bg-teal-50/50 p-4 rounded-xl border border-teal-100 flex flex-wrap items-center gap-4">
            <span className="text-xs font-bold text-teal-900 uppercase tracking-wider">
              Group By Dimensions:
            </span>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-600">Primary:</span>
              <select
                value={primaryDim}
                onChange={(e) => setPrimaryDim(e.target.value)}
                className="text-xs font-semibold bg-white border border-teal-200 rounded-lg px-2.5 py-1.5 outline-none focus:ring-2 focus:ring-teal-500"
              >
                {DIMENSIONS.map((d) => (
                  <option key={d.value} value={d.value}>{d.label}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-600">Secondary (Cross-Tab):</span>
              <select
                value={secondaryDim}
                onChange={(e) => setSecondaryDim(e.target.value)}
                className="text-xs font-semibold bg-white border border-teal-200 rounded-lg px-2.5 py-1.5 outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value="">None (1-Dimension Table)</option>
                {DIMENSIONS.filter((d) => d.value !== primaryDim).map((d) => (
                  <option key={d.value} value={d.value}>{d.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Filters grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5">
            <div>
              <label className="block text-[11px] font-semibold text-gray-500 uppercase mb-1">From Date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full text-xs border border-gray-200 rounded-lg px-2 py-1.5 outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-gray-500 uppercase mb-1">To Date</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full text-xs border border-gray-200 rounded-lg px-2 py-1.5 outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-gray-500 uppercase mb-1">Branch</label>
              <select
                value={branch}
                onChange={(e) => setBranch(e.target.value)}
                className="w-full text-xs border border-gray-200 rounded-lg px-2 py-1.5 outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value="all">All</option>
                <option value="CSE">CSE</option>
                <option value="IT">IT</option>
                <option value="ECE">ECE</option>
                <option value="EE">EE</option>
                <option value="Mechanical">Mechanical</option>
                <option value="Civil">Civil</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-gray-500 uppercase mb-1">Year</label>
              <select
                value={year}
                onChange={(e) => setYear(e.target.value)}
                className="w-full text-xs border border-gray-200 rounded-lg px-2 py-1.5 outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value="all">All</option>
                <option value="1st">1st</option>
                <option value="2nd">2nd</option>
                <option value="3rd">3rd</option>
                <option value="4th">4th</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-gray-500 uppercase mb-1">Severity</label>
              <select
                value={severity}
                onChange={(e) => setSeverity(e.target.value)}
                className="w-full text-xs border border-gray-200 rounded-lg px-2 py-1.5 outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value="all">All</option>
                <option value="Severe">Severe</option>
                <option value="Moderate">Moderate</option>
                <option value="Mild">Mild</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-gray-500 uppercase mb-1">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full text-xs border border-gray-200 rounded-lg px-2 py-1.5 outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value="all">All</option>
                <option value="approved">Approved</option>
                <option value="completed">Completed</option>
                <option value="pending">Pending</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>

            <div className="flex items-end pb-1.5">
              <label className="flex items-center gap-1.5 text-xs font-semibold text-rose-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isUrgent}
                  onChange={(e) => setIsUrgent(e.target.checked)}
                  className="rounded text-rose-600 focus:ring-rose-500 h-4 w-4"
                />
                Urgent Only
              </label>
            </div>
          </div>
        </div>

        {error && (
          <div className="p-4 bg-red-50 text-red-700 rounded-xl text-sm border border-red-200">
            {error}
          </div>
        )}

        {/* REPORT CONTENT */}
        {loading ? (
          <div className="py-20 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600 mx-auto mb-2"></div>
            <p className="text-xs text-gray-400">Computing real-time aggregation...</p>
          </div>
        ) : !reportData ? (
          <div className="p-12 text-center text-gray-400 text-xs">No report data.</div>
        ) : (
          <div className="space-y-6">
            {/* Aggregated Output Section */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-xs p-6">
              <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                <h3 className="font-bold text-gray-900 text-sm">
                  {secondaryDim
                    ? `Cross-Tabulation: ${DIMENSIONS.find(d => d.value === primaryDim)?.label} × ${DIMENSIONS.find(d => d.value === secondaryDim)?.label}`
                    : `Distribution Summary by ${DIMENSIONS.find(d => d.value === primaryDim)?.label}`}
                </h3>
                <span className="text-xs font-semibold text-teal-800 bg-teal-50 px-2.5 py-1 rounded-full border border-teal-100">
                  Total Matching: {reportData.totalCount}
                </span>
              </div>

              {/* 1-DIMENSION TABLE */}
              {!secondaryDim && (
                <div className="overflow-x-auto mt-4">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-gray-500 uppercase tracking-wider text-[11px]">
                      <tr>
                        <th className="py-2.5 px-4">{DIMENSIONS.find(d => d.value === primaryDim)?.label}</th>
                        <th className="py-2.5 px-4 text-right">Appointments Count</th>
                        <th className="py-2.5 px-4 text-right">Percentage</th>
                        <th className="py-2.5 px-4 w-1/3">Distribution Bar</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {reportData.reportData.map((item, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/60">
                          <td className="py-2.5 px-4 font-semibold text-gray-800">{item.dimension}</td>
                          <td className="py-2.5 px-4 text-right font-bold text-teal-700">{item.count}</td>
                          <td className="py-2.5 px-4 text-right text-gray-500">{item.percentage}%</td>
                          <td className="py-2.5 px-4">
                            <div className="w-full bg-slate-100 rounded-full h-2">
                              <div
                                className="bg-teal-600 h-2 rounded-full transition-all"
                                style={{ width: `${Math.min(100, item.percentage)}%` }}
                              ></div>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* 2-DIMENSION CROSS-TAB */}
              {secondaryDim && crossTab && (
                <div className="overflow-x-auto mt-4">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead className="bg-slate-50 text-gray-700 uppercase tracking-wider text-[10px]">
                      <tr>
                        <th className="py-2.5 px-3 border border-gray-200">
                          {DIMENSIONS.find(d => d.value === primaryDim)?.label} \ {DIMENSIONS.find(d => d.value === secondaryDim)?.label}
                        </th>
                        {crossTab.colKeys.map((col) => (
                          <th key={col} className="py-2.5 px-3 border border-gray-200 text-center font-bold text-gray-800">
                            {col}
                          </th>
                        ))}
                        <th className="py-2.5 px-3 border border-gray-200 text-center font-extrabold bg-teal-50 text-teal-900">
                          Row Total
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {crossTab.rowKeys.map((r) => {
                        const rowSum = crossTab.colKeys.reduce((acc, c) => acc + (crossTab.matrix[r][c] || 0), 0);
                        return (
                          <tr key={r} className="hover:bg-slate-50/80">
                            <td className="py-2.5 px-3 border border-gray-200 font-bold text-gray-900 bg-slate-50/40">
                              {r}
                            </td>
                            {crossTab.colKeys.map((c) => {
                              const val = crossTab.matrix[r][c];
                              return (
                                <td
                                  key={c}
                                  className={`py-2.5 px-3 border border-gray-200 text-center ${
                                    val > 0 ? 'font-semibold text-teal-800 bg-teal-50/30' : 'text-gray-300'
                                  }`}
                                >
                                  {val}
                                </td>
                              );
                            })}
                            <td className="py-2.5 px-3 border border-gray-200 text-center font-extrabold text-teal-900 bg-teal-50/60">
                              {rowSum}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Row-Level Report Table */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-xs p-6">
              <h3 className="font-bold text-gray-900 text-sm mb-3">
                Matching Individual Records (Showing {reportData.rowLevel.length} of {reportData.totalCount})
              </h3>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-gray-500 uppercase tracking-wider text-[10px]">
                    <tr>
                      <th className="py-2.5 px-3">Date</th>
                      <th className="py-2.5 px-3">Slot</th>
                      <th className="py-2.5 px-3">Student</th>
                      <th className="py-2.5 px-3">Branch & Year</th>
                      <th className="py-2.5 px-3">Issue Category</th>
                      <th className="py-2.5 px-3">Severity</th>
                      <th className="py-2.5 px-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {reportData.rowLevel.map((r) => (
                      <tr key={r._id} className="hover:bg-slate-50/60">
                        <td className="py-2.5 px-3 text-gray-800 font-medium">
                          {new Date(r.date).toLocaleDateString()}
                        </td>
                        <td className="py-2.5 px-3 text-gray-500">{r.timeSlot}</td>
                        <td className="py-2.5 px-3">
                          <span className="font-semibold text-gray-900">{r.name}</span>
                          <span className="block text-[10px] text-gray-400">{r.enrollmentNo}</span>
                        </td>
                        <td className="py-2.5 px-3 text-gray-600">{r.branch} ({r.year} Yr)</td>
                        <td className="py-2.5 px-3 text-gray-700">{r.issueCategory}</td>
                        <td className="py-2.5 px-3">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold border bg-slate-50">
                            {r.severity || 'N/A'}
                          </span>
                        </td>
                        <td className="py-2.5 px-3">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold border bg-teal-50 text-teal-800">
                            {r.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CounselorReports;
