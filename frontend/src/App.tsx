import { Routes, Route } from "react-router-dom";
import { RequireAuth } from "react-auth-kit";

import DashboardLayout from "./components/layouts/DashboardLayout";
import Login from "./pages/Login";
import Home from "./pages/Home";
import RequerimentoCreate from "./pages/RequerimentoCreate";

export default function App() {
  return (
    <Routes>
      <Route index element={<RequerimentoCreate />} />
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
      <Route path="login" element={<Login />} />
      <Route path="*" element={<p>Not Found</p>} />
    </Routes>
  );
}
