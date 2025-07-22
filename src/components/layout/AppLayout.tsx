import { Outlet } from "react-router-dom";
import { EnhancedSidebar, MobileSidebarTrigger } from "./EnhancedSidebar";
import { ResponsiveContainer } from "@/components/ui/mobile-optimized";

export const AppLayout = () => {
  return (
    <div className="min-h-screen w-full flex bg-background">
      <EnhancedSidebar />
      <MobileSidebarTrigger />
      
      <div className="flex-1 flex flex-col min-w-0 lg:ml-0">
        <main className="flex-1 overflow-auto">
          <ResponsiveContainer className="py-6">
            <Outlet />
          </ResponsiveContainer>
        </main>
      </div>
    </div>
  );
};