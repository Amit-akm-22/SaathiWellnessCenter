import React from 'react';
import Hero from '../components/Hero';
import SupportCard from '../components/SupportCard';
import TrustStrip from '../components/TrustStrip';
import { LuMessagesSquare, LuGraduationCap } from 'react-icons/lu';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const Home = () => {
  const { isAuthenticated, user } = useAuth();
  const { isDark } = useTheme();

  const getCardRoute = (target) => {
    if (isAuthenticated && user?.role === 'student') {
      return '/student/screening';
    }
    return '/login';
  };

  const lowerBg = isDark ? 'bg-[#101C28]' : 'bg-[#FBF9F4]';

  return (
    <div className={`w-full transition-colors duration-200 ${lowerBg}`}>
      {/* 1. Hero Section */}
      <Hero />

      {/* 2. Lower Content Section */}
      <section id="support" className={`py-10 sm:py-12 md:py-14 transition-colors duration-200 ${lowerBg}`}>
        <div className="max-w-[1160px] mx-auto px-4 sm:px-6 lg:px-8">
          {/* 3 Support Cards in one row on desktop */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 sm:mb-10">
            {/* Card 1: Talk to a Counsellor */}
            <SupportCard
              icon={<LuMessagesSquare className="w-6 h-6 stroke-[2]" />}
              heading="Talk to a Counsellor"
              description="Share your thoughts, feelings and concerns with a trusted faculty counsellor in a safe and non-judgmental space."
              linkTo={getCardRoute('counsellor')}
            />

            {/* Card 2: Stress & Anxiety */}
            <SupportCard
              icon={
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="w-6 h-6"
                >
                  <path d="M12 3C10 7 10 12.5 12 17C14 12.5 14 7 12 3Z" />
                  <path d="M12 17C7.5 15.5 4.5 10.5 5.5 6.5C8 9 10.5 13 12 17Z" />
                  <path d="M12 17C16.5 15.5 19.5 10.5 18.5 6.5C16 9 13.5 13 12 17Z" />
                  <path d="M4.5 19C9 21 15 21 19.5 19" />
                </svg>
              }
              heading="Stress & Anxiety"
              description="Feelings of stress, overthinking or anxiety are common. Get guidance and practical strategies to manage them better."
              linkTo={getCardRoute('anxiety')}
            />

            {/* Card 3: Academic & Personal Challenges */}
            <SupportCard
              icon={<LuGraduationCap className="w-6 h-6 stroke-[2]" />}
              heading="Academic & Personal"
              headingLine2="Challenges"
              description="From academic pressure to life decisions, get support for whatever you're going through."
              linkTo={getCardRoute('academic')}
            />
          </div>

          {/* Trust and Reassurance Strip */}
          <TrustStrip />
        </div>
      </section>
    </div>
  );
};

export default Home;
