import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { ProtectedRoute, PublicOnlyRoute } from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import FAQPage from './pages/FAQPage';
import StudentDashboard from './pages/StudentDashboard';
import Screening from './pages/Screening';
import BookAppointment from './pages/BookAppointment';
import MyAppointments from './pages/MyAppointments';

// Counselor Pages
import CounselorDashboard from './pages/counselor/CounselorDashboard';
import CounselorAppointments from './pages/counselor/CounselorAppointments';
import CounselorQueue from './pages/counselor/CounselorQueue';
import CounselorStudents from './pages/counselor/CounselorStudents';
import CounselorReports from './pages/counselor/CounselorReports';
import CounselorAnalytics from './pages/counselor/CounselorAnalytics';
import CounselorNotifications from './pages/counselor/CounselorNotifications';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsers from './pages/admin/AdminUsers';
import AdminAppointments from './pages/admin/AdminAppointments';
import AdminSettings from './pages/admin/AdminSettings';
import AdminBlockedDates from './pages/admin/AdminBlockedDates';
import AdminFAQs from './pages/admin/AdminFAQs';
import AdminLogs from './pages/admin/AdminLogs';
import AdminExport from './pages/admin/AdminExport';

function AppContent() {
  const location = useLocation();
  const { isDark } = useTheme();
  const isLoginPage = location.pathname === '/login';
  const isAuth = isLoginPage;

  return (
    <div
      className={`${
        isLoginPage ? 'h-screen max-h-screen overflow-hidden' : 'min-h-screen'
      } flex flex-col transition-colors duration-200 ${
        isDark ? 'bg-[#101C28] text-[#F7F8FA]' : 'bg-[#FBF9F4] text-[#102D4F]'
      }`}
    >
      {!isLoginPage && <Navbar />}
      <main className={`flex-1 ${isLoginPage ? 'h-full overflow-hidden flex flex-col justify-center' : ''}`}>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Home />} />
          <Route path="/faqs" element={<FAQPage />} />

          {/* Auth routes (public only - redirect if logged in) */}
          <Route path="/login" element={<PublicOnlyRoute><Login /></PublicOnlyRoute>} />
          <Route path="/register" element={<Navigate to="/login" replace />} />

          {/* Student routes */}
          <Route path="/student/dashboard" element={<ProtectedRoute role="student"><StudentDashboard /></ProtectedRoute>} />
          <Route path="/student/screening" element={<ProtectedRoute role="student"><Screening /></ProtectedRoute>} />
          <Route path="/student/book" element={<ProtectedRoute role="student"><BookAppointment /></ProtectedRoute>} />
          <Route path="/student/appointments" element={<ProtectedRoute role="student"><MyAppointments /></ProtectedRoute>} />

          {/* Counselor routes */}
          <Route path="/counselor/dashboard" element={<ProtectedRoute role="counselor"><CounselorDashboard /></ProtectedRoute>} />
          <Route path="/counselor/appointments" element={<ProtectedRoute role="counselor"><CounselorAppointments /></ProtectedRoute>} />
          <Route path="/counselor/queue" element={<ProtectedRoute role="counselor"><CounselorQueue /></ProtectedRoute>} />
          <Route path="/counselor/students" element={<ProtectedRoute role="counselor"><CounselorStudents /></ProtectedRoute>} />
          <Route path="/counselor/reports" element={<ProtectedRoute role="counselor"><CounselorReports /></ProtectedRoute>} />
          <Route path="/counselor/analytics" element={<ProtectedRoute role="counselor"><CounselorAnalytics /></ProtectedRoute>} />
          <Route path="/counselor/notifications" element={<ProtectedRoute role="counselor"><CounselorNotifications /></ProtectedRoute>} />

          {/* Admin routes */}
          <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="/admin/dashboard" element={<ProtectedRoute role="admin"><AdminDashboard /></ProtectedRoute>} />
          <Route path="/admin/users" element={<ProtectedRoute role="admin"><AdminUsers /></ProtectedRoute>} />
          <Route path="/admin/appointments" element={<ProtectedRoute role="admin"><AdminAppointments /></ProtectedRoute>} />
          <Route path="/admin/settings" element={<ProtectedRoute role="admin"><AdminSettings /></ProtectedRoute>} />
          <Route path="/admin/blocked-dates" element={<ProtectedRoute role="admin"><AdminBlockedDates /></ProtectedRoute>} />
          <Route path="/admin/faqs" element={<ProtectedRoute role="admin"><AdminFAQs /></ProtectedRoute>} />
          <Route path="/admin/logs" element={<ProtectedRoute role="admin"><AdminLogs /></ProtectedRoute>} />
          <Route path="/admin/export" element={<ProtectedRoute role="admin"><AdminExport /></ProtectedRoute>} />

          {/* 404 */}
          <Route path="*" element={
            <div className="max-w-2xl mx-auto px-4 py-20 text-center">
              <h1 className="text-6xl font-bold text-gray-300 mb-4">404</h1>
              <p className="text-gray-500 mb-6">Page not found</p>
              <a href="/" className="text-teal-600 hover:text-teal-800 font-medium">← Back to Home</a>
            </div>
          } />
        </Routes>
      </main>
      {!isAuth && <Footer />}
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ThemeProvider>
          <AppContent />
        </ThemeProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
