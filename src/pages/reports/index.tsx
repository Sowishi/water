import { Breadcrumb, Button, Table } from "flowbite-react";
import type { FC } from "react";
import { useEffect, useState } from "react";
import { HiHome } from "react-icons/hi";
import NavbarSidebarLayout from "../../layouts/navbar-sidebar";
import useCrudBill from "../../hooks/useCrudBill";
import useCrudUser from "../../hooks/useCrudUser";
import { usePDF } from "react-to-pdf";

interface Bill {
  id: string;
  userId: string;
  month: string;
  prevReading: number;
  currentReading: number;
  amount: string;
  deadline: string;
  paidDate?: string;
}

interface User {
  id: string;
  firstName: string;
  lastName: string;
  meterID: string;
}

const ReportsPage: FC = () => {
  const [bills, setBills] = useState<Bill[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const { getBills } = useCrudBill();
  const { getUsers } = useCrudUser();
  const { toPDF, targetRef } = usePDF({ filename: "billing-reports.pdf" });

  useEffect(() => {
    getBills(setBills);
    getUsers(setUsers);
  }, []);

  const getUser = (id: string) => users.find((u) => u.id === id);

  return (
    <NavbarSidebarLayout isFooter={false}>
      <section className="border-b border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-900">
        <div className="mb-4">
          <Breadcrumb className="mb-3">
            <Breadcrumb.Item href="#">
              <HiHome className="mr-2 text-xl" />
              <span className="dark:text-white">Home</span>
            </Breadcrumb.Item>
            <Breadcrumb.Item>Reports</Breadcrumb.Item>
          </Breadcrumb>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">
              Billing Reports
            </h1>
            <div className="mt-4 sm:mt-0 space-x-2 flex">
              <Button size="sm" onClick={() => window.print()}>
                Print
              </Button>
              <Button size="sm" onClick={toPDF}>
                Download PDF
              </Button>
            </div>
          </div>
        </div>
      </section>

      <div className="p-6 overflow-x-auto" ref={targetRef}>
        <Table hoverable striped>
          <Table.Head className="text-sm uppercase tracking-wide bg-gray-100 dark:bg-gray-700">
            <Table.HeadCell>Name</Table.HeadCell>
            <Table.HeadCell>Meter ID</Table.HeadCell>
            <Table.HeadCell>Month</Table.HeadCell>
            <Table.HeadCell>Previous</Table.HeadCell>
            <Table.HeadCell>Current</Table.HeadCell>
            <Table.HeadCell>Amount</Table.HeadCell>
            <Table.HeadCell>Deadline</Table.HeadCell>
            <Table.HeadCell>Status</Table.HeadCell>
          </Table.Head>
          <Table.Body className="bg-white dark:bg-gray-900">
            {bills.map((bill) => {
              const user = getUser(bill.userId);
              return (
                <Table.Row key={bill.id} className="whitespace-nowrap text-sm">
                  <Table.Cell>
                    {user ? `${user.firstName} ${user.lastName}` : "-"}
                  </Table.Cell>
                  <Table.Cell>{user?.meterID || "-"}</Table.Cell>
                  <Table.Cell>{bill.month}</Table.Cell>
                  <Table.Cell>{bill.prevReading}</Table.Cell>
                  <Table.Cell>{bill.currentReading}</Table.Cell>
                  <Table.Cell className="text-green-600 dark:text-green-400">
                    ₱{bill.amount}
                  </Table.Cell>
                  <Table.Cell>{bill.deadline}</Table.Cell>
                  <Table.Cell>
                    {bill.paidDate ? (
                      <span className="text-green-600 dark:text-green-400">
                        Paid on {bill.paidDate}
                      </span>
                    ) : (
                      <span className="text-red-600 dark:text-red-400">
                        Unpaid
                      </span>
                    )}
                  </Table.Cell>
                </Table.Row>
              );
            })}
          </Table.Body>
        </Table>
      </div>
    </NavbarSidebarLayout>
  );
};

export default ReportsPage;
