import { useEffect } from 'react';
import { DemoReadOnlyProvider } from '@/features/demo/DemoReadOnlyProvider';
import { DemoBanner } from '@/features/demo/DemoBanner';
import { FeaslyModelV2 } from '@/components/FeaslyModel/FeaslyModelV2';

export default function DemoModelPage() {
  useEffect(() => {
    document.title = 'Demo - Feasly Financial Model';
  }, []);

  // Get demo project ID from environment or use fallback
  const demoProjectId = import.meta.env.VITE_DEMO_PROJECT_ID || 'demo-project';

  return (
    <DemoReadOnlyProvider mode="demo">
      <div className="min-h-screen bg-background">
        <DemoBanner />
        <FeaslyModelV2 
          projectId={demoProjectId}
          onSubmit={async () => {
            // No-op for demo mode
          }}
          onSaveDraft={() => {
            // No-op for demo mode
          }}
        />
      </div>
    </DemoReadOnlyProvider>
  );
}