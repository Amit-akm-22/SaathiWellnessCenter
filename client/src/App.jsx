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
import ProfileCompletion from './pages/ProfileCompletion';

// Counselor Pages
import CounselorDashboard from './pages/counselor/CounselorDashboard';
import CounselorAppointments from './pages/counselor/CounselorAppointments';
import CounselorQueue from './pages/counselor/CounselorQueue';
import CounselorStudents from './pages/counselor/CounselorStudents';
import CounselorReports from './pages/counselor/CounselorReports';
import CounselorAnalytics from './pages/counselor/CounselorAnalytics';
import CounselorNotifications from './pages/counselor/CounselorNotifications';
import CounselorAvailability from './pages/counselor/CounselorAvailability';
import CounselorLayout from './components/CounselorLayout';

import AdminLayout from './components/AdminLayout';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminAccessControl from './pages/admin/AdminAccessControl';
import AdminAcademicPrograms from './pages/admin/AdminAcademicPrograms';
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
  const isProfileCompletePage = location.pathname === '/complete-profile';
  const isAdminRoute = location.pathname.startsWith('/admin');
  const isCounselorRoute = location.pathname.startsWith('/counselor');
  const hideNavAndFooter = isLoginPage || isProfileCompletePage || isAdminRoute || isCounselorRoute;

  return (
    <div
      className={`${
        isLoginPage ? 'h-screen max-h-screen overflow-hidden' : 'min-h-screen'
      } flex flex-col transition-colors duration-200 ${
        isDark ? 'bg-[#101C28] text-[#F7F8FA]' : 'bg-[#FBF9F4] text-[#102D4F]'
      }`}
    >
      {!hideNavAndFooter && <Navbar />}
      <main className={`flex-1 ${isLoginPage ? 'h-full overflow-hidden flex flex-col justify-center' : ''}`}>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Home />} />
          <Route path="/faqs" element={<FAQPage />} />

          {/* Auth routes (public only - redirect if logged in) */}
          <Route path="/login" element={<PublicOnlyRoute><Login /></PublicOnlyRoute>} />
          <Route path="/register" element={<Navigate to="/login" replace />} />

          {/* Student routes */}
          <Route path="/complete-profile" element={<ProtectedRoute role="student" allowIncomplete={true}><ProfileCompletion /></ProtectedRoute>} />
          <Route path="/dashboard" element={<Navigate to="/student/dashboard" replace />} />
          <Route path="/student/dashboard" element={<ProtectedRoute role="student"><StudentDashboard /></ProtectedRoute>} />
          <Route path="/student/screening" element={<ProtectedRoute role="student"><Screening /></ProtectedRoute>} />
          <Route path="/student/book" element={<ProtectedRoute role="student"><BookAppointment /></ProtectedRoute>} />
          <Route path="/student/appointments" element={<ProtectedRoute role="student"><MyAppointments /></ProtectedRoute>} />

          {/* Counselor routes with dedicated Sidebar Layout */}
          <Route path="/counselor" element={<Navigate to="/counselor/dashboard" replace />} />
          <Route element={<ProtectedRoute role="counselor"><CounselorLayout /></ProtectedRoute>}>
            <Route path="/counselor/dashboard" element={<CounselorDashboard />} />
            <Route path="/counselor/appointments" element={<CounselorAppointments />} />
            <Route path="/counselor/availability" element={<CounselorAvailability />} />
            <Route path="/counselor/queue" element={<CounselorQueue />} />
            <Route path="/counselor/students" element={<CounselorStudents />} />
            <Route path="/counselor/reports" element={<CounselorReports />} />
            <Route path="/counselor/analytics" element={<CounselorAnalytics />} />
            <Route path="/counselor/notifications" element={<CounselorNotifications />} />
          </Route>

          {/* Admin routes with dedicated Sidebar Layout */}
          <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
          <Route element={<ProtectedRoute role="admin"><AdminLayout /></ProtectedRoute>}>
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/access-control" element={<AdminAccessControl />} />
            <Route path="/admin/academic-programs" element={<AdminAcademicPrograms />} />
            <Route path="/admin/users" element={<AdminUsers />} />
            <Route path="/admin/appointments" element={<AdminAppointments />} />
            <Route path="/admin/settings" element={<AdminSettings />} />
            <Route path="/admin/blocked-dates" element={<AdminBlockedDates />} />
            <Route path="/admin/faqs" element={<AdminFAQs />} />
            <Route path="/admin/logs" element={<AdminLogs />} />
            <Route path="/admin/export" element={<AdminExport />} />
          </Route>

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
      {!hideNavAndFooter && <Footer />}
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
