import { Navigate } from 'react-router-dom';
import { useViewMode } from '@/lib/view-mode';
import { VIEW_CONFIG } from '@/lib/views/config';

export default function LandingRedirect() {
  const { mode } = useViewMode();
  const cfg = VIEW_CONFIG[mode];
  return <Navigate to={cfg.defaults.landingRoute} replace />;
}