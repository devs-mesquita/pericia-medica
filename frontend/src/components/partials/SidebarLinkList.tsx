import SidebarLink, { SidebarLinkProps } from "./SidebarLink";

interface SidebarLinkListProps {
  listLogo: JSX.Element;
  listTitle: string;
  linkList: SidebarLinkProps[];
}

export default function SidebarLinkList({
  linkList,
  listLogo,
  listTitle,
}: SidebarLinkListProps) {
  return linkList.length > 1 ? (
    <div className="flex p-2 items-center justify-center relative">
      {listLogo} <span className="ml-2">{listTitle}</span>
      <div className="absolute bg-slate-500 top-0 left-full w-[152px]">
        {linkList.map((link) => (
          <SidebarLink logo={link.logo} path={link.path} title={link.title} />
        ))}
      </div>
    </div>
  ) : (
    <SidebarLink
      logo={linkList[0].logo}
      path={linkList[0].path}
      title={linkList[0].title}
    />
  );
}
