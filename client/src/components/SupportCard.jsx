import React from 'react';
import { Link } from 'react-router-dom';
import { LuArrowRight } from 'react-icons/lu';
import { useTheme } from '../context/ThemeContext';

const SupportCard = ({ icon, heading, headingLine2, description, linkTo = '/login' }) => {
  const { isDark } = useTheme();

  return (
    <div
      className={`rounded-2xl p-6 sm:p-7 flex flex-col justify-between transition-all duration-200 hover:shadow-md ${
        isDark
          ? 'bg-[#172431] border border-[#243547] hover:border-[#A7F477]/40'
          : 'bg-[#FCFBF8] border border-[#DFE4E6] hover:border-[#CBD5E1]'
      }`}
    >
      <div className="flex items-start gap-4 mb-5">
        <div
          className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${
            isDark
              ? 'bg-[#101C28] text-[#A7F477] border border-[#243547]'
              : 'bg-[#EAF5ED] text-[#075E50]'
          }`}
        >
          {icon}
        </div>
        <div className="flex-1">
          <h3
            className={`font-bold text-lg leading-snug ${
              isDark ? 'text-[#F7F8FA]' : 'text-[#102D4F]'
            }`}
          >
            {heading}
            {headingLine2 && (
              <>
                <br />
                {headingLine2}
              </>
            )}
          </h3>
          <p
            className={`text-sm mt-2 leading-relaxed ${
              isDark ? 'text-[#CBD5E1]' : 'text-[#526579]'
            }`}
          >
            {description}
          </p>
        </div>
      </div>

      <div className="pt-2">
        <Link
          to={linkTo}
          className={`inline-flex items-center gap-2 text-sm font-semibold transition-colors group ${
            isDark ? 'text-[#A7F477] hover:text-[#B5FF91]' : 'text-[#075E50] hover:text-[#0a826e]'
          }`}
        >
          <span>Learn More</span>
          <LuArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
        </Link>
      </div>
    </div>
  );
};

export default SupportCard;
