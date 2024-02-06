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
import { useSignOut, useAuthUser } from "react-auth-kit";
import { AuthUser } from "@/types/interfaces";

interface SideBarProps {
  className?: string;
  sidebarIsOpen: boolean;
}

interface SidebarLinkList {
  listID: number;
  linkList: SidebarLinkProps[];
  listTitle: string;
  listLogo: JSX.Element;
  disabled?: boolean;
}

export default function Sidebar({ className, sidebarIsOpen }: SideBarProps) {
  const [openedDropdown, setOpenedDropdown] = React.useState<number>(-1);

  const signOut = useSignOut();

  const authUserFn = useAuthUser();
  const authState = authUserFn() as AuthUser;

  const sidebarLinkList: SidebarLinkList[] = [
    {
      listID: 1,
      linkList: [
        {
          title: "Home",
          path: "/home",
          logo: <HomeIcon className="h-5 w-5" />,
          sidebarIsOpen,
        },
      ],
      listLogo: <HomeIcon />,
      listTitle: "Home",
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
          title: "Relatórios",
          path: "/requerimentos/relatorios",
          logo: <FileDownIcon className="h-5 w-5" />,
          sidebarIsOpen,
        },
      ],
      listLogo: <FolderOpenIcon className="h-5 w-5" />,
      listTitle: "Requerimentos",
    },
    {
      disabled: !["Admin", "Super-Admin"].includes(authState?.user.role || ""),
      listID: 3,
      linkList: [
        {
          title: "Direcionamentos",
          path: "/direcionamentos",
          logo: <SendIcon className="h-5 w-5" />,
          sidebarIsOpen,
        },
        {
          title: "Realocação",
          path: "/requerimentos/realocacao",
          logo: <FileInputIcon className="h-5 w-5" />,
          sidebarIsOpen,
        },
        {
          title: "Usuários",
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
        <h2 className="text-sm font-bold tracking-wide md:block">
          Perícia Médica
        </h2>
      </div>
      <div className="flex-1 font-semibold">
        {sidebarLinkList.map((link) =>
          !link.disabled ? (
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
          ) : null,
        )}
        <button
          className={`flex hover:bg-indigo-600/50 ${className || ""} ${
            sidebarIsOpen
              ? "w-full flex-col p-2 text-xs md:w-[208px] md:flex-row md:py-4"
              : "flex-col p-2 text-xs md:w-full"
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
      <div className="mt-auto flex justify-center p-2">
        <picture>
          <source media="(max-width: 767px)" srcSet="/logo192.png" />
          <source
            media="(min-width: 768px)"
            srcSet={sidebarIsOpen ? "/banner192x64.png" : "/logo192.png"}
          />
          <img
            alt="Logotipo da Prefeitura Municipal de Mesquita"
            className={sidebarIsOpen ? "w-[80px] md:w-full" : "w-[80px]"}
          />
        </picture>
      </div>
    </nav>
  );
}
