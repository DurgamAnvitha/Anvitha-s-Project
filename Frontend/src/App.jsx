import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import { useAuth } from './services/AuthContext';

// Standard Login Flow
import LoginPage from './pages/auth/LoginPage';
import SignupPage from './pages/auth/SignupPage';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';

// Lazy Loaded Core Routes
const Dashboard = lazy(() => import('./pages/Dashboard'));
const AdminDashboard = lazy(() => import('./pages/admin/Dashboard'));
const Profile = lazy(() => import('./pages/Profile'));

// Lazy Loaded Heavy Feature Routes
const Students = lazy(() => import('./pages/admin/Students'));
const StudentDetail = lazy(() => import('./pages/StudentDetail'));
const Teachers = lazy(() => import('./pages/admin/Teachers'));
const SectionManagement = lazy(() => import('./pages/admin/SectionManagement'));

const Attendance = lazy(() => import('./pages/Attendance'));
const Grades = lazy(() => import('./pages/Grades'));
const KnowledgeHub = lazy(() => import('./pages/Library'));
const Timetable = lazy(() => import('./pages/Timetable'));
const Queries = lazy(() => import('./pages/Queries'));
const ResourceHub = lazy(() => import('./pages/ResourceHub'));
const Assignments = lazy(() => import('./pages/Assignments'));
const Cohorts = lazy(() => import('./pages/Cohorts'));

// Lazy Loaded Feature Routes additions below...
const LibraryAdmin = lazy(() => import('./pages/admin/LibraryAdmin'));
const FeesAdmin = lazy(() => import('./pages/admin/FeesAdmin'));
const PlacementsAdmin = lazy(() => import('./pages/admin/PlacementsAdmin'));

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) return null;
  if (!user) return <Navigate to="/login" />;
  if (allowedRoles && !allowedRoles.includes(user.role)) return <Navigate to="/" />;

  return children;
};

const LoaderFallback = () => (
  <div className="flex items-center justify-center min-h-screen bg-[#050505]">
    <div className="w-16 h-16 rounded-full border-4 border-orange-500 border-t-transparent animate-spin"></div>
  </div>
);

function App() {
  const { user } = useAuth();
  return (
    <Suspense fallback={<LoaderFallback />}>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route index element={
            user?.role === 'ADMIN' ? <AdminDashboard /> : <Dashboard />
          } />
          <Route path="students" element={
            <ProtectedRoute allowedRoles={['ADMIN', 'TEACHER']}>
              <Students />
            </ProtectedRoute>
          } />
          <Route path="sections" element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <SectionManagement />
            </ProtectedRoute>
          } />
          <Route path="teachers" element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <Teachers />
            </ProtectedRoute>
          } />
          <Route path="attendance" element={<Attendance />} />
          <Route path="grades" element={<Grades />} />
          <Route path="library" element={<KnowledgeHub />} />
          <Route path="timetable" element={<Timetable />} />
          <Route path="profile" element={<Profile />} />
          <Route path="queries" element={<Queries />} />
          <Route path="resources" element={<ResourceHub />} />
          <Route path="assignments" element={<Assignments />} />
          <Route path="cohorts" element={<Cohorts />} />
          <Route path="students/:id" element={<StudentDetail />} />
          <Route path="library-admin" element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <LibraryAdmin />
            </ProtectedRoute>
          } />
          <Route path="fees-admin" element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <FeesAdmin />
            </ProtectedRoute>
          } />
          <Route path="placements-admin" element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <PlacementsAdmin />
            </ProtectedRoute>
          } />
        </Route>
      </Routes>
    </Suspense>
  );
}

export default App;
