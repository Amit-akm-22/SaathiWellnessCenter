const Footer = () => {
  return (
    <footer className="bg-gray-800 text-gray-300 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-2xl">🤝</span>
              <span className="text-lg font-bold text-white">Saathi Wellness Center</span>
            </div>
            <p className="text-sm text-gray-400">
              Your safe space for mental health support. We're here to listen, understand, and help you grow.
            </p>
          </div>

          {/* Quick links */}
          <div>
            <h3 className="font-semibold text-white mb-3">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li><a href="/" className="hover:text-teal-400 transition-colors">Home</a></li>
              <li><a href="/faqs" className="hover:text-teal-400 transition-colors">FAQs</a></li>
              <li><a href="/login" className="hover:text-teal-400 transition-colors">Book Appointment</a></li>
            </ul>
          </div>

          {/* Crisis helpline */}
          <div>
            <h3 className="font-semibold text-white mb-3">Crisis Helpline</h3>
            <div className="bg-gray-700 rounded-lg p-4">
              <p className="text-sm mb-2">If you or someone you know is in crisis:</p>
              <p className="text-teal-400 font-bold text-lg">📞 Tele-MANAS: 14416</p>
              <p className="text-xs text-gray-400 mt-1">
                Available 24/7 | Free & Confidential
              </p>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-8 pt-4 text-center text-xs text-gray-500">
          © {new Date().getFullYear()} Saathi Wellness Center. All rights reserved. 
          <span className="mx-2">•</span>
          You are not alone. 💚
        </div>
      </div>
    </footer>
  );
};

export default Footer;
