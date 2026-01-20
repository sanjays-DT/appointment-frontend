import { useAuth } from "../context/AuthContext.tsx";
import { Navigate, useLocation } from "react-router-dom";
import { ReactNode } from "react";

interface Props {
  children: ReactNode;
}

export default function ProtectedRoute({ children }: Props) {
  const auth = useAuth();
  const { user, loading } = auth;
  const forcePasswordChange = (auth as any).forcePasswordChange ?? false;
  const location = useLocation();

  if (loading) return null;

  // ❌ Not logged in → login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // 🔒 Force password change → ONLY allow /change-password
  if (forcePasswordChange && location.pathname !== "/change-password") {
    return <Navigate to="/change-password" replace />;
  }

  // ❌ After login, prevent going back to login
  if (!forcePasswordChange && location.pathname === "/login") {
    return <Navigate to="/categories" replace />;
  }

  return <>{children}</>;
}
