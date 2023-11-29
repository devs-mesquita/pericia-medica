export default function RegularNavbar() {
  return (
    <header
      id="navbar"
      className="relative z-20 flex items-center bg-slate-100 p-2 text-xs shadow-[1px_2px_2px_0px_rgb(0,0,0,0.75)] shadow-black/20 md:text-sm"
    >
      <div className="w-1/2 md:w-1/3">
        <img
          src="/banner-hq.png"
          alt="Banner da Prefeitura de Mesquita"
          className="w-[180px] rounded-lg shadow shadow-black/20 md:w-[225px] md:rounded-lg"
        />
      </div>
      <div className="w-1/2 md:w-1/3">
        <h1 className="text-center text-xl">Perícia Médica</h1>
      </div>
      <div className="md:w-1/3"></div>
    </header>
  );
}
