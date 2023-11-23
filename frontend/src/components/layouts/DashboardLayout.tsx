import React from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../partials/Sidebar";
import DashboardNavbar from "../partials/DashboardNavbar";
import Footer from "../partials/Footer";

// Sidebar.
// Navbar, Main, Footer.

export default function DashboardLayout() {
  const [sidebarIsOpen, setSidebarIsOpen] = React.useState<boolean>(false);

  const toggleSidebar = () => {
    setSidebarIsOpen((st) => !st);
  };

  return (
    <div id="dashboard-root" className="h-screen flex">
      <Sidebar className={`${sidebarIsOpen ? "flex" : "hidden md:flex"}`} />
      <div id="dashboard-body" className="flex-1 flex flex-col">
        <DashboardNavbar toggleSidebar={toggleSidebar} />
        <div id="notifications" />
        <main
          id="content"
          className="flex-1 bg-slate-200 flex items-center justify-center"
        >
          <Outlet />
        </main>
        <Footer />
      </div>
    </div>
  );
}
