import { Outlet } from 'react-router-dom';
import { TopBar } from '@/components/layout/TopBar';
import { EnhancedSidebar } from '@/components/layout/EnhancedSidebar';

export default function AppShell() {
  return (
    <div className="min-h-screen bg-background">
      <TopBar />
      <div className="flex">
        <EnhancedSidebar />
        <main className="flex-1 pt-14 min-h-screen">
          {/* Skip to content link for accessibility */}
          <a 
            href="#main-content" 
            className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 z-50 bg-primary text-primary-foreground px-4 py-2 rounded"
          >
            Skip to content
          </a>
          <div id="main-content" className="flex-1">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}