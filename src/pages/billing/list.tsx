/* eslint-disable jsx-a11y/anchor-is-valid */
import { Breadcrumb, Button, Label, Modal, Table, TextInput } from "flowbite-react";
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
      <div className="block items-center justify-between border-b border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800 sm:flex">
        <div className="mb-1 w-full">
          <div className="mb-4">
            <Breadcrumb className="mb-4">
              <Breadcrumb.Item href="#">
                <div className="flex items-center gap-x-3">
                  <HiHome className="text-xl" />
                  <span className="dark:text-white">Home</span>
                </div>
              </Breadcrumb.Item>
              <Breadcrumb.Item>Billing</Breadcrumb.Item>
            </Breadcrumb>
            <h1 className="text-xl font-semibold text-gray-900 dark:text-white sm:text-2xl">
              Billing management
            </h1>
          </div>
        </div>
      </div>
      <div className="flex flex-col">
        <div className="overflow-x-auto">
          <div className="inline-block min-w-full align-middle">
            <div className="overflow-hidden shadow">
              <BillingUsersTable users={users} />
            </div>
          </div>
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
      <Modal onClose={() => setOpen(false)} show={isOpen} size="lg">
        <Modal.Header>Monthly Bills</Modal.Header>
        <Modal.Body>
          <div className="mb-4 grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="month">Month</Label>
              <TextInput id="month" value={month} onChange={(e) => setMonth(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="amount">Amount</Label>
              <TextInput id="amount" value={amount} onChange={(e) => setAmount(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="deadline">Deadline</Label>
              <TextInput
                id="deadline"
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
              />
            </div>
            <div className="col-span-3">
              <Button onClick={handleAdd}>Add bill</Button>
            </div>
          </div>
          <Table>
            <Table.Head>
              <Table.HeadCell>Month</Table.HeadCell>
              <Table.HeadCell>Amount</Table.HeadCell>
              <Table.HeadCell>Deadline</Table.HeadCell>
              <Table.HeadCell>Status</Table.HeadCell>
              <Table.HeadCell>Actions</Table.HeadCell>
            </Table.Head>
            <Table.Body>
              {bills.map((bill) => (
                <Table.Row key={bill.id}>
                  <Table.Cell>{bill.month}</Table.Cell>
                  <Table.Cell>{bill.amount}</Table.Cell>
                  <Table.Cell>{bill.deadline}</Table.Cell>
                  <Table.Cell>
                    {bill.paidDate ? `Paid on ${bill.paidDate}` : "Unpaid"}
                  </Table.Cell>
                  <Table.Cell className="space-x-2">
                    {!bill.paidDate && (
                      <Button size="xs" onClick={() => handleMarkPaid(bill.id)}>
                        Mark Paid
                      </Button>
                    )}
                    <Button color="failure" size="xs" onClick={() => deleteBill(bill.id)}>
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
    <Table.Body className="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-800">
      {users.map((user) => (
        <Table.Row key={user.id} className="hover:bg-gray-100 dark:hover:bg-gray-700">
          <Table.Cell className="p-4 text-base font-medium text-gray-900 dark:text-white">
            {user.firstName} {user.lastName}
          </Table.Cell>
          <Table.Cell className="p-4 text-base font-medium text-gray-900 dark:text-white">
            {user.meterID}
          </Table.Cell>
          <Table.Cell className="p-4 text-base font-normal text-gray-900 dark:text-white">
            <div className="flex items-center">
              <div
                className={`mr-2 h-2.5 w-2.5 rounded-full ${user.status === 'active' ? 'bg-green-400' : 'bg-red-400'}`}
              ></div>
              {user.status === 'active' ? 'Active' : 'Disconnected'}
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
