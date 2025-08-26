import { useAuth } from '@/components/auth/AuthProvider';
import { Navigate } from 'react-router-dom';
import { Suspense, lazy } from 'react';
import { PATHS } from './paths';

const FeaslyLanding = lazy(() => import("../pages/marketing/FeaslyLanding"));

export default function SmartLanding() {
  const { user, loading } = useAuth();
  
  console.log('SmartLanding - user:', user?.id, 'loading:', loading);
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  // If user is authenticated, redirect to dashboard
  if (user) {
    console.log('User authenticated, redirecting to dashboard');
    return <Navigate to={PATHS.dashboard} replace />;
  }
  
  // If not authenticated, show marketing page
  console.log('User not authenticated, showing marketing page');
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <FeaslyLanding />
    </Suspense>
  );
}