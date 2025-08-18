import { Outlet } from 'react-router-dom';
import Header from '@/components/layout/Header';
import { Sidebar } from '@/components/layout/Sidebar';

export default function AppShell() {
  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <div className="flex flex-col min-w-0 min-h-screen sidebar-auto-space">
        <Header />
        <main className="pt-14 flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  );
}