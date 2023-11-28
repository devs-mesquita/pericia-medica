import { HomeIcon, TvIcon } from "lucide-react";
import { SidebarLinkProps } from "./SidebarLink";
import SidebarLinkList from "./SidebarLinkList";

interface SideBarProps {
  className?: string;
  sidebarIsOpen: boolean;
}

interface SidebarLinkList {
  linkList: SidebarLinkProps[];
  listTitle: string;
  listLogo: JSX.Element;
}

const sidebarLinkList: SidebarLinkList[] = [
  {
    linkList: [
      {
        title: "SubLink 1",
        path: "/somewhere",
        logo: <TvIcon className="w-5 h-5" />,
      },
      {
        title: "SubLink 2",
        path: "/somewhere2",
        logo: <TvIcon className="w-5 h-5" />,
      },
      {
        title: "SubLink 3",
        path: "/somewhere3",
        logo: <TvIcon className="w-5 h-5" />,
      },
    ],
    listLogo: <HomeIcon className="w-5 h-5" />,
    listTitle: "Home",
  },
  {
    linkList: [
      {
        title: "Link 1",
        path: "/somewhere",
        logo: <TvIcon className="w-5 h-5" />,
      },
    ],
    listLogo: <HomeIcon />,
    listTitle: "Home",
  },
];

export default function Sidebar({ className, sidebarIsOpen }: SideBarProps) {
  return (
    <nav
      id="sidebar"
      className={`${
        className ? className : ""
      } bg-slate-500 text-xs md:text-sm shadow-[2px_38px_2px_0px_rgb(0,0,0,0.75)] shadow-black/30 z-20 flex flex-col`}
    >
      <div className="h-[48px] p-2 flex justify-center items-center border-b border-slate-300/50">
        {sidebarIsOpen && <h2 className="text-sm">App Title</h2>}
      </div>
      <div className="flex-1">
        {sidebarLinkList.map((link) => (
          <SidebarLinkList
            linkList={link.linkList}
            listLogo={link.listLogo}
            listTitle={link.listTitle}
          />
        ))}
      </div>
      <div className="mt-auto p-2 h-[0px]">
        <img
          alt="Banner da Prefeitura de Mesquita"
          src="./banner192x64.png"
          className={`shadow shadow-black/30 rounded-md ${
            sidebarIsOpen ? "" : "hidden"
          }`}
        />
      </div>
    </nav>
  );
}
