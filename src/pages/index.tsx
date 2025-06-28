/* eslint-disable jsx-a11y/anchor-is-valid */
import { Badge, Dropdown, Table, useTheme } from "flowbite-react";
import type { FC } from "react";
import { useEffect, useState } from "react";
import Chart from "react-apexcharts";
import NavbarSidebarLayout from "../layouts/navbar-sidebar";
import useCrudBill from "../hooks/useCrudBill";
import useCrudUser from "../hooks/useCrudUser";

/** Reusable card layout for dashboard sections */
const DashboardCard: FC<{ title?: string; children: React.ReactNode }> = ({
  title,
  children,
}) => (
  <div className="mb-6 rounded-2xl bg-white p-6 shadow-md dark:bg-gray-800">
    {title && (
      <h3 className="mb-4 text-xl font-semibold text-gray-900 dark:text-white">
        {title}
      </h3>
    )}
    {children}
  </div>
);

const Datepicker: FC = function () {
  return (
    <Dropdown
      inline
      label={
        <span className="text-sm text-gray-600 dark:text-gray-300">
          📅 Last 7 days
        </span>
      }
    >
      <Dropdown.Item>
        <strong>Sep 16, 2021 - Sep 22, 2021</strong>
      </Dropdown.Item>
      <Dropdown.Divider />
      <Dropdown.Item>Yesterday</Dropdown.Item>
      <Dropdown.Item>Today</Dropdown.Item>
      <Dropdown.Item>Last 7 days</Dropdown.Item>
      <Dropdown.Item>Last 30 days</Dropdown.Item>
      <Dropdown.Item>Last 90 days</Dropdown.Item>
      <Dropdown.Divider />
      <Dropdown.Item>Custom...</Dropdown.Item>
    </Dropdown>
  );
};

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  status: string;
  profilePic: string;
}

const LatestCustomers: FC = function () {
  const [users, setUsers] = useState<User[]>([]);
  const { getUsers } = useCrudUser();

  useEffect(() => {
    getUsers(setUsers);
  }, []);

  const latest = [...users].slice(-5).reverse();

  return (
    <DashboardCard title="Latest Customers">
      <ul className="divide-y divide-gray-200 dark:divide-gray-700">
        {latest.map((u) => (
          <li className="py-3 sm:py-4" key={u.id}>
            <div className="flex items-center space-x-4">
              <img
                className="h-10 w-10 rounded-full"
                src={u.profilePic}
                alt={`${u.firstName}`}
              />
              <div className="flex-1 min-w-0">
                <p className="truncate text-sm font-medium text-gray-900 dark:text-white">
                  {u.firstName} {u.lastName}
                </p>
                <p className="truncate text-sm text-gray-500 dark:text-gray-400">
                  {u.email}
                </p>
              </div>
              <div className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                {u.status}
              </div>
            </div>
          </li>
        ))}
      </ul>
      <div className="flex justify-end pt-4 border-t border-gray-200 dark:border-gray-700">
        <Datepicker />
      </div>
    </DashboardCard>
  );
};

interface Bill {
  id: string;
  userId: string;
  amount: string;
  paidDate?: string;
}

const PaymentsOverview: FC = function () {
  const [bills, setBills] = useState<Bill[]>([]);
  const { getBills } = useCrudBill();
  const { mode } = useTheme();
  const isDark = mode === "dark";
  const labelColor = isDark ? "#93ACAF" : "#6B7280";
  const borderColor = isDark ? "#374151" : "#F3F4F6";

  useEffect(() => {
    getBills(setBills);
  }, []);

  const totals = new Array(12).fill(0);
  bills.forEach((b) => {
    if (b.paidDate) {
      const month = new Date(b.paidDate).getMonth();
      totals[month] += parseFloat(b.amount) || 0;
    }
  });

  const options: ApexCharts.ApexOptions = {
    chart: {
      type: "bar",
      fontFamily: "Inter, sans-serif",
      toolbar: { show: false },
    },
    xaxis: {
      categories: [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
      ],
      labels: {
        style: { colors: [labelColor], fontSize: "14px", fontWeight: 500 },
      },
      axisBorder: { color: borderColor },
      axisTicks: { color: borderColor },
    },
    yaxis: {
      labels: { style: { colors: [labelColor], fontSize: "14px" } },
    },
    colors: ["#1C64F2"],
    grid: {
      borderColor,
      strokeDashArray: 1,
      padding: { left: 35, bottom: 15 },
    },
  };

  return (
    <DashboardCard title="Payments Overview">
      <Chart
        options={options}
        series={[{ name: "Payments", data: totals }]}
        type="bar"
        height={300}
      />
    </DashboardCard>
  );
};

const LatestTransactions: FC = function () {
  const [bills, setBills] = useState<Bill[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const { getBills } = useCrudBill();
  const { getUsers } = useCrudUser();

  useEffect(() => {
    getBills(setBills);
    getUsers(setUsers);
  }, []);

  const getName = (id: string) => {
    const user = users.find((u) => u.id === id);
    return user ? `${user.firstName} ${user.lastName}` : "Unknown";
  };

  const paid = bills
    .filter((b) => b.paidDate)
    .sort(
      (a, b) =>
        new Date(b.paidDate!).getTime() - new Date(a.paidDate!).getTime()
    )
    .slice(0, 10);

  return (
    <DashboardCard title="Latest Transactions">
      <span className="text-sm text-gray-500 dark:text-gray-400 mb-4 block">
        This is a list of the latest transactions
      </span>
      <div className="overflow-x-auto">
        <Table striped>
          <Table.Head className="bg-gray-50 dark:bg-gray-700">
            <Table.HeadCell>Transaction</Table.HeadCell>
            <Table.HeadCell>Date & Time</Table.HeadCell>
            <Table.HeadCell>Amount</Table.HeadCell>
            <Table.HeadCell>Status</Table.HeadCell>
          </Table.Head>
          <Table.Body className="bg-white dark:bg-gray-800">
            {paid.map((b) => (
              <Table.Row key={b.id}>
                <Table.Cell className="p-4 text-sm text-gray-900 dark:text-white">
                  Payment from{" "}
                  <span className="font-semibold">{getName(b.userId)}</span>
                </Table.Cell>
                <Table.Cell className="p-4 text-sm text-gray-500 dark:text-gray-400">
                  {new Date(b.paidDate!).toLocaleDateString()}
                </Table.Cell>
                <Table.Cell className="p-4 text-sm font-semibold text-gray-900 dark:text-white">
                  ₱{b.amount}
                </Table.Cell>
                <Table.Cell className="p-4">
                  <Badge color="success">Completed</Badge>
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table>
      </div>
      <div className="flex justify-end pt-4 border-t border-gray-200 dark:border-gray-700">
        <Datepicker />
      </div>
    </DashboardCard>
  );
};

const DashboardPage: FC = function () {
  return (
    <NavbarSidebarLayout>
      <div className="px-4 pt-6">
        <LatestTransactions />
        <LatestCustomers />
        <PaymentsOverview />
      </div>
    </NavbarSidebarLayout>
  );
};

export default DashboardPage;
