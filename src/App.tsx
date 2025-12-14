import { Toaster as Sonner } from "@/components/ui/sonner";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Login from "./pages/Login";
import ForgotPassword from "./pages/ForgotPassword";
import Dashboard from "./pages/Dashboard";
import CallLogs from "./pages/CallLogs";
import Bookings from "./pages/Bookings";
import Orders from "./pages/Orders";
import Feedbacks from "./pages/Feedbacks";
import Menus from "./pages/Menus";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";

import { DashboardLayout } from "@/components/layout/DashboardLayout";
import AuthGuard from "@/components/AuthGuard";

const App = () => {
  return (
    <BrowserRouter>
      {/* Global toast */}
      <Sonner />

      <Routes>
        {/* Default redirect */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />

        {/* Public routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />

        {/* Protected routes */}
        <Route
          path="/dashboard"
          element={
            <AuthGuard>
              <DashboardLayout>
                <Dashboard />
              </DashboardLayout>
            </AuthGuard>
          }
        />

        <Route
          path="/call-logs"
          element={
            <AuthGuard>
              <DashboardLayout>
                <CallLogs />
              </DashboardLayout>
            </AuthGuard>
          }
        />

        <Route
          path="/bookings"
          element={
            <AuthGuard>
              <DashboardLayout>
                <Bookings />
              </DashboardLayout>
            </AuthGuard>
          }
        />

        <Route
          path="/orders"
          element={
            <AuthGuard>
              <DashboardLayout>
                <Orders />
              </DashboardLayout>
            </AuthGuard>
          }
        />

        <Route
          path="/feedbacks"
          element={
            <AuthGuard>
              <DashboardLayout>
                <Feedbacks />
              </DashboardLayout>
            </AuthGuard>
          }
        />

        <Route
          path="/menus"
          element={
            <AuthGuard>
              <DashboardLayout>
                <Menus />
              </DashboardLayout>
            </AuthGuard>
          }
        />

        <Route
          path="/settings"
          element={
            <AuthGuard>
              <DashboardLayout>
                <Settings />
              </DashboardLayout>
            </AuthGuard>
          }
        />

        {/* 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;

