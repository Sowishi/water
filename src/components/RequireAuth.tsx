import { Navigate } from "react-router-dom";
import type { FC, PropsWithChildren } from "react";
import { useAuth } from "../context/AuthContext";

const RequireAuth: FC<PropsWithChildren> = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return null;
  }

  if (!user) {
    return <Navigate to="/authentication/sign-in" replace />;
  }

  return <>{children}</>;
};

export default RequireAuth;
