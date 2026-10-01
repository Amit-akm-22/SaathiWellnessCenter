import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Home = () => {
  const { isAuthenticated, user } = useAuth();

  const bookLink = isAuthenticated && user?.role === 'student'
    ? '/student/screening'
    : '/login';

  return (
    <div>
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-teal-600 via-teal-700 to-teal-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
              Your mental health matters. 
              <span className="text-teal-200"> We're here for you.</span>
            </h1>
            <p className="text-lg md:text-xl text-teal-100 mb-8 leading-relaxed">
              Saathi Wellness Center provides free, confidential counselling for all students. 
              Whether you're dealing with stress, anxiety, relationships, or just need someone to talk to — we're your companion on this journey.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                to={bookLink}
                className="bg-white text-teal-700 px-8 py-3 rounded-lg font-semibold hover:bg-teal-50 transition-colors shadow-lg"
              >
                Book Appointment
              </Link>
              <Link
                to="/faqs"
                className="border-2 border-teal-200 text-white px-8 py-3 rounded-lg font-semibold hover:bg-teal-600 transition-colors"
              >
                Learn More
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">About Saathi</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              "Saathi" means companion. We believe that every student deserves a safe, 
              non-judgmental space to talk about what they're going through. Our trained 
              counsellors are here to listen, support, and guide you — at your own pace.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6 rounded-xl bg-teal-50">
              <div className="text-4xl mb-4">🔒</div>
              <h3 className="font-semibold text-lg text-gray-800 mb-2">100% Confidential</h3>
              <p className="text-gray-600 text-sm">
                Everything you share stays between you and your counsellor. Your privacy is our priority.
              </p>
            </div>
            <div className="text-center p-6 rounded-xl bg-lavender-50">
              <div className="text-4xl mb-4">🆓</div>
              <h3 className="font-semibold text-lg text-gray-800 mb-2">Completely Free</h3>
              <p className="text-gray-600 text-sm">
                All counselling services are free for registered students. No hidden charges, ever.
              </p>
            </div>
            <div className="text-center p-6 rounded-xl bg-warm-50">
              <div className="text-4xl mb-4">💚</div>
              <h3 className="font-semibold text-lg text-gray-800 mb-2">Non-Judgmental</h3>
              <p className="text-gray-600 text-sm">
                No topic is off-limits. Come as you are — we're here to understand, not to judge.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-10 text-center">How We Can Help</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { emoji: '📚', title: 'Academic Stress', desc: 'Struggling with exams, projects, or time management?' },
              { emoji: '😰', title: 'Anxiety & Panic', desc: 'Feeling anxious, restless, or having panic attacks?' },
              { emoji: '💔', title: 'Relationships', desc: 'Dealing with heartbreak, conflicts, or loneliness?' },
              { emoji: '🧭', title: 'Career Confusion', desc: 'Unsure about your future or feeling lost?' },
              { emoji: '😞', title: 'Depression', desc: 'Feeling hopeless, empty, or losing interest?' },
              { emoji: '😤', title: 'Anger Management', desc: 'Struggling to control anger or mood swings?' },
              { emoji: '👨‍👩‍👧', title: 'Family Issues', desc: 'Conflicts at home affecting your well-being?' },
              { emoji: '🌈', title: 'And More...', desc: 'Whatever you\'re going through, we\'re here to help.' },
            ].map((service) => (
              <div
                key={service.title}
                className="bg-white p-5 rounded-xl shadow-sm hover:shadow-md transition-shadow border border-gray-100"
              >
                <div className="text-3xl mb-3">{service.emoji}</div>
                <h3 className="font-semibold text-gray-800 mb-1">{service.title}</h3>
                <p className="text-gray-500 text-sm">{service.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Preview */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">Have Questions?</h2>
          <p className="text-gray-600 mb-8 max-w-xl mx-auto">
            We've answered common questions about mental health, counselling, and everyday 
            struggles. Understanding is the first step.
          </p>
          <Link
            to="/faqs"
            className="inline-block bg-teal-600 hover:bg-teal-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors"
          >
            Browse FAQs
          </Link>
        </div>
      </section>

      {/* Crisis Banner */}
      <section className="bg-red-50 border-t border-red-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 text-center">
          <p className="text-red-800 font-medium mb-1">
            In crisis or having thoughts of self-harm?
          </p>
          <p className="text-red-700 text-lg font-bold">
            📞 Call Tele-MANAS now: <a href="tel:14416" className="underline">14416</a>
          </p>
          <p className="text-red-600 text-sm mt-1">Available 24/7 • Free • Confidential</p>
        </div>
      </section>
    </div>
  );
};

export default Home;
