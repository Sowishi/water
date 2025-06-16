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
import { increment } from "firebase/firestore";
import useCrudBill from "../../hooks/useCrudBill";
import { HiHome } from "react-icons/hi";

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

interface BillModalProps {
  userId: string;
  connection: string;
}

const BillingPage: FC = function () {
  const [users, setUsers] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const { getUsers } = useCrudUser();

  useEffect(() => {
    getUsers(setUsers);
  }, []);

  const filteredUsers = users.filter((user) => {
    const fullName = `${user.firstName} ${user.lastName}`.toLowerCase();
    return (
      fullName.includes(searchTerm.toLowerCase()) ||
      user.meterID?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

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

      <div className="mb-4 px-4 sm:px-6 lg:px-8">
        <TextInput
          placeholder="Search by name or meter ID"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-md"
        />
      </div>

      <div className="mt-4 px-4 sm:px-6 lg:px-8">
        <div className="overflow-hidden rounded-lg shadow-md bg-white dark:bg-gray-800">
          <BillingUsersTable users={filteredUsers} />
        </div>
      </div>
    </NavbarSidebarLayout>
  );
};

const BillModal: FC<BillModalProps> = ({ userId, connection }) => {
  const [isOpen, setOpen] = useState(false);
  const [bills, setBills] = useState<Bill[]>([]);
  const [month, setMonth] = useState("January");
  const [prevReading, setPrevReading] = useState("");
  const [currentReading, setCurrentReading] = useState("");
  const [amount, setAmount] = useState("");
  const [deadline, setDeadline] = useState("");
  const rates: Record<string, number> = {
    Resedential: 10,
    Comercial: 15,
    Industrial: 20,
  };
  const { getBillsByUser, addBill, deleteBill, updateBill } = useCrudBill();
  const { updateUser } = useCrudUser();

  useEffect(() => {
    if (isOpen) {
      getBillsByUser(userId, setBills);
    }
  }, [isOpen]);

  useEffect(() => {
    if (bills.length > 0) {
      const last = bills[bills.length - 1];
      setPrevReading(String(last.currentReading));
    } else {
      setPrevReading("0");
    }
  }, [bills]);

  useEffect(() => {
    const prev = parseFloat(prevReading) || 0;
    const curr = parseFloat(currentReading) || 0;
    const consumption = Math.max(curr - prev, 0);
    const rate = rates[connection] ?? 0;
    setAmount(String(consumption * rate));
  }, [prevReading, currentReading, connection]);

  const handleAdd = () => {
    addBill({
      userId,
      month,
      prevReading: Number(prevReading),
      currentReading: Number(currentReading),
      amount,
      deadline,
      paidDate: "",
    });
    updateUser(userId, {
      status: "disconnected",
      balance: increment(Number(amount)),
    });
    const receipt = window.open("", "", "width=600,height=400");
    if (receipt) {
      receipt.document.write(`<h1>Meter Reading Receipt</h1>`);
      receipt.document.write(`<p>Month: ${month}</p>`);
      receipt.document.write(`<p>Prev: ${prevReading}</p>`);
      receipt.document.write(`<p>Current: ${currentReading}</p>`);
      receipt.document.write(`<p>Amount: ${amount}</p>`);
      receipt.print();
      receipt.close();
    }
    setAmount("");
    setPrevReading("");
    setCurrentReading("");
  };

  return (
    <>
      <Button size="xs" onClick={() => setOpen(true)}>
        View Billing
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
              <Label htmlFor="prev" value="Prev Reading" />
              <TextInput
                id="prev"
                value={prevReading}
                onChange={(e) => setPrevReading(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="current" value="Current Reading" />
              <TextInput
                id="current"
                value={currentReading}
                onChange={(e) => setCurrentReading(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="amount" value="Amount" />
              <TextInput id="amount" value={amount} readOnly />
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
              <Table.HeadCell>Prev Reading</Table.HeadCell>
              <Table.HeadCell>Current Reading</Table.HeadCell>
              <Table.HeadCell>Amount</Table.HeadCell>
              <Table.HeadCell>Deadline</Table.HeadCell>
              <Table.HeadCell>Status</Table.HeadCell>
              <Table.HeadCell>Actions</Table.HeadCell>
            </Table.Head>
            <Table.Body className="text-sm">
              {bills.map((bill) => (
                <Table.Row key={bill.id}>
                  <Table.Cell>{bill.month}</Table.Cell>
                  <Table.Cell>{bill.prevReading}</Table.Cell>
                  <Table.Cell>{bill.currentReading}</Table.Cell>
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

interface PayBillingModalProps {
  userId: string;
}

const PayBillingModal: FC<PayBillingModalProps> = ({ userId }) => {
  const [isOpen, setOpen] = useState(false);
  const [bills, setBills] = useState<Bill[]>([]);
  const [billId, setBillId] = useState("");
  const [date, setDate] = useState("");
  const { getBillsByUser, updateBill } = useCrudBill();
  const { updateUser } = useCrudUser();

  useEffect(() => {
    if (isOpen) {
      getBillsByUser(userId, setBills);
    }
  }, [isOpen]);

  const unpaidBills = bills.filter((b) => !b.paidDate);

  const handlePay = () => {
    if (billId && date) {
      const bill = bills.find((b) => b.id === billId);
      updateBill(billId, { paidDate: date });
      updateUser(userId, {
        status: "active",
        balance: increment(-(bill ? Number(bill.amount) : 0)),
      });
      const receipt = window.open("", "", "width=600,height=400");
      if (receipt && bill) {
        receipt.document.write(`<h1>Payment Receipt</h1>`);
        receipt.document.write(`<p>Month: ${bill.month}</p>`);
        receipt.document.write(`<p>Amount: ${bill.amount}</p>`);
        receipt.document.write(`<p>Paid Date: ${date}</p>`);
        receipt.print();
        receipt.close();
      }
      setOpen(false);
      setDate("");
      setBillId("");
    }
  };

  return (
    <>
      <Button size="xs" color="success" onClick={() => setOpen(true)}>
        Pay Billing
      </Button>
      <Modal show={isOpen} onClose={() => setOpen(false)}>
        <Modal.Header>Pay Billing</Modal.Header>
        <Modal.Body>
          <div className="mb-4">
            <Label htmlFor="bill" value="Bill" />
            <select
              id="bill"
              className="mt-1 block w-full rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 text-sm text-gray-900 dark:text-white"
              value={billId}
              onChange={(e) => setBillId(e.target.value)}
            >
              <option value="">Select Bill</option>
              {unpaidBills.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.month}
                </option>
              ))}
            </select>
          </div>
          <div className="mb-4">
            <Label htmlFor="date" value="Paid Date" />
            <TextInput
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button onClick={handlePay}>Confirm</Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

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
          <Table.Cell className="p-4 text-base font-medium text-gray-900 dark:text-white items-center mr-2 justify-start flex">
            <img className="w-[30px]" src={user.profilePic} alt="" />
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
          <Table.Cell className="p-4 space-x-2 flex">
            <BillModal userId={user.id} connection={user.connection} />
            {localStorage.getItem("role") !== "meter" && (
              <PayBillingModal userId={user.id} />
            )}
          </Table.Cell>
        </Table.Row>
      ))}
    </Table.Body>
  </Table>
);

export default BillingPage;
