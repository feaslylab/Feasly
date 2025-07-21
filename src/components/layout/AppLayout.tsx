import { Outlet } from "react-router-dom";
import { Sidebar } from "./Sidebar";

export const AppLayout = () => {
  return (
    <div className="feasly-page h-screen flex overflow-hidden">
      <div className="w-64 flex-shrink-0 h-full">
        <Sidebar />
      </div>
      <div className="flex-1 flex flex-col min-w-0 h-full">
        <main className="flex-1 overflow-auto">
          <div className="feasly-container">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};