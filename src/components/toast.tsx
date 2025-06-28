import type { FC } from "react";
import { useEffect } from "react";

interface ToastProps {
  message: string;
  type?: "success" | "error";
  onClose: () => void;
}

const Toast: FC<ToastProps> = ({ message, type = "success", onClose }) => {
  useEffect(() => {
    const t = setTimeout(onClose, 3000);
    return () => clearTimeout(t);
  }, [onClose]);

  const colorClasses =
    type === "success"
      ? "bg-green-100 text-green-700"
      : "bg-red-100 text-red-700";

  return (
    <div
      className={`fixed top-5 right-5 z-50 rounded-lg p-4 shadow ${colorClasses}`}
    >
      <p className="text-sm font-medium">{message}</p>
    </div>
  );
};

export default Toast;
