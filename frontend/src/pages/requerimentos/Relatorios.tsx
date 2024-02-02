import * as React from "react";
import { FileDownIcon, LoaderIcon } from "lucide-react";
import { format } from "date-fns";
import DateRangePicker from "@/components/ui/daterangepicker";
import { useMutation } from "@tanstack/react-query";
import { DateRange } from "react-day-picker";
import { useAuthHeader } from "react-auth-kit";
import { useAtom } from "jotai";
import { notificationAtom } from "@/store";
import { Requerimento } from "@/types/interfaces";
import requerimentoToPDF from "@/lib/requerimentoPDF";

const API_URL = import.meta.env.VITE_API_URL;

type RelatorioMutationResponse = {
  requerimentos: Requerimento[];
  from: string;
  to: string;
};

export default function RequerimentoRelatoriosPage() {
  document.title = "Relatórios";

  const authHeader = useAuthHeader();

  const setNotification = useAtom(notificationAtom)[1];

  const [dateRange, setDateRange] = React.useState<DateRange | undefined>({
    from: undefined,
    to: undefined,
    /* from: new Date(2024, 0, 1),
    to: addDays(new Date(2024, 0, 31), 20), */
  });

  const relatorioMutation = useMutation({
    mutationFn: async (dateRange: { from: Date; to: Date }) => {
      const res = await fetch(`${API_URL}/api/requerimentos/relatorio`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: authHeader(),
        },
        body: JSON.stringify({
          from: `${format(dateRange.from, "yyyy-LL-dd")}`,
          to: `${format(dateRange.to, "yyyy-LL-dd")}`,
        }),
      });

      if (!res.ok) {
        throw await res.json();
      }

      return (await res.json()) as RelatorioMutationResponse;
    },
    onSuccess: (data) => {
      console.log(data);
      requerimentoToPDF({
        requerimentos: data.requerimentos,
        from: new Date(data.from),
        to: new Date(data.from),
      });
    },
    onError: (err) => {
      console.log(err);
      setNotification({
        message: "Ocorreu um erro.",
        type: "error",
      });
    },
  });

  const handleSubmit = (evt: React.FormEvent) => {
    evt.preventDefault();
    if (!dateRange) {
      setNotification({
        message: "Selecione o intervalo de datas.",
        type: "error",
      });
      return;
    }

    const { from, to } = dateRange;

    if (!from || !to) {
      setNotification({
        message: "Selecione o intervalo de datas.",
        type: "error",
      });
      return;
    }

    relatorioMutation.mutate({ from, to });
  };

  return (
    <div className="flex flex-col rounded-md bg-slate-100 p-2 pt-1 shadow shadow-black/20">
      <h1 className="mb-2 flex items-center justify-center border-b-2 border-slate-300 py-3">
        <FileDownIcon className="h-5 w-5" />
        <span className="ml-2 font-semibold">Relatórios</span>
      </h1>
      <form
        onSubmit={handleSubmit}
        className="flex flex-1 flex-col rounded border border-slate-300 p-4"
      >
        <div className="flex gap-4">
          <div className="flex flex-col items-start gap-1">
            <label htmlFor="name" className="font-semibold">
              Selecione o intervalo:
            </label>
            <DateRangePicker
              disabled={() => {
                return relatorioMutation.isPending;
              }}
              date={dateRange}
              setDate={setDateRange}
            />
          </div>
          {relatorioMutation.isPending ? (
            <button
              type="button"
              disabled
              className="min-w-[120px] cursor-wait self-end rounded bg-green-400 px-3 py-2 text-center font-semibold text-white"
            >
              <LoaderIcon className="mx-auto animate-spin self-end text-white duration-2000" />
            </button>
          ) : (
            <button
              title="Exportar relatórios."
              type="submit"
              className="min-w-[120px] self-end rounded bg-green-500 px-3 py-2 text-center font-semibold text-white hover:bg-green-600"
            >
              EXPORTAR
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
