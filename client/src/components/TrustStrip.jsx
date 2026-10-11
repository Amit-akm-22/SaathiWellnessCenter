import React from 'react';
import { LuLock, LuShieldCheck, LuUsers, LuHeartPulse } from 'react-icons/lu';
import { useTheme } from '../context/ThemeContext';

const TrustStrip = () => {
  const { isDark } = useTheme();

  const items = [
    {
      icon: <LuLock className="w-6 h-6 stroke-[2]" />,
      heading: '100% Confidential',
      supporting: 'Your privacy is our priority.',
    },
    {
      icon: <LuShieldCheck className="w-6 h-6 stroke-[2]" />,
      heading: 'Trusted Faculty Counsellors',
      supporting: 'Guidance from trained professionals.',
    },
    {
      icon: <LuUsers className="w-6 h-6 stroke-[2]" />,
      heading: 'Open to All Students',
      supporting: 'No judgment. No stigma.',
    },
    {
      icon: <LuHeartPulse className="w-6 h-6 stroke-[2]" />,
      heading: 'A Healthier You',
      supporting: 'Because you matter.',
    },
  ];

  return (
    <div
      className={`rounded-2xl px-6 py-6 sm:py-7 transition-colors duration-200 ${
        isDark
          ? 'bg-[#132A38] border border-[#243E50]'
          : 'bg-[#EAF5ED] border border-[#D5EAD9]'
      }`}
    >
      <div
        className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x ${
          isDark ? 'divide-[#243E50]' : 'divide-[#CFE3D4]/80'
        }`}
      >
        {items.map((item, idx) => (
          <div
            key={idx}
            className={`flex items-center gap-3.5 ${
              idx !== 0 ? 'sm:pl-6' : ''
            } ${idx !== items.length - 1 ? 'sm:pr-6' : ''} py-3 sm:py-0`}
          >
            <div className={`shrink-0 p-1 ${isDark ? 'text-[#A7F477]' : 'text-[#075E50]'}`}>
              {item.icon}
            </div>
            <div>
              <h4
                className={`font-bold text-sm sm:text-base leading-tight ${
                  isDark ? 'text-[#F7F8FA]' : 'text-[#102D4F]'
                }`}
              >
                {item.heading}
              </h4>
              <p
                className={`text-xs sm:text-[13px] mt-0.5 leading-snug ${
                  isDark ? 'text-[#CBD5E1]' : 'text-[#526579]'
                }`}
              >
                {item.supporting}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TrustStrip;
