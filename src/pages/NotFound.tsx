import { Button } from '@/components/ui/button';
import { PATHS } from '@/routes/paths';
import { useNavigate } from 'react-router-dom';
import { Home, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="mx-auto max-w-xl py-16 px-6 text-center">
        <div className="mb-8">
          <h1 className="text-6xl font-bold text-muted-foreground mb-4">404</h1>
          <h2 className="text-2xl font-semibold text-foreground mb-2">Page not found</h2>
          <p className="text-muted-foreground">
            The page you're looking for doesn't exist or has moved.
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button
            onClick={() => navigate(-1)}
            variant="outline"
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Go Back
          </Button>
          <Button
            onClick={() => navigate(PATHS.dashboard, { replace: true })}
            className="flex items-center gap-2"
          >
            <Home className="w-4 h-4" />
            Go to Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
}