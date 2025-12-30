import { HashRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { Navbar } from './components/Layout/Navbar';
import { NotificationToast } from './components/Notifications/NotificationToast';
import { PageSEO } from './components/SEO';
import { HeartbeatLoader } from './components/Layout/HeartbeatLoader';
import { lazy, Suspense, useEffect } from 'react';
import { supabase } from './lib/supabase';

// Lazy load components for better initial load performance
const AuthPage = lazy(() => import('./components/Auth/AuthPage').then(m => ({ default: m.AuthPage })));
const PatientDashboard = lazy(() => import('./components/Patient/PatientDashboard').then(m => ({ default: m.PatientDashboard })));
const DoctorDashboard = lazy(() => import('./components/Doctor/DoctorDashboard').then(m => ({ default: m.DoctorDashboard })));
const AdminDashboard = lazy(() => import('./components/Admin/AdminDashboard').then(m => ({ default: m.AdminDashboard })));
const LandingPage = lazy(() => import('./components/LandingPage').then(m => ({ default: m.LandingPage })));
const MedicationsPage = lazy(() => import('./pages/MedicationsPage'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));
const CommonDiseasesPage = lazy(() => import('./pages/CommonDiseasesPage'));
const HistoryPage = lazy(() => import('./pages/HistoryPage'));
const HealthAssessmentPage = lazy(() => import('./pages/HealthAssessmentPage'));
const MedicationStore = lazy(() => import('./pages/MedicationStorePage').then(m => ({ default: m.MedicationStore })));
const PaymentSuccessPage = lazy(() => import('./pages/PaymentSuccessPage').then(m => ({ default: m.PaymentSuccessPage })));
const PaymentCanceledPage = lazy(() => import('./pages/PaymentCanceledPage').then(m => ({ default: m.PaymentCanceledPage })));
const OrderHistoryPage = lazy(() => import('./pages/OrderHistoryPage').then(m => ({ default: m.OrderHistoryPage })));
const ResetPasswordPage = lazy(() => import('./pages/ResetPasswordPage').then(m => ({ default: m.ResetPasswordPage })));
const AddMedicationPage = lazy(() => import('./pages/AddMedicationPage').then(m => ({ default: m.AddMedicationPage })));
const EditMedicationPage = lazy(() => import('./pages/EditMedicationPage').then(m => ({ default: m.EditMedicationPage })));
const CreateCaseForm = lazy(() => import('./components/Patient/CreateCaseForm').then(m => ({ default: m.CreateCaseForm })));
const PatientCasesList = lazy(() => import('./components/Patient/PatientCasesList').then(m => ({ default: m.PatientCasesList })));
const DoctorCasesList = lazy(() => import('./components/Doctor/DoctorCasesList').then(m => ({ default: m.DoctorCasesList })));
const DiseasePrediction = lazy(() => import('./components/Patient/DiseasePrediction').then(m => ({ default: m.DiseasePrediction })));
const SmartSymptomForm = lazy(() => import('./components/Patient/SmartSymptomForm').then(m => ({ default: m.SmartSymptomForm })));
const SettingsPage = lazy(() => import('./pages/SettingsPage'));

// Suspense wrapper for lazy components
const LazyComponent = ({ children }: { children: React.ReactNode }) => (
  <Suspense fallback={<HeartbeatLoader />}>
    {children}
  </Suspense>
);

// Landing Page Wrapper to use navigation
function LandingPageWrapper() {
  const navigate = useNavigate();
  
  // Handle email confirmation tokens from URL
  useEffect(() => {
    const hash = window.location.hash;
    
    // Check if there's an access_token in the hash (from email confirmation)
    if (hash.includes('access_token=') && hash.includes('type=signup')) {
      const params = new URLSearchParams(hash.split('#')[1] || '');
      const accessToken = params.get('access_token');
      const refreshToken = params.get('refresh_token');
      
      if (accessToken && refreshToken) {
        supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        }).then(() => {
          // Redirect to dashboard after successful email confirmation
          navigate('/dashboard');
        });
      }
    }
  }, [navigate]);
  
  return (
    <LazyComponent>
      <LandingPage onGetStarted={() => navigate('/login')} />
    </LazyComponent>
  );
}

// Auth Page Wrapper to use navigation
function AuthPageWrapper() {
  const navigate = useNavigate();
  return (
    <LazyComponent>
      <AuthPage onBack={() => navigate('/')} />
    </LazyComponent>
  );
}

// Protected Route Component
function ProtectedRoute({ children, requiredRole }: { children: React.ReactNode; requiredRole?: string }) {
  const { user, profile, loading } = useAuth();

  if (loading) {
    return <HeartbeatLoader />;
  }

  if (!user || !profile) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && profile.role !== requiredRole) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
}

// Dashboard Layout Component
function DashboardLayout({ children, role }: { children: React.ReactNode; role?: string }) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      <Navbar />
      <main>
        {children}
      </main>
    </div>
  );
}

// Medications Layout (no padding since the page has its own layout)
function MedicationsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main>
        {children}
      </main>
    </div>
  );
}

// Unauthorized Page
function UnauthorizedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-orange-50">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-red-600 mb-4">Access Denied</h1>
        <p className="text-gray-600 mb-6">You don't have permission to access this page.</p>
        <button
          onClick={() => window.location.href = '/'}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Go Home
        </button>
      </div>
    </div>
  );
}

function AppContent() {
  const { user, profile, loading } = useAuth();

  if (loading) {
    return <HeartbeatLoader />;
  }

  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingPageWrapper />} />
        <Route path="/login" element={<AuthPageWrapper />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/unauthorized" element={<UnauthorizedPage />} />

        {/* Protected Routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardLayout role={profile?.role}>
                {profile?.role === 'patient' && <PatientDashboard />}
                {profile?.role === 'doctor' && <DoctorDashboard />}
                {profile?.role === 'admin' && <AdminDashboard />}
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        {/* Role-specific Routes */}
        <Route
          path="/patient-dashboard"
          element={
            <ProtectedRoute requiredRole="patient">
              <DashboardLayout role="patient">
                <PatientDashboard />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/doctor-dashboard"
          element={
            <ProtectedRoute requiredRole="doctor">
              <DashboardLayout role="doctor">
                <DoctorDashboard />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin"
          element={
            <ProtectedRoute requiredRole="admin">
              <DashboardLayout role="admin">
                <AdminDashboard />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        
        {/* Add Medication Route - Only for Admins */}
        <Route
          path="/admin/add-medication"
          element={
            <ProtectedRoute requiredRole="admin">
              <AddMedicationPage />
            </ProtectedRoute>
          }
        />
        
        {/* Edit Medication Route - Only for Admins */}
        <Route
          path="/admin/edit-medication/:id"
          element={
            <ProtectedRoute requiredRole="admin">
              <EditMedicationPage />
            </ProtectedRoute>
          }
        />
        
        {/* Redirect old admin-dashboard route to new /admin route */}
        <Route path="/admin-dashboard" element={<Navigate to="/admin" replace />} />

        {/* Medications Route - Available for all authenticated users */}
        <Route
          path="/medications"
          element={
            <ProtectedRoute>
              <MedicationsLayout>
                <MedicationsPage />
              </MedicationsLayout>
            </ProtectedRoute>
          }
        />

        {/* Medication Store Route - Only for Doctors */}
        <Route
          path="/medication-store"
          element={
            <ProtectedRoute requiredRole="doctor">
              <MedicationStore />
            </ProtectedRoute>
          }
        />

        {/* Payment Routes - Only for Doctors */}
        <Route
          path="/payment-success"
          element={
            <ProtectedRoute requiredRole="doctor">
              <PaymentSuccessPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/payment-canceled"
          element={
            <ProtectedRoute requiredRole="doctor">
              <PaymentCanceledPage />
            </ProtectedRoute>
          }
        />

        {/* Order History - Only for Doctors */}
        <Route
          path="/order-history"
          element={
            <ProtectedRoute requiredRole="doctor">
              <OrderHistoryPage />
            </ProtectedRoute>
          }
        />

        {/* Create Case - Only for Patients */}
        <Route
          path="/create-case"
          element={
            <ProtectedRoute requiredRole="patient">
              <DashboardLayout role="patient">
                <CreateCaseForm />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        {/* My Cases - Only for Patients */}
        <Route
          path="/my-cases"
          element={
            <ProtectedRoute requiredRole="patient">
              <DashboardLayout role="patient">
                <PatientCasesList />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        {/* Doctor Cases - Only for Doctors */}
        <Route
          path="/doctor-cases"
          element={
            <ProtectedRoute requiredRole="doctor">
              <DashboardLayout role="doctor">
                <DoctorCasesList />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <DashboardLayout role={profile?.role}>
                <ProfilePage />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/common-diseases"
          element={
            <ProtectedRoute>
              <DashboardLayout role={profile?.role}>
                <CommonDiseasesPage />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/history"
          element={
            <ProtectedRoute>
              <DashboardLayout role={profile?.role}>
                <HistoryPage />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/health-assessment"
          element={
            <ProtectedRoute>
              <HealthAssessmentPage />
            </ProtectedRoute>
          }
        />

        {/* Settings Page */}
        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <SettingsPage />
            </ProtectedRoute>
          }
        />

        {/* Disease Prediction - AI Model Test */}
        <Route
          path="/disease-prediction"
          element={
            <ProtectedRoute>
              <SmartSymptomForm />
            </ProtectedRoute>
          }
        />

        {/* Redirect authenticated users to dashboard */}
        <Route
          path="*"
          element={
            user && profile ? (
              <Navigate to="/dashboard" replace />
            ) : (
              <Navigate to="/" replace />
            )
          }
        />
      </Routes>
    </Router>
  );
}

function App() {
  return (
    <HelmetProvider>
      <ThemeProvider>
        <AuthProvider>
          <NotificationProvider>
            <NotificationToast />
            <AppContent />
          </NotificationProvider>
        </AuthProvider>
      </ThemeProvider>
    </HelmetProvider>
  );
}

export default App;
