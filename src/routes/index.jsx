import { Routes, Route } from "react-router-dom";

import PublicRoutes from "./PublicRoutes";
import StudentRoutes from "./StudentRoutes";
import ClubRoutes from "./ClubRoutes";
import AdminRoutes from "./AdminRoutes";
import PrivateRoute from "./PrivateRoute";
import RoleProtectedRoute from "./RoleProtectedRoute";
import NotFoundPage from "@/pages/public/NotFoundPage";

export default function AppRoutes() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/*" element={<PublicRoutes />} />
      {/* Admin */}
      <Route
        path="/admin/*"
        element={
          <RoleProtectedRoute allowedRoles={["ADMIN"]}>
            <AdminRoutes />
          </RoleProtectedRoute>
        }
      />
      {/* Student */}
      <Route
        path="/student/*"
        element={
          <RoleProtectedRoute allowedRoles={["STUDENT"]}>
            <StudentRoutes />
          </RoleProtectedRoute>
        }
      />

      {/* Club */}
      <Route
        path="/club/*"
        element={
          <RoleProtectedRoute allowedRoles={["CLUB"]} requireApproval={true}>
            <ClubRoutes />
          </RoleProtectedRoute>
        }
      />



      {/* 404 */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

