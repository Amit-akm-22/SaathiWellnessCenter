import { useState, useEffect } from 'react';
import { faqAPI } from '../api';

const FAQPage = () => {
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
    // Debounce search
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

  const categoryColors = {
    'Understanding Mental Health': 'border-teal-200 bg-teal-50',
    'About Counselling': 'border-lavender-200 bg-lavender-50',
    'Everyday Struggles': 'border-warm-200 bg-warm-50',
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold text-gray-800 mb-3">Frequently Asked Questions</h1>
        <p className="text-gray-500 max-w-xl mx-auto">
          Learn about mental health, counselling, and how to manage everyday challenges. 
          Knowledge is the first step towards feeling better.
        </p>
      </div>

      {/* Search */}
      <div className="mb-8">
        <div className="relative max-w-md mx-auto">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={search}
            onChange={handleSearch}
            placeholder="Search questions..."
            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none"
          />
        </div>
      </div>

      {/* Disclaimer */}
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-8 text-sm text-amber-800">
        <span className="font-medium">📝 Note:</span> These FAQs are for general awareness and education only. 
        They are not a substitute for a professional diagnosis. If you're struggling, please book a session with our counsellor.
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-teal-600 mx-auto"></div>
          <p className="text-gray-400 mt-4">Loading FAQs...</p>
        </div>
      ) : error ? (
        <div className="text-center py-12 text-red-600">{error}</div>
      ) : Object.keys(faqs).length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          No FAQs found{search ? ` for "${search}"` : ''}. Try a different search.
        </div>
      ) : (
        <div className="space-y-8">
          {Object.entries(faqs).map(([category, items]) => (
            <div key={category}>
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <span>{categoryIcons[category] || '📌'}</span>
                {category}
              </h2>
              <div className="space-y-2">
                {items.map((faq) => (
                  <div
                    key={faq._id}
                    className={`border rounded-lg overflow-hidden ${categoryColors[category] || 'border-gray-200 bg-gray-50'}`}
                  >
                    <button
                      onClick={() => toggleItem(faq._id)}
                      className="w-full text-left p-4 flex justify-between items-center hover:bg-white/50 transition-colors"
                    >
                      <span className="font-medium text-gray-800 pr-4">{faq.question}</span>
                      <svg
                        className={`w-5 h-5 text-gray-500 flex-shrink-0 transition-transform ${
                          openItems[faq._id] ? 'rotate-180' : ''
                        }`}
                        fill="none" viewBox="0 0 24 24" stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    {openItems[faq._id] && (
                      <div className="px-4 pb-4 text-gray-600 text-sm leading-relaxed bg-white/60">
                        {faq.answer}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FAQPage;
