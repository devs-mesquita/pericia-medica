import { NavLink } from "react-router-dom";

export interface SidebarLinkProps {
  title: string;
  logo: JSX.Element;
  path: string;
}

export default function SidebarLink({ title, path, logo }: SidebarLinkProps) {
  return (
    <NavLink to={path} className="flex items-center justify-center p-2">
      {logo} <span className="ml-2">{title}</span>
    </NavLink>
  );
}
