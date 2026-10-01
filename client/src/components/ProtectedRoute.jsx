import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const ProtectedRoute = ({ children, role }) => {
  const { user, loading, isAuthenticated } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (role) {
    const isAllowed = user.role === role || (role === 'counselor' && user.role === 'admin');
    if (!isAllowed) {
      // Redirect to appropriate dashboard
      const dashboards = {
        student: '/student/dashboard',
        counselor: '/counselor/dashboard',
        admin: '/admin/dashboard',
      };
      return <Navigate to={dashboards[user.role] || '/'} replace />;
    }
  }

  return children;
};

export const PublicOnlyRoute = ({ children }) => {
  const { user, loading, isAuthenticated } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
      </div>
    );
  }

  if (isAuthenticated) {
    const dashboards = {
      student: '/student/dashboard',
      counselor: '/counselor/dashboard',
      admin: '/admin/dashboard',
    };
    return <Navigate to={dashboards[user.role] || '/'} replace />;
  }

  return children;
};
