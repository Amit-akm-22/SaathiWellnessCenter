import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { studentAPI } from '../api';

const QUESTIONS = [
  'Little interest or pleasure in doing things',
  'Feeling down, hopeless or depressed',
  'Feeling nervous, anxious or on edge',
  'Not being able to stop or control worrying',
  'Have you had thoughts of hurting yourself?',
];

const OPTIONS = [
  { value: 0, label: 'Not at all' },
  { value: 1, label: 'Several days' },
  { value: 2, label: 'More than half the days' },
  { value: 3, label: 'Nearly every day' },
];

const Screening = () => {
  const navigate = useNavigate();
  const [answers, setAnswers] = useState(Array(5).fill(-1));
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleAnswer = (qIndex, value) => {
    const newAnswers = [...answers];
    newAnswers[qIndex] = value;
    setAnswers(newAnswers);
  };

  const allAnswered = answers.every((a) => a >= 0);

  const handleSubmit = async () => {
    if (!allAnswered) return;
    setError('');
    setLoading(true);

    try {
      const res = await studentAPI.submitScreening(answers);
      setResult(res.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit screening.');
    } finally {
      setLoading(false);
    }
  };

  const handleContinue = () => {
    navigate('/student/book', { state: { screeningAnswers: answers } });
  };

  const getSeverityMessage = (severity) => {
    switch (severity) {
      case 'Mild':
        return "You seem to be managing well. It's still a great idea to talk to someone if you'd like — even a small conversation can make a difference.";
      case 'Moderate':
        return "It looks like you may be going through a bit of a tough time. Speaking with a counsellor can really help you feel lighter and more in control.";
      case 'Severe':
        return "We understand things might feel heavy right now. You're brave for reaching out. Our counsellor is here for you — please go ahead and book a session.";
      default:
        return '';
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Quick Wellness Check</h1>
        <p className="text-gray-500">
          Before booking, we'd like to understand how you've been feeling over the last 2 weeks. 
          This helps us provide you with better support.
        </p>
      </div>

      {!result ? (
        <>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-6">
            {QUESTIONS.map((question, qIndex) => (
              <div key={qIndex} className={`${qIndex === 4 ? 'border-t pt-6 mt-2' : ''}`}>
                {qIndex === 4 && (
                  <p className="text-xs text-gray-400 mb-2 uppercase tracking-wide">Safety Question</p>
                )}
                <p className="font-medium text-gray-800 mb-3">
                  {qIndex + 1}. {question}
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => handleAnswer(qIndex, opt.value)}
                      className={`px-3 py-2 text-xs sm:text-sm rounded-lg border transition-all ${
                        answers[qIndex] === opt.value
                          ? 'bg-teal-600 text-white border-teal-600'
                          : 'bg-white text-gray-600 border-gray-200 hover:border-teal-300'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {error && (
            <div className="bg-red-50 text-red-700 px-4 py-3 rounded-lg mt-4 text-sm">
              {error}
            </div>
          )}

          <div className="mt-6 text-center">
            <button
              onClick={handleSubmit}
              disabled={!allAnswered || loading}
              className="bg-teal-600 hover:bg-teal-700 text-white px-8 py-3 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Submitting...' : 'Submit Check'}
            </button>
          </div>
        </>
      ) : (
        <div className="space-y-6">
          {/* Crisis banner if urgent */}
          {(result.isUrgent || result.urgentFlag) && (
            <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6 text-center">
              <p className="text-red-800 font-semibold text-lg mb-2">
                We're glad you're reaching out. You're not alone. 💚
              </p>
              <p className="text-red-700 mb-3">
                If you're in immediate distress, please reach out to a helpline:
              </p>
              <p className="text-red-800 text-xl font-bold">
                📞 Tele-MANAS: <a href="tel:14416" className="underline">14416</a>
              </p>
              <p className="text-red-600 text-sm mt-1">Available 24/7 • Free • Confidential</p>
            </div>
          )}

          {/* Result card */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center">
            <div className="text-4xl mb-4">
              {(result.isUrgent || result.urgentFlag) ? '💙' : '🌿'}
            </div>
            <p className="text-gray-700 text-lg leading-relaxed mb-6">
              {result.note || "Thank you for checking in with yourself. Speaking with a counselor can help you feel supported and heard."}
            </p>
            <button
              onClick={handleContinue}
              className="bg-teal-600 hover:bg-teal-700 text-white px-8 py-3 rounded-lg font-medium transition-colors"
            >
              Continue to Booking →
            </button>
          </div>

          <p className="text-center text-xs text-gray-400">
            This is a brief screening, not a diagnosis. A counsellor will provide proper assessment.
          </p>
        </div>
      )}
    </div>
  );
};

export default Screening;
