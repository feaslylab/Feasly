import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { DemoReadOnlyProvider } from '@/features/demo/DemoReadOnlyProvider';
import { DemoBanner } from '@/features/demo/DemoBanner';
import { FeaslyModelV2 } from '@/components/FeaslyModel/FeaslyModelV2';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { PATHS } from '@/routes/paths';

interface SharedView {
  id: string;
  project_id: string;
  scenario_id?: string;
  expires_at?: string;
}

export default function SharePage() {
  const { token } = useParams<{ token: string }>();
  const [sharedView, setSharedView] = useState<SharedView | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setError('Invalid share link');
      setLoading(false);
      return;
    }

    // TODO: Implement actual API call to validate token and fetch shared view
    // For now, simulate a valid response for demo purposes
    setTimeout(() => {
      setSharedView({
        id: 'demo-shared-view',
        project_id: 'demo-project',
        scenario_id: 'baseline',
      });
      setLoading(false);
    }, 1000);
  }, [token]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error || !sharedView) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="max-w-md w-full space-y-4">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {error || 'This shared link is invalid or has expired.'}
            </AlertDescription>
          </Alert>
          <Button asChild className="w-full">
            <Link to={PATHS.auth}>
              Sign up to create your own projects
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <DemoReadOnlyProvider mode="share">
      <div className="min-h-screen bg-background">
        <DemoBanner />
        <FeaslyModelV2 
          projectId={sharedView.project_id}
          onSubmit={async () => {
            // No-op for shared view
          }}
          onSaveDraft={() => {
            // No-op for shared view
          }}
        />
      </div>
    </DemoReadOnlyProvider>
  );
}