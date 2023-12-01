import { Menu, UserCircle2, LogOut, KeyRound } from "lucide-react";
import { useSignOut } from "react-auth-kit";
import { Link, useNavigate } from "react-router-dom";

interface DashboardNavbarProps {
  toggleSidebar: () => void;
}

export default function DashboardNavbar({
  toggleSidebar,
}: DashboardNavbarProps) {
  const signOut = useSignOut();
  const navigate = useNavigate();

  const handleSignOut = (evt: React.MouseEvent<HTMLButtonElement>) => {
    evt.preventDefault();
    signOut();
    navigate("/login");
  };

  return (
    <header id="navbar" className="relative">
      <div className="relative z-20 flex h-[48px] items-center border-b border-black/20 bg-slate-200 text-xs shadow-[1px_2px_2px_0px_rgb(0,0,0,0.75)] shadow-black/30 md:text-sm">
        <div className="flex p-2">
          <button
            id="toggle-sidebar"
            className="rounded border border-slate-900/10 bg-slate-200 text-roxo/80 shadow shadow-black/30"
            onClick={toggleSidebar}
            title="Expandir/recolher menu lateral."
          >
            <Menu />
          </button>
        </div>
        <h1 className="flex-1 text-center">Header</h1>
        <div className="group p-2 hover:cursor-pointer">
          <nav
            title="Configurações de usuário."
            id="toggle-dropdown"
            className="rounded-full bg-slate-200 p-[2px] text-slate-400"
          >
            <UserCircle2 />
            <div
              id="dropdown-menu"
              className="text-md absolute right-0 top-full hidden min-w-[192px] border border-black/20 bg-slate-200 text-slate-600 shadow shadow-black/20 group-hover:flex group-hover:flex-col md:text-lg"
            >
              <Link
                to="/changepassword"
                className="flex items-center justify-between border-b px-2 py-1 hover:bg-slate-300"
                title="Alterar senha."
              >
                Alterar Senha <KeyRound className="h-4 w-4" />
              </Link>
              <button
                onClick={handleSignOut}
                className="flex items-center justify-between px-2 py-1 hover:bg-slate-300"
                title="Sair do sistema."
              >
                Sair <LogOut className="h-4 w-4" />
              </button>
            </div>
          </nav>
        </div>
      </div>
    </header>
  );
}
