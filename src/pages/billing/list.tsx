/* eslint-disable jsx-a11y/anchor-is-valid */
import {
  Breadcrumb,
  Button,
  Label,
  Modal,
  Table,
  TextInput,
} from "flowbite-react";
import type { FC } from "react";
import { useEffect, useState } from "react";
import NavbarSidebarLayout from "../../layouts/navbar-sidebar";
import useCrudUser from "../../hooks/useCrudUser";
import useCrudBill from "../../hooks/useCrudBill";
import { HiHome } from "react-icons/hi";

interface Bill {
  id: string;
  userId: string;
  month: string;
  amount: string;
  deadline: string;
  paidDate?: string;
}

interface BillModalProps {
  userId: string;
}

const BillingPage: FC = function () {
  const [users, setUsers] = useState<any[]>([]);
  const { getUsers } = useCrudUser();

  useEffect(() => {
    getUsers(setUsers);
  }, []);

  return (
    <NavbarSidebarLayout isFooter={false}>
      <div className="border-b border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
        <div className="mb-4">
          <Breadcrumb className="mb-2">
            <Breadcrumb.Item href="#">
              <HiHome className="text-xl mr-2" />
              <span className="dark:text-white">Home</span>
            </Breadcrumb.Item>
            <Breadcrumb.Item>Billing</Breadcrumb.Item>
          </Breadcrumb>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Billing Management
          </h1>
        </div>
      </div>

      <div className="mt-4 px-4 sm:px-6 lg:px-8">
        <div className="overflow-hidden rounded-lg shadow-md bg-white dark:bg-gray-800">
          <BillingUsersTable users={users} />
        </div>
      </div>
    </NavbarSidebarLayout>
  );
};

const BillModal: FC<BillModalProps> = ({ userId }) => {
  const [isOpen, setOpen] = useState(false);
  const [bills, setBills] = useState<Bill[]>([]);
  const [month, setMonth] = useState("January");
  const [amount, setAmount] = useState("");
  const [deadline, setDeadline] = useState("");
  const { getBillsByUser, addBill, deleteBill, updateBill } = useCrudBill();
  const { updateUser } = useCrudUser();

  useEffect(() => {
    if (isOpen) {
      getBillsByUser(userId, setBills);
    }
  }, [isOpen]);

  const handleAdd = () => {
    addBill({ userId, month, amount, deadline, paidDate: "" });
    updateUser(userId, { status: "disconnected" });
    setAmount("");
  };

  const handleMarkPaid = (billId: string) => {
    const date = new Date().toISOString().split("T")[0];
    updateBill(billId, { paidDate: date });
    updateUser(userId, { status: "active" });
  };

  return (
    <>
      <Button size="xs" onClick={() => setOpen(true)}>
        Manage Bills
      </Button>
      <Modal onClose={() => setOpen(false)} show={isOpen} size="5xl">
        <Modal.Header>Monthly Bills</Modal.Header>
        <Modal.Body>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <div>
              <Label htmlFor="month" value="Month" />
              <select
                id="month"
                className="mt-1 block w-full rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 text-sm text-gray-900 dark:text-white"
                value={month}
                onChange={(e) => setMonth(e.target.value)}
              >
                {[
                  "January",
                  "February",
                  "March",
                  "April",
                  "May",
                  "June",
                  "July",
                  "August",
                  "September",
                  "October",
                  "November",
                  "December",
                ].map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label htmlFor="amount" value="Amount" />
              <TextInput
                id="amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="deadline" value="Deadline" />
              <TextInput
                id="deadline"
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
              />
            </div>
          </div>

          <div className="flex justify-end mb-6">
            <Button onClick={handleAdd}>Add Bill</Button>
          </div>

          <Table hoverable striped>
            <Table.Head>
              <Table.HeadCell>Month</Table.HeadCell>
              <Table.HeadCell>Amount</Table.HeadCell>
              <Table.HeadCell>Deadline</Table.HeadCell>
              <Table.HeadCell>Status</Table.HeadCell>
              <Table.HeadCell>Actions</Table.HeadCell>
            </Table.Head>
            <Table.Body className="text-sm">
              {bills.map((bill) => (
                <Table.Row key={bill.id}>
                  <Table.Cell>{bill.month}</Table.Cell>
                  <Table.Cell>${bill.amount}</Table.Cell>
                  <Table.Cell>{bill.deadline}</Table.Cell>
                  <Table.Cell>
                    {bill.paidDate ? (
                      <span className="text-green-600">
                        Paid on {bill.paidDate}
                      </span>
                    ) : (
                      <span className="text-red-600">Unpaid</span>
                    )}
                  </Table.Cell>
                  <Table.Cell className="space-x-2">
                    {!bill.paidDate && (
                      <Button size="xs" onClick={() => handleMarkPaid(bill.id)}>
                        Mark Paid
                      </Button>
                    )}
                    <Button
                      color="failure"
                      size="xs"
                      onClick={() => deleteBill(bill.id)}
                    >
                      Delete
                    </Button>
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table>
        </Modal.Body>
      </Modal>
    </>
  );
};

interface BillingUsersTableProps {
  users: any[];
}

const BillingUsersTable: FC<BillingUsersTableProps> = ({ users }) => (
  <Table className="min-w-full divide-y divide-gray-200 dark:divide-gray-600">
    <Table.Head className="bg-gray-100 dark:bg-gray-700">
      <Table.HeadCell>Name</Table.HeadCell>
      <Table.HeadCell>Meter ID</Table.HeadCell>
      <Table.HeadCell>Status</Table.HeadCell>
      <Table.HeadCell>Manage</Table.HeadCell>
    </Table.Head>
    <Table.Body className="divide-y divide-gray-200 dark:divide-gray-700">
      {users.map((user) => (
        <Table.Row
          key={user.id}
          className="hover:bg-gray-100 dark:hover:bg-gray-700"
        >
          <Table.Cell className="p-4 text-base font-medium text-gray-900 dark:text-white">
            {user.firstName} {user.lastName}
          </Table.Cell>
          <Table.Cell className="p-4 text-base font-medium text-gray-900 dark:text-white">
            {user.meterID}
          </Table.Cell>
          <Table.Cell className="p-4 text-base text-gray-900 dark:text-white">
            <div className="flex items-center">
              <div
                className={`mr-2 h-2.5 w-2.5 rounded-full ${
                  user.status === "active" ? "bg-green-400" : "bg-red-400"
                }`}
              ></div>
              {user.status === "active" ? "Active" : "Disconnected"}
            </div>
          </Table.Cell>
          <Table.Cell className="p-4">
            <BillModal userId={user.id} />
          </Table.Cell>
        </Table.Row>
      ))}
    </Table.Body>
  </Table>
);

export default BillingPage;
