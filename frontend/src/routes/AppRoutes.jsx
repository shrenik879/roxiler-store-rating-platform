import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from './ProtectedRoute';
import { DashboardLayout } from '@/layouts/DashboardLayout';
import { FullPageSpinner } from '@/components/ui/Spinner';
import { useAuth } from '@/contexts/AuthContext';
import { ROLE_HOME, ROLES } from '@/constants';

const Login = lazy(() => import('@/pages/auth/Login'));
const Register = lazy(() => import('@/pages/auth/Register'));
const ChangePassword = lazy(() => import('@/pages/ChangePassword'));
const AdminDashboard = lazy(() => import('@/pages/admin/AdminDashboard'));
const ManageUsers = lazy(() => import('@/pages/admin/ManageUsers'));
const ManageStores = lazy(() => import('@/pages/admin/ManageStores'));
const BrowseStores = lazy(() => import('@/pages/user/BrowseStores'));
const OwnerDashboard = lazy(() => import('@/pages/owner/OwnerDashboard'));
const NotFound = lazy(() => import('@/pages/NotFound'));

function RootRedirect() {
  const { isAuthenticated, user, initializing } = useAuth();
  if (initializing) return <FullPageSpinner />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <Navigate to={ROLE_HOME[user.role] || '/login'} replace />;
}

export function AppRoutes() {
  return (
    <Suspense fallback={<FullPageSpinner />}>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/change-password" element={<ChangePassword />} />

          <Route
            path="/admin/dashboard"
            element={<ProtectedRoute allow={[ROLES.ADMIN]}><AdminDashboard /></ProtectedRoute>}
          />
          <Route
            path="/admin/users"
            element={<ProtectedRoute allow={[ROLES.ADMIN]}><ManageUsers /></ProtectedRoute>}
          />
          <Route
            path="/admin/stores"
            element={<ProtectedRoute allow={[ROLES.ADMIN]}><ManageStores /></ProtectedRoute>}
          />

          <Route
            path="/stores"
            element={<ProtectedRoute allow={[ROLES.USER]}><BrowseStores /></ProtectedRoute>}
          />

          <Route
            path="/owner/dashboard"
            element={<ProtectedRoute allow={[ROLES.STORE_OWNER]}><OwnerDashboard /></ProtectedRoute>}
          />
        </Route>

        <Route path="/" element={<RootRedirect />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
}
