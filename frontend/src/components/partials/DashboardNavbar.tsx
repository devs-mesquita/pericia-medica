import { Menu, UserCircle2, LogOut, KeyRound } from "lucide-react";

interface DashboardNavbarProps {
  toggleSidebar: () => void;
}

export default function DashboardNavbar({
  toggleSidebar,
}: DashboardNavbarProps) {
  return (
    <header id="navbar" className="relative">
      <div className="relative z-20 flex h-[48px] items-center border-b border-slate-300/50 bg-slate-500 text-xs shadow-[1px_2px_2px_0px_rgb(0,0,0,0.75)] shadow-black/30 md:text-sm">
        <div className="flex p-2">
          <button
            id="toggle-sidebar"
            className="rounded bg-slate-200 text-slate-400 shadow shadow-slate-800/20"
            onClick={toggleSidebar}
          >
            <Menu />
          </button>
        </div>
        <h1 className="flex-1 text-center">Header</h1>
        <div className="group p-2 hover:cursor-pointer">
          <nav
            id="toggle-dropdown"
            className="rounded-full bg-slate-200 p-[2px] text-slate-400"
          >
            <UserCircle2 />
            <div
              id="dropdown-menu"
              className="text-md absolute right-0 top-full hidden min-w-[192px] bg-slate-300 text-slate-600 group-hover:flex group-hover:flex-col md:text-lg"
            >
              <a className="flex items-center justify-between border-b px-2 py-1 hover:bg-slate-400">
                Alterar Senha <KeyRound className="h-4 w-4" />
              </a>
              <button className="flex items-center justify-between px-2 py-1 hover:bg-slate-400">
                Sair <LogOut className="h-4 w-4" />
              </button>
            </div>
          </nav>
        </div>
      </div>
    </header>
  );
}
