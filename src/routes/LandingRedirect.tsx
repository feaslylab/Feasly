import { Navigate } from 'react-router-dom';
import { useViewMode } from '@/lib/view-mode';
import { VIEW_CONFIG } from '@/lib/views/config';
import { PATHS, isKnownPath } from '@/routes/paths';

export default function LandingRedirect() {
  const { mode } = useViewMode();
  const cfg = VIEW_CONFIG[mode];
  const target = cfg.defaults.landingRoute;
  const safeTarget = isKnownPath(target) ? target : PATHS.dashboard;
  
  return <Navigate to={safeTarget} replace />;
}