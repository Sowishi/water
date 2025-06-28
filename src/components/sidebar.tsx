import { Sidebar, TextInput } from "flowbite-react";
import type { FC } from "react";
import { useEffect, useState } from "react";
import {
  HiChartBar,
  HiChartPie,
  HiClipboard,
  HiCollection,
  HiCurrencyDollar,
  HiX,
  HiInformationCircle,
  HiLogin,
  HiPencil,
  HiSearch,
  HiShoppingBag,
  HiUsers,
} from "react-icons/hi";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const ExampleSidebar: FC<SidebarProps> = function ({ isOpen, onClose }) {
  const [currentPage, setCurrentPage] = useState("");

  useEffect(() => {
    const newPage = window.location.pathname;

    setCurrentPage(newPage);
  }, [setCurrentPage]);

  const role = localStorage.getItem("role");
  const isMeter = role === "meter";

  return (
    <Sidebar
      aria-label="Sidebar with multi-level dropdown example"
      className={`fixed top-0 left-0 z-40 h-screen w-64 transition-transform bg-white dark:bg-gray-800 lg:static lg:translate-x-0 ${
        isOpen ? "translate-x-0" : "-translate-x-full"
      }`}
    >
      <button
        onClick={onClose}
        className="absolute top-2 right-2 rounded p-1 text-gray-500 hover:bg-gray-100 lg:hidden"
      >
        <HiX className="h-5 w-5" />
      </button>
      <div className="flex h-full flex-col justify-between py-2">
        <div>
          <form className="pb-3 md:hidden">
            <TextInput
              icon={HiSearch}
              type="search"
              placeholder="Search"
              required
              size={32}
            />
          </form>
          <Sidebar.Items>
            <Sidebar.ItemGroup>
              {!isMeter && (
                <Sidebar.Item
                  href="/dashboard"
                  icon={HiChartPie}
                  className={
                    "/dashboard" === currentPage
                      ? "bg-gray-100 dark:bg-gray-700"
                      : ""
                  }
                >
                  Dashboard
                </Sidebar.Item>
              )}
              <Sidebar.Item
                href="/billing"
                icon={HiChartBar}
                className={
                  "/billing" === currentPage
                    ? "bg-gray-100 dark:bg-gray-700"
                    : ""
                }
              >
                Billing Management
              </Sidebar.Item>
              {!isMeter && (
                <Sidebar.Item
                  href="/users/list"
                  icon={HiUsers}
                  className={
                    "/users/list" === currentPage
                      ? "bg-gray-100 dark:bg-gray-700"
                      : ""
                  }
                >
                  Customer List
                </Sidebar.Item>
              )}
            </Sidebar.ItemGroup>
            {!isMeter && (
              <Sidebar.ItemGroup>
                <Sidebar.Item
                  href="https://github.com/themesberg/flowbite-react/"
                  icon={HiClipboard}
                >
                  Generate Reports
                </Sidebar.Item>

                <Sidebar.Item
                  href="https://github.com/themesberg/flowbite-react/issues"
                  icon={HiInformationCircle}
                >
                  Account Setiings
                </Sidebar.Item>
                <Sidebar.Item
                  href="/"
                  icon={HiPencil}
                  onClick={() => localStorage.removeItem("role")}
                >
                  Logout
                </Sidebar.Item>
              </Sidebar.ItemGroup>
            )}
            {isMeter && (
              <Sidebar.ItemGroup>
                <Sidebar.Item
                  href="/"
                  icon={HiPencil}
                  onClick={() => localStorage.removeItem("role")}
                >
                  Logout
                </Sidebar.Item>
              </Sidebar.ItemGroup>
            )}
          </Sidebar.Items>
        </div>
      </div>
    </Sidebar>
  );
};

export default ExampleSidebar;
