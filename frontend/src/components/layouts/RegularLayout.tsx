import { Outlet } from "react-router-dom";
import RegularNavbar from "../partials/RegularNavbar";
import Footer from "../partials/Footer";

// Navbar, Main, Footer.

export default function RegularLayout() {
  return (
    <div className="font-roboto flex min-h-[100vh] flex-col">
      <RegularNavbar />
      <div id="notifications" />
      <main id="content" className="flex flex-1 flex-col bg-slate-100">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
