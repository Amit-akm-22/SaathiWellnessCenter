import { useState, useEffect } from 'react';
import AdminNav from '../../components/AdminNav';
import { adminAPI } from '../../api';
import { useAuth } from '../../context/AuthContext';

const AdminUsers = () => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Filters & Pagination
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [branchFilter, setBranchFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Modals state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  // Forms
  const [createForm, setCreateForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'student',
    enrollmentNo: '',
    branch: 'CSE',
    year: '1st',
    gender: 'Other',
    phone: '',
    specialization: '',
  });

  const [editForm, setEditForm] = useState({
    name: '',
    email: '',
    role: 'student',
    enrollmentNo: '',
    branch: '',
    year: '',
    gender: '',
    phone: '',
    specialization: '',
    isActive: true,
  });

  const [resetPasswordForm, setResetPasswordForm] = useState({
    newPassword: '',
    mustChangePassword: true,
  });

  const [csvFile, setCsvFile] = useState(null);
  const [importResult, setImportResult] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    setError('');
    try {
      const params = {
        page,
        limit: 15,
        search: search.trim() || undefined,
        role: roleFilter || undefined,
        status: statusFilter || undefined,
        branch: branchFilter || undefined,
      };
      const res = await adminAPI.getUsers(params);
      setUsers(res.data.data.users);
      setTotalPages(res.data.data.pagination.pages || 1);
      setTotalCount(res.data.data.pagination.total || 0);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch users.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [page, roleFilter, statusFilter, branchFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchUsers();
  };

  const showToast = (msg) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  // Create User
  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    setError('');
    try {
      await adminAPI.createUser(createForm);
      setShowCreateModal(false);
      setCreateForm({
        name: '',
        email: '',
        password: '',
        role: 'student',
        enrollmentNo: '',
        branch: 'CSE',
        year: '1st',
        gender: 'Other',
        phone: '',
        specialization: '',
      });
      showToast('User created successfully.');
      fetchUsers();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create user.');
    } finally {
      setActionLoading(false);
    }
  };

  // Open Edit Modal
  const openEditModal = (user) => {
    setSelectedUser(user);
    setEditForm({
      name: user.name || '',
      email: user.email || '',
      role: user.role || 'student',
      enrollmentNo: user.enrollmentNo || '',
      branch: user.branch || '',
      year: user.year || '',
      gender: user.gender || '',
      phone: user.phone || '',
      specialization: user.specialization || '',
      isActive: user.isActive !== false,
    });
    setShowEditModal(true);
  };

  // Submit Edit
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      await adminAPI.updateUser(selectedUser._id, editForm);
      setShowEditModal(false);
      showToast('User updated successfully.');
      fetchUsers();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update user.');
    } finally {
      setActionLoading(false);
    }
  };

  // Open Reset Password
  const openResetModal = (user) => {
    setSelectedUser(user);
    setResetPasswordForm({
      newPassword: '',
      mustChangePassword: true,
    });
    setShowResetModal(true);
  };

  // Submit Reset Password
  const handleResetSubmit = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      const res = await adminAPI.resetPassword(selectedUser._id, resetPasswordForm);
      setShowResetModal(false);
      showToast(
        `Password reset for ${selectedUser.name}. ${
          res.data.data?.temporaryPassword
            ? `Generated password: ${res.data.data.temporaryPassword}`
            : ''
        }`
      );
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reset password.');
    } finally {
      setActionLoading(false);
    }
  };

  // Soft Delete
  const handleDeleteUser = async (user) => {
    if (!window.confirm(`Are you sure you want to delete ${user.name}? This will revoke access.`)) {
      return;
    }
    try {
      await adminAPI.deleteUser(user._id);
      showToast(`User ${user.name} deleted.`);
      fetchUsers();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete user.');
    }
  };

  // Restore User
  const handleRestoreUser = async (user) => {
    try {
      await adminAPI.restoreUser(user._id);
      showToast(`User ${user.name} restored.`);
      fetchUsers();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to restore user.');
    }
  };

  // CSV Import
  const handleCSVSubmit = async (e) => {
    e.preventDefault();
    if (!csvFile) return;
    setActionLoading(true);
    setImportResult(null);
    try {
      const formData = new FormData();
      formData.append('file', csvFile);
      const res = await adminAPI.importCSV(formData);
      setImportResult(res.data.data);
      showToast(`Imported ${res.data.data.importedCount} students!`);
      fetchUsers();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to import CSV.');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <AdminNav />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">User Management</h1>
            <p className="text-sm text-slate-500">
              Manage student accounts, counselor staff, administrative access, and password credentials.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowImportModal(true)}
              className="px-3.5 py-2 rounded-lg bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 text-xs sm:text-sm font-medium transition shadow-sm flex items-center gap-1.5"
            >
              <span>📥</span>
              <span>Bulk CSV Import</span>
            </button>

            <button
              onClick={() => setShowCreateModal(true)}
              className="px-3.5 py-2 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-xs sm:text-sm font-medium transition shadow-sm flex items-center gap-1.5"
            >
              <span>➕</span>
              <span>Create User</span>
            </button>
          </div>
        </div>

        {/* Notifications */}
        {successMsg && (
          <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-sm flex items-center justify-between">
            <span className="flex items-center gap-2">
              <span>✅</span>
              <span>{successMsg}</span>
            </span>
            <button onClick={() => setSuccessMsg('')} className="text-emerald-600 hover:text-emerald-800">✕</button>
          </div>
        )}

        {error && (
          <div className="p-3.5 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm flex items-center justify-between">
            <span className="flex items-center gap-2">
              <span>⚠️</span>
              <span>{error}</span>
            </span>
            <button onClick={() => setError('')} className="text-red-500 hover:text-red-700">✕</button>
          </div>
        )}

        {/* Filters Bar */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col md:flex-row gap-3 items-center justify-between">
          <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 w-full md:w-80">
            <input
              type="text"
              placeholder="Search by name, email, roll no..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
            <button
              type="submit"
              className="px-3 py-2 bg-slate-800 hover:bg-slate-900 text-white text-xs sm:text-sm font-medium rounded-lg"
            >
              Search
            </button>
          </form>

          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            <select
              value={roleFilter}
              onChange={(e) => { setRoleFilter(e.target.value); setPage(1); }}
              className="px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-teal-500 bg-white"
            >
              <option value="">All Roles</option>
              <option value="student">Students</option>
              <option value="counselor">Counselors</option>
              <option value="admin">Admins</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
              className="px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-teal-500 bg-white"
            >
              <option value="">All Statuses</option>
              <option value="active">Active Only</option>
              <option value="inactive">Inactive Only</option>
              <option value="deleted">Deleted (Archived)</option>
            </select>

            <select
              value={branchFilter}
              onChange={(e) => { setBranchFilter(e.target.value); setPage(1); }}
              className="px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-teal-500 bg-white"
            >
              <option value="">All Branches</option>
              <option value="CSE">CSE</option>
              <option value="IT">IT</option>
              <option value="ECE">ECE</option>
              <option value="EE">EE</option>
              <option value="Mechanical">Mechanical</option>
              <option value="Civil">Civil</option>
            </select>

            {(search || roleFilter || statusFilter || branchFilter) && (
              <button
                onClick={() => {
                  setSearch('');
                  setRoleFilter('');
                  setStatusFilter('');
                  setBranchFilter('');
                  setPage(1);
                }}
                className="px-2.5 py-2 text-xs text-rose-600 hover:text-rose-800 font-medium"
              >
                Reset
              </button>
            )}
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Showing {users.length} of {totalCount} users
            </span>
          </div>

          {loading ? (
            <div className="py-16 text-center text-slate-400 text-sm">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600 mx-auto mb-2"></div>
              Loading users...
            </div>
          ) : users.length === 0 ? (
            <div className="py-16 text-center text-slate-400 text-sm">
              No users found matching your filters.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">User</th>
                    <th className="py-3 px-4">Role</th>
                    <th className="py-3 px-4">Branch / Year</th>
                    <th className="py-3 px-4">Phone</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Last Login</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {users.map((u) => {
                    const isSelf = currentUser?._id === u._id;
                    return (
                      <tr key={u._id} className="hover:bg-slate-50/70 transition">
                        <td className="py-3 px-4">
                          <div>
                            <span className="font-semibold text-slate-900 block">{u.name}</span>
                            <span className="text-xs text-slate-400">{u.email}</span>
                            {u.enrollmentNo && (
                              <span className="text-[11px] text-teal-600 block font-mono">
                                #{u.enrollmentNo}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider ${
                              u.role === 'admin'
                                ? 'bg-purple-100 text-purple-800'
                                : u.role === 'counselor'
                                ? 'bg-teal-100 text-teal-800'
                                : 'bg-blue-100 text-blue-800'
                            }`}
                          >
                            {u.role}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-slate-600">
                          {u.branch ? `${u.branch} (${u.year || 'N/A'})` : u.specialization || '—'}
                        </td>
                        <td className="py-3 px-4 text-slate-600 font-mono text-xs">
                          {u.phone || '—'}
                        </td>
                        <td className="py-3 px-4">
                          {u.isDeleted ? (
                            <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-rose-100 text-rose-800">
                              Deleted
                            </span>
                          ) : !u.isActive ? (
                            <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-200 text-slate-700">
                              Inactive
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-100 text-emerald-800">
                              Active
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-slate-400 text-xs">
                          {u.lastLoginAt ? new Date(u.lastLoginAt).toLocaleDateString() : 'Never'}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => {
                                setSelectedUser(u);
                                setShowDetailModal(true);
                              }}
                              className="px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs"
                              title="View details"
                            >
                              👁️
                            </button>
                            <button
                              onClick={() => openEditModal(u)}
                              className="px-2 py-1 rounded bg-teal-50 hover:bg-teal-100 text-teal-700 text-xs font-medium"
                              title="Edit user"
                            >
                              ✏️ Edit
                            </button>
                            <button
                              onClick={() => openResetModal(u)}
                              className="px-2 py-1 rounded bg-amber-50 hover:bg-amber-100 text-amber-700 text-xs font-medium"
                              title="Reset password"
                            >
                              🔑 Reset
                            </button>
                            {u.isDeleted ? (
                              <button
                                onClick={() => handleRestoreUser(u)}
                                className="px-2 py-1 rounded bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-medium"
                              >
                                Restore
                              </button>
                            ) : (
                              !isSelf && (
                                <button
                                  onClick={() => handleDeleteUser(u)}
                                  className="px-2 py-1 rounded bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-medium"
                                  title="Delete user"
                                >
                                  🗑️
                                </button>
                              )
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="p-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
              <button
                disabled={page <= 1}
                onClick={() => setPage(page - 1)}
                className="px-3 py-1.5 border border-slate-300 rounded disabled:opacity-40"
              >
                ← Previous
              </button>
              <span>
                Page {page} of {totalPages}
              </span>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage(page + 1)}
                className="px-3 py-1.5 border border-slate-300 rounded disabled:opacity-40"
              >
                Next →
              </button>
            </div>
          )}
        </div>

        {/* Modal 1: Create User */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
              <div className="flex items-center justify-between border-b pb-3">
                <h3 className="font-bold text-slate-900 text-base">Create New User</h3>
                <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-slate-600">✕</button>
              </div>

              <form onSubmit={handleCreateSubmit} className="space-y-3 text-xs sm:text-sm">
                <div>
                  <label className="block text-slate-700 font-medium mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={createForm.name}
                    onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-teal-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-700 font-medium mb-1">Email Address *</label>
                    <input
                      type="email"
                      required
                      value={createForm.email}
                      onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-teal-500"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-medium mb-1">Password *</label>
                    <input
                      type="password"
                      required
                      value={createForm.password}
                      onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-teal-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-700 font-medium mb-1">System Role *</label>
                    <select
                      value={createForm.role}
                      onChange={(e) => setCreateForm({ ...createForm, role: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-teal-500 bg-white"
                    >
                      <option value="student">Student</option>
                      <option value="counselor">Counselor</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-700 font-medium mb-1">Phone Number</label>
                    <input
                      type="text"
                      value={createForm.phone}
                      onChange={(e) => setCreateForm({ ...createForm, phone: e.target.value })}
                      placeholder="+91..."
                      className="w-full px-3 py-2 border rounded-lg focus:ring-teal-500"
                    />
                  </div>
                </div>

                {createForm.role === 'student' && (
                  <div className="grid grid-cols-3 gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
                    <div>
                      <label className="block text-slate-600 font-medium mb-1">Roll / Enroll No</label>
                      <input
                        type="text"
                        value={createForm.enrollmentNo}
                        onChange={(e) => setCreateForm({ ...createForm, enrollmentNo: e.target.value })}
                        className="w-full px-2 py-1.5 border rounded focus:ring-teal-500 bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-600 font-medium mb-1">Branch</label>
                      <select
                        value={createForm.branch}
                        onChange={(e) => setCreateForm({ ...createForm, branch: e.target.value })}
                        className="w-full px-2 py-1.5 border rounded focus:ring-teal-500 bg-white"
                      >
                        <option value="CSE">CSE</option>
                        <option value="IT">IT</option>
                        <option value="ECE">ECE</option>
                        <option value="EE">EE</option>
                        <option value="Mechanical">Mechanical</option>
                        <option value="Civil">Civil</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-slate-600 font-medium mb-1">Year</label>
                      <select
                        value={createForm.year}
                        onChange={(e) => setCreateForm({ ...createForm, year: e.target.value })}
                        className="w-full px-2 py-1.5 border rounded focus:ring-teal-500 bg-white"
                      >
                        <option value="1st">1st Year</option>
                        <option value="2nd">2nd Year</option>
                        <option value="3rd">3rd Year</option>
                        <option value="4th">4th Year</option>
                      </select>
                    </div>
                  </div>
                )}

                {createForm.role === 'counselor' && (
                  <div>
                    <label className="block text-slate-700 font-medium mb-1">Counselor Specialization</label>
                    <input
                      type="text"
                      placeholder="e.g. Clinical Psychology, Cognitive Behavioral Therapy"
                      value={createForm.specialization}
                      onChange={(e) => setCreateForm({ ...createForm, specialization: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-teal-500"
                    />
                  </div>
                )}

                <div className="pt-3 border-t flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="px-4 py-2 border rounded-lg text-slate-600 hover:bg-slate-100"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={actionLoading}
                    className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-medium disabled:opacity-50"
                  >
                    {actionLoading ? 'Creating...' : 'Create User'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal 2: Edit User */}
        {showEditModal && selectedUser && (
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
              <div className="flex items-center justify-between border-b pb-3">
                <h3 className="font-bold text-slate-900 text-base">Edit User: {selectedUser.name}</h3>
                <button onClick={() => setShowEditModal(false)} className="text-slate-400 hover:text-slate-600">✕</button>
              </div>

              <form onSubmit={handleEditSubmit} className="space-y-3 text-xs sm:text-sm">
                <div>
                  <label className="block text-slate-700 font-medium mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-700 font-medium mb-1">Email</label>
                    <input
                      type="email"
                      required
                      value={editForm.email}
                      onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-medium mb-1">Phone</label>
                    <input
                      type="text"
                      value={editForm.phone}
                      onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg"
                    />
                  </div>
                </div>

                {selectedUser.role === 'student' && (
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-700 font-medium mb-1">Branch</label>
                      <input
                        type="text"
                        value={editForm.branch}
                        onChange={(e) => setEditForm({ ...editForm, branch: e.target.value })}
                        className="w-full px-3 py-2 border rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-700 font-medium mb-1">Year</label>
                      <input
                        type="text"
                        value={editForm.year}
                        onChange={(e) => setEditForm({ ...editForm, year: e.target.value })}
                        className="w-full px-3 py-2 border rounded-lg"
                      />
                    </div>
                  </div>
                )}

                <div className="pt-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editForm.isActive}
                      onChange={(e) => setEditForm({ ...editForm, isActive: e.target.checked })}
                      className="rounded text-teal-600 focus:ring-teal-500"
                    />
                    <span className="text-slate-800 font-medium">Account is Active</span>
                  </label>
                  <p className="text-xs text-slate-400 ml-6">
                    Inactive users cannot log into the platform.
                  </p>
                </div>

                <div className="pt-3 border-t flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowEditModal(false)}
                    className="px-4 py-2 border rounded-lg text-slate-600 hover:bg-slate-100"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={actionLoading}
                    className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-medium disabled:opacity-50"
                  >
                    {actionLoading ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal 3: Reset Password */}
        {showResetModal && selectedUser && (
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
              <div className="flex items-center justify-between border-b pb-3">
                <h3 className="font-bold text-slate-900 text-base">Reset Password: {selectedUser.name}</h3>
                <button onClick={() => setShowResetModal(false)} className="text-slate-400 hover:text-slate-600">✕</button>
              </div>

              <form onSubmit={handleResetSubmit} className="space-y-4 text-xs sm:text-sm">
                <div>
                  <label className="block text-slate-700 font-medium mb-1">
                    New Password (leave blank to auto-generate)
                  </label>
                  <input
                    type="text"
                    placeholder="Auto-generate if empty"
                    value={resetPasswordForm.newPassword}
                    onChange={(e) =>
                      setResetPasswordForm({ ...resetPasswordForm, newPassword: e.target.value })
                    }
                    className="w-full px-3 py-2 border rounded-lg font-mono"
                  />
                </div>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={resetPasswordForm.mustChangePassword}
                    onChange={(e) =>
                      setResetPasswordForm({
                        ...resetPasswordForm,
                        mustChangePassword: e.target.checked,
                      })
                    }
                    className="rounded text-teal-600 focus:ring-teal-500"
                  />
                  <span className="text-slate-700">Require user to change password on next login</span>
                </label>

                <p className="text-xs text-amber-700 bg-amber-50 p-2.5 rounded border border-amber-200">
                  ⚠️ Resetting password will invalidate all existing sessions and tokens for this user.
                </p>

                <div className="pt-3 border-t flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowResetModal(false)}
                    className="px-4 py-2 border rounded-lg text-slate-600"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={actionLoading}
                    className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-medium disabled:opacity-50"
                  >
                    {actionLoading ? 'Resetting...' : 'Confirm Reset'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal 4: CSV Bulk Import */}
        {showImportModal && (
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
              <div className="flex items-center justify-between border-b pb-3">
                <h3 className="font-bold text-slate-900 text-base">Bulk CSV Import: Students</h3>
                <button onClick={() => setShowImportModal(false)} className="text-slate-400 hover:text-slate-600">✕</button>
              </div>

              <div className="text-xs text-slate-600 space-y-2">
                <p>
                  Upload a CSV file containing student rosters. Duplicate emails or enrollment numbers will be skipped.
                </p>
                <div className="bg-slate-50 p-2.5 rounded font-mono text-[11px] text-slate-700 border">
                  Expected header:
                  <br />
                  <strong>name,email,password,enrollmentNo,branch,year,gender,phone</strong>
                </div>
              </div>

              <form onSubmit={handleCSVSubmit} className="space-y-4">
                <input
                  type="file"
                  accept=".csv"
                  required
                  onChange={(e) => setCsvFile(e.target.files[0])}
                  className="block w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-teal-50 file:text-teal-700 hover:file:bg-teal-100"
                />

                {importResult && (
                  <div className="p-3 bg-slate-50 border rounded-lg text-xs space-y-1">
                    <p className="font-semibold text-slate-800">Import Summary:</p>
                    <p className="text-emerald-700">✅ Successfully imported: {importResult.importedCount}</p>
                    <p className="text-amber-700">⚠️ Skipped / duplicates: {importResult.skippedCount}</p>
                    {importResult.errors?.length > 0 && (
                      <div className="mt-2 text-rose-700 max-h-24 overflow-y-auto">
                        {importResult.errors.map((err, i) => (
                          <p key={i}>• {err}</p>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                <div className="pt-3 border-t flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowImportModal(false);
                      setImportResult(null);
                    }}
                    className="px-4 py-2 border rounded-lg text-slate-600"
                  >
                    Close
                  </button>
                  <button
                    type="submit"
                    disabled={!csvFile || actionLoading}
                    className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-medium disabled:opacity-50"
                  >
                    {actionLoading ? 'Importing...' : 'Upload & Process CSV'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal 5: User Details */}
        {showDetailModal && selectedUser && (
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
              <div className="flex items-center justify-between border-b pb-3">
                <h3 className="font-bold text-slate-900 text-base">User Details</h3>
                <button onClick={() => setShowDetailModal(false)} className="text-slate-400 hover:text-slate-600">✕</button>
              </div>

              <div className="space-y-3 text-xs sm:text-sm">
                <div>
                  <span className="text-slate-400 text-xs block">Full Name</span>
                  <span className="font-bold text-slate-900 text-base">{selectedUser.name}</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-slate-400 text-xs block">Email</span>
                    <span className="text-slate-700">{selectedUser.email}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-xs block">Role</span>
                    <span className="font-semibold uppercase tracking-wider text-teal-700">
                      {selectedUser.role}
                    </span>
                  </div>
                </div>
                {selectedUser.enrollmentNo && (
                  <div>
                    <span className="text-slate-400 text-xs block">Enrollment No</span>
                    <span className="font-mono text-slate-800">{selectedUser.enrollmentNo}</span>
                  </div>
                )}
                {selectedUser.branch && (
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <span className="text-slate-400 text-xs block">Branch</span>
                      <span className="text-slate-700">{selectedUser.branch}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 text-xs block">Year</span>
                      <span className="text-slate-700">{selectedUser.year}</span>
                    </div>
                  </div>
                )}
                {selectedUser.specialization && (
                  <div>
                    <span className="text-slate-400 text-xs block">Specialization</span>
                    <span className="text-slate-700">{selectedUser.specialization}</span>
                  </div>
                )}
                <div className="grid grid-cols-2 gap-2 pt-2 border-t text-xs">
                  <div>
                    <span className="text-slate-400 block">Created On</span>
                    <span className="text-slate-600">{new Date(selectedUser.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Last Login</span>
                    <span className="text-slate-600">
                      {selectedUser.lastLoginAt ? new Date(selectedUser.lastLoginAt).toLocaleString() : 'Never'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t text-right">
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="px-4 py-1.5 bg-slate-800 text-white rounded-lg text-xs"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminUsers;
