import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useSearchParams, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { useSquadStore } from './store/useSquadStore';
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
import RoadmapsExplorer from './pages/RoadmapsExplorer';
import RoadmapDetail from './pages/RoadmapDetail';
import TopicProblems from './pages/TopicProblems';
import SquadHub from './pages/SquadHub';
import LandingPage from './pages/LandingPage';

// Deep-link join handler component
const DeepLinkJoinHandler = ({ children }) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { joinByCode } = useSquadStore();

  useEffect(() => {
    const code = searchParams.get('joinSquad');
    if (code && user) {
      const confirmJoin = window.confirm(`Do you want to join squad with code "${code}"?`);
      if (confirmJoin) {
        joinByCode(code)
          .then(() => {
            alert(`Successfully joined squad!`);
            navigate('/squad');
          })
          .catch((err) => {
            alert(err.message || 'Failed to join squad via deep link.');
          })
          .finally(() => {
            searchParams.delete('joinSquad');
            setSearchParams(searchParams);
          });
      } else {
        searchParams.delete('joinSquad');
        setSearchParams(searchParams);
      }
    }
  }, [searchParams, user, joinByCode, navigate, setSearchParams]);

  return children;
};

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-[#22c55e] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

// Public Route Component
const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-[#22c55e] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

// Smart Home Component
const HomeOrLanding = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-[#22c55e] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return user ? <Dashboard /> : <LandingPage />;
};

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <DeepLinkJoinHandler>
          <Routes>
            <Route path="/landing" element={<LandingPage />} />
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
            <Route path="/" element={<HomeOrLanding />} />
            <Route
              path="/dashboard"
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
              path="/roadmaps"
              element={
                <ProtectedRoute>
                  <RoadmapsExplorer />
                </ProtectedRoute>
              }
            />
            <Route
              path="/roadmap/:roadmapId"
              element={
                <ProtectedRoute>
                  <RoadmapDetail />
                </ProtectedRoute>
              }
            />
            <Route
              path="/squad"
              element={
                <ProtectedRoute>
                  <SquadHub />
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
        </DeepLinkJoinHandler>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
