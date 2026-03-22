import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface RoleRouteProps {
  children: React.ReactNode;
  requiredRole: 'DONOR' | 'HOSPITAL' | 'ADMIN';
}

const RoleRoute: React.FC<RoleRouteProps> = ({ children, requiredRole }) => {
  const { role, isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (role !== requiredRole) {
    // Redirect to appropriate dashboard based on role
    const redirectMap = {
      DONOR: '/donor/dashboard',
      HOSPITAL: '/hospital/dashboard',
      ADMIN: '/admin/dashboard',
    };
    return <Navigate to={redirectMap[role!]} replace />;
  }

  return <>{children}</>;
};

export default RoleRoute;
