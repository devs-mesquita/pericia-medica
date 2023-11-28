import { Menu, UserCircle2, LogOut, KeyRound } from "lucide-react";

interface DashboardNavbarProps {
  toggleSidebar: () => void;
}

export default function DashboardNavbar({
  toggleSidebar,
}: DashboardNavbarProps) {
  return (
    <header id="navbar" className="relative">
      <div className="bg-slate-500 border-b border-slate-300/50 h-[48px] text-xs md:text-sm flex items-center relative shadow-[1px_2px_2px_0px_rgb(0,0,0,0.75)] shadow-black/30 z-20">
        <div className="p-2 flex">
          <button
            id="toggle-sidebar"
            className="text-slate-400 rounded bg-slate-200 shadow shadow-slate-800/20"
            onClick={toggleSidebar}
          >
            <Menu />
          </button>
        </div>
        <h1 className="text-center flex-1">Header</h1>
        <div className="group p-2 hover:cursor-pointer">
          <button
            id="toggle-dropdown"
            className="text-slate-400 bg-slate-200 rounded-full p-[2px]"
          >
            <UserCircle2 />
            <div
              id="dropdown-menu"
              className="absolute hidden group-hover:flex group-hover:flex-col text-slate-600 bg-slate-300 right-0 top-full text-md md:text-lg min-w-[192px] z-10"
            >
              <a className="hover:bg-slate-400 flex justify-between items-center border-b px-2 py-1">
                Alterar Senha <KeyRound className="w-4 h-4" />
              </a>
              <button className="hover:bg-slate-400 flex items-center justify-between px-2 py-1">
                Sair <LogOut className="w-4 h-4" />
              </button>
            </div>
          </button>
        </div>
      </div>
    </header>
  );
}
