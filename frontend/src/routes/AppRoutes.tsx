import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import PrivateRoute from './PrivateRoute';
import RoleRoute from './RoleRoute';

// Public pages
import LandingPage from '../pages/public/LandingPage';
import LoginPage from '../pages/public/LoginPage';
import DonorRegisterPage from '../pages/public/DonorRegisterPage';
import HospitalRegisterPage from '../pages/public/HospitalRegisterPage';

// Donor pages
import DonorDashboard from '../pages/donor/DonorDashboard';

// Hospital pages
import HospitalDashboard from '../pages/hospital/HospitalDashboard';
import CreateRequest from '../pages/hospital/CreateRequest';
import RequestDetail from '../pages/hospital/RequestDetail';

// Admin pages
import AdminDashboard from '../pages/admin/AdminDashboard';
import ManageHospitals from '../pages/admin/ManageHospitals';
import ManageDonors from '../pages/admin/ManageDonors';

const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register/donor" element={<DonorRegisterPage />} />
      <Route path="/register/hospital" element={<HospitalRegisterPage />} />

      {/* Protected routes by role */}
      <Route
        path="/donor/dashboard"
        element={
          <PrivateRoute>
            <RoleRoute requiredRole="DONOR">
              <DonorDashboard />
            </RoleRoute>
          </PrivateRoute>
        }
      />

      <Route
        path="/hospital/dashboard"
        element={
          <PrivateRoute>
            <RoleRoute requiredRole="HOSPITAL">
              <HospitalDashboard />
            </RoleRoute>
          </PrivateRoute>
        }
      />

      <Route
        path="/hospital/request/new"
        element={
          <PrivateRoute>
            <RoleRoute requiredRole="HOSPITAL">
              <CreateRequest />
            </RoleRoute>
          </PrivateRoute>
        }
      />

      <Route
        path="/hospital/request/:id"
        element={
          <PrivateRoute>
            <RoleRoute requiredRole="HOSPITAL">
              <RequestDetail />
            </RoleRoute>
          </PrivateRoute>
        }
      />

      <Route
        path="/admin/dashboard"
        element={
          <PrivateRoute>
            <RoleRoute requiredRole="ADMIN">
              <AdminDashboard />
            </RoleRoute>
          </PrivateRoute>
        }
      />

      <Route
        path="/admin/hospitals"
        element={
          <PrivateRoute>
            <RoleRoute requiredRole="ADMIN">
              <ManageHospitals />
            </RoleRoute>
          </PrivateRoute>
        }
      />

      <Route
        path="/admin/donors"
        element={
          <PrivateRoute>
            <RoleRoute requiredRole="ADMIN">
              <ManageDonors />
            </RoleRoute>
          </PrivateRoute>
        }
      />

      {/* Catch all route */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;
