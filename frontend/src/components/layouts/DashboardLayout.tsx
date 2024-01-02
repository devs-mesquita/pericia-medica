import React from "react";
import { Outlet, useNavigate } from "react-router-dom";
import Sidebar from "../partials/Sidebar";
import DashboardNavbar from "../partials/DashboardNavbar";
import Footer from "../partials/Footer";
import TopNotification from "../ui/TopNotification";
import { useAuthHeader, useIsAuthenticated, useSignOut } from "react-auth-kit";
import { notificationAtom, usingDefaultPasswordAtom } from "@/store";
import { useAtom } from "jotai";

const API_URL = import.meta.env.VITE_API_URL;

type CheckPasswordAPIResponse = {
  message: "not-found" | "default-password" | "ok";
};

export default function DashboardLayout() {
  const [sidebarIsOpen, setSidebarIsOpen] = React.useState<boolean>(true);

  const isAuthenticated = useIsAuthenticated();
  const authHeader = useAuthHeader();
  const signOut = useSignOut();
  const navigate = useNavigate();

  const [usingDefaultPassword, setUsingDefaultPassword] = useAtom(
    usingDefaultPasswordAtom,
  );
  const setNotification = useAtom(notificationAtom)[1];

  const toggleSidebar = () => {
    setSidebarIsOpen((st) => !st);
  };

  React.useEffect(() => {
    const checkPassword = async () => {
      if (!isAuthenticated()) return;

      if (usingDefaultPassword === false) return; // false = Already checked and authorized.

      if (usingDefaultPassword === true) {
        // true = Checkend and unauthorized (using default).
        setNotification({
          message: "Altere sua senha para obter acesso ao sistema.",
          type: "warning",
        });
        navigate("/changepassword");
      }

      if (usingDefaultPassword === null) {
        // null = Not Checked
        try {
          const res = await fetch(`${API_URL}/api/checkpassword`, {
            method: "GET",
            headers: {
              Accept: "application/json",
              Authorization: authHeader(),
            },
          });

          if (!res.ok) {
            const err = await res.json();
            throw err;
          }

          const data: CheckPasswordAPIResponse = await res.json();

          if (data.message === "default-password") {
            setNotification({
              message: "Altere sua senha para obter acesso ao sistema.",
              type: "warning",
            });
            setUsingDefaultPassword(true);
            navigate("/changepassword");
          } else if (data.message === "not-found") {
            setNotification({
              type: "error",
              message: "O usuário não foi encontrado.",
            });
            setUsingDefaultPassword(null);
            signOut();
          } else {
            setUsingDefaultPassword(false);
          }
        } catch (error) {
          console.error(error);
          setNotification({
            message: "Ocorreu um erro.",
            type: "error",
          });
        }
      }
    };

    checkPassword();
  }, [location.pathname]);

  return (
    <div id="dashboard-root" className="flex h-screen font-roboto">
      <Sidebar
        sidebarIsOpen={sidebarIsOpen}
        className={`${sidebarIsOpen ? "flex" : "hidden md:flex"}`}
      />
      <div id="dashboard-body" className="flex flex-1 flex-col">
        <DashboardNavbar toggleSidebar={toggleSidebar} />
        <TopNotification />
        <main
          id="content"
          className="flex flex-1 items-center justify-center bg-slate-200"
        >
          <Outlet />
        </main>
        <Footer />
      </div>
    </div>
  );
}
