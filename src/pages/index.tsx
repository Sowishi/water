/* eslint-disable jsx-a11y/anchor-is-valid */
import { Badge, Dropdown, Table, useTheme } from "flowbite-react";
import type { FC } from "react";
import { useEffect, useState } from "react";
import Chart from "react-apexcharts";
import NavbarSidebarLayout from "../layouts/navbar-sidebar";
import useCrudBill from "../hooks/useCrudBill";
import useCrudUser from "../hooks/useCrudUser";

const DashboardPage: FC = function () {
  return (
    <NavbarSidebarLayout>
      <div className="px-4 pt-6">
        <div className="my-6">
          <LatestTransactions />
        </div>
        <LatestCustomers />
        <div className="my-6">
          <PaymentsOverview />
        </div>
      </div>
    </NavbarSidebarLayout>
  );
};

const Datepicker: FC = function () {
  return (
    <span className="text-sm text-gray-600">
      <Dropdown inline label="Last 7 days">
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
    </span>
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
    <div className="mb-4 h-full rounded-lg bg-white p-4 shadow dark:bg-gray-800 sm:p-6">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-xl font-bold leading-none text-gray-900 dark:text-white">
          Latest Customers
        </h3>
      </div>
      <div className="flow-root">
        <ul className="divide-y divide-gray-200 dark:divide-gray-700">
          {latest.map((u) => (
            <li className="py-3 sm:py-4" key={u.id}>
              <div className="flex items-center space-x-4">
                <div className="shrink-0">
                  <img
                    className="h-8 w-8 rounded-full"
                    src={u.profilePic}
                    alt=""
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-gray-900 dark:text-white">
                    {u.firstName} {u.lastName}
                  </p>
                  <p className="truncate text-sm text-gray-500 dark:text-gray-400">
                    {u.email}
                  </p>
                </div>
                <div className="inline-flex items-center text-base font-semibold text-gray-900 dark:text-white">
                  {u.status}
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
      <div className="flex items-center justify-between border-t border-gray-200 pt-3 dark:border-gray-700 sm:pt-6">
        <Datepicker />
      </div>
    </div>
  );
};

interface Bill {
  amount: string;
  paidDate?: string;
}

const PaymentsOverview: FC = function () {
  const [bills, setBills] = useState<Bill[]>([]);
  const { getBills } = useCrudBill();
  const { mode } = useTheme();
  const isDarkTheme = mode === "dark";
  const labelColor = isDarkTheme ? "#93ACAF" : "#6B7280";
  const borderColor = isDarkTheme ? "#374151" : "#F3F4F6";

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
        style: {
          colors: [labelColor],
          fontSize: "14px",
          fontWeight: 500,
        },
      },
      axisBorder: { color: borderColor },
      axisTicks: { color: borderColor },
    },
    yaxis: {
      labels: {
        style: {
          colors: [labelColor],
          fontSize: "14px",
        },
      },
    },
    colors: ["#1C64F2"],
    grid: {
      show: true,
      borderColor: borderColor,
      strokeDashArray: 1,
      padding: { left: 35, bottom: 15 },
    },
  };

  const series = [
    {
      name: "Payments",
      data: totals,
    },
  ];

  return (
    <div className="rounded-lg bg-white p-4 shadow dark:bg-gray-800 sm:p-6 xl:p-8">
      <h3 className="mb-4 text-xl font-bold leading-none text-gray-900 dark:text-white">
        Payments Overview
      </h3>
      <Chart options={options} series={series} type="bar" height={350} />
    </div>
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

  const getName = (userId: string) => {
    const u = users.find((user) => user.id === userId);
    return u ? `${u.firstName} ${u.lastName}` : "Unknown";
  };

  const paid = bills
    .filter((b) => b.paidDate)
    .sort(
      (a, b) =>
        new Date(b.paidDate ?? "").getTime() -
        new Date(a.paidDate ?? "").getTime()
    )
    .slice(0, 10);

  return (
    <div className="rounded-lg bg-white p-4 shadow dark:bg-gray-800 sm:p-6 xl:p-8">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="mb-2 text-xl font-bold text-gray-900 dark:text-white">
            Latest Transactions
          </h3>
          <span className="text-base font-normal text-gray-600 dark:text-gray-400">
            This is a list of latest transactions
          </span>
        </div>
      </div>
      <div className="mt-8 flex flex-col">
        <div className="overflow-x-auto rounded-lg">
          <div className="inline-block min-w-full w-full align-middle">
            <div className="overflow-hidden shadow sm:rounded-lg">
              <Table
                striped
                className="min-w-full w-full divide-y divide-gray-200 dark:divide-gray-600"
              >
                <Table.Head className="bg-gray-50 dark:bg-gray-700">
                  <Table.HeadCell>Transaction</Table.HeadCell>
                  <Table.HeadCell>Date &amp; Time</Table.HeadCell>
                  <Table.HeadCell>Amount</Table.HeadCell>
                  <Table.HeadCell>Status</Table.HeadCell>
                </Table.Head>
                <Table.Body className="bg-white dark:bg-gray-800">
                  {paid.map((b) => (
                    <Table.Row key={b.id}>
                      <Table.Cell className="whitespace-nowrap p-4 text-sm font-normal text-gray-900 dark:text-white">
                        Payment from{" "}
                        <span className="font-semibold">
                          {getName(b.userId)}
                        </span>
                      </Table.Cell>
                      <Table.Cell className="whitespace-nowrap p-4 text-sm font-normal text-gray-500 dark:text-gray-400">
                        {b.paidDate
                          ? new Date(b.paidDate).toLocaleDateString()
                          : ""}
                      </Table.Cell>
                      <Table.Cell className="whitespace-nowrap p-4 text-sm font-semibold text-gray-900 dark:text-white">
                        ₱{b.amount}
                      </Table.Cell>
                      <Table.Cell className="flex whitespace-nowrap p-4">
                        <Badge color="success">Completed</Badge>
                      </Table.Cell>
                    </Table.Row>
                  ))}
                </Table.Body>
              </Table>
            </div>
          </div>
        </div>
      </div>
      <div className="flex items-center justify-between pt-3 sm:pt-6">
        <Datepicker />
      </div>
    </div>
  );
};

export default DashboardPage;
