import { useState, useEffect } from 'react';
import { faqAPI } from '../api';
import { useTheme } from '../context/ThemeContext';
import { LuSearch, LuChevronDown } from 'react-icons/lu';

const FAQPage = () => {
  const { isDark } = useTheme();
  const [faqs, setFaqs] = useState({});
  const [search, setSearch] = useState('');
  const [openItems, setOpenItems] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchFAQs();
  }, []);

  const fetchFAQs = async (searchTerm = '') => {
    try {
      setLoading(true);
      const res = await faqAPI.getAll(searchTerm);
      setFaqs(res.data.data.faqs);
    } catch {
      setError('Failed to load FAQs. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    const val = e.target.value;
    setSearch(val);
    clearTimeout(window._faqSearchTimeout);
    window._faqSearchTimeout = setTimeout(() => {
      fetchFAQs(val);
    }, 300);
  };

  const toggleItem = (id) => {
    setOpenItems((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const categoryIcons = {
    'Understanding Mental Health': '🧠',
    'About Counselling': '💬',
    'Everyday Struggles': '🌱',
  };

  const pageBg = isDark ? 'text-[#F7F8FA]' : 'text-[#102D4F]';
  const headingColor = isDark ? 'text-[#F7F8FA]' : 'text-[#102D4F]';
  const subtextColor = isDark ? 'text-[#CBD5E1]' : 'text-[#526579]';

  return (
    <div className={`max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 transition-colors duration-200 ${pageBg}`}>
      <div className="text-center mb-10">
        <h1 className={`text-3xl font-extrabold mb-3 tracking-tight ${headingColor}`}>
          Frequently Asked Questions
        </h1>
        <p className={`max-w-xl mx-auto text-sm sm:text-base ${subtextColor}`}>
          Learn about mental health, counselling, and how to manage everyday challenges. 
          Knowledge is the first step towards feeling better.
        </p>
      </div>

      {/* Search */}
      <div className="mb-8">
        <div className="relative max-w-md mx-auto">
          <LuSearch
            className={`absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 ${
              isDark ? 'text-[#A7F477]' : 'text-[#075E50]'
            }`}
          />
          <input
            type="text"
            value={search}
            onChange={handleSearch}
            placeholder="Search questions (e.g. anxiety, confidentiality)..."
            className={`w-full pl-11 pr-4 py-3 rounded-xl text-sm transition-all focus:outline-none focus:ring-2 ${
              isDark
                ? 'bg-[#172431] border border-[#243547] text-[#F7F8FA] placeholder-[#64748B] focus:ring-[#A7F477]'
                : 'bg-white border border-[#DFE4E6] text-[#102D4F] placeholder-[#94A3B8] focus:ring-[#A7F477] shadow-sm'
            }`}
          />
        </div>
      </div>

      {/* Disclaimer */}
      <div
        className={`border rounded-2xl p-4 sm:p-5 mb-8 text-xs sm:text-sm flex items-start gap-3 transition-colors ${
          isDark
            ? 'bg-[#132A38] border-[#243E50] text-[#CBD5E1]'
            : 'bg-[#EAF5ED] border-[#CFE3D4] text-[#102D4F]'
        }`}
      >
        <span className="text-lg">📝</span>
        <p className="leading-relaxed">
          <strong>Note:</strong> These FAQs are for general awareness and education only. They are not a substitute for a professional clinical diagnosis. If you're struggling, please book a free appointment with our college faculty counsellor.
        </p>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className={`animate-spin rounded-full h-10 w-10 border-b-2 mx-auto ${isDark ? 'border-[#A7F477]' : 'border-[#075E50]'}`}></div>
          <p className={`mt-4 text-xs font-medium ${subtextColor}`}>Loading FAQs...</p>
        </div>
      ) : error ? (
        <div className="text-center py-12 text-red-500 text-sm font-semibold">{error}</div>
      ) : Object.keys(faqs).length === 0 ? (
        <div className={`text-center py-12 text-sm ${subtextColor}`}>
          No FAQs found{search ? ` for "${search}"` : ''}. Try a different search term.
        </div>
      ) : (
        <div className="space-y-8">
          {Object.entries(faqs).map(([category, items]) => (
            <div key={category}>
              <h2 className={`text-xl font-bold mb-4 flex items-center gap-2 ${headingColor}`}>
                <span>{categoryIcons[category] || '📌'}</span>
                <span>{category}</span>
              </h2>
              <div className="space-y-3">
                {items.map((faq) => {
                  const isOpen = openItems[faq._id];
                  return (
                    <div
                      key={faq._id}
                      className={`border rounded-2xl overflow-hidden transition-all duration-200 ${
                        isDark
                          ? 'bg-[#172431] border-[#243547] hover:border-[#A7F477]/40'
                          : 'bg-[#FCFBF8] border-[#DFE4E6] hover:border-[#CBD5E1] shadow-sm'
                      }`}
                    >
                      <button
                        onClick={() => toggleItem(faq._id)}
                        className={`w-full text-left p-4 sm:p-5 flex justify-between items-center transition-colors ${
                          isDark ? 'hover:bg-white/5' : 'hover:bg-[#F8FAF9]'
                        }`}
                      >
                        <span className={`font-semibold text-sm sm:text-base pr-4 ${headingColor}`}>
                          {faq.question}
                        </span>
                        <LuChevronDown
                          className={`w-5 h-5 shrink-0 transition-transform duration-200 ${
                            isDark ? 'text-[#A7F477]' : 'text-[#075E50]'
                          } ${isOpen ? 'rotate-180' : ''}`}
                        />
                      </button>
                      {isOpen && (
                        <div
                          className={`px-4 sm:px-5 pb-4 sm:pb-5 text-sm leading-relaxed border-t ${
                            isDark
                              ? 'bg-[#101C28]/80 text-[#CBD5E1] border-[#243547]'
                              : 'bg-white/70 text-[#526579] border-[#DFE4E6]/60'
                          }`}
                        >
                          {faq.answer}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FAQPage;
