import { Sidebar, TextInput } from "flowbite-react";
import type { FC } from "react";
import { useEffect, useState } from "react";
import {
  HiChartBar,
  HiChartPie,
  HiClipboard,
  HiCollection,
  HiCurrencyDollar,
  HiInformationCircle,
  HiLogin,
  HiPencil,
  HiSearch,
  HiShoppingBag,
  HiUsers,
} from "react-icons/hi";

const ExampleSidebar: FC = function () {
  const [currentPage, setCurrentPage] = useState("");

  useEffect(() => {
    const newPage = window.location.pathname;

    setCurrentPage(newPage);
  }, [setCurrentPage]);

  return (
    <Sidebar aria-label="Sidebar with multi-level dropdown example">
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
              <Sidebar.Item
                href="/"
                icon={HiChartPie}
                className={
                  "/" === currentPage ? "bg-gray-100 dark:bg-gray-700" : ""
                }
              >
                Dashboard
              </Sidebar.Item>
              <Sidebar.Item
                href="/billing"
                icon={HiChartBar}
                className={
                  "/billing" === currentPage ? "bg-gray-100 dark:bg-gray-700" : ""
                }
              >
                Billing Management
              </Sidebar.Item>
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
              <Sidebar.Item
                href="/meter"
                icon={HiChartBar}
                className={
                  "/meter" === currentPage ? "bg-gray-100 dark:bg-gray-700" : ""
                }
              >
                Meter Dashboard
              </Sidebar.Item>
            </Sidebar.ItemGroup>
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
              <Sidebar.Item href="/authentication/sign-up" icon={HiPencil}>
                Logout
              </Sidebar.Item>
            </Sidebar.ItemGroup>
          </Sidebar.Items>
        </div>
      </div>
    </Sidebar>
  );
};

export default ExampleSidebar;
