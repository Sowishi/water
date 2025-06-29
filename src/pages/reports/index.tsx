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

const ReportsPage: FC = function () {
  const [bills, setBills] = useState<Bill[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const { getBills } = useCrudBill();
  const { getUsers } = useCrudUser();
  const { toPDF, targetRef } = usePDF({ filename: "reports.pdf" });

  useEffect(() => {
    getBills(setBills);
    getUsers(setUsers);
  }, []);

  const getUser = (id: string) => users.find((u) => u.id === id);

  return (
    <NavbarSidebarLayout isFooter={false}>
      <div className="border-b border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
        <div className="mb-4">
          <Breadcrumb className="mb-2">
            <Breadcrumb.Item href="#">
              <HiHome className="mr-2 text-xl" />
              <span className="dark:text-white">Home</span>
            </Breadcrumb.Item>
            <Breadcrumb.Item>Reports</Breadcrumb.Item>
          </Breadcrumb>
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Billing Reports
            </h1>
            <div className="space-x-2">
              <Button size="xs" onClick={() => window.print()}>
                Print
              </Button>
              <Button size="xs" onClick={() => toPDF()}>
                Download PDF
              </Button>
            </div>
          </div>
        </div>
      </div>
      <div className="p-4" ref={targetRef}>
        <Table striped>
          <Table.Head>
            <Table.HeadCell>Name</Table.HeadCell>
            <Table.HeadCell>Meter ID</Table.HeadCell>
            <Table.HeadCell>Month</Table.HeadCell>
            <Table.HeadCell>Prev</Table.HeadCell>
            <Table.HeadCell>Current</Table.HeadCell>
            <Table.HeadCell>Amount</Table.HeadCell>
            <Table.HeadCell>Deadline</Table.HeadCell>
            <Table.HeadCell>Status</Table.HeadCell>
          </Table.Head>
          <Table.Body className="bg-white dark:bg-gray-800">
            {bills.map((bill) => {
              const user = getUser(bill.userId);
              return (
                <Table.Row key={bill.id} className="whitespace-nowrap">
                  <Table.Cell>
                    {user ? `${user.firstName} ${user.lastName}` : "-"}
                  </Table.Cell>
                  <Table.Cell>{user ? user.meterID : "-"}</Table.Cell>
                  <Table.Cell>{bill.month}</Table.Cell>
                  <Table.Cell>{bill.prevReading}</Table.Cell>
                  <Table.Cell>{bill.currentReading}</Table.Cell>
                  <Table.Cell>₱{bill.amount}</Table.Cell>
                  <Table.Cell>{bill.deadline}</Table.Cell>
                  <Table.Cell>
                    {bill.paidDate ? `Paid on ${bill.paidDate}` : "Unpaid"}
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
