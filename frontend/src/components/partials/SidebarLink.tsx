import { NavLink } from "react-router-dom";

export interface SidebarLinkProps {
  title: string;
  logo: JSX.Element;
  path: string;
  sidebarIsOpen: boolean;
  className?: string;
}

export default function SidebarLink({
  title,
  path,
  logo,
  sidebarIsOpen,
  className,
}: SidebarLinkProps) {
  return (
    <NavLink
      to={path}
      className={`flex ${className || ""} ${
        sidebarIsOpen ? "w-[208px] px-2 py-4" : "w-[64px] flex-col p-2 text-xs"
      } items-center hover:bg-slate-400`}
    >
      {logo}{" "}
      <span className={`${sidebarIsOpen ? "ml-2" : "mt-1"}`}>{title}</span>
    </NavLink>
  );
}
