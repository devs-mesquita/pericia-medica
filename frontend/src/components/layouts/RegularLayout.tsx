import { Outlet } from "react-router-dom";
import RegularNavbar from "../partials/RegularNavbar";
import Footer from "../partials/Footer";
import TopNotification from "../ui/TopNotification";

// Navbar, Main, Footer.

export default function RegularLayout() {
  return (
    <div className="flex min-h-[100vh] flex-col font-roboto">
      <RegularNavbar />
      <TopNotification />
      <main id="content" className="flex flex-1 flex-col bg-white">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
