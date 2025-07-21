import { Outlet } from "react-router-dom";
import { Sidebar } from "./Sidebar";

export const AppLayout = () => {
  return (
    <div className="feasly-page h-screen flex overflow-hidden">
      <div className="flex-shrink-0 h-full transition-all duration-300">
        <Sidebar />
      </div>
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        <main className="flex-1 overflow-auto">
          <div className="feasly-container min-h-[100vh] px-4 sm:px-6 lg:px-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};