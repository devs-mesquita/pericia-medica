import React from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../partials/Sidebar";
import DashboardNavbar from "../partials/DashboardNavbar";
import Footer from "../partials/Footer";

// Sidebar.
// Navbar, Main, Footer.

export default function DashboardLayout() {
  const [sidebarIsOpen, setSidebarIsOpen] = React.useState<boolean>(true);

  const toggleSidebar = () => {
    setSidebarIsOpen((st) => !st);
  };

  return (
    <div id="dashboard-root" className="flex h-screen font-roboto">
      <Sidebar
        sidebarIsOpen={sidebarIsOpen}
        className={`${sidebarIsOpen ? "flex" : "hidden md:flex"}`}
      />
      <div id="dashboard-body" className="flex flex-1 flex-col">
        <DashboardNavbar toggleSidebar={toggleSidebar} />
        <div id="notifications" />
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
