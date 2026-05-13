import { Outlet } from 'react-router-dom';
import { useState } from 'react';
import Header from './Header';
import Sidebar from './Sidebar';

const MainLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const toggleSidebar = () => setIsSidebarOpen((prev) => !prev);
  const toggleCollapse = () => setIsSidebarCollapsed((prev) => !prev);
  const closeSidebar = () => setIsSidebarOpen(false);

  return (
    <div className="h-[100dvh] sm:h-screen bg-gray-100 overflow-hidden">
      <Header
        onToggleSidebar={toggleSidebar}
        onToggleCollapse={toggleCollapse}
      />
      <div className="relative h-[calc(100dvh-4rem)] sm:h-[calc(100vh-4rem)] overflow-hidden">
        <Sidebar
          isOpen={isSidebarOpen}
          isCollapsed={isSidebarCollapsed}
          onClose={closeSidebar}
        />
        <main className="h-full w-full overflow-auto p-4 sm:p-6 lg:pl-64">
          <div className="mx-auto w-full max-w-6xl">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
