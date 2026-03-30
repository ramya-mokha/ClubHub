import { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { doc, onSnapshot } from "firebase/firestore";
import { auth, db } from "@/firebase/firebase";

export default function RoleProtectedRoute({ allowedRoles = [], requireApproval = false, children }) {
  const [loading, setLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    let unsubscribeSnapshot = null;

    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (unsubscribeSnapshot) {
        unsubscribeSnapshot();
        unsubscribeSnapshot = null;
      }

      if (user) {
        unsubscribeSnapshot = onSnapshot(
          doc(db, "users", user.uid),
          (userDoc) => {
            if (userDoc.exists()) {
              const data = userDoc.data();
              setUserData(data);

              const hasRole = allowedRoles.length === 0 || allowedRoles.includes(data.role);
              const hasApproval = !requireApproval || data.isApproved === true;

              if (hasRole && hasApproval) {
                setIsAuthorized(true);
              } else {
                setIsAuthorized(false);
              }
            } else {
              setIsAuthorized(false);
            }
            setLoading(false);
          },
          (error) => {
            console.error("Error fetching user role:", error);
            setIsAuthorized(false);
            setLoading(false);
          }
        );
      } else {
        setIsAuthorized(false);
        setLoading(false);
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeSnapshot) {
        unsubscribeSnapshot();
      }
    };
  }, [allowedRoles, requireApproval]);

  if (loading) {
    return (
      <div className="w-screen h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  }

  if (!isAuthorized) {
    if (userData && !userData.isApproved && requireApproval) {
      return <Navigate to="/waiting-approval" replace />;
    }
    // If authenticated but wrong role, push to root or login
    return <Navigate to={auth.currentUser ? "/" : "/login"} replace />;
  }

  return children ? children : <Outlet />;
}
