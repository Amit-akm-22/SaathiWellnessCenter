import { Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';

const SaathiLogoMark = ({ size = 28 }) => (
  <div style={{ width: size, height: size }} className="relative flex items-center justify-center shrink-0">
    <svg viewBox="0 0 32 32" fill="none" className="w-full h-full drop-shadow-[0_2px_6px_rgba(167,244,119,0.4)]">
      <defs>
        <linearGradient id="footerHeartGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#B5FF91" />
          <stop offset="45%" stopColor="#A7F477" />
          <stop offset="100%" stopColor="#7CD94B" />
        </linearGradient>
        <radialGradient id="footerHeartHL" cx="35%" cy="30%" r="50%">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.6" />
          <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
        </radialGradient>
      </defs>
      <path
        d="M16 28C16 28 4 20.5 4 11.5C4 7 7.5 3.5 12 3.5C14.5 3.5 16 5 16 5C16 5 17.5 3.5 20 3.5C24.5 3.5 28 7 28 11.5C28 20.5 16 28 16 28Z"
        fill="url(#footerHeartGrad)"
      />
      <path
        d="M16 26.5C16 26.5 5.5 19.5 5.5 11.5C5.5 8 8.2 5 12 5C14 5 15.4 6.2 15.4 6.2C15.4 6.2 16.8 5 18.8 5C22.6 5 25.3 8 25.3 11.5C25.3 19.5 16 26.5 16 26.5Z"
        fill="url(#footerHeartHL)"
      />
    </svg>
  </div>
);

const Footer = () => {
  const { isDark } = useTheme();

  const bg = isDark ? 'bg-[#101C28]' : 'bg-[#F4F8F5]';
  const borderTop = isDark ? 'border-[#243547]' : 'border-[#D5E5D8]';
  const brandText = isDark ? 'text-[#F7F8FA]' : 'text-[#102D4F]';
  const subtitleText = isDark ? 'text-[#94A3B8]' : 'text-[#526579]';
  const taglineAccent = isDark ? 'text-[#A7F477]' : 'text-[#075E50]';
  const divider = isDark ? 'border-[#243547]' : 'border-[#D5E5D8]';
  const sectionHeading = isDark ? 'text-[#A7F477]' : 'text-[#075E50]';
  const linkBase = isDark
    ? 'text-[#94A3B8] hover:text-[#A7F477] transition-colors duration-150'
    : 'text-[#526579] hover:text-[#075E50] transition-colors duration-150';
  const bottomBarText = isDark ? 'text-[#64748B]' : 'text-[#94A3B8]';
  const developerText = isDark ? 'text-[#A7F477]' : 'text-[#075E50]';
  const developerBg = isDark
    ? 'bg-[#172431] border border-[#243547]'
    : 'bg-white border border-[#D5E5D8]';
  const sdcBadge = isDark
    ? 'bg-[#A7F477]/10 text-[#A7F477] border border-[#A7F477]/25'
    : 'bg-[#EAF5ED] text-[#075E50] border border-[#C2DECA]';

  return (
    <footer className={`${bg} border-t ${borderTop} mt-auto transition-colors duration-200`}>
      {/* Main footer content */}
      <div className="max-w-[1160px] mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-6">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-10">

          {/* Brand Column */}
          <div className="md:col-span-5">
            {/* Saathi logo + name */}
            <div className="flex items-center gap-2.5 mb-1">
              <SaathiLogoMark size={30} />
              <div className="flex flex-col leading-none">
                <span className={`text-lg font-bold tracking-tight ${brandText}`}>Saathi</span>
                <span className={`text-[10px] font-medium uppercase tracking-widest ${subtitleText}`}>
                  Wellness Center
                </span>
              </div>
            </div>

            {/* NbN / Institute badge */}
            <div className={`flex items-center gap-1.5 mt-3 mb-1`}>
              <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full border ${
                isDark ? 'bg-[#A7F477]/10 text-[#A7F477] border-[#A7F477]/25' : 'bg-[#EAF5ED] text-[#075E50] border-[#C2DECA]'
              }`}>
                MITS
              </span>
              <span className={`text-[10px] ${subtitleText}`}>|</span>
              <span className={`text-[10px] font-semibold uppercase tracking-wider ${taglineAccent}`}>
                Wellness Desk
              </span>
            </div>

            <p className={`text-xs font-semibold mt-1 mb-1 ${taglineAccent}`}>
              Madhav Institute of Technology &amp; Science
            </p>
            <p className={`text-xs sm:text-sm leading-relaxed max-w-sm ${subtitleText}`}>
              "Saathi Wellness Desk — The Official Digital Gateway for Student Mental Health &amp; Counselling."
            </p>

            {/* Emergency helpline */}
            <a
              href="tel:14416"
              className={`inline-flex items-center gap-2 mt-4 px-3.5 py-2 rounded-xl text-xs font-bold transition-all border ${
                isDark
                  ? 'bg-[#172431] border-[#243547] text-[#A7F477] hover:bg-[#1F3041]'
                  : 'bg-[#EAF5ED] border-[#C2DECA] text-[#075E50] hover:bg-[#D5EAD9]'
              }`}
            >
              <span>📞</span>
              <span>Tele-MANAS: 14416 &nbsp;·&nbsp; 24/7 Free &amp; Confidential</span>
            </a>
          </div>

          {/* Spacer */}
          <div className="hidden md:block md:col-span-1" />

          {/* Quick Links */}
          <div className="md:col-span-3">
            <h3 className={`text-[11px] font-bold uppercase tracking-widest mb-3.5 ${sectionHeading}`}>
              Quick Navigation
            </h3>
            <ul className="space-y-2.5">
              {[
                { label: 'Home', to: '/' },
                { label: 'Mental Health FAQs', to: '/faqs' },
                { label: 'Book Counselling', to: '/student/book' },
                { label: 'My Appointments', to: '/student/appointments' },
                { label: 'Login', to: '/login' },
              ].map(({ label, to }) => (
                <li key={label}>
                  <Link to={to} className={`text-xs sm:text-sm ${linkBase}`}>
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Guidelines & SDC */}
          <div className="md:col-span-3">
            <h3 className={`text-[11px] font-bold uppercase tracking-widest mb-3.5 ${sectionHeading}`}>
              Guidelines &amp; Legals
            </h3>
            <ul className="space-y-2.5">
              {[
                { label: 'Counselling Guidelines', to: '/faqs' },
                { label: 'Confidentiality Policy', to: '/faqs' },
                { label: 'Student Wellness Charter', to: '/faqs' },
                { label: 'Terms & Conditions', to: '/faqs' },
              ].map(({ label, to }) => (
                <li key={label}>
                  <Link to={to} className={`text-xs sm:text-sm ${linkBase}`}>
                    {label}
                  </Link>
                </li>
              ))}
            </ul>

            {/* Created by SDC */}
            <div className="mt-6">
              <h3 className={`text-[11px] font-bold uppercase tracking-widest mb-2.5 ${sectionHeading}`}>
                Created &amp; Powered By
              </h3>
              <div className={`rounded-xl px-3.5 py-3 ${developerBg}`}>
                <div className="flex items-center gap-2 mb-1.5">
                  <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full ${sdcBadge}`}>
                    SDC
                  </span>
                  <span className={`text-xs font-semibold ${brandText}`}>Software Development Club</span>
                </div>
                <p className={`text-[11px] leading-relaxed ${subtitleText}`}>
                  Designing, engineering &amp; launching premium digital solutions for institutional excellence at MITS Gwalior.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className={`border-t ${divider}`} />

      {/* Bottom bar */}
      <div className="max-w-[1160px] mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row items-center justify-between gap-3">
        <p className={`text-[11px] text-center sm:text-left ${bottomBarText}`}>
          © {new Date().getFullYear()} MITS Gwalior — Saathi Mental Wellness Platform. All rights reserved.
        </p>
        <div className={`flex items-center gap-1.5 text-[11px] ${bottomBarText}`}>
          <span className="font-mono">&lt;/&gt;</span>
          <span>Developed by</span>
          <span className={`font-semibold ${developerText}`}>
            Amit Manmode &amp; Ayan Ahmed Khan
          </span>
          <span className={`${developerText} font-bold`}>→</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
