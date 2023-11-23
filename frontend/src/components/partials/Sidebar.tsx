interface SideBarProps {
  className?: string;
}

export default function Sidebar({ className }: SideBarProps) {
  return (
    <nav
      id="sidebar"
      className={`${
        className ? className : ""
      } bg-slate-500 p-2 text-xs md:text-sm shadow-[2px_38px_2px_0px_rgb(0,0,0,0.75)] shadow-black/30 z-20`}
    >
      <h1 className="my-auto">Sidebar</h1>
    </nav>
  );
}
