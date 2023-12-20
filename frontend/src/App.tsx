import { Routes, Route } from "react-router-dom";
import { RequireAuth } from "react-auth-kit";

import DashboardLayout from "./components/layouts/DashboardLayout";
import RegularLayout from "./components/layouts/RegularLayout";
import Login from "./pages/Login";
import Home from "./pages/Home";
import RequerimentoCreate from "./pages/RequerimentoCreate";
import ConfirmationPage from "./pages/Confirmation";

export default function App() {
  return (
    <Routes>
      <Route index element={<RequerimentoCreate />} />
      {/* Regular Layout */}
      <Route path="/" element={<RegularLayout />}>
        <Route path="confirmation" element={<ConfirmationPage />} />
        <Route path="login" element={<Login />} />
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
        <Route path="home" element={<Home />} />
      </Route>
      <Route path="*" element={<p>404 - Página não encontrada.</p>} />
    </Routes>
  );
}
