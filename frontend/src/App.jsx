import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import SettingsPage from './pages/Settings';
import Dashboard from './pages/Dashboard';
import CompaniesGrid from './pages/CompaniesGrid';
import TrackDetail from './pages/TrackDetail';
import SheetsExplorer from './pages/SheetsExplorer';
import SheetDetail from './pages/SheetDetail';
import TopicProblems from './pages/TopicProblems';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

// Public Route Component (Redirects to dashboard if already authenticated)
const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (user) {
    return <Navigate to="/" replace />;
  }

  return children;
};

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route
            path="/login"
            element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            }
          />
          <Route
            path="/register"
            element={
              <PublicRoute>
                <Register />
              </PublicRoute>
            }
          />
          <Route
            path="/forgot-password"
            element={
              <PublicRoute>
                <ForgotPassword />
              </PublicRoute>
            }
          />
          <Route
            path="/reset-password"
            element={<ResetPassword />}
          />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/companies"
            element={
              <ProtectedRoute>
                <CompaniesGrid />
              </ProtectedRoute>
            }
          />
          <Route
            path="/company/:companySlug/:trackId"
            element={
              <ProtectedRoute>
                <TrackDetail />
              </ProtectedRoute>
            }
          />
          <Route
            path="/sheets"
            element={
              <ProtectedRoute>
                <SheetsExplorer />
              </ProtectedRoute>
            }
          />
          <Route
            path="/sheet/:sheetSlug"
            element={
              <ProtectedRoute>
                <SheetDetail />
              </ProtectedRoute>
            }
          />
          <Route
            path="/topics/:tagName"
            element={
              <ProtectedRoute>
                <TopicProblems />
              </ProtectedRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <SettingsPage />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
