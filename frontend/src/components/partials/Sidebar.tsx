import React from "react";
import { HomeIcon, TvIcon, LogOutIcon } from "lucide-react";
import { SidebarLinkProps } from "./SidebarLink";
import SidebarLinkList from "./SidebarLinkList";
import { nanoid } from "nanoid";
import { useSignOut } from "react-auth-kit";

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

  const signOut = useSignOut();

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
      } z-20 flex flex-col bg-roxo text-xs text-white shadow-[2px_38px_2px_0px_rgb(0,0,0,0.75)] shadow-black/30 md:text-sm`}
    >
      <div className="z-20 flex h-[48px] items-center justify-center border-b border-black/20 p-2 shadow-[1px_2px_2px_0px_rgb(0,0,0,0.75)] shadow-black/30">
        {sidebarIsOpen && (
          <h2 className="hidden text-sm font-bold tracking-wide md:block">
            Perícia Médica
          </h2>
        )}
      </div>
      <div className="flex-1">
        {sidebarLinkList.map((link) => (
          <SidebarLinkList
            sidebarIsOpen={sidebarIsOpen}
            key={nanoid()}
            listID={link.listID}
            linkList={link.linkList}
            listLogo={link.listLogo}
            listTitle={link.listTitle}
            dropdownIsOpen={openedDropdown === link.listID}
            setDropdownOpen={setOpenedDropdown}
          />
        ))}
        <button
          className={`flex hover:bg-black/10 ${className || ""} ${
            sidebarIsOpen
              ? "w-[80px] flex-col p-2 text-xs md:w-[208px] md:flex-row md:px-2 md:py-4"
              : "w-[80px] flex-col p-2 text-xs"
          } items-center`}
          onClick={signOut}
        >
          <LogOutIcon className="h-5 w-5" />
          <span
            className={`${sidebarIsOpen ? "mt-1 md:ml-2 md:mt-0" : "mt-1"}`}
          >
            Sair do Sistema
          </span>
        </button>
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
