import { Routes, Route } from "react-router-dom";
import { RequireAuth } from "react-auth-kit";

import DashboardLayout from "./components/layouts/DashboardLayout";
import RegularLayout from "./components/layouts/RegularLayout";
import Login from "./pages/Login";
import Home from "./pages/Home";
import RequerimentoCreate from "./pages/RequerimentoCreate";

export default function App() {
  return (
    <Routes>
      {/* Regular Layout */}
      <Route path="/" element={<RegularLayout />}>
        <Route index element={<RequerimentoCreate />} />
        <Route path="login" element={<Login />} />
      </Route>
      {/* Dashboard */}
      <Route path="/" element={<DashboardLayout />}>
        <Route
          path="home"
          element={
            <RequireAuth loginPath="/login">
              <Home />
            </RequireAuth>
          }
        />
      </Route>
      <Route path="*" element={<p>Not Found</p>} />
    </Routes>
  );
}
