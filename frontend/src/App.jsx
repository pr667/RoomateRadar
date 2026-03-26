// src/App.jsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

// Pages (empty for now, to be filled)
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Onboarding from './pages/Onboarding';
import Browse from './pages/Browse';
import SeekerDashboard from './pages/Dashboard/SeekerDashboard';
import HostDashboard from './pages/Dashboard/HostDashboard';
import AdminDashboard from './pages/Dashboard/AdminDashboard';

const DashboardRedirect = () => {
  const { user } = useAuth();
  if (user?.role === 'host') return <Navigate to="/host/dashboard" replace />;
  if (user?.role === 'admin') return <Navigate to="/admin/dashboard" replace />;
  return <Navigate to="/seeker/dashboard" replace />;
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public */}
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* After login → redirect to correct dashboard */}
          <Route path="/dashboard" element={
            <ProtectedRoute><DashboardRedirect /></ProtectedRoute>
          } />

          {/* Onboarding (both seekers and hosts must complete) */}
          <Route path="/onboarding" element={
            <ProtectedRoute><Onboarding /></ProtectedRoute>
          } />

          {/* Seeker routes */}
          <Route path="/browse" element={
            <ProtectedRoute allowedRoles={['seeker']}><Browse /></ProtectedRoute>
          } />
          <Route path="/seeker/dashboard" element={
            <ProtectedRoute allowedRoles={['seeker']}><SeekerDashboard /></ProtectedRoute>
          } />

          {/* Host routes */}
          <Route path="/host/dashboard" element={
            <ProtectedRoute allowedRoles={['host']}><HostDashboard /></ProtectedRoute>
          } />

          {/* Admin routes */}
          <Route path="/admin/dashboard" element={
            <ProtectedRoute allowedRoles={['admin']}><AdminDashboard /></ProtectedRoute>
          } />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
