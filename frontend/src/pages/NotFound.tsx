import { HomeIcon } from "lucide-react";
import { Link } from "react-router-dom";

export default function NotFoundPage() {
  return (
    <div className="mx-auto mt-8 flex w-[300px] flex-col items-center rounded-lg p-4 shadow shadow-black/20 md:w-[500px]">
      <h1 className="text-lg font-semibold">Erro 404</h1>
      <p className="mb-4">A página não foi encontrada.</p>
      <Link
        to="/"
        className="flex items-center gap-2 rounded bg-blue-500 px-4 py-2 font-bold text-white shadow shadow-black/20 hover:bg-blue-600"
      >
        <HomeIcon className="h-5 w-5" /> Página Inicial
      </Link>
    </div>
  );
}
