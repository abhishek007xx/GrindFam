import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useSearchParams, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SettingsProvider } from './context/SettingsContext';
import { ThemeProvider } from './context/ThemeContext';
import { useSquadStore } from './store/useSquadStore';
import MainLayout from './components/MainLayout';
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
import Portfolio from './pages/Portfolio';
import PublicPortfolio from './pages/PublicPortfolio';
import WorldwideLeaderboard from './pages/WorldwideLeaderboard';

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
            navigate('/community');
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
      <div className="h-screen bg-[#141414] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-[#EA5D3A] border-t-transparent rounded-full animate-spin"></div>
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
      <div className="h-screen bg-[#141414] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-[#EA5D3A] border-t-transparent rounded-full animate-spin"></div>
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
      <div className="h-screen bg-[#141414] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-[#EA5D3A] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return user ? (
    <MainLayout>
      <Dashboard />
    </MainLayout>
  ) : (
    <LandingPage />
  );
};

function App() {
  return (
    <AuthProvider>
      <SettingsProvider>
        <ThemeProvider>
          <BrowserRouter>
            <DeepLinkJoinHandler>
              <Routes>
                <Route path="/p/:username" element={<PublicPortfolio />} />
                <Route path="/landing" element={<LandingPage />} />
                <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
                <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
                <Route path="/forgot-password" element={<PublicRoute><ForgotPassword /></PublicRoute>} />
                <Route path="/reset-password" element={<ResetPassword />} />

                <Route path="/" element={<HomeOrLanding />} />
                <Route path="/dashboard" element={<ProtectedRoute><MainLayout><Dashboard /></MainLayout></ProtectedRoute>} />
                <Route path="/companies" element={<ProtectedRoute><MainLayout><CompaniesGrid /></MainLayout></ProtectedRoute>} />
                <Route path="/company/:companySlug/:trackId" element={<ProtectedRoute><MainLayout><TrackDetail /></MainLayout></ProtectedRoute>} />
                <Route path="/sheets" element={<ProtectedRoute><MainLayout><SheetsExplorer /></MainLayout></ProtectedRoute>} />
                <Route path="/sheet/:sheetSlug" element={<ProtectedRoute><MainLayout><SheetDetail /></MainLayout></ProtectedRoute>} />
                <Route path="/roadmaps" element={<ProtectedRoute><MainLayout><RoadmapsExplorer /></MainLayout></ProtectedRoute>} />
                <Route path="/roadmap/:roadmapId" element={<ProtectedRoute><MainLayout><RoadmapDetail /></MainLayout></ProtectedRoute>} />
                <Route path="/community" element={<ProtectedRoute><MainLayout><SquadHub /></MainLayout></ProtectedRoute>} />
                <Route path="/leaderboard" element={<ProtectedRoute><MainLayout><WorldwideLeaderboard /></MainLayout></ProtectedRoute>} />
                <Route path="/squad" element={<Navigate to="/community" replace />} />
                <Route path="/topics/:tagName" element={<ProtectedRoute><MainLayout><TopicProblems /></MainLayout></ProtectedRoute>} />
                <Route path="/settings" element={<ProtectedRoute><MainLayout><SettingsPage /></MainLayout></ProtectedRoute>} />
                <Route path="/portfolio" element={<ProtectedRoute><MainLayout><Portfolio /></MainLayout></ProtectedRoute>} />

                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </DeepLinkJoinHandler>
          </BrowserRouter>
        </ThemeProvider>
      </SettingsProvider>
    </AuthProvider>
  );
}

export default App;
