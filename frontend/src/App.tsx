import { Routes, Route } from "react-router-dom";
import { RequireAuth } from "react-auth-kit";

import DashboardLayout from "./components/layouts/DashboardLayout";
import RegularLayout from "./components/layouts/RegularLayout";
import LoginPage from "./pages/Login";
import HomePage from "./pages/Home";
import RequerimentoCreatePage from "./pages/requerimentos/Create";
import RequerimentoAvaliacaoPage from "./pages/requerimentos/Avaliacao";
import SuccessPage from "./pages/requerimentos/Success";
import ConfirmarPage from "./pages/requerimentos/Confirmar";
import ChangePasswordPage from "./pages/ChangePassword";
import RequerimentoIndexPage from "./pages/requerimentos/Index";
import RequerimentoDiarioPage from "./pages/requerimentos/Diario";
import RequerimentoArquivoPage from "./pages/requerimentos/Arquivo";
import RequerimentoRelatorioPage from "./pages/requerimentos/Relatorio";
import RequerimentoReagendamentoPage from "./pages/requerimentos/Reagendamento";
import DirecionamentoIndexPage from "./pages/direcionamentos/Index";
import DirecionamentoEditPage from "./pages/direcionamentos/Edit";
import DirecionamentoCreatePage from "./pages/direcionamentos/Create";
import UserIndexPage from "./pages/users/Index";
import UserEditPage from "./pages/users/Edit";
import UserCreatePage from "./pages/users/Create";
import RequerimentoShowPage from "./pages/requerimentos/Show";

export default function App() {
  return (
    <Routes>
      <Route index element={<RequerimentoCreatePage />} />
      {/* Regular Layout */}
      <Route path="/" element={<RegularLayout />}>
        <Route path="success" element={<SuccessPage />} />
        <Route path="confirmar" element={<ConfirmarPage />} />
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
        <Route path="requerimentos">
          <Route index element={<RequerimentoIndexPage />} />
          <Route path="diario" element={<RequerimentoDiarioPage />} />
          <Route path="arquivo" element={<RequerimentoArquivoPage />} />
          <Route path="relatorio" element={<RequerimentoRelatorioPage />} />
          <Route
            path="reagendamento"
            element={<RequerimentoReagendamentoPage />}
          />
          <Route path=":id" element={<RequerimentoShowPage />} />
          <Route path=":id/avaliacao" element={<RequerimentoAvaliacaoPage />} />
        </Route>
        <Route path="direcionamentos">
          <Route index element={<DirecionamentoIndexPage />} />
          <Route path="create" element={<DirecionamentoCreatePage />} />
          <Route path=":id/edit" element={<DirecionamentoEditPage />} />
        </Route>
        <Route path="users">
          <Route index element={<UserIndexPage />} />
          <Route path=":id/edit" element={<UserEditPage />} />
          <Route path="create" element={<UserCreatePage />} />
        </Route>
      </Route>
      <Route path="*" element={<p>404 - Página não encontrada.</p>} />
    </Routes>
  );
}
