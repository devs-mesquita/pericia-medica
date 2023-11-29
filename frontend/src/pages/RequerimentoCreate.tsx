import Footer from "@/components/partials/Footer";
export default function RequerimentoCreate() {
  return (
    <div className="flex min-h-[100vh] flex-col">
      <header
        id="navbar"
        className="relative z-20 flex items-center justify-between bg-slate-100 p-2 text-xs shadow-[1px_2px_2px_0px_rgb(0,0,0,0.75)] shadow-black/20 md:text-sm"
      >
        <div className="w-1/2 md:w-1/3">
          <img
            src="/banner192x64.png"
            alt="Banner da Prefeitura de Mesquita"
            className="rounded-lg shadow shadow-black/20"
          />
        </div>
        <div className="flex w-1/2 justify-center md:w-1/3">
          <a
            href="#"
            className="rounded-3xl bg-sky-500 p-2 text-base text-white shadow-md shadow-black/20 hover:bg-sky-600"
          >
            Manual de Utilização
          </a>
        </div>
        <div className="md:w-1/3"></div>
      </header>
      <div id="notifications" />
      <main
        id="content"
        className="flex flex-1 items-center justify-center bg-slate-100"
      >
        RequerimentoCreateForm
      </main>
      <Footer />
    </div>
  );
}
