import React from "react";
import { Menu, UserCircle2, LogOut, KeyRound } from "lucide-react";

interface DashboardNavbarProps {
  toggleSidebar: () => void;
}

export default function DashboardNavbar({
  toggleSidebar,
}: DashboardNavbarProps) {
  const [dropdownIsOpen, setDropdownIsOpen] = React.useState<boolean>(false);

  const toggleDropdown = () => {
    setDropdownIsOpen((st) => !st);
  };

  return (
    <header id="navbar" className="relative">
      <div className="bg-slate-500 p-2 text-xs md:text-sm flex items-center relative shadow-[1px_2px_2px_0px_rgb(0,0,0,0.75)] shadow-black/30 z-20">
        <button
          id="toggle-sidebar"
          className="text-slate-400 rounded bg-slate-200 shadow shadow-slate-800/20"
          onClick={toggleSidebar}
        >
          <Menu />
        </button>
        <h1 className="text-center flex-1">Header</h1>
        <button
          id="toggle-dropdown"
          onClick={toggleDropdown}
          className="text-slate-400 bg-slate-200 rounded-full p-[2px]"
        >
          <UserCircle2 />
        </button>
      </div>
      {dropdownIsOpen && (
        <div
          id="dropdown-menu"
          className="absolute flex flex-col bg-slate-300 right-0 top-full text-md md:text-lg min-w-[175px] z-10"
        >
          <a className="hover:bg-slate-400 flex justify-between items-center border-b px-2 py-1">
            Alterar Senha <KeyRound className="w-4 h-4" />
          </a>
          <button className="hover:bg-slate-400 flex items-center justify-between px-2 py-1">
            Sair <LogOut className="w-4 h-4" />
          </button>
        </div>
      )}
    </header>
  );
}
