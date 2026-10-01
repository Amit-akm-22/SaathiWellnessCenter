import { useState, useEffect } from 'react';
import AdminNav from '../../components/AdminNav';
import { adminAPI } from '../../api';

const AdminFAQs = () => {
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Modals & Form
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedFaq, setSelectedFaq] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    category: 'Everyday Struggles',
    question: '',
    answer: '',
    order: 0,
    isActive: true,
  });

  const categories = [
    'Everyday Struggles',
    'Mental Health 101',
    'Self-Care & Mindfulness',
    'Therapy Myths & Facts',
    'Crisis & Support',
    'Academic & Career',
  ];

  const fetchFaqs = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await adminAPI.getFAQs();
      setFaqs(res.data.data.faqs || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch FAQs.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFaqs();
  }, []);

  const showToast = (msg) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  const openCreateModal = () => {
    setIsEditing(false);
    setSelectedFaq(null);
    setForm({
      category: 'Everyday Struggles',
      question: '',
      answer: '',
      order: 0,
      isActive: true,
    });
    setShowModal(true);
  };

  const openEditModal = (faq) => {
    setIsEditing(true);
    setSelectedFaq(faq);
    setForm({
      category: faq.category || 'Everyday Struggles',
      question: faq.question || '',
      answer: faq.answer || '',
      order: faq.order || 0,
      isActive: faq.isActive !== false,
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      if (isEditing && selectedFaq) {
        await adminAPI.updateFAQ(selectedFaq._id, form);
        showToast('FAQ updated successfully.');
      } else {
        await adminAPI.createFAQ(form);
        showToast('FAQ created successfully.');
      }
      setShowModal(false);
      fetchFaqs();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save FAQ.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleActive = async (faq) => {
    try {
      await adminAPI.updateFAQ(faq._id, { isActive: !faq.isActive });
      showToast(`FAQ "${faq.question.slice(0, 30)}..." ${!faq.isActive ? 'activated' : 'deactivated'}.`);
      fetchFaqs();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to toggle FAQ status.');
    }
  };

  const handleDelete = async (faq) => {
    if (!window.confirm(`Delete question: "${faq.question}"?`)) return;
    try {
      await adminAPI.deleteFAQ(faq._id);
      showToast('FAQ deleted.');
      fetchFaqs();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete FAQ.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <AdminNav />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">FAQ Content Management</h1>
            <p className="text-sm text-slate-500">
              Create, curate, and publish mental health knowledge base articles shown on the public portal.
            </p>
          </div>

          <button
            onClick={openCreateModal}
            className="px-4 py-2 rounded-lg bg-teal-600 hover:bg-teal-700 text-white font-medium text-sm transition shadow-sm flex items-center gap-1.5"
          >
            <span>➕</span>
            <span>Add New FAQ</span>
          </button>
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

        {/* FAQs Table */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Total Questions ({faqs.length})
            </span>
          </div>

          {loading ? (
            <div className="py-16 text-center text-slate-400 text-sm">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600 mx-auto mb-2"></div>
              Loading FAQs...
            </div>
          ) : faqs.length === 0 ? (
            <div className="py-16 text-center text-slate-400 text-sm">
              No FAQs found. Add your first mental health question above.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="bg-slate-50 text-slate-600 font-semibold border-b">
                  <tr>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Question</th>
                    <th className="py-3 px-4">Order</th>
                    <th className="py-3 px-4">Published</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {faqs.map((f) => (
                    <tr key={f._id} className="hover:bg-slate-50/70 transition">
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded text-xs font-semibold bg-teal-50 text-teal-700 border border-teal-200">
                          {f.category}
                        </span>
                      </td>
                      <td className="py-3 px-4 max-w-md">
                        <span className="font-semibold text-slate-900 block">{f.question}</span>
                        <p className="text-xs text-slate-500 line-clamp-2 mt-0.5">{f.answer}</p>
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-600">{f.order || 0}</td>
                      <td className="py-3 px-4">
                        <button
                          onClick={() => handleToggleActive(f)}
                          className={`px-2 py-0.5 rounded-full text-xs font-semibold cursor-pointer ${
                            f.isActive
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-slate-200 text-slate-700'
                          }`}
                        >
                          {f.isActive ? 'Active' : 'Inactive'}
                        </button>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => openEditModal(f)}
                            className="px-2.5 py-1 rounded bg-teal-50 hover:bg-teal-100 text-teal-700 text-xs font-medium"
                          >
                            ✏️ Edit
                          </button>
                          <button
                            onClick={() => handleDelete(f)}
                            className="px-2.5 py-1 rounded bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-medium"
                          >
                            🗑️ Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Modal: Create / Edit FAQ */}
        {showModal && (
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
              <div className="flex items-center justify-between border-b pb-3">
                <h3 className="font-bold text-slate-900 text-base">
                  {isEditing ? 'Edit FAQ' : 'Add New FAQ'}
                </h3>
                <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">✕</button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-3.5 text-xs sm:text-sm">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-700 font-medium mb-1">Category *</label>
                    <select
                      value={form.category}
                      onChange={(e) => setForm({ ...form, category: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-teal-500 bg-white"
                    >
                      {categories.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-700 font-medium mb-1">Display Order</label>
                    <input
                      type="number"
                      value={form.order}
                      onChange={(e) => setForm({ ...form, order: Number(e.target.value) })}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-teal-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-700 font-medium mb-1">Question *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. How do I cope with academic anxiety before exams?"
                    value={form.question}
                    onChange={(e) => setForm({ ...form, question: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-teal-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-medium mb-1">Answer *</label>
                  <textarea
                    required
                    rows="4"
                    placeholder="Provide a compassionate, practical, and clear response..."
                    value={form.answer}
                    onChange={(e) => setForm({ ...form, answer: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-teal-500"
                  />
                </div>

                <label className="flex items-center gap-2 cursor-pointer pt-1">
                  <input
                    type="checkbox"
                    checked={form.isActive}
                    onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                    className="rounded text-teal-600 focus:ring-teal-500"
                  />
                  <span className="text-slate-800 font-medium">Publish immediately (Active)</span>
                </label>

                <div className="pt-3 border-t flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 border rounded-lg text-slate-600 hover:bg-slate-100"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-medium disabled:opacity-50"
                  >
                    {submitting ? 'Saving...' : 'Save Question'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminFAQs;
