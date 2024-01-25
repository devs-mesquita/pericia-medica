import { ChevronDown, ChevronRight } from "lucide-react";
import SidebarLink, { SidebarLinkProps } from "./SidebarLink";
import { nanoid } from "nanoid";

interface SidebarLinkListProps {
  listID: number;
  listLogo: JSX.Element;
  listTitle: string;
  linkList: SidebarLinkProps[];
  dropdownIsOpen: boolean;
  setDropdownOpen: React.Dispatch<React.SetStateAction<number>>;
  sidebarIsOpen: boolean;
}

export default function SidebarLinkList({
  listID,
  linkList,
  listLogo,
  listTitle,
  dropdownIsOpen,
  setDropdownOpen,
  sidebarIsOpen,
}: SidebarLinkListProps) {
  return linkList.length > 1 ? (
    <div
      className={`${
        sidebarIsOpen
          ? "flex-col py-2 md:w-[208px] md:py-0"
          : "w-[64px] text-xs md:w-full"
      } ${
        dropdownIsOpen ? "bg-indigo-700/50" : ""
      } relative flex border-b border-slate-900 hover:bg-indigo-600/50`}
    >
      <button
        className={`flex w-full items-center text-xs md:py-2 ${
          sidebarIsOpen
            ? "mx-auto flex-col px-2 md:mx-0 md:flex-row md:justify-center md:py-4"
            : "mx-auto flex-col px-2"
        }`}
        onClick={() => {
          setDropdownOpen((st) => {
            return st === listID ? -1 : listID;
          });
        }}
      >
        {listLogo}{" "}
        <span className={`${sidebarIsOpen ? "mt-1 md:ml-2 md:mt-0" : "mt-1"}`}>
          {listTitle}
        </span>{" "}
        {sidebarIsOpen && (
          <>
            {dropdownIsOpen ? (
              <ChevronDown className="ml-auto hidden h-4 w-4 md:block" />
            ) : (
              <ChevronRight className="ml-auto hidden h-4 w-4 md:block" />
            )}
          </>
        )}
      </button>
      <div
        className={`
        ${dropdownIsOpen ? "block" : "hidden"}
        ${
          sidebarIsOpen
            ? "absolute left-full top-0 border border-slate-800 bg-slate-500 md:static md:border-0 md:bg-slate-500/50"
            : "absolute left-full top-0 border border-slate-800 bg-slate-500"
        }`}
      >
        {linkList.map((link, i) => (
          <SidebarLink
            className={`py-2 
            ${i === linkList.length - 1 ? "" : "border-b border-black/20"}
            ${
              i === 0 && sidebarIsOpen
                ? "md:border-t"
                : "border-black/20 md:border-l"
            }
            ${
              sidebarIsOpen
                ? "w-[104px] px-2 md:w-[208px] md:py-4 md:pl-6"
                : "w-[104px] flex-col"
            }`}
            sidebarIsOpen={sidebarIsOpen}
            key={nanoid()}
            logo={link.logo}
            path={link.path}
            title={link.title}
          />
        ))}
      </div>
    </div>
  ) : (
    <SidebarLink
      className="border-b border-black/20"
      sidebarIsOpen={sidebarIsOpen}
      logo={linkList[0].logo}
      path={linkList[0].path}
      title={linkList[0].title}
    />
  );
}
