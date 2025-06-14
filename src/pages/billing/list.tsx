/* eslint-disable jsx-a11y/anchor-is-valid */
import { Button, Label, Modal, Table, TextInput } from "flowbite-react";
import type { FC } from "react";
import { useEffect, useState } from "react";
import NavbarSidebarLayout from "../../layouts/navbar-sidebar";
import useCrudUser from "../../hooks/useCrudUser";
import useCrudBill from "../../hooks/useCrudBill";

interface Bill {
  id: string;
  userId: string;
  month: string;
  amount: string;
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
      <div className="flex flex-col">
        <div className="overflow-x-auto">
          <div className="inline-block min-w-full align-middle">
            <div className="overflow-hidden shadow">
              <Table className="min-w-full divide-y divide-gray-200 dark:divide-gray-600">
                <Table.Head className="bg-gray-100 dark:bg-gray-700">
                  <Table.HeadCell>Name</Table.HeadCell>
                  <Table.HeadCell>Actions</Table.HeadCell>
                </Table.Head>
                <Table.Body className="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-800">
                  {users.map((user) => (
                    <Table.Row key={user.id} className="hover:bg-gray-100 dark:hover:bg-gray-700">
                      <Table.Cell className="p-4 text-base font-medium text-gray-900 dark:text-white">
                        {user.firstName} {user.lastName}
                      </Table.Cell>
                      <Table.Cell className="p-4">
                        <BillModal userId={user.id} />
                      </Table.Cell>
                    </Table.Row>
                  ))}
                </Table.Body>
              </Table>
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
  const { getBillsByUser, addBill, deleteBill } = useCrudBill();

  useEffect(() => {
    if (isOpen) {
      getBillsByUser(userId, setBills);
    }
  }, [isOpen]);

  const handleAdd = () => {
    addBill({ userId, month, amount });
    setAmount("");
  };

  return (
    <>
      <Button size="xs" onClick={() => setOpen(true)}>
        Manage Bills
      </Button>
      <Modal onClose={() => setOpen(false)} show={isOpen} size="lg">
        <Modal.Header>Monthly Bills</Modal.Header>
        <Modal.Body>
          <div className="mb-4 grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="month">Month</Label>
              <TextInput id="month" value={month} onChange={(e) => setMonth(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="amount">Amount</Label>
              <TextInput id="amount" value={amount} onChange={(e) => setAmount(e.target.value)} />
            </div>
            <div className="col-span-2">
              <Button onClick={handleAdd}>Add bill</Button>
            </div>
          </div>
          <Table>
            <Table.Head>
              <Table.HeadCell>Month</Table.HeadCell>
              <Table.HeadCell>Amount</Table.HeadCell>
              <Table.HeadCell>Delete</Table.HeadCell>
            </Table.Head>
            <Table.Body>
              {bills.map((bill) => (
                <Table.Row key={bill.id}>
                  <Table.Cell>{bill.month}</Table.Cell>
                  <Table.Cell>{bill.amount}</Table.Cell>
                  <Table.Cell>
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

export default BillingPage;
