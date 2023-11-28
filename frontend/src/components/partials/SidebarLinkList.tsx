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
        sidebarIsOpen ? "w-[208px] flex-col" : "w-[64px] p-2 text-xs"
      } relative flex w-full border-b border-slate-600/70 hover:bg-slate-400`}
      onClick={() => {
        setDropdownOpen((st) => {
          return st === listID ? -1 : listID;
        });
      }}
    >
      <div
        className={`flex w-full items-center justify-center ${
          sidebarIsOpen ? "px-2 py-4" : "mx-auto flex-col"
        }`}
      >
        {listLogo}{" "}
        <span className={`${sidebarIsOpen ? "ml-2" : "mt-1"}`}>
          {listTitle}
        </span>{" "}
        {sidebarIsOpen && (
          <>
            {dropdownIsOpen ? (
              <ChevronDown className="ml-auto h-4 w-4" />
            ) : (
              <ChevronRight className="ml-auto h-4 w-4" />
            )}
          </>
        )}
      </div>
      <div
        className={`
        ${dropdownIsOpen ? "block" : "hidden"}
        ${sidebarIsOpen ? "static" : "absolute left-full top-0"}
         bg-slate-500
        `}
      >
        {linkList.map((link, i) => (
          <SidebarLink
            className={`py-2 ${
              i === linkList.length - 1 ? "" : "border-b border-slate-600/70"
            } ${i === 0 && sidebarIsOpen ? "border-t" : "border-l border-slate-600/70"} ${
              sidebarIsOpen
                ? "w-[208px] px-2 py-4 pl-6"
                : "w-[104px] flex-col justify-center p-2 text-xs"
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
