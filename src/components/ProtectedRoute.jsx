import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { getAccessToken, getRefreshToken, isAuthenticated } from "../services/auth";

// Simple JWT decoder to extract role without verification
const getUserRoleFromToken = (token) => {
  try {
    const payload = token.split('.')[1];
    const decoded = JSON.parse(atob(payload));
    return decoded.role;
  } catch (error) {
    console.error('Error decoding token:', error);
    return null;
  }
};

export default function ProtectedRoute({ children }) {
  const [ready, setReady] = useState(false);
  const [authed, setAuthed] = useState(isAuthenticated());
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const run = async () => {
      // If access token exists, check role
      if (getAccessToken()) {
        const role = getUserRoleFromToken(getAccessToken());
        if (isMounted) {
          setIsAdmin(role === 'admin');
          setAuthed(true);
          setReady(true);
        }
        return;
      }

      // Refresh token exists -> "keep till api call" (no backend API call yet).
      // For now we treat presence of refreshToken cookie as "session can be restored".
      if (getRefreshToken()) {
        if (isMounted) {
          setAuthed(true);
          setReady(true);
        }
        return;
      }

      if (isMounted) {
        setAuthed(false);
        setReady(true);
      }
    };

    run();
    return () => {
      isMounted = false;
    };
  }, []);

  if (!ready) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-slate-50 text-slate-600 font-medium">
        Loading...
      </div>
    );
  }

  if (!authed) {
    return <Navigate to="/auth/login" replace />;
  }

  // If admin tries to access user routes, redirect to admin dashboard
  if (isAdmin) {
    return <Navigate to="/admin/verify" replace />;
  }

  return children;
}

