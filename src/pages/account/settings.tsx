import { Breadcrumb, Button, Label, TextInput } from "flowbite-react";
import type { FC, FormEvent } from "react";
import { useEffect, useState } from "react";
import { HiHome } from "react-icons/hi";
import NavbarSidebarLayout from "../../layouts/navbar-sidebar";

interface Account {
  email: string;
  password: string;
  role: string;
}

const AccountSettingsPage: FC = function () {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [account, setAccount] = useState<Account | null>(null);

  useEffect(() => {
    const role = localStorage.getItem("role");
    const stored = localStorage.getItem("accounts");
    if (role && stored) {
      try {
        const accounts: Account[] = JSON.parse(stored);
        const acc = accounts.find((a) => a.role === role) || null;
        setAccount(acc);
      } catch {
        // ignore parse errors
      }
    }
  }, []);

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!account) return;
    setError("");
    setSuccess("");
    if (currentPassword !== account.password) {
      setError("Current password is incorrect.");
      return;
    }
    if (!newPassword || newPassword !== confirmPassword) {
      setError("New passwords do not match.");
      return;
    }

    const stored = localStorage.getItem("accounts");
    if (stored) {
      try {
        const accounts: Account[] = JSON.parse(stored);
        const idx = accounts.findIndex((a) => a.role === account.role);
        if (idx !== -1) {
          accounts[idx].password = newPassword;
          localStorage.setItem("accounts", JSON.stringify(accounts));
          setAccount(accounts[idx]);
          setSuccess("Password updated successfully.");
          setCurrentPassword("");
          setNewPassword("");
          setConfirmPassword("");
        }
      } catch {
        setError("Unable to update password.");
      }
    }
  };

  return (
    <NavbarSidebarLayout>
      <div className="border-b border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
        <div className="mb-4">
          <Breadcrumb className="mb-2">
            <Breadcrumb.Item href="#">
              <HiHome className="text-xl mr-2" />
              <span className="dark:text-white">Home</span>
            </Breadcrumb.Item>
            <Breadcrumb.Item>Account Settings</Breadcrumb.Item>
          </Breadcrumb>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Account Settings
          </h1>
        </div>
      </div>
      <div className="p-4 sm:p-6">
        <form onSubmit={handleSubmit} className="max-w-md space-y-4">
          <div>
            <Label htmlFor="current" value="Current Password" />
            <TextInput
              id="current"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
            />
          </div>
          <div>
            <Label htmlFor="new" value="New Password" />
            <TextInput
              id="new"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
          </div>
          <div>
            <Label htmlFor="confirm" value="Confirm New Password" />
            <TextInput
              id="confirm"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          {success && <p className="text-sm text-green-600">{success}</p>}
          <Button type="submit">Update Password</Button>
        </form>
      </div>
    </NavbarSidebarLayout>
  );
};

export default AccountSettingsPage;
