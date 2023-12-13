export default function RegularNavbar() {
  return (
    <header
      id="navbar"
      className="relative z-20 flex items-center bg-slate-100 p-2 text-xs shadow-[1px_2px_2px_0px_rgb(0,0,0,0.75)] shadow-black/20 md:text-sm"
    >
      <div className="flex w-1/2 justify-center md:w-1/3">
        <img
          src="/banner192x64.png"
          alt="Banner da Prefeitura de Mesquita"
          className="w-[180px] rounded-lg shadow shadow-black/20 md:w-[192px] md:rounded-lg"
        />
      </div>
      <div className="w-1/2 md:w-1/3">
        <h1 className="text-center text-xl">Perícia Médica</h1>
      </div>
      <div className="md:w-1/3"></div>
    </header>
  );
}
