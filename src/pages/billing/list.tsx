/* eslint-disable jsx-a11y/anchor-is-valid */
import {
  Breadcrumb,
  Button,
  Checkbox,
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
import { HiHome, HiOutlineExclamationCircle } from "react-icons/hi";
import logo from "../../../public/images/logo.png";
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
      <div className="flex w-full justify-start items-center py-5 ml-10">
        <h1 className="text-3xl font-bold">Billing Management</h1>
      </div>

      <div className="mb-4 px-4 sm:px-6 lg:px-8">
        <TextInput
          placeholder="Search by name or meter ID"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-md "
        />
      </div>

      <div className="mt-4 px-4 sm:px-6 lg:px-8" style={{ height: 500 }}>
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

  const { toPDF, targetRef } = usePDF({ filename: "page.pdf" });

  const getMonthWithYear = (m: string, date: string) => {
    if (!date) return m;
    const year = new Date(date).getFullYear();
    return `${m} ${year}`;
  };

  const getConsumptionRange = (bill: Bill) => {
    const index = bills.findIndex((b) => b.id === bill.id);
    const to = getMonthWithYear(bill.month, bill.deadline);
    const fromBill = index > 0 ? bills[index - 1] : bill;
    const from = getMonthWithYear(fromBill.month, fromBill.deadline);
    return { from, to };
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
    const consumption = Math.max(bill.currentReading - bill.prevReading, 0);
    const amountDue = calculateAmount(connection, consumption);
    const arrearsBills = bills.filter((b) => !b.paidDate && b.id !== bill.id);
    const arrears = arrearsBills.reduce((sum, b) => sum + Number(b.amount), 0);
    const totalDue = amountDue + arrears;
    const arrearsDetails = arrearsBills
      .map(
        (b) =>
          `<div class="row"><span>${b.month}</span><span class="bold">₱${b.amount}</span></div>`
      )
      .join("");

    const now = new Date();
    const formattedDateTime = now.toLocaleString("en-PH", {
      dateStyle: "long",
      timeStyle: "short",
    });

    const { from, to } = getConsumptionRange(bill);
    const receiptWindow = window.open("", "_blank");
    if (receiptWindow) {
      receiptWindow.document.write(`
        <html>
          <head>
            <title>Billing Receipt</title>
            <style>
              body { font-family: Arial, sans-serif; padding: 20px; }
              .center { text-align: center; }
              .bold { font-weight: bold; }
              .row { display: flex; justify-content: space-between; margin-top: 10px; }
              .divider { margin: 20px 0; border-top: 1px dashed #000; }
            </style>
          </head>
          <body>
            <div class="center">
              <img src="${logo}" width="130" />
              <h2>VILLANUEVA WATER SYSTEM</h2>
              <p>LGU Villanueva<br>Misamin, Oriental</p>
            </div>
            <p class="center">${formattedDateTime}</p>
            <div class="divider"></div>
            <div class="row"><span>Account Number:</span><span class="bold">${user?.meterID}</span></div>
            <div class="row"><span>Account Name:</span><span class="bold">${user?.firstName} ${user?.lastName}</span></div>
            <div class="row"><span>Connection Type:</span><span class="bold">${user?.connection}</span></div>
            <div class="row"><span>Address:</span><span class="bold">${user?.address}</span></div>
            <div class="row"><span>Consumption From:</span><span class="bold">${from}</span></div>
            <div class="row"><span>Consumption To:</span><span class="bold">${to}</span></div>
            <div class="row"><span>Reading:</span><span class="bold">${bill.currentReading}</span></div>
            <div class="row"><span>Consumed:</span><span class="bold">${consumption}</span></div>
            <div class="row"><span>Amount:</span><span class="bold">₱${amountDue}</span></div>
            <div class="row"><span class="bold">Arrears</span></div>
            ${arrearsDetails}
            <div class="row"><span>Total Arrears:</span><span class="bold">₱${arrears}</span></div>
            <div class="row"><span>Total Due:</span><span class="bold">₱${totalDue}</span></div>
            <div class="divider"></div>
            <div class="center bold">Contact Us</div>
            <div class="row"><span>PhilCom:</span><span class="bold">088-5650-278</span></div>
            <div class="row"><span>Globe:</span><span class="bold">0917-1629-094</span></div>
            <div class="row"><span>Website:</span><span class="bold">villanuevamisor.gov.ph</span></div>
            <div class="row"><span>Facebook:</span><span class="bold">facebook.com/LGUVillanueva</span></div>
            <script>window.onload = function() { window.print(); }</script>
          </body>
        </html>
      `);
      receiptWindow.document.close();
    }
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
            <div
              ref={targetRef}
              className="wrapper flex justify-center items-center flex-col dark:text-white"
            >
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
                    {getConsumptionRange(selectedBill).from}
                  </h1>
                </div>
                <div className="flex w-full mt-3 justify-between items-center">
                  <h1>Consumption To</h1>
                  <h1 className="text-xs font-bold">
                    {getConsumptionRange(selectedBill).to}
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
                </div>
                {bills
                  .filter((b) => !b.paidDate && b.id !== selectedBill.id)
                  .map((b) => (
                    <div
                      key={b.id}
                      className="flex w-full mt-1 justify-between items-center text-xs"
                    >
                      <h1>{b.month}</h1>
                      <h1 className="font-bold">₱{b.amount}</h1>
                    </div>
                  ))}
                <div className="flex w-full mt-2 justify-between items-center">
                  <h1>Total Arrears</h1>
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
        <Modal.Footer>
          <Button onClick={() => toPDF()}>Download</Button>
        </Modal.Footer>
      </Modal>

      <Modal onClose={() => setOpen(false)} show={isOpen} size="5xl">
        <Modal.Header className="sticky top-0 z-50">Monthly Bills</Modal.Header>
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

          <div className="max-h-80 overflow-y-auto">
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
                          Paid
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
                        Receipt
                      </Button>
                    </Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table>
          </div>
        </Modal.Body>
      </Modal>
    </>
  );
};

interface DeleteBillModalProps {
  billId: string;
  onDelete: (id: string) => void;
}

const DeleteBillModal: FC<DeleteBillModalProps> = ({ billId, onDelete }) => {
  const [isOpen, setOpen] = useState(false);

  return (
    <>
      <Button
        color="failure"
        size="xs"
        className="rounded px-3 py-1 text-sm font-medium"
        onClick={() => setOpen(true)}
      >
        Delete
      </Button>
      <Modal onClose={() => setOpen(false)} show={isOpen} size="md">
        <Modal.Header className="px-6 pt-6 pb-0">
          <span className="sr-only">Delete bill</span>
        </Modal.Header>
        <Modal.Body className="px-6 pt-0 pb-6">
          <div className="flex flex-col items-center gap-y-6 text-center">
            <HiOutlineExclamationCircle className="text-7xl text-red-500" />
            <p className="text-xl text-gray-500">
              Are you sure you want to delete this bill?
            </p>
            <div className="flex items-center gap-x-3">
              <Button
                color="failure"
                onClick={() => {
                  onDelete(billId);
                  setOpen(false);
                }}
              >
                Yes, I'm sure
              </Button>
              <Button color="gray" onClick={() => setOpen(false)}>
                No, cancel
              </Button>
            </div>
          </div>
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
  user: Object;
}

const PayBillingModal: FC<PayBillingModalProps> = ({ userId, user }) => {
  const [isOpen, setOpen] = useState(false);
  const [bills, setBills] = useState<Bill[]>([]);
  const [selectedBillIds, setSelectedBillIds] = useState<string[]>([]);
  const [payAll, setPayAll] = useState(false);
  const [date, setDate] = useState("");
  const [amountPaid, setAmountPaid] = useState("");
  const { getBillsByUser, updateBill } = useCrudBill();
  const { updateUser } = useCrudUser();

  useEffect(() => {
    if (isOpen) {
      getBillsByUser(userId, setBills);
      const today = new Date().toISOString().split("T")[0];
      setDate(today);
      setAmountPaid("");
    }
  }, [isOpen]);

  const unpaidBills = bills.filter((b) => !b.paidDate);

  const selectedBills = payAll
    ? unpaidBills
    : bills.filter((b) => selectedBillIds.includes(b.id));
  const totalAmount = selectedBills.reduce(
    (sum, b) => sum + Number(b.amount),
    0
  );
  const change = amountPaid ? Number(amountPaid) - totalAmount : 0;

  const printReceipt = (bill: Bill) => {
    const now = new Date();
    const formattedDateTime = now.toLocaleString("en-PH", {
      dateStyle: "long",
      timeStyle: "short",
    });

    const receiptWindow = window.open("", "_blank");
    if (receiptWindow) {
      receiptWindow.document.write(`
        <html>
          <head>
            <title>Billing Receipt</title>
            <style>
              body { font-family: Arial, sans-serif; padding: 20px; }
              .center { text-align: center; }
              .bold { font-weight: bold; }
              .section { margin-top: 20px; }
              .row { display: flex; justify-content: space-between; margin-top: 10px; }
              .divider { margin: 20px 0; border-top: 1px dashed #000; }
            </style>
          </head>
          <body>
            <div class="center">
              <img src="${logo}" width="130" />
              <h2>VILLANUEVA WATER SYSTEM</h2>
              <p>LGU Villanueva<br>Misamin, Oriental</p>
            </div>
            <div class="section">${formattedDateTime}</div>
            <div class="divider"></div>
            <div class="section">
              <div class="row"><span>Account Number:</span><span class="bold">${
                user?.meterID || "-"
              }</span></div>
              <div class="row"><span>Account Name:</span><span class="bold">${
                user?.firstName || ""
              } ${user?.lastName || ""}</span></div>
              <div class="row"><span>Connection Type:</span><span class="bold">${
                user?.connection || "-"
              }</span></div>
              <div class="row"><span>Address:</span><span class="bold">${
                user.address || "-"
              }</span></div>
              <div class="row"><span>Month:</span><span class="bold">${
                bill.month
              }</span></div>
              <div class="row"><span>Reading:</span><span class="bold">${
                bill.currentReading
              }</span></div>
              <div class="row"><span>Paid Date:</span><span class="bold">${date}</span></div>
              <div class="row"><span>Amount Paid:</span><span class="bold">₱${
                bill.amount
              }</span></div>
            </div>
            <div class="divider"></div>
            <div class="section center">
              <p class="bold">Contact Us</p>
              <div class="row"><span>PhilCom:</span><span class="bold">088-5650-278</span></div>
              <div class="row"><span>Globe:</span><span class="bold">0917-1629-094</span></div>
              <div class="row"><span>Website:</span><span class="bold">villanuevamisor.gov.ph</span></div>
              <div class="row"><span>Facebook:</span><span class="bold">facebook.com/LGUVillanueva</span></div>
            </div>
            <script>
              window.onload = function () {
                window.print();
              };
            </script>
          </body>
        </html>
      `);
      receiptWindow.document.close();
    }
  };

  const handlePay = () => {
    const billsToPay = payAll
      ? unpaidBills
      : bills.filter((b) => selectedBillIds.includes(b.id));

    if (billsToPay.length > 0 && date) {
      billsToPay.forEach((b) => {
        updateBill(b.id, { paidDate: date });
        printReceipt(b);
      });

      const total = billsToPay.reduce((sum, b) => sum + Number(b.amount), 0);

      updateUser(userId, {
        status: "active",
        balance: increment(-total),
      });

      setOpen(false);
      setDate("");
      setSelectedBillIds([]);
      setPayAll(false);
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
            <Label htmlFor="bill" value="Bills" />
            <select
              multiple
              id="bill"
              className="mt-1 block w-full rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 text-sm text-gray-900 dark:text-white"
              value={selectedBillIds}
              onChange={(e) =>
                setSelectedBillIds(
                  Array.from(e.target.selectedOptions, (opt) => opt.value)
                )
              }
              disabled={payAll}
            >
              {unpaidBills.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.month}
                </option>
              ))}
            </select>
          </div>
          <div className="mb-4 flex items-center space-x-2">
            <Checkbox
              id="payAll"
              checked={payAll}
              onChange={(e) => {
                const checked = e.target.checked;
                setPayAll(checked);
                setSelectedBillIds(checked ? unpaidBills.map((b) => b.id) : []);
              }}
            />
            <Label htmlFor="payAll">Pay all unpaid months</Label>
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
          <div className="mb-4">
            <Label htmlFor="total" value="Total Amount" />
            <TextInput
              id="total"
              readOnly
              className="bg-gray-100 dark:bg-gray-700"
              value={totalAmount.toFixed(2)}
            />
          </div>
          <div className="mb-4">
            <Label htmlFor="amountPaid" value="Amount Paid" />
            <TextInput
              id="amountPaid"
              type="number"
              value={amountPaid}
              onChange={(e) => setAmountPaid(e.target.value)}
            />
          </div>
          <div className="mb-4">
            <Label htmlFor="change" value="Change" />
            <TextInput
              id="change"
              readOnly
              className="bg-gray-100 dark:bg-gray-700"
              value={isNaN(change) ? "" : change.toFixed(2)}
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
    <Table.Head className="bg-blue-500 dark:bg-gray-800">
      <Table.HeadCell className="text-sm font-semibold text-white dark:text-gray-300">
        Name
      </Table.HeadCell>
      <Table.HeadCell className="text-sm font-semibold text-white dark:text-gray-300">
        Meter ID
      </Table.HeadCell>
      <Table.HeadCell className="text-sm font-semibold text-white dark:text-gray-300">
        Connection Type
      </Table.HeadCell>
      <Table.HeadCell className="text-sm font-semibold text-white dark:text-gray-300">
        Status
      </Table.HeadCell>
      <Table.HeadCell className="text-sm font-semibold text-white dark:text-gray-300">
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
            {localStorage.getItem("role") === "meter" && (
              <BillModal
                userId={user.id}
                user={user}
                connection={user.connection}
              />
            )}
            {localStorage.getItem("role") !== "meter" && (
              <>
                <BillModal
                  userId={user.id}
                  user={user}
                  connection={user.connection}
                />
                <PayBillingModal user={user} userId={user.id} />
              </>
            )}
          </Table.Cell>
        </Table.Row>
      ))}
    </Table.Body>
  </Table>
);

export default BillingPage;
