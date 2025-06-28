import type { FC } from "react";
import { DarkThemeToggle, Navbar } from "flowbite-react";
import { HiMenu } from "react-icons/hi";

interface ExampleNavbarProps {
  onSidebarToggle: () => void;
}

const ExampleNavbar: FC<ExampleNavbarProps> = function ({ onSidebarToggle }) {
  const role = localStorage.getItem("role");
  const isMeter = role === "meter";

  return (
    <Navbar fluid className="bg-[#23404B] shadow-md">
      <div className="w-full px-4 py-3 lg:px-6 text-white">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
          {/* Left: Toggle & Branding */}
          <div className="flex items-center justify-between lg:justify-start lg:gap-4">
            <button
              className="mr-2 rounded text-white focus:outline-none lg:hidden"
              onClick={onSidebarToggle}
            >
              <HiMenu className="h-6 w-6" />
            </button>
            <Navbar.Brand
              href="/"
              className="flex items-center space-x-3 hover:opacity-90"
            >
              <img alt="Logo" src="/images/logo.png" className="h-8 sm:h-10" />
              <div>
                <div className="text-xl font-semibold leading-tight">
                  Water District
                </div>
                <div className="text-xs text-gray-300">
                  Villanueva, Misamis Oriental
                </div>
              </div>
            </Navbar.Brand>
          </div>

          {/* Right: Role & Toggle */}
          <div className="mt-3 flex items-center justify-between gap-4 lg:mt-0">
            <span className="text-sm font-medium text-white border border-white rounded px-3 py-1">
              Login as {isMeter ? "Meter Man" : "Teller"}
            </span>
            <DarkThemeToggle className="hover:scale-105 transition-transform" />
          </div>
        </div>
      </div>
    </Navbar>
  );
};

export default ExampleNavbar;
