import * as React from "react";
import { useAuthHeader } from "react-auth-kit";
import { useQuery } from "@tanstack/react-query";
import { Reagendamento, Requerimento } from "@/types/interfaces";
import { LoaderIcon } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL;

type RequerimentoIndexResponse = {
  requerimentos: Requerimento[];
  reagendamentos: Reagendamento[];
  requerimentosRealocados: Requerimento[];
  reagendamentosRealocados: Reagendamento[];
};

export default function HomePage() {
  document.title = "Perícia Médica";

  const authHeader = useAuthHeader();

  const { data } = useQuery({
    queryKey: ["requerimentos", "index"],
    queryFn: async () => {
      const res = await fetch(`${API_URL}/api/requerimentos`, {
        method: "GET",
        headers: {
          Authorization: authHeader(),
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      });

      if (!res.ok) {
        throw await res.json();
      }

      return (await res.json()) as RequerimentoIndexResponse;
    },
  });

  React.useEffect(() => {
    console.log(data);
  }, [data]);

  return (
    <div className="grid place-items-stretch gap-4 p-2 md:grid-cols-2 md:p-0 lg:grid-cols-3">
      <div className="col-span-full flex flex-col items-center gap-2 rounded bg-slate-100 p-4 shadow shadow-black/20">
        <h1 className="text-3xl font-bold">REQUERIMENTOS</h1>
      </div>
      {/* Totals */}
      <div className="col-span-full flex flex-col items-center gap-2 rounded bg-slate-100 p-4 shadow shadow-black/20">
        <h2 className="md:text-md text-center text-xl font-bold lg:text-xl">
          TOTAL
        </h2>
        <p className="my-auto self-center text-8xl font-semibold md:text-7xl lg:text-8xl">
          {data ? (
            data.requerimentos.length + data.reagendamentos.length
          ) : (
            <LoaderIcon className="animate-spin text-slate-700 duration-2000" />
          )}
        </p>
        <div className="flex w-full flex-col items-start  justify-center gap-2 md:flex-row lg:gap-6">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-500">
            <span className="rounded-full bg-slate-500 p-2"></span>
            Em Análise
          </div>
          <div className="flex items-center gap-2 text-sm font-semibold text-blue-500">
            <span className="rounded-full bg-blue-500 p-2"></span>
            Aguardando Confirmação
          </div>
          <div className="flex items-center gap-2 text-sm font-semibold text-green-500">
            <span className="rounded-full bg-green-500 p-2"></span>
            Confirmados
          </div>
          <div className="flex items-center gap-2 text-sm font-semibold text-red-500">
            <span className="rounded-full bg-red-500 p-2"></span>
            Recusados
          </div>
        </div>
      </div>
      <div className="flex aspect-[3.5/2] flex-col items-center gap-2 rounded bg-slate-100 p-6 shadow shadow-black/20">
        <h2 className="md:text-md text-center text-xl font-bold lg:text-xl">
          ATIVOS
        </h2>
        <p className="my-auto self-center text-8xl font-semibold md:text-7xl lg:text-8xl">
          {data ? (
            data.requerimentos.filter(
              (r) =>
                r.status === "em-analise" ||
                r.status === "aguardando-confirmacao",
            ).length +
            data.reagendamentos.filter(
              (r) =>
                r.status === "em-analise" ||
                r.status === "aguardando-confirmacao",
            ).length
          ) : (
            <LoaderIcon className="animate-spin text-slate-700 duration-2000" />
          )}
        </p>
        <div className="flex w-full flex-col items-start  justify-center gap-2 lg:flex-row lg:gap-6">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-500">
            <span className="rounded-full bg-slate-500 p-2"></span>
            Em Análise
          </div>
          <div className="flex items-center gap-2 text-sm font-semibold text-blue-500">
            <span className="rounded-full bg-blue-500 p-2"></span>
            Aguardando Confirmação
          </div>
        </div>
      </div>
      <div className="flex aspect-[3.5/2] flex-col items-center gap-2 rounded bg-slate-100 p-6 shadow shadow-black/20">
        <h2 className="md:text-md text-center text-xl font-bold lg:text-xl">
          ARQUIVADOS
        </h2>
        <p className="my-auto self-center text-8xl font-semibold md:text-7xl lg:text-8xl">
          {data ? (
            data.requerimentos.filter(
              (r) => r.status === "confirmado" || r.status === "recusado",
            ).length +
            data.reagendamentos.filter(
              (r) => r.status === "confirmado" || r.status === "recusado",
            ).length
          ) : (
            <LoaderIcon className="animate-spin text-slate-700 duration-2000" />
          )}
        </p>
        <div className="flex w-full flex-col items-start  justify-center gap-2 lg:flex-row lg:gap-6">
          <div className="flex items-center gap-2 text-sm font-semibold text-green-500">
            <span className="rounded-full bg-green-500 p-2"></span>
            Confirmados
          </div>
          <div className="flex items-center gap-2 text-sm font-semibold text-red-500">
            <span className="rounded-full bg-red-500 p-2"></span>
            Recusados
          </div>
        </div>
      </div>
      {/* Singles */}
      <div className="flex aspect-[3.5/2] flex-col items-center gap-2 rounded bg-slate-100 p-6 text-slate-700 shadow shadow-black/20">
        <h2 className="md:text-md text-center text-xl font-bold lg:text-xl">
          EM ANÁLISE
        </h2>
        <p className="my-auto self-center text-8xl font-semibold md:text-7xl lg:text-8xl">
          {data ? (
            data.requerimentos.filter((r) => r.status === "em-analise").length +
            data.reagendamentos.filter((r) => r.status === "em-analise").length
          ) : (
            <LoaderIcon className="animate-spin text-slate-700 duration-2000" />
          )}
        </p>
      </div>
      <div className="flex aspect-[3.5/2] flex-col items-center gap-2 rounded bg-slate-100 p-6 text-blue-600 shadow shadow-black/20">
        <h2 className="md:text-md text-center text-xl font-bold lg:text-xl">
          AGUARDANDO CONFIRMAÇÃO
        </h2>
        <p className="my-auto self-center text-8xl font-semibold md:text-7xl lg:text-8xl">
          {data ? (
            data.requerimentos.filter(
              (r) => r.status === "aguardando-confirmacao",
            ).length +
            data.reagendamentos.filter(
              (r) => r.status === "aguardando-confirmacao",
            ).length
          ) : (
            <LoaderIcon className="animate-spin text-slate-700 duration-2000" />
          )}
        </p>
      </div>
      <div className="flex aspect-[3.5/2] flex-col items-center gap-2 rounded bg-slate-100 p-6 text-green-600 shadow shadow-black/20">
        <h2 className="md:text-md text-center text-xl font-bold lg:text-xl">
          CONFIRMADOS
        </h2>
        <p className="my-auto self-center text-8xl font-semibold md:text-7xl lg:text-8xl">
          {data ? (
            data.requerimentos.filter((r) => r.status === "confirmado").length +
            data.reagendamentos.filter((r) => r.status === "confirmado").length
          ) : (
            <LoaderIcon className="animate-spin text-slate-700 duration-2000" />
          )}
        </p>
      </div>
      <div className="flex aspect-[3.5/2] flex-col items-center gap-2 rounded bg-slate-100 p-6 text-red-600 shadow shadow-black/20">
        <h2 className="md:text-md text-center text-xl font-bold lg:text-xl">
          RECUSADOS
        </h2>
        <p className="my-auto self-center text-8xl font-semibold md:text-7xl lg:text-8xl">
          {data ? (
            data.requerimentos.filter((r) => r.status === "recusado").length +
            data.reagendamentos.filter((r) => r.status === "recusado").length
          ) : (
            <LoaderIcon className="animate-spin text-slate-700 duration-2000" />
          )}
        </p>
      </div>
      {/* Reagendamentos */}
      <div className="col-span-full flex flex-col items-center gap-2 rounded bg-slate-100 p-4 shadow shadow-black/20">
        <h1 className="text-3xl font-bold">REAGENDAMENTOS / REALOCAÇÕES</h1>
      </div>
      <div className="col-span-full flex flex-col items-center gap-2 rounded bg-slate-100 p-4 shadow shadow-black/20">
        <h2 className="md:text-md text-center text-xl font-bold lg:text-xl">
          TOTAL
        </h2>
        <p className="my-auto self-center text-8xl font-semibold md:text-7xl lg:text-8xl">
          {data ? (
            data.requerimentosRealocados.length +
            data.reagendamentosRealocados.length
          ) : (
            <LoaderIcon className="animate-spin text-slate-700 duration-2000" />
          )}
        </p>
        <div className="flex w-full flex-col items-start  justify-center gap-2 md:flex-row lg:gap-6">
          <div className="flex items-center gap-2 text-sm font-semibold text-amber-500">
            <span className="rounded-full bg-amber-500 p-2"></span>
            Reagendamentos Solicitados
          </div>
          <div className="flex items-center gap-2 text-sm font-semibold text-roxo-lighter">
            <span className="rounded-full bg-roxo-lighter p-2"></span>
            Realocados
          </div>
        </div>
      </div>
      <div className="flex aspect-[3.5/2] flex-col items-center gap-2 rounded bg-slate-100 p-6 text-amber-600 shadow shadow-black/20">
        <h2 className="md:text-md text-center text-xl font-bold lg:text-xl">
          REAGENDAMENTOS SOLICITADOS
        </h2>
        <p className="my-auto self-center text-8xl font-semibold md:text-7xl lg:text-8xl">
          {data ? (
            data.requerimentosRealocados.filter(
              (r) => r.status === "reagendamento-solicitado",
            ).length +
            data.reagendamentosRealocados.filter(
              (r) => r.status === "reagendamento-solicitado",
            ).length
          ) : (
            <LoaderIcon className="animate-spin text-slate-700 duration-2000" />
          )}
        </p>
      </div>
      <div className="flex aspect-[3.5/2] flex-col items-center gap-2 rounded bg-slate-100 p-6 text-roxo-lighter shadow shadow-black/20">
        <h2 className="md:text-md text-center text-xl font-bold lg:text-xl">
          REALOCADOS
        </h2>
        <p className="my-auto self-center text-8xl font-semibold md:text-7xl lg:text-8xl">
          {data ? (
            data.requerimentosRealocados.filter(
              (r) => r.status === "reagendamento-solicitado",
            ).length +
            data.reagendamentosRealocados.filter(
              (r) => r.status === "reagendamento-solicitado",
            ).length
          ) : (
            <LoaderIcon className="animate-spin text-slate-700 duration-2000" />
          )}
        </p>
      </div>
    </div>
  );
}
