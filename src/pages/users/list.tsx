/* eslint-disable jsx-a11y/anchor-is-valid */
import {
  Breadcrumb,
  Button,
  Checkbox,
  Dropdown,
  Label,
  Modal,
  Select,
  Table,
  TextInput,
} from "flowbite-react";
import type { FC } from "react";
import { useEffect, useState } from "react";
import {
  HiDocumentDownload,
  HiHome,
  HiOutlineExclamationCircle,
  HiOutlinePencilAlt,
  HiEye,
  HiPlus,
  HiTrash,
  HiClock,
} from "react-icons/hi";
import NavbarSidebarLayout from "../../layouts/navbar-sidebar";
import useCrudUser from "../../hooks/useCrudUser";
import useCrudBill from "../../hooks/useCrudBill";

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  connection: string;
  meterID: string;
  street: string;
  barangay: string;
  address: string;
  status: string;
  profilePic: string;
  balance?: string;
  history?: any[];
}

interface DeleteUserModalProps {
  user: User;
}

const UserListPage: FC = function () {
  return (
    <NavbarSidebarLayout isFooter={false}>
      <div className="block items-center justify-between border-b flex-col border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800 sm:flex">
        <div className="flex justify-start items-start w-full py-3">
          <h1 className="text-3xl font-bold">User Management</h1>
        </div>
        <div className="mb-1 w-full">
          <div className="sm:flex">
            <div className="mb-3 hidden items-center dark:divide-gray-700 sm:mb-0 sm:flex sm:divide-x sm:divide-gray-100">
              <form className="lg:pr-3">
                <Label htmlFor="users-search" className="sr-only">
                  Search
                </Label>
                <div className="relative mt-1 lg:w-64 xl:w-96">
                  <TextInput
                    id="users-search"
                    name="users-search"
                    placeholder="Search for users"
                  />
                </div>
              </form>
            </div>
            <div className="ml-auto flex items-center space-x-2 sm:space-x-3">
              <AddUserModal />
              <Button color="gray">
                <div className="flex items-center gap-x-3">
                  <HiDocumentDownload className="text-xl" />
                  <span>Export</span>
                </div>
              </Button>
            </div>
          </div>
        </div>
      </div>
      <div className="flex flex-col" style={{ height: 500 }}>
        <div className="overflow-x-auto">
          <div className="inline-block min-w-full w-full align-middle">
            <div className="overflow-hidden shadow">
              <AllUsersTable />
            </div>
          </div>
        </div>
      </div>
    </NavbarSidebarLayout>
  );
};

const AddUserModal: FC = function () {
  type FormsType = {
    [key: string]: string;
  };

  const [isOpen, setOpen] = useState(false);
  const [forms, setForms] = useState<FormsType>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    meterID: "",
    connection: "Resedential",
    street: "",
    barangay: "",
    status: "pending",
    balance: "750",
  });

  const { addUser } = useCrudUser();
  const { addBill } = useCrudBill();

  const generateMeterID = () => {
    return Math.floor(100000000 + Math.random() * 900000000).toString();
  };

  useEffect(() => {
    if (isOpen) {
      setForms((prev) => ({ ...prev, meterID: generateMeterID() }));
    }
  }, [isOpen]);

  const handleChange = (value: string, name: string) => {
    const formsCopy = { ...forms };
    formsCopy[name] = value;
    setForms(formsCopy);
  };

  const handleSubmit = async () => {
    const address = `${forms.street}, ${forms.barangay}`;
    const userId = await addUser({ ...forms, address });
    if (userId) {
      addBill({
        userId,
        month: "Connection",
        prevReading: 0,
        currentReading: 0,
        amount: forms.balance,
        deadline: "",
        paidDate: "",
      });
    }
    setOpen(false);
  };

  return (
    <>
      <Button color="primary" onClick={() => setOpen(true)}>
        <div className="flex items-center gap-x-3">
          <HiPlus className="text-xl" />
          Add user
        </div>
      </Button>
      <Modal onClose={() => setOpen(false)} show={isOpen}>
        <Modal.Header className="border-b border-gray-200 !p-6 dark:border-gray-700">
          <strong>Add new user</strong>
        </Modal.Header>
        <Modal.Body>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <Label htmlFor="firstName">First name</Label>
              <div className="mt-1">
                <TextInput
                  id="firstName"
                  onChange={(e) => handleChange(e.target.value, e.target.name)}
                  name="firstName"
                  placeholder="Bonnie"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="lastName">Last name</Label>
              <div className="mt-1">
                <TextInput
                  id="lastName"
                  onChange={(e) => handleChange(e.target.value, e.target.name)}
                  name="lastName"
                  placeholder="Green"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <div className="mt-1">
                <TextInput
                  id="email"
                  name="email"
                  onChange={(e) => handleChange(e.target.value, e.target.name)}
                  placeholder="example@company.com"
                  type="email"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="phone">Phone number</Label>
              <div className="mt-1">
                <TextInput
                  id="phone"
                  name="phone"
                  onChange={(e) => handleChange(e.target.value, e.target.name)}
                  placeholder="e.g., +(12)3456 789"
                  type="tel"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="meterID">Meter ID</Label>
              <div className="mt-1">
                <TextInput
                  id="meterID"
                  name="meterID"
                  value={forms.meterID}
                  readOnly
                />
              </div>
            </div>
            <div>
              <Label htmlFor="company">Connection</Label>
              <div className="mt-1">
                <Select
                  name="connection"
                  onChange={(e) => handleChange(e.target.value, e.target.name)}
                >
                  <option value="Resedential">Resedential</option>
                  <option value="Comercial">Comercial</option>
                  <option value="Industrial">Industrial</option>
                </Select>
              </div>
            </div>
            <div>
              <Label htmlFor="street">Street</Label>
              <div className="mt-1">
                <TextInput
                  id="street"
                  name="street"
                  placeholder="123 Street"
                  onChange={(e) => handleChange(e.target.value, e.target.name)}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="barangay">Barangay</Label>
              <div className="mt-1">
                <Select
                  id="barangay"
                  name="barangay"
                  onChange={(e) => handleChange(e.target.value, e.target.name)}
                >
                  <option value="">Select Barangay</option>
                  <option value="Barangay 1">Barangay 1</option>
                  <option value="Barangay 2">Barangay 2</option>
                  <option value="Barangay 3">Barangay 3</option>
                </Select>
              </div>
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button color="primary" onClick={() => handleSubmit()}>
            Add user
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

interface HistoryModalProps {
  user: User;
}

const HistoryModal: FC<HistoryModalProps> = function ({ user }) {
  const [isOpen, setOpen] = useState(false);
  const history = user.history ?? [];
  return (
    <>
      <Button color="gray" onClick={() => setOpen(true)} size="xs">
        <div className="flex items-center gap-x-2">
          <HiClock className="text-lg" />
          History
        </div>
      </Button>
      <Modal onClose={() => setOpen(false)} show={isOpen}>
        <Modal.Header className="border-b border-gray-200 !p-6 dark:border-gray-700">
          <strong>History</strong>
        </Modal.Header>
        <Modal.Body>
          {history.length === 0 ? (
            <p className="text-gray-500">No history</p>
          ) : (
            <ul className="list-disc space-y-1 pl-5">
              {history.map((h, i) => (
                <li key={i} className="font-medium break-words">
                  {typeof h === "string"
                    ? h
                    : `${h.updatedAt} - ${h.firstName} ${h.lastName}, ${h.street}, ${h.barangay}`}
                </li>
              ))}
            </ul>
          )}
        </Modal.Body>
      </Modal>
    </>
  );
};

const AllUsersTable: FC = function () {
  const [users, setUsers] = useState<User[]>([]);
  const { getUsers, updateUser } = useCrudUser();

  useEffect(() => {
    getUsers(setUsers);
  }, []);

  return (
    <Table className="min-w-full w-full divide-y divide-gray-200 dark:divide-gray-600">
      <Table.Head className="bg-blue-500 text-white dark:bg-gray-700">
        <Table.HeadCell>Name</Table.HeadCell>
        <Table.HeadCell>Meter ID</Table.HeadCell>
        <Table.HeadCell>Address</Table.HeadCell>
        <Table.HeadCell>Balance</Table.HeadCell>
        <Table.HeadCell>Status</Table.HeadCell>
        <Table.HeadCell>Change status</Table.HeadCell>
        <Table.HeadCell>Actions</Table.HeadCell>
      </Table.Head>
      <Table.Body className="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-800">
        {users.length >= 1 && (
          <>
            {users.map((user) => {
              return (
                <Table.Row
                  key={user.id}
                  className="hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <Table.Cell className="mr-12 flex items-center space-x-6 whitespace-nowrap p-4 lg:mr-0">
                    <img
                      className="h-10 w-10 rounded-full"
                      src={user.profilePic}
                      alt="Neil Sims avatar"
                    />
                    <div className="text-sm font-normal text-gray-500 dark:text-gray-400">
                      <div className="text-base font-semibold text-gray-900 dark:text-white">
                        {user.firstName} {user.lastName}
                      </div>
                      <div className="text-sm font-normal text-gray-500 dark:text-gray-400">
                        {user.email}
                      </div>
                      {user.connection}
                    </div>
                  </Table.Cell>
                  <Table.Cell className="whitespace-nowrap p-4 text-base font-medium text-gray-900 dark:text-white">
                    {user.meterID}
                  </Table.Cell>
                  <Table.Cell className="whitespace-nowrap p-4 text-base font-medium text-gray-900 dark:text-white">
                    {user.street && user.barangay ? (
                      <div
                        className="max-w-[200px] truncate"
                        title={`${user.street}, ${user.barangay}`}
                      >
                        {user.street}, {user.barangay}
                      </div>
                    ) : (
                      "No address"
                    )}
                  </Table.Cell>

                  <Table.Cell className="whitespace-nowrap p-4 text-base font-medium text-gray-900 dark:text-white">
                    ₱{user.balance}
                  </Table.Cell>
                  <Table.Cell className="whitespace-nowrap p-4 text-base font-normal text-gray-900 dark:text-white">
                    <div className="flex items-center">
                      <div
                        className={`mr-2 h-2.5 w-2.5 rounded-full ${
                          user.status === "active"
                            ? "bg-green-400"
                            : user.status === "pending"
                            ? "bg-yellow-400"
                            : "bg-red-400"
                        }`}
                      ></div>
                      {user.status === "active"
                        ? "Active"
                        : user.status === "pending"
                        ? "Pending"
                        : "Disconnected"}
                    </div>
                  </Table.Cell>
                  <Table.Cell className="whitespace-nowrap p-4 text-base font-normal text-gray-900 dark:text-white">
                    <Button
                      size="xs"
                      onClick={() =>
                        updateUser(user.id, {
                          status:
                            user.status === "active"
                              ? "disconnected"
                              : "active",
                        })
                      }
                    >
                      {user.status === "active" ? "Disconnect" : "Activate"}
                    </Button>
                  </Table.Cell>
                  <Table.Cell>
                    <Dropdown label="Action" dismissOnClick={false} inline>
                      <Dropdown.Item>
                        <ViewUserModal user={user} />
                      </Dropdown.Item>
                      <Dropdown.Item>
                        <HistoryModal user={user} />
                      </Dropdown.Item>
                      <Dropdown.Item>
                        <EditUserModal user={user} />
                      </Dropdown.Item>
                      <Dropdown.Item>
                        <DeleteUserModal user={user} />
                      </Dropdown.Item>
                    </Dropdown>
                  </Table.Cell>
                </Table.Row>
              );
            })}
          </>
        )}
      </Table.Body>
    </Table>
  );
};

interface ViewUserModalProps {
  user: User;
}

const ViewUserModal: FC<ViewUserModalProps> = function ({ user }) {
  const [isOpen, setOpen] = useState(false);
  return (
    <>
      <Button color="gray" onClick={() => setOpen(true)} size="xs">
        <div className="flex items-center gap-x-2">
          <HiEye className="text-lg" />
          View
        </div>
      </Button>
      <Modal onClose={() => setOpen(false)} show={isOpen}>
        <Modal.Header className="border-b border-gray-200 !p-6 dark:border-gray-700">
          <strong>Customer Details</strong>
        </Modal.Header>
        <Modal.Body>
          <div className="grid grid-cols-1 gap-4">
            <div>
              <Label value="Name" />
              <p className="font-medium">
                {user.firstName} {user.lastName}
              </p>
            </div>
            <div>
              <Label value="Email" />
              <p className="font-medium">{user.email}</p>
            </div>
            {user.phone && (
              <div>
                <Label value="Phone" />
                <p className="font-medium">{user.phone}</p>
              </div>
            )}
            <div>
              <Label value="Meter ID" />
              <p className="font-medium">{user.meterID}</p>
            </div>
            <div>
              <Label value="Connection" />
              <p className="font-medium">{user.connection}</p>
            </div>
            <div>
              <Label value="Street" />
              <p className="font-medium">{user.street}</p>
            </div>
            <div>
              <Label value="Barangay" />
              <p className="font-medium">{user.barangay}</p>
            </div>
            <div>
              <Label value="Status" />
              <p className="font-medium">{user.status}</p>
            </div>
          </div>
        </Modal.Body>
      </Modal>
    </>
  );
};

interface EditUserModalProps {
  user: User;
}

const EditUserModal: FC<EditUserModalProps> = function ({ user }) {
  type FormsType = {
    [key: string]: string;
  };

  const [isOpen, setOpen] = useState(false);
  const [forms, setForms] = useState<FormsType>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    meterID: "",
    connection: "Resedential",
    street: "",
    barangay: "",
    status: "active",
  });

  const { updateUser } = useCrudUser();

  useEffect(() => {
    if (isOpen) {
      const [street = "", barangay = ""] = user.address
        ? user.address.split(",").map((s) => s.trim())
        : ["", ""];
      setForms({
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone ?? "",
        meterID: user.meterID,
        connection: user.connection,
        street: user.street ?? street,
        barangay: user.barangay ?? barangay,
        status: user.status,
      });
    }
  }, [isOpen]);

  const handleChange = (value: string, name: string) => {
    const formsCopy = { ...forms };
    formsCopy[name] = value;
    setForms(formsCopy);
  };

  const handleSubmit = () => {
    const history = user.history ?? [];
    const previous = {
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone ?? "",
      meterID: user.meterID,
      connection: user.connection,
      street: user.street ?? "",
      barangay: user.barangay ?? "",
      status: user.status,
      updatedAt: new Date().toISOString(),
    };
    updateUser(user.id, {
      ...forms,
      address: `${forms.street}, ${forms.barangay}`,
      history: [...history, previous],
    });
    setOpen(false);
  };

  return (
    <>
      <Button color="primary" onClick={() => setOpen(true)} size="xs">
        <div className="flex items-center gap-x-2">
          <HiOutlinePencilAlt className="text-lg" />
          Edit
        </div>
      </Button>
      <Modal onClose={() => setOpen(false)} show={isOpen}>
        <Modal.Header className="border-b border-gray-200 !p-6 dark:border-gray-700">
          <strong>Edit User</strong>
        </Modal.Header>
        <Modal.Body>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <Label htmlFor="firstName">First name</Label>
              <div className="mt-1">
                <TextInput
                  id="firstName"
                  name="firstName"
                  value={forms.firstName}
                  onChange={(e) => handleChange(e.target.value, e.target.name)}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="lastName">Last name</Label>
              <div className="mt-1">
                <TextInput
                  id="lastName"
                  name="lastName"
                  value={forms.lastName}
                  onChange={(e) => handleChange(e.target.value, e.target.name)}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <div className="mt-1">
                <TextInput
                  id="email"
                  name="email"
                  type="email"
                  value={forms.email}
                  onChange={(e) => handleChange(e.target.value, e.target.name)}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="phone">Phone number</Label>
              <div className="mt-1">
                <TextInput
                  id="phone"
                  name="phone"
                  type="tel"
                  value={forms.phone}
                  onChange={(e) => handleChange(e.target.value, e.target.name)}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="meterID">Meter ID</Label>
              <div className="mt-1">
                <TextInput
                  id="meterID"
                  name="meterID"
                  value={forms.meterID}
                  readOnly
                />
              </div>
            </div>
            <div>
              <Label htmlFor="connection">Connection</Label>
              <div className="mt-1">
                <Select
                  id="connection"
                  name="connection"
                  value={forms.connection}
                  onChange={(e) => handleChange(e.target.value, e.target.name)}
                >
                  <option value="Resedential">Resedential</option>
                  <option value="Comercial">Comercial</option>
                  <option value="Industrial">Industrial</option>
                </Select>
              </div>
            </div>
            <div>
              <Label htmlFor="street-edit">Street</Label>
              <div className="mt-1">
                <TextInput
                  id="street-edit"
                  name="street"
                  value={forms.street}
                  onChange={(e) => handleChange(e.target.value, e.target.name)}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="barangay-edit">Barangay</Label>
              <div className="mt-1">
                <Select
                  id="barangay-edit"
                  name="barangay"
                  value={forms.barangay}
                  onChange={(e) => handleChange(e.target.value, e.target.name)}
                >
                  <option value="">Select Barangay</option>
                  <option value="Barangay 1">Barangay 1</option>
                  <option value="Barangay 2">Barangay 2</option>
                  <option value="Barangay 3">Barangay 3</option>
                </Select>
              </div>
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button color="primary" onClick={handleSubmit}>
            Save
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

const DeleteUserModal: FC<DeleteUserModalProps> = ({ user }) => {
  const [isOpen, setOpen] = useState(false);

  const { deleteUser } = useCrudUser();
  return (
    <>
      <Button size={"xs"} color="failure" onClick={() => setOpen(true)}>
        <div className="flex items-center gap-x-2">
          <HiTrash className="text-lg" />
          Delete user
        </div>
      </Button>
      <Modal onClose={() => setOpen(false)} show={isOpen} size="md">
        <Modal.Header className="px-6 pt-6 pb-0">
          <span className="sr-only">Delete user</span>
        </Modal.Header>
        <Modal.Body className="px-6 pt-0 pb-6">
          <div className="flex flex-col items-center gap-y-6 text-center">
            <HiOutlineExclamationCircle className="text-7xl text-red-500" />
            <p className="text-xl text-gray-500">
              Are you sure you want to delete this user?
            </p>
            <div className="flex items-center gap-x-3">
              <Button color="failure" onClick={() => deleteUser(user)}>
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

export default UserListPage;
