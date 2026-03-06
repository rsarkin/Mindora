import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider, useToast } from './context/ToastContext';

// Pages & Components
import { OnboardingPage } from './pages/OnboardingPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { Dashboard } from './pages/Dashboard';
import { ProfilePage } from './pages/ProfilePage';
import { ErrorBoundary } from './components/ErrorBoundary';
import { LandingPage } from './pages/LandingPage';
import { PublicBotPage } from './pages/PublicBotPage';
import { BreathingExercisesPage } from './pages/BreathingExercisesPage';
import { PatientResourcesPage } from './pages/PatientResourcesPage';

import { TherapistLayout } from './layouts/TherapistLayout';
import { TherapistDashboardPage } from './pages/TherapistDashboardPage';
import { MyPatientsPage } from './pages/therapist/MyPatientsPage';
import { TherapistAppointmentsPage } from './pages/therapist/TherapistAppointmentsPage';
import { TherapistProfilePage } from './pages/therapist/TherapistProfilePage';
import { EarningsPage } from './pages/therapist/EarningsPage';
import { SettingsPage } from './pages/therapist/SettingsPage';
import { TherapistSlotsPage } from './pages/therapist/TherapistSlotsPage';
import { PatientProfilePage } from './pages/therapist/PatientProfilePage';
import { SessionPage } from './pages/therapist/SessionPage';
import { MessagesPage } from './pages/therapist/MessagesPage';
import { PatientAppointmentsPage } from './pages/PatientAppointmentsPage';
import { FindTherapistsPage } from './pages/FindTherapistsPage';
import { TherapistBookingPage } from './pages/TherapistBookingPage';
import { PatientMessagesPage } from './pages/PatientMessagesPage';
import { BotChatPage } from './pages/PatientBotChatPage';
import { CommunitiesPage } from './pages/patient/CommunitiesPage';
import { PodDashboard } from './pages/patient/PodDashboard';
import { PageTransition } from './components/PageTransition';
import { ScrollToTop } from './components/ScrollToTop';
import { PatientLayout } from './layouts/PatientLayout';

// Admin Routes (New SaaS Architecture)
import { AdminLayout } from './layouts/AdminLayout';
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import { AdminProfilePage } from './pages/AdminProfilePage';
import { AdminSettingsPage } from './pages/AdminSettingsPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { VerificationPendingPage } from './pages/VerificationPendingPage';

import { LoadingSpinner } from './components/LoadingSpinner';

const RedirectWithToast = ({ to, message }: { to: string; message: string }) => {
  const { showToast } = useToast();
  React.useEffect(() => {
    showToast(message, 'error');
  }, [showToast, message]);
  return <Navigate to={to} replace />;
};

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) return <div className="min-h-screen flex items-center justify-center bg-slate-50"><LoadingSpinner size="lg" /></div>;
  if (!isAuthenticated) return <RedirectWithToast to="/login/patient" message="Please log in to access this page." />;
  return <PageTransition>{children}</PageTransition>;
};

const TherapistRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, user, isLoading } = useAuth();
  if (isLoading) return <div className="min-h-screen flex items-center justify-center bg-slate-50"><LoadingSpinner size="lg" /></div>;
  if (!isAuthenticated || user?.role !== 'therapist') return <RedirectWithToast to="/login/therapist" message="Unauthorized. Therapist access only." />;
  if (user?.accountStatus === 'PENDING_VERIFICATION') return <Navigate to="/verification-pending" replace />;
  return <PageTransition>{children}</PageTransition>;
};

const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, user, isLoading } = useAuth();
  if (isLoading) return <div className="min-h-screen flex items-center justify-center bg-slate-50"><LoadingSpinner size="lg" /></div>;
  if (!isAuthenticated || user?.role !== 'admin') return <RedirectWithToast to="/admin/login" message="Unauthorized. Admin access only." />;
  return <PageTransition>{children}</PageTransition>;
};

const AnimatedRoutes = () => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<PageTransition><LandingPage /></PageTransition>} />
        <Route path="/onboarding" element={<PageTransition><OnboardingPage /></PageTransition>} />
        <Route path="/bot/public" element={<PageTransition><PublicBotPage /></PageTransition>} />

        <Route path="/login/patient" element={<PageTransition><LoginPage role="patient" /></PageTransition>} />
        <Route path="/login/therapist" element={<PageTransition><LoginPage role="therapist" /></PageTransition>} />
        <Route path="/admin/login" element={<PageTransition><LoginPage role="admin" /></PageTransition>} />
        <Route path="/login/admin" element={<Navigate to="/admin/login" />} />

        <Route path="/signup/patient" element={<PageTransition><RegisterPage role="patient" /></PageTransition>} />
        <Route path="/signup/therapist" element={<PageTransition><RegisterPage role="therapist" /></PageTransition>} />

        <Route path="/login" element={<PageTransition><LoginPage /></PageTransition>} />
        <Route path="/register" element={<PageTransition><RegisterPage /></PageTransition>} />
        <Route path="/verification-pending" element={<PageTransition><VerificationPendingPage /></PageTransition>} />

        {/* Patient Routes */}
        <Route element={<PatientLayout />}>
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/dashboard/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
          <Route path="/breathing" element={<ProtectedRoute><BreathingExercisesPage /></ProtectedRoute>} />
          <Route path="/resources" element={<ProtectedRoute><PatientResourcesPage /></ProtectedRoute>} />

          <Route path="/find-therapists" element={<ProtectedRoute><FindTherapistsPage /></ProtectedRoute>} />
          <Route path="/appointments" element={<ProtectedRoute><PatientAppointmentsPage /></ProtectedRoute>} />
          <Route path="/therapist-profile/:therapistId" element={<ProtectedRoute><TherapistBookingPage /></ProtectedRoute>} />
          <Route path="/messages" element={<ProtectedRoute><PatientMessagesPage /></ProtectedRoute>} />
          <Route path="/bot" element={<ProtectedRoute><BotChatPage /></ProtectedRoute>} />
        </Route>

        {/* Therapist Routes */}
        <Route path="/therapist" element={<TherapistRoute><TherapistLayout /></TherapistRoute>}>
          <Route index element={<Navigate to="/therapist/dashboard" replace />} />
          <Route path="dashboard" element={<TherapistDashboardPage />} />
          <Route path="patients" element={<MyPatientsPage />} />
          <Route path="patients/:id" element={<PatientProfilePage />} />
          <Route path="appointments" element={<TherapistAppointmentsPage />} />
          <Route path="slots" element={<TherapistSlotsPage />} />
          <Route path="session/:appointmentId" element={<SessionPage />} />
          <Route path="messages" element={<MessagesPage />} />
          <Route path="chat" element={<Navigate to="/therapist/messages" replace />} />
          <Route path="profile" element={<TherapistProfilePage />} />
          <Route path="earnings" element={<EarningsPage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>

        {/* Admin Routes */}
        <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
          <Route index element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboardPage />} />
          <Route path="profile" element={<AdminProfilePage />} />
          <Route path="settings" element={<AdminSettingsPage />} />

          <Route path="patients" element={<AdminDashboardPage />} />
          <Route path="therapists" element={<AdminDashboardPage />} />
        </Route>

        {/* 404 Catch-All Route */}
        <Route path="*" element={<PageTransition><NotFoundPage /></PageTransition>} />
      </Routes>
    </AnimatePresence>
  );
};

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <ToastProvider>
          <Router>
            <ScrollToTop />
            <AnimatedRoutes />
          </Router>
        </ToastProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}
