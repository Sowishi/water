import { Breadcrumb, Button, Table, Label, Select } from "flowbite-react";
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
  barangay: string;
  connection: string;
  status: string;
}

const ReportsPage: FC = () => {
  const [bills, setBills] = useState<Bill[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [barangay, setBarangay] = useState("");
  const [month, setMonth] = useState("");
  const [connection, setConnection] = useState("");
  const [status, setStatus] = useState("");
  const [payment, setPayment] = useState("");
  const { getBills } = useCrudBill();
  const { getUsers } = useCrudUser();
  const { toPDF, targetRef } = usePDF({ filename: "billing-reports.pdf" });

  useEffect(() => {
    getBills(setBills);
    getUsers(setUsers);
  }, []);

  const getUser = (id: string) => users.find((u) => u.id === id);

  const filteredBills = bills.filter((bill) => {
    const user = getUser(bill.userId);
    if (!user) return false;
    if (barangay && user.barangay !== barangay) return false;
    if (connection && user.connection !== connection) return false;
    if (status && user.status !== status) return false;
    if (month && bill.month !== month) return false;
    if (payment === "Paid" && !bill.paidDate) return false;
    if (payment === "Unpaid" && bill.paidDate) return false;
    return true;
  });

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
        <div className="mb-4 flex flex-wrap gap-4">
          <div>
            <Label htmlFor="barangay" value="Barangay" />
            <Select
              id="barangay"
              value={barangay}
              onChange={(e) => setBarangay(e.target.value)}
            >
              <option value="">All</option>
              <option value="Balacanas">Balacanas</option>
              <option value="Dayawan">Dayawan</option>
              <option value="Katipunan">Katipunan</option>
              <option value="Kimaya">Kimaya</option>
              <option value="Poblacion 1">Poblacion 1</option>
              <option value="San Martin">San Martin</option>
              <option value="Tambobong">Tambobong</option>
              <option value="Imelda">Imelda</option>
              <option value="Looc">Looc</option>
              <option value="Poblacion 2">Poblacion 2</option>
              <option value="Poblacion 3">Poblacion 3</option>
            </Select>
          </div>
          <div>
            <Label htmlFor="month" value="Month" />
            <Select
              id="month"
              value={month}
              onChange={(e) => setMonth(e.target.value)}
            >
              <option value="">All</option>
              <option value="January">January</option>
              <option value="February">February</option>
              <option value="March">March</option>
              <option value="April">April</option>
              <option value="May">May</option>
              <option value="June">June</option>
              <option value="July">July</option>
              <option value="August">August</option>
              <option value="September">September</option>
              <option value="October">October</option>
              <option value="November">November</option>
              <option value="December">December</option>
            </Select>
          </div>
          <div>
            <Label htmlFor="connection" value="Connection" />
            <Select
              id="connection"
              value={connection}
              onChange={(e) => setConnection(e.target.value)}
            >
              <option value="">All</option>
              <option value="Resedential">Resedential</option>
              <option value="Comercial">Comercial</option>
              <option value="Industrial">Industrial</option>
            </Select>
          </div>
          <div>
            <Label htmlFor="status" value="Status" />
            <Select
              id="status"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="">All</option>
              <option value="pending">Pending</option>
              <option value="active">Active</option>
              <option value="disconnected">Disconnected</option>
            </Select>
          </div>
          <div>
            <Label htmlFor="payment" value="Payment" />
            <Select
              id="payment"
              value={payment}
              onChange={(e) => setPayment(e.target.value)}
            >
              <option value="">All</option>
              <option value="Paid">Paid</option>
              <option value="Unpaid">Unpaid</option>
            </Select>
          </div>
          <div className="flex items-end">
            <Button
              color="gray"
              size="sm"
              onClick={() => {
                setBarangay("");
                setMonth("");
                setConnection("");
                setStatus("");
                setPayment("");
              }}
            >
              Reset
            </Button>
          </div>
        </div>
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
            {filteredBills.map((bill) => {
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
