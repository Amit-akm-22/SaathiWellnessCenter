import React from 'react';
import { Link } from 'react-router-dom';
import { LuCalendar, LuArrowRight } from 'react-icons/lu';
import heroImg from '../assets/student-hero.png';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const Hero = () => {
  const { isAuthenticated, user } = useAuth();
  const { isDark } = useTheme();

  const appointmentLink =
    isAuthenticated && user?.role === 'student'
      ? '/student/screening'
      : isAuthenticated
      ? '/student/dashboard'
      : '/login';

  const heroBg = isDark ? 'bg-[#172431]' : 'bg-[#EBF5EE] border-b border-[#DFE4E6]';
  const eyebrowColor = isDark ? 'text-[#A7F477]' : 'text-[#075E50]';
  const heading1Color = isDark ? 'text-[#F7F8FA]' : 'text-[#102D4F]';
  const heading2Color = isDark ? 'text-[#A7F477]' : 'text-[#075E50]';
  const descColor = isDark ? 'text-[#E2E8F0]' : 'text-[#526579]';

  return (
    <section className={`${heroBg} pt-6 pb-12 sm:pt-8 sm:pb-16 lg:py-14 relative overflow-hidden transition-colors duration-200`}>
      <div className="max-w-[1160px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-8 items-center">
          {/* Left Column: Content */}
          <div className="lg:col-span-7 flex flex-col justify-center z-10">
            {/* Eyebrow */}
            <p className={`text-[11px] sm:text-xs font-semibold tracking-[0.22em] ${eyebrowColor} uppercase mb-4 sm:mb-5`}>
              MENTAL WELLNESS &nbsp; • &nbsp; COLLEGE SUPPORT &nbsp; • &nbsp; SAATHI
            </p>

            {/* Main Heading */}
            <h1 className="text-3xl sm:text-4xl md:text-[46px] lg:text-[50px] font-extrabold tracking-tight leading-[1.12] mb-5 sm:mb-6 text-left">
              <span className={`${heading1Color} block`}>You deserve support,</span>
              <span className={`${heading2Color} block`}>not pressure.</span>
            </h1>

            {/* Description Text */}
            <p className={`${descColor} text-sm sm:text-base md:text-[17px] leading-relaxed max-w-xl mb-8 sm:mb-9 text-left`}>
              Saathi provides free, confidential counselling appointments
              <br className="hidden sm:inline" /> with your college faculty counsellor. Take a step towards
              <br className="hidden sm:inline" /> a healthier, happier you — because your well-being matters.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-3.5 sm:gap-4">
              {/* Primary Button */}
              <Link
                to={appointmentLink}
                className={`font-semibold text-sm sm:text-[15px] px-5 sm:px-6 py-3 sm:py-3.5 rounded-xl inline-flex items-center gap-2.5 transition-all duration-200 shadow-sm hover:shadow active:scale-[0.99] ${
                  isDark
                    ? 'bg-[#A7F477] hover:bg-[#B5FF91] text-[#102D4F]'
                    : 'bg-[#075E50] hover:bg-[#0b7967] text-white shadow-md'
                }`}
              >
                <LuCalendar className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.2]" />
                <span>Book an Appointment</span>
                <LuArrowRight className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.2]" />
              </Link>

              {/* Secondary Button */}
              <a
                href="#support"
                className={`font-medium text-sm sm:text-[15px] px-5 sm:px-6 py-3 sm:py-3.5 rounded-xl inline-flex items-center gap-2.5 transition-all duration-200 active:scale-[0.99] ${
                  isDark
                    ? 'bg-[#172431] hover:bg-[#1f3041] border border-[#DFE4E6]/30 hover:border-[#DFE4E6]/60 text-[#F7F8FA]'
                    : 'bg-white hover:bg-gray-50 border border-[#DFE4E6] text-[#102D4F] shadow-sm'
                }`}
              >
                <span>Explore Support</span>
                <LuArrowRight className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.2]" />
              </a>
            </div>
          </div>

          {/* Right Column: Illustration */}
          <div className="lg:col-span-5 flex justify-center lg:justify-end relative">
            <div className="relative w-full max-w-[360px] sm:max-w-[420px] lg:max-w-[460px]">
              {/* Handwritten Badge: Better Days Ahead */}
              <div className="absolute top-2 left-4 sm:left-8 -rotate-6 z-20 pointer-events-none select-none">
                <span className="font-handwritten text-2xl sm:text-3xl font-bold text-[#A7F477] drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)] block">
                  Better Days Ahead
                </span>
                <svg
                  className="w-24 sm:w-28 h-3 text-[#A7F477] -mt-1 drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)]"
                  viewBox="0 0 120 12"
                  fill="none"
                >
                  <path
                    d="M2 7C35 2 85 3 118 8"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  />
                </svg>
              </div>

              {/* Student 3D Illustration */}
              <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                <img
                  src={heroImg}
                  alt="Calm college student illustration"
                  className="w-full h-auto object-contain block select-none"
                  loading="eager"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
