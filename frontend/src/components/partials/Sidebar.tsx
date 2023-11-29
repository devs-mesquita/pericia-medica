import React from "react";
import { HomeIcon, TvIcon } from "lucide-react";
import { SidebarLinkProps } from "./SidebarLink";
import SidebarLinkList from "./SidebarLinkList";

interface SideBarProps {
  className?: string;
  sidebarIsOpen: boolean;
}

interface SidebarLinkList {
  listID: number;
  linkList: SidebarLinkProps[];
  listTitle: string;
  listLogo: JSX.Element;
}

export default function Sidebar({ className, sidebarIsOpen }: SideBarProps) {
  const [openedDropdown, setOpenedDropdown] = React.useState<number>(-1);

  const sidebarLinkList: SidebarLinkList[] = [
    {
      listID: 1,
      linkList: [
        {
          title: "SubLink 1",
          path: "/somewhere",
          logo: <TvIcon className="h-5 w-5" />,
          sidebarIsOpen,
        },
        {
          title: "SubLink 2",
          path: "/somewhere2",
          logo: <TvIcon className="h-5 w-5" />,
          sidebarIsOpen,
        },
        {
          title: "SubLink 3",
          path: "/somewhere3",
          logo: <TvIcon className="h-5 w-5" />,
          sidebarIsOpen,
        },
      ],
      listLogo: <HomeIcon className="h-5 w-5" />,
      listTitle: "Home",
    },
    {
      listID: 2,
      linkList: [
        {
          title: "Link 1",
          path: "/home",
          logo: <TvIcon className="h-5 w-5" />,
          sidebarIsOpen,
        },
      ],
      listLogo: <HomeIcon />,
      listTitle: "Home",
    },
  ];

  return (
    <nav
      id="sidebar"
      className={`${
        className ? className : ""
      } z-20 flex flex-col bg-slate-500 text-xs shadow-[2px_38px_2px_0px_rgb(0,0,0,0.75)] shadow-black/30 md:text-sm`}
    >
      <div className="z-20 flex h-[48px] items-center justify-center border-b border-slate-300/50 p-2 shadow-[1px_2px_2px_0px_rgb(0,0,0,0.75)] shadow-black/30">
        {sidebarIsOpen && (
          <h2 className="hidden text-sm md:block">App Title</h2>
        )}
      </div>
      <div className="flex-1">
        {sidebarLinkList.map((link) => (
          <SidebarLinkList
            sidebarIsOpen={sidebarIsOpen}
            key={crypto.randomUUID()}
            listID={link.listID}
            linkList={link.linkList}
            listLogo={link.listLogo}
            listTitle={link.listTitle}
            dropdownIsOpen={openedDropdown === link.listID}
            setDropdownOpen={setOpenedDropdown}
          />
        ))}
      </div>
      <div className="mt-auto h-[80px] p-2">
        <img
          alt="Banner da Prefeitura de Mesquita"
          src="./banner192x64.png"
          className={`rounded-md shadow shadow-black/30 ${
            sidebarIsOpen ? "hidden md:block" : "hidden"
          }`}
        />
      </div>
    </nav>
  );
}
