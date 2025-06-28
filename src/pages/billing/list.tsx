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
import logo from "../../../public/images/logo.png";

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
  user: Object;
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

const BillModal: FC<BillModalProps> = ({ userId, connection, user }) => {
  const [isOpen, setOpen] = useState(false);
  const [bills, setBills] = useState<Bill[]>([]);
  const [month, setMonth] = useState("January");
  const [prevReading, setPrevReading] = useState("");
  const [currentReading, setCurrentReading] = useState("");
  const [amount, setAmount] = useState("");
  const [deadline, setDeadline] = useState("");
  const rateTable: Record<string, { min: number; succ: number }> = {
    Resedential: { min: 10, succ: 12 },
    Comercial: { min: 25, succ: 30 },
    Industrial: { min: 35, succ: 40 },
  };

  const calculateAmount = (conn: string, consumption: number) => {
    const rates = rateTable[conn];
    if (!rates) return 0;
    if (consumption <= 10) {
      return consumption * rates.min;
    }
    return 10 * rates.min + (consumption - 10) * rates.succ;
  };
  const { getBillsByUser, addBill, deleteBill, updateBill } = useCrudBill();
  const { updateUser } = useCrudUser();

  const [showReceipt, setShowReceipt] = useState(false);
  const [selectedBill, setSelectedBill] = useState<Bill | null>(null);

  const consumption = selectedBill
    ? Math.max(selectedBill.currentReading - selectedBill.prevReading, 0)
    : 0;
  const amountDue = selectedBill ? calculateAmount(connection, consumption) : 0;
  const arrears = selectedBill
    ? bills
        .filter((b) => !b.paidDate && b.id !== selectedBill.id)
        .reduce((sum, b) => sum + Number(b.amount), 0)
    : 0;
  const totalDue = amountDue + arrears;

  const handleViewReceipt = (bill: Bill) => {
    setSelectedBill(bill);
    setShowReceipt(true);
  };

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
    setAmount(String(calculateAmount(connection, consumption)));
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

  const now = new Date();
  const formattedDateTime = now.toLocaleString("en-PH", {
    dateStyle: "long",
    timeStyle: "short",
  });

  return (
    <>
      <Button
        size="xs"
        onClick={() => setOpen(true)}
        className="bg-blue-600 hover:bg-blue-700 text-white rounded shadow-sm"
      >
        View Billing
      </Button>
      <Modal show={showReceipt} onClose={() => setShowReceipt(false)}>
        <Modal.Header>Billing Receipt</Modal.Header>
        <Modal.Body>
          {selectedBill ? (
            <div className="wrapper flex justify-center items-center flex-col dark:text-white">
              <div className="flex flex-col items-center justify-center">
                <img width={130} src={logo} alt="" />
                <div className="text-center mt-5">
                  <h1>VILLANUEVA WATER SYSTEM</h1>
                  <h1>LGU Villanueva {"\n"} Misamin, Oriental</h1>
                </div>
              </div>
              <div className="w-full mt-10">{formattedDateTime}</div>
              <h1>=============================</h1>
              <div className="content w-full mt-5">
                <div className="flex w-full  justify-between items-center">
                  <h1>Account Number</h1>
                  <h1 className="text-lg font-bold">{user.meterID}</h1>
                </div>
                <div className="flex w-full mt-3 justify-between items-center">
                  <h1>Account Name</h1>
                  <h1 className="text-lg font-bold">
                    {user.firstName + " " + user.lastName}
                  </h1>
                </div>
                <div className="flex w-full mt-3 justify-between items-center">
                  <h1>Connection Type</h1>
                  <h1 className="text-lg font-bold">{user.connection}</h1>
                </div>
                <div className="flex w-full mt-3 justify-between items-center">
                  <h1>Address</h1>
                  <h1 className="text-xs font-bold text-nowrap">
                    {user.address}
                  </h1>
                </div>
                <div className="flex w-full mt-3 justify-between items-center">
                  <h1>Consumption From</h1>
                  <h1 className="text-xs font-bold">
                    {selectedBill.prevReading}
                  </h1>
                </div>
                <div className="flex w-full mt-3 justify-between items-center">
                  <h1>Consumption To</h1>
                  <h1 className="text-xs font-bold">
                    {selectedBill.currentReading}
                  </h1>
                </div>
                <div className="flex w-full mt-3 justify-between items-center">
                  <h1>Reading</h1>
                  <h1 className="text-xs font-bold">
                    {selectedBill.currentReading}
                  </h1>
                </div>
                <div className="flex w-full mt-3 justify-between items-center">
                  <h1>Consumed</h1>
                  <h1 className="text-xs font-bold">{consumption}</h1>
                </div>
                <div className="flex w-full mt-3 justify-between items-center">
                  <h1>Amount</h1>
                  <h1 className="text-2xl font-bold">₱{amountDue}</h1>
                </div>
                <div className="flex w-full mt-3 justify-between items-center">
                  <h1>Arrears</h1>
                  <h1 className="text-2xl font-bold">₱{arrears}</h1>
                </div>
                <div className="flex w-full mt-3 justify-between items-center">
                  <h1>Total Due</h1>
                  <h1 className="text-2xl font-bold">₱{totalDue}</h1>
                </div>
              </div>
              <h1>=============================</h1>
              <h1>Contact Us</h1>
              <div className="flex w-full mt-3 justify-between items-center">
                <h1>PhilCom</h1>
                <h1 className="text-sm font-bold">088-5650-278</h1>
              </div>
              <div className="flex w-full mt-3 justify-between items-center">
                <h1>Globe</h1>
                <h1 className="text-sm font-bold">0917-1629-094</h1>
              </div>
              <div className="flex w-full mt-3 justify-between items-center">
                <h1>Webisite</h1>
                <h1 className="text-sm font-bold">villanuevamisor.gov.ph</h1>
              </div>
              <div className="flex w-full mt-3 justify-between items-center">
                <h1>Facebook</h1>
                <h1 className="text-sm font-bold">
                  facebook.com/LGUVillanueva
                </h1>
              </div>
              <h1>=============================</h1>
            </div>
          ) : (
            <p>No data available.</p>
          )}
        </Modal.Body>
      </Modal>

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
              <TextInput
                id="amount"
                value={amount}
                readOnly
                className="bg-gray-100 dark:bg-gray-700"
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
            <Button
              onClick={handleAdd}
              className="bg-green-600 hover:bg-green-700 text-white rounded shadow-sm"
            >
              Add Bill
            </Button>
          </div>

          <Table hoverable striped>
            <Table.Head>
              <Table.HeadCell>Month</Table.HeadCell>
              <Table.HeadCell>Prev Reading</Table.HeadCell>
              <Table.HeadCell>Current Reading</Table.HeadCell>
              <Table.HeadCell>Connection Type</Table.HeadCell>
              <Table.HeadCell>Amount</Table.HeadCell>
              <Table.HeadCell>Deadline</Table.HeadCell>
              <Table.HeadCell>Status</Table.HeadCell>
              <Table.HeadCell>Actions</Table.HeadCell>
            </Table.Head>
            <Table.Body className="text-sm">
              {bills.map((bill) => (
                <Table.Row
                  key={bill.id}
                  className="hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  <Table.Cell>{bill.month}</Table.Cell>
                  <Table.Cell>{bill.prevReading}</Table.Cell>
                  <Table.Cell>{bill.currentReading}</Table.Cell>
                  <Table.Cell>{user.connection}</Table.Cell>

                  <Table.Cell>₱{bill.amount}</Table.Cell>
                  <Table.Cell>{bill.deadline}</Table.Cell>
                  <Table.Cell>
                    {bill.paidDate ? (
                      <span className="px-2 py-1 text-green-700 bg-green-100 rounded-full text-xs font-semibold">
                        Paid on {bill.paidDate}
                      </span>
                    ) : (
                      <span className="px-2 py-1 text-red-700 bg-red-100 rounded-full text-xs font-semibold">
                        Unpaid
                      </span>
                    )}
                  </Table.Cell>
                  <Table.Cell className="flex items-center justify-start">
                    <Button
                      color="failure"
                      size="xs"
                      className="rounded px-3 py-1 text-sm font-medium"
                      onClick={() => deleteBill(bill.id)}
                    >
                      Delete
                    </Button>
                    <Button
                      color="warning"
                      size="xs"
                      className="rounded px-3 py-1 text-sm font-medium ml-3"
                      onClick={() => handleViewReceipt(bill)}
                    >
                      Receipts
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
  <Table className="min-w-full w-full divide-y divide-gray-200 dark:divide-gray-600">
    <Table.Head className="bg-gray-50 dark:bg-gray-800">
      <Table.HeadCell className="text-sm font-semibold text-gray-700 dark:text-gray-300">
        Name
      </Table.HeadCell>
      <Table.HeadCell className="text-sm font-semibold text-gray-700 dark:text-gray-300">
        Meter ID
      </Table.HeadCell>
      <Table.HeadCell className="text-sm font-semibold text-gray-700 dark:text-gray-300">
        Connection Type
      </Table.HeadCell>
      <Table.HeadCell className="text-sm font-semibold text-gray-700 dark:text-gray-300">
        Status
      </Table.HeadCell>
      <Table.HeadCell className="text-sm font-semibold text-gray-700 dark:text-gray-300">
        Manage
      </Table.HeadCell>
    </Table.Head>
    <Table.Body className="divide-y divide-gray-200 dark:divide-gray-700">
      {users.map((user) => (
        <Table.Row
          key={user.id}
          className="transition duration-200 hover:bg-gray-100 dark:hover:bg-gray-700"
        >
          <Table.Cell className="p-4 text-base font-medium text-gray-900 dark:text-white flex items-center space-x-3">
            <img
              className="w-[36px] h-[36px] rounded-full object-cover border border-gray-300 dark:border-gray-600"
              src={user.profilePic}
              alt="avatar"
            />
            <span>
              {user.firstName} {user.lastName}
            </span>
          </Table.Cell>
          <Table.Cell className="p-4 text-base text-gray-900 dark:text-white">
            <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded-md text-sm font-medium">
              {user.meterID}
            </span>
          </Table.Cell>
          <Table.Cell className="p-4 text-base text-gray-900 dark:text-white">
            <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded-md text-sm font-medium">
              {user.connection}
            </span>
          </Table.Cell>
          <Table.Cell className="p-4 text-base text-gray-900 dark:text-white">
            <span
              className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${
                user.status === "active"
                  ? "bg-green-100 text-green-800 dark:bg-green-200"
                  : "bg-red-100 text-red-800 dark:bg-red-200"
              }`}
            >
              <span
                className={`mr-1 h-2 w-2 rounded-full ${
                  user.status === "active" ? "bg-green-500" : "bg-red-500"
                }`}
              ></span>
              {user.status === "active" ? "Active" : "Disconnected"}
            </span>
          </Table.Cell>
          <Table.Cell className="p-4 flex flex-wrap gap-2">
            <BillModal
              userId={user.id}
              user={user}
              connection={user.connection}
            />
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
