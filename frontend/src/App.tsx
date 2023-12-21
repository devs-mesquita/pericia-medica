import { Routes, Route } from "react-router-dom";
import { RequireAuth } from "react-auth-kit";

import DashboardLayout from "./components/layouts/DashboardLayout";
import RegularLayout from "./components/layouts/RegularLayout";
import LoginPage from "./pages/Login";
import HomePage from "./pages/Home";
import RequerimentoCreatePage from "./pages/RequerimentoCreate";
import ConfirmationPage from "./pages/Confirmation";
import ChangePasswordPage from "./pages/ChangePassword";

export default function App() {
  return (
    <Routes>
      <Route index element={<RequerimentoCreatePage />} />
      {/* Regular Layout */}
      <Route path="/" element={<RegularLayout />}>
        <Route path="confirmation" element={<ConfirmationPage />} />
        <Route path="login" element={<LoginPage />} />
      </Route>
      {/* Dashboard */}
      <Route
        path="/"
        element={
          <RequireAuth loginPath="/login">
            <DashboardLayout />
          </RequireAuth>
        }
      >
        <Route path="home" element={<HomePage />} />
        <Route path="changepassword" element={<ChangePasswordPage />} />
      </Route>
      <Route path="*" element={<p>404 - Página não encontrada.</p>} />
    </Routes>
  );
}
