import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useSearchParams, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { useSquadStore } from './store/useSquadStore';
import AppLayout from './components/AppLayout';
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

  return user ? (
    <AppLayout activeSection="dashboard">
      <Dashboard />
    </AppLayout>
  ) : (
    <LandingPage />
  );
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
                  <AppLayout activeSection="dashboard">
                    <Dashboard />
                  </AppLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/companies"
              element={
                <ProtectedRoute>
                  <AppLayout activeSection="companies">
                    <CompaniesGrid />
                  </AppLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/company/:companySlug/:trackId"
              element={
                <ProtectedRoute>
                  <AppLayout activeSection="companies">
                    <TrackDetail />
                  </AppLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/sheets"
              element={
                <ProtectedRoute>
                  <AppLayout activeSection="sheets">
                    <SheetsExplorer />
                  </AppLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/sheet/:sheetSlug"
              element={
                <ProtectedRoute>
                  <AppLayout activeSection="sheets">
                    <SheetDetail />
                  </AppLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/roadmaps"
              element={
                <ProtectedRoute>
                  <AppLayout activeSection="roadmaps">
                    <RoadmapsExplorer />
                  </AppLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/roadmap/:roadmapId"
              element={
                <ProtectedRoute>
                  <AppLayout activeSection="roadmaps">
                    <RoadmapDetail />
                  </AppLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/squad"
              element={
                <ProtectedRoute>
                  <AppLayout activeSection="squad">
                    <SquadHub />
                  </AppLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/topics/:tagName"
              element={
                <ProtectedRoute>
                  <AppLayout activeSection="topics">
                    <TopicProblems />
                  </AppLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/settings"
              element={
                <ProtectedRoute>
                  <AppLayout activeSection="settings">
                    <SettingsPage />
                  </AppLayout>
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
