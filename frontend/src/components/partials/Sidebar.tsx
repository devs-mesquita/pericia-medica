import React from "react";
import {
  HomeIcon,
  FolderOpenIcon,
  LogOutIcon,
  ArchiveIcon,
  BookUserIcon,
  FileDownIcon,
  FileBarChart2Icon,
  SettingsIcon,
  SendIcon,
  FileInputIcon,
} from "lucide-react";
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
          title: "Principal",
          path: "/home",
          logo: <HomeIcon className="h-5 w-5" />,
          sidebarIsOpen,
        },
      ],
      listLogo: <HomeIcon />,
      listTitle: "Principal",
    },
    {
      listID: 2,
      linkList: [
        {
          title: "Em Análise",
          path: "/requerimentos",
          logo: <FileBarChart2Icon className="h-5 w-5" />,
          sidebarIsOpen,
        },
        {
          title: "Agenda Diária",
          path: "/requerimentos/diario",
          logo: <BookUserIcon className="h-5 w-5" />,
          sidebarIsOpen,
        },
        {
          title: "Arquivados",
          path: "/requerimentos/arquivo",
          logo: <ArchiveIcon className="h-5 w-5" />,
          sidebarIsOpen,
        },
        {
          title: "Relatório",
          path: "/requerimentos/relatorio",
          logo: <FileDownIcon className="h-5 w-5" />,
          sidebarIsOpen,
        },
      ],
      listLogo: <FolderOpenIcon className="h-5 w-5" />,
      listTitle: "Requerimentos",
    },
    {
      listID: 3,
      linkList: [
        {
          title: "Direcionamentos",
          path: "/direcionamentos",
          logo: <SendIcon className="h-5 w-5" />,
          sidebarIsOpen,
        },
        {
          title: "Reagendamento",
          path: "/requerimentos/reagendamento",
          logo: <FileInputIcon className="h-5 w-5" />,
          sidebarIsOpen,
        },
        {
          title: "Funcionários",
          path: "/users",
          logo: <BookUserIcon className="h-5 w-5" />,
          sidebarIsOpen,
        },
      ],
      listLogo: <SettingsIcon className="h-5 w-5" />,
      listTitle: "Administração",
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
      <div className="flex-1 font-semibold">
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
