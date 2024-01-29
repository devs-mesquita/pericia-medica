import * as React from "react";
import { useAuthHeader } from "react-auth-kit";
import { FileInputIcon, LoaderIcon, Space } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { useAtom } from "jotai";
import { notificationAtom } from "@/store";
import { format } from "date-fns";
import DatePicker from "@/components/ui/datepicker";
import { nanoid } from "nanoid";

const API_URL = import.meta.env.VITE_API_URL;

type Realocacao = {
  direcionamento_id: number;
  realocar: boolean;
  manter_horario: boolean;
  novo_horario: string;
};

type RealocacaoAPIResponse = {
  realocacoes: Realocacao[];
};

type RealocarRequerimentosResponse = {
  message: string;
};

type RealocacaoForm = {
  justificativa_realocacao: string;
  realocacoes: Realocacao[];
};

export default function RequerimentoRealocacaoPage() {
  document.title = "Realocação de Requerimentos";
  const authHeader = useAuthHeader();
  const navigate = useNavigate();
  const setNotification = useAtom(notificationAtom)[1];
  const queryClient = useQueryClient();

  const [dataCancelada, setDataCancelada] = React.useState<Date | undefined>(
    undefined,
  );
  const [novaData, setNovaData] = React.useState<Date | undefined>(undefined);
  const [justificativa, setJustificativa] = React.useState<string>("");
  const [realocacoes, setRealocacoes] = React.useState<Realocacao[]>([]);

  const realocarRequerimentosMutation = useMutation({
    mutationFn: async (data: RealocacaoForm) => {
      const res = await fetch(`${API_URL}/api/requerimentos/realocacao`, {
        method: "POST",
        body: JSON.stringify({ ...data, _method: "PATCH" }),
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: authHeader(),
        },
      });

      if (!res.ok) {
        throw await res.json();
      }

      return (await res.json()) as RealocarRequerimentosResponse;
    },
    onSuccess: () => {
      setNotification({
        message: "Os requerimentos foram realocados com sucesso.",
        type: "success",
      });
      queryClient.invalidateQueries({ queryKey: ["requerimentos"] });
      navigate("/requerimentos");
    },
    onError: (error) => {
      console.log(error);
      setNotification({
        message: "Ocorreu um erro.",
        type: "error",
      });
    },
  });

  const handleSubmit = (evt: React.FormEvent<HTMLFormElement>) => {
    evt.preventDefault();
    realocarRequerimentosMutation.mutate({
      justificativa_realocacao: justificativa,
      realocacoes,
    });
  };

  const { data, isFetching, refetch } = useQuery({
    initialData: { realocacoes: [] },
    enabled: false,
    queryKey: ["requerimentos", "realocacao"],
    queryFn: async () => {
      if (!dataCancelada) return { realocacoes: [] } as RealocacaoAPIResponse;

      const res = await fetch(
        `${API_URL}/api/requerimentos/realocacao?${new URLSearchParams({
          dataCancelada: format(dataCancelada, "yyyy-LL-dd"),
        }).toString()}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: authHeader(),
          },
        },
      );

      if (!res.ok) {
        throw await res.json();
      }

      return (await res.json()) as RealocacaoAPIResponse;
    },
    staleTime: Infinity,
  });

  React.useEffect(() => {
    const interv = setTimeout(() => {
      refetch();
    }, 500);

    return () => {
      clearTimeout(interv);
    };
  }, [dataCancelada]);

  React.useEffect(() => {
    if (data?.realocacoes) {
      setRealocacoes(data.realocacoes);
    }
  }, [data]);

  return (
    <div className="flex flex-1 flex-col rounded-md bg-slate-100 p-2 pt-1 shadow shadow-black/20">
      <h1 className="mb-2 flex items-center justify-center border-b-2 border-slate-300 py-3">
        <FileInputIcon className="h-5 w-5" />
        <span className="ml-2 font-semibold">Realocação de Requerimentos</span>
      </h1>
      <form
        onSubmit={handleSubmit}
        className="flex flex-1 flex-col rounded border border-slate-300 py-3"
      >
        <div className="flex flex-1 flex-col gap-4 px-4">
          <div className="flex flex-col items-start gap-1">
            <label htmlFor="name" className="font-semibold">
              Data a ser cancelada:
            </label>
            <DatePicker
              date={dataCancelada}
              setDate={setDataCancelada}
              disabled={realocarRequerimentosMutation.isPending || isFetching}
            />
          </div>
          <div className="grid grid-cols-5 border-b-2 border-slate-300 pb-2 font-semibold">
            <h2>Direcionamento</h2>
            <h2>Quantidade</h2>
            <h2>Realocar requerimentos?</h2>
            <h2>Manter horários?</h2>
            <h2>Novo horário</h2>
          </div>
          <div className="grid grid-cols-5">
            {data.realocacoes.length > 0 ? (
              data.realocacoes.map((realocacao) => (
                <div key={nanoid()} className="col-span-5 grid grid-cols-5">
                  <p>1</p>
                  <p>2</p>
                  <p>3</p>
                  <p>4</p>
                  <p>5</p>
                </div>
              ))
            ) : (
              <span className="col-span-5 mt-4 justify-self-center">
                Selecione uma data a ser cancelada.
              </span>
            )}
          </div>
          <div className="mt-auto flex gap-6">
            <div className="flex flex-col items-start gap-1">
              <label htmlFor="name" className="font-semibold">
                Nova data de atendimento:
              </label>
              <DatePicker
                date={novaData}
                setDate={setNovaData}
                disabled={(date) => {
                  return (
                    date < new Date() ||
                    realocarRequerimentosMutation.isPending ||
                    isFetching ||
                    data.realocacoes.length === 0
                  );
                }}
              />
            </div>
            <div className="flex flex-col items-start gap-1">
              <label htmlFor="name" className="font-semibold">
                Motivo da Realocação:
              </label>
              <textarea
                id="justificativa"
                name="justificativa"
                placeholder="A justificativa será inclusa no email."
                className="w-full resize-none rounded border border-slate-300 p-2 text-sm disabled:cursor-not-allowed"
                value={justificativa}
                onChange={(evt) => {
                  setJustificativa(evt.target.value);
                }}
                disabled={
                  realocarRequerimentosMutation.isPending ||
                  isFetching ||
                  data.realocacoes.length === 0
                }
                rows={1}
                cols={40}
              />
            </div>
            {realocarRequerimentosMutation.isPending ? (
              <button
                type="button"
                disabled
                className="min-w-[120px] cursor-wait self-end rounded bg-green-400 px-3 py-2 text-center font-semibold text-white"
              >
                <LoaderIcon className="mx-auto animate-spin self-end text-white duration-2000" />
              </button>
            ) : (
              <button
                type="submit"
                className="min-w-[120px] self-end rounded bg-green-500 px-3 py-2 text-center font-semibold text-white hover:bg-green-600"
              >
                ENVIAR
              </button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}
