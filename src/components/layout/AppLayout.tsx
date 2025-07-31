import { Outlet } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { ResponsiveContainer } from "@/components/ui/mobile-optimized";

export const AppLayout = () => {
  return (
    <div className="min-h-screen w-full bg-background">
      <Sidebar />
      
      <div className="flex flex-col min-w-0 min-h-screen sidebar-auto-space">
        <main className="flex-1 overflow-auto pt-14">
          <ResponsiveContainer className="py-6">
            <Outlet />
          </ResponsiveContainer>
        </main>
      </div>
    </div>
  );
};