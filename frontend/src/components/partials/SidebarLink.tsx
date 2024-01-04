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
      end
      className={({ isActive }) =>
        `flex hover:bg-black/10 ${className || ""} ${
          sidebarIsOpen
            ? "flex-col p-2 text-xs md:w-[208px] md:flex-row md:px-2 md:py-4"
            : "flex-col p-2 text-xs"
        } items-center ${isActive ? "bg-white/10 hover:bg-white/20" : ""}`
      }
    >
      {logo}{" "}
      <span className={`${sidebarIsOpen ? "mt-1 md:ml-2 md:mt-0" : "mt-1"}`}>
        {title}
      </span>
    </NavLink>
  );
}
