import { useState } from "react";
import type { FC, PropsWithChildren } from "react";
import Navbar from "../components/navbar";
import Sidebar from "../components/sidebar";

interface NavbarSidebarLayoutProps {
  isFooter?: boolean;
}

const NavbarSidebarLayout: FC<PropsWithChildren<NavbarSidebarLayoutProps>> =
  function ({ children, isFooter = true }) {
    const [isSidebarOpen, setSidebarOpen] = useState(false);

    return (
      <>
        <Navbar onSidebarToggle={() => setSidebarOpen((prev) => !prev)} />
        {isSidebarOpen && (
          <div
            className="fixed inset-0 z-30 bg-black/50 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
        <div className="flex items-start pt-16">
          <Sidebar isOpen={isSidebarOpen} onClose={() => setSidebarOpen(false)} />
          <MainContent isFooter={isFooter}>{children}</MainContent>
        </div>
      </>
    );
  };

const MainContent: FC<PropsWithChildren<NavbarSidebarLayoutProps>> = function ({
  children,
}) {
  return (
    <main className="relative h-full w-full overflow-y-auto bg-gray-50 dark:bg-gray-900 lg:ml-64">
      {children}
    </main>
  );
};

export default NavbarSidebarLayout;
