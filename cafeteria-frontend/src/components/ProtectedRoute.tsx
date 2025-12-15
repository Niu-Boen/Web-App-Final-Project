import { Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../store/store';

interface ProtectedRouteProps {
  requiredRole?: 'admin' | 'staff' | 'student';
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ requiredRole }) => {
  const { user, token } = useSelector((state: RootState) => state.auth);

  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && user.role !== requiredRole) {
    // If user doesn't have required role, redirect to home
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;

