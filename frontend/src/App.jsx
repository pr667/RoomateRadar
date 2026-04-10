// src/App.jsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import { ThemeProvider } from './context/ThemeContext';
import ProtectedRoute from './components/ProtectedRoute';
import ThemeToggle from './components/ThemeToggle';

import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Onboarding from './pages/Onboarding';
import Browse from './pages/Browse';
import ListingDetail from './pages/ListingDetail';
import CreateListing from './pages/CreateListing';
import Chat from './pages/Chat';
import Shortlist from './pages/Shortlist';
import Compare from './pages/Compare';
import SeekerDashboard from './pages/Dashboard/SeekerDashboard';
import HostDashboard from './pages/Dashboard/HostDashboard';
import AdminDashboard from './pages/Dashboard/AdminDashboard';
import Profile from './pages/Profile';
import UserProfile from './pages/UserProfile';
import ForgotPassword from './pages/ForgotPassword';
import EditListing from './pages/EditListing';

const DashboardRedirect = () => {
  const { user } = useAuth();
  if (user?.role === 'host') return <Navigate to="/host/dashboard" replace />;
  if (user?.role === 'admin') return <Navigate to="/admin/dashboard" replace />;
  return <Navigate to="/seeker/dashboard" replace />;
};

function App() {
  return (
    <ThemeProvider>
    <AuthProvider>
      <SocketProvider>
        <BrowserRouter>
          <ThemeToggle />
          <Routes>
            {/* Public */}
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />

            {/* After login → redirect to correct dashboard */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <DashboardRedirect />
                </ProtectedRoute>
              }
            />

            {/* Onboarding (both seekers and hosts must complete) */}
            <Route
              path="/onboarding"
              element={
                <ProtectedRoute>
                  <Onboarding />
                </ProtectedRoute>
              }
            />

            {/* Listing detail — accessible without auth */}
            <Route path="/listings/:id" element={<ListingDetail />} />

            {/* Seeker routes */}
            <Route
              path="/browse"
              element={
                <ProtectedRoute allowedRoles={['seeker']}>
                  <Browse />
                </ProtectedRoute>
              }
            />
            <Route
              path="/shortlist"
              element={
                <ProtectedRoute allowedRoles={['seeker']}>
                  <Shortlist />
                </ProtectedRoute>
              }
            />
            <Route
              path="/compare"
              element={
                <ProtectedRoute allowedRoles={['seeker']}>
                  <Compare />
                </ProtectedRoute>
              }
            />
            <Route
              path="/seeker/dashboard"
              element={
                <ProtectedRoute allowedRoles={['seeker']}>
                  <SeekerDashboard />
                </ProtectedRoute>
              }
            />

            {/* Host routes */}
            <Route
              path="/create-listing"
              element={
                <ProtectedRoute allowedRoles={['host']}>
                  <CreateListing />
                </ProtectedRoute>
              }
            />
            <Route
              path="/host/dashboard"
              element={
                <ProtectedRoute allowedRoles={['host']}>
                  <HostDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/edit-listing/:id"
              element={
                <ProtectedRoute allowedRoles={['host']}>
                  <EditListing />
                </ProtectedRoute>
              }
            />

            {/* Shared (seekers + hosts) */}
            <Route
              path="/chat"
              element={
                <ProtectedRoute>
                  <Chat />
                </ProtectedRoute>
              }
            />

            {/* Profile */}
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/user/:id"
              element={
                <ProtectedRoute>
                  <UserProfile />
                </ProtectedRoute>
              }
            />

            {/* Admin routes */}
            <Route
              path="/admin/dashboard"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />

            {/* Catch-all */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </SocketProvider>
    </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
