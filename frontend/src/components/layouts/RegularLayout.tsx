import { Outlet } from "react-router-dom";
import RegularNavbar from "../partials/RegularNavbar";
import Footer from "../partials/Footer";

// Navbar, Main, Footer.

export default function RegularLayout() {
  return (
    <div className="min-h-[100vh] flex flex-col">
      <RegularNavbar />
      <div id="notifications" />
      <main
        id="content"
        className="flex-1 flex items-center justify-center bg-blue-200"
      >
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
