import { Breadcrumb, Table, Button } from "flowbite-react";
import type { FC } from "react";
import { useEffect, useState, useRef } from "react";
import ReactToPdf from "react-to-pdf";
import { HiHome } from "react-icons/hi";
import NavbarSidebarLayout from "../layouts/navbar-sidebar";
import useCrudBill from "../hooks/useCrudBill";
import useCrudUser from "../hooks/useCrudUser";

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
}

const ReportsPage: FC = function () {
  const [bills, setBills] = useState<Bill[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const tableRef = useRef<HTMLDivElement>(null);
  const { getBills } = useCrudBill();
  const { getUsers } = useCrudUser();

  useEffect(() => {
    getBills(setBills);
    getUsers(setUsers);
  }, []);

  const userMap = new Map(users.map((u) => [u.id, u]));

  return (
    <NavbarSidebarLayout isFooter={false}>
      <div className="border-b border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
        <div className="mb-4 flex items-center justify-between">
          <Breadcrumb className="mb-2">
            <Breadcrumb.Item href="#">
              <HiHome className="text-xl mr-2" />
              <span className="dark:text-white">Home</span>
            </Breadcrumb.Item>
            <Breadcrumb.Item>Generate Reports</Breadcrumb.Item>
          </Breadcrumb>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Reports
          </h1>
          <ReactToPdf
            targetRef={tableRef}
            filename="reports.pdf"
            options={{ orientation: "landscape" }}
          >
            {({ toPdf }) => (
              <Button size="sm" onClick={toPdf} className="ml-auto">
                Download PDF
              </Button>
            )}
          </ReactToPdf>
        </div>
      </div>
      <div className="p-4 sm:p-6">
        <div
          ref={tableRef}
          className="overflow-hidden rounded-lg shadow-md bg-white dark:bg-gray-800"
        >
          <Table hoverable striped>
            <Table.Head>
              <Table.HeadCell>Customer</Table.HeadCell>
              <Table.HeadCell>Month</Table.HeadCell>
              <Table.HeadCell>Prev</Table.HeadCell>
              <Table.HeadCell>Current</Table.HeadCell>
              <Table.HeadCell>Amount</Table.HeadCell>
              <Table.HeadCell>Deadline</Table.HeadCell>
              <Table.HeadCell>Paid Date</Table.HeadCell>
            </Table.Head>
            <Table.Body className="text-sm">
              {bills.map((bill) => {
                const u = userMap.get(bill.userId);
                return (
                  <Table.Row key={bill.id}>
                    <Table.Cell>
                      {u ? `${u.firstName} ${u.lastName}` : bill.userId}
                    </Table.Cell>
                    <Table.Cell>{bill.month}</Table.Cell>
                    <Table.Cell>{bill.prevReading}</Table.Cell>
                    <Table.Cell>{bill.currentReading}</Table.Cell>
                    <Table.Cell>₱{bill.amount}</Table.Cell>
                    <Table.Cell>{bill.deadline}</Table.Cell>
                    <Table.Cell>{bill.paidDate || "-"}</Table.Cell>
                  </Table.Row>
                );
              })}
            </Table.Body>
          </Table>
        </div>
      </div>
    </NavbarSidebarLayout>
  );
};

export default ReportsPage;
