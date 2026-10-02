import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Login from './pages/Login';
import AdminLayout from './layouts/AdminLayout';
import Dashboard from './pages/Dashboard';
import FleetManagement from './pages/FleetManagement';
import RouteManagement from './pages/RouteManagement';
import StopManagement from './pages/StopManagement';
import ScheduleManagement from './pages/ScheduleManagement';
import DriverManagement from './pages/DriverManagement';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="h-screen flex items-center justify-center text-gray-500">Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  return children;
};

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        element={
          <ProtectedRoute>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="fleet" element={<FleetManagement />} />
        <Route path="routes" element={<RouteManagement />} />
        <Route path="stops" element={<StopManagement />} />
        <Route path="schedules" element={<ScheduleManagement />} />
        <Route path="drivers" element={<DriverManagement />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
