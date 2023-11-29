import { ChevronDown, ChevronRight } from "lucide-react";
import SidebarLink, { SidebarLinkProps } from "./SidebarLink";

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
    <button
      className={`${
        sidebarIsOpen
          ? "w-[80px] flex-col py-2 md:w-[208px] md:py-0"
          : "w-[64px] text-xs md:py-2"
      } relative flex border-b border-slate-600/70 hover:bg-slate-400 md:w-full`}
      onClick={() => {
        setDropdownOpen((st) => {
          return st === listID ? -1 : listID;
        });
      }}
    >
      <div
        className={`flex w-full items-center ${
          sidebarIsOpen
            ? " mx-auto flex-col md:mx-0 md:flex-row md:justify-center md:px-2 md:py-4"
            : "mx-auto flex-col"
        }`}
      >
        {listLogo}{" "}
        <span className={`${sidebarIsOpen ? "ml-2" : "mt-1"}`}>
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
      </div>
      <div
        className={`
        ${dropdownIsOpen ? "block" : "hidden"}
        ${
          sidebarIsOpen
            ? "absolute left-full top-0 md:static"
            : "absolute left-full top-0"
        }
         bg-slate-500
        `}
      >
        {linkList.map((link, i) => (
          <SidebarLink
            className={`py-2 
            ${i === linkList.length - 1 ? "" : "border-b border-slate-600/70"}
            ${
              i === 0 && sidebarIsOpen
                ? "md:border-t"
                : "border-slate-600/70 md:border-l"
            }
            ${
              sidebarIsOpen
                ? "w-[208px] px-2 md:py-4 md:pl-6"
                : "justify-centertext-xs w-[104px] flex-col"
            }`}
            sidebarIsOpen={sidebarIsOpen}
            key={crypto.randomUUID()}
            logo={link.logo}
            path={link.path}
            title={link.title}
          />
        ))}
      </div>
    </button>
  ) : (
    <SidebarLink
      className="border-b border-slate-600/70"
      sidebarIsOpen={sidebarIsOpen}
      logo={linkList[0].logo}
      path={linkList[0].path}
      title={linkList[0].title}
    />
  );
}
