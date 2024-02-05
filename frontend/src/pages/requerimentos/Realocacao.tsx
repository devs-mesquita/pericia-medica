import * as React from "react";
import { useAuthHeader } from "react-auth-kit";
import { FileInputIcon, LoaderIcon } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { useAtom } from "jotai";
import { notificationAtom } from "@/store";
import { format } from "date-fns";
import DatePicker from "@/components/ui/datepicker";
import { nanoid } from "nanoid";
import TimePicker from "@/components/ui/timepicker";

const API_URL = import.meta.env.VITE_API_URL;

type Realocacao = {
  direcionamento_id: number;
  direcionamento_name: string;
  realocar: boolean;
  manterHorario: boolean;
  novoHorario: string;
  quantidade: number;
};

type RealocacoesObject = Record<number, Realocacao>;

type RealocacaoAPIResponse = {
  realocacoes: Pick<
    Realocacao,
    "direcionamento_id" | "direcionamento_name" | "quantidade"
  >[];
};

type RealocarRequerimentosResponse = {
  message: string;
};

type RealocacaoForm = {
  justificativaRealocacao: string;
  novaData: string;
  dataCancelada: string;
  realocacoes: RealocacoesObject;
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
  const [justificativaOutro, setJustificativaOutro] =
    React.useState<string>("");
  const [realocacoes, setRealocacoes] = React.useState<RealocacoesObject>({});

  const realocarRequerimentosMutation = useMutation({
    mutationFn: async (data: RealocacaoForm) => {
      const res = await fetch(`${API_URL}/api/realocacao`, {
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

    if (!dataCancelada) {
      setNotification({
        message: "Selecione a data a ser cancelada.",
        type: "warning",
      });
      return;
    }

    if (!novaData) {
      setNotification({
        message: "Selecione a nova data de atendimento.",
        type: "warning",
      });
      return;
    }

    if (Object.keys(realocacoes).length === 0) {
      setNotification({
        message:
          "Nenhum registro foi encontrado, selecione a data a ser cancelada.",
        type: "warning",
      });
      return;
    }

    realocarRequerimentosMutation.mutate({
      dataCancelada: format(dataCancelada, "yyyy-LL-dd"),
      novaData: format(novaData, "yyyy-LL-dd"),
      justificativaRealocacao:
        justificativa === "outro" ? justificativaOutro : justificativa,
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
        `${API_URL}/api/realocacao?${new URLSearchParams({
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
    refetch();
  }, [dataCancelada]);

  React.useEffect(() => {
    if (data?.realocacoes) {
      const formattedRealocacoes: RealocacoesObject = {};

      for (const realocacao of data.realocacoes) {
        if (!formattedRealocacoes[realocacao.direcionamento_id]) {
          formattedRealocacoes[realocacao.direcionamento_id] = {
            direcionamento_id: 0,
            direcionamento_name: "",
            manterHorario: true,
            novoHorario: "",
            quantidade: 0,
            realocar: true,
          };
        }

        formattedRealocacoes[realocacao.direcionamento_id].direcionamento_id =
          realocacao.direcionamento_id;
        formattedRealocacoes[realocacao.direcionamento_id].direcionamento_name =
          realocacao.direcionamento_name;
        formattedRealocacoes[realocacao.direcionamento_id].quantidade +=
          realocacao.quantidade;
      }

      setRealocacoes(formattedRealocacoes);
    }
  }, [data]);

  return (
    <div className="flex flex-col rounded-md bg-slate-100 p-2 pt-1 shadow shadow-black/20">
      <h1 className="mb-2 flex items-center justify-center border-b-2 border-slate-300 py-3">
        <FileInputIcon className="h-5 w-5" />
        <span className="ml-2 font-semibold">Realocação de Requerimentos</span>
      </h1>
      <form
        onSubmit={handleSubmit}
        className="flex flex-1 flex-col rounded border border-slate-300 py-3"
      >
        <div className="flex flex-1 flex-col">
          <div className="mb-6 flex flex-col items-start gap-1 px-4">
            <label htmlFor="name" className="font-semibold">
              Data a ser cancelada:
            </label>
            <DatePicker
              date={dataCancelada}
              setDate={setDataCancelada}
              disabled={realocarRequerimentosMutation.isPending || isFetching}
            />
          </div>
          <div className="mb-6 flex flex-col items-start gap-6 px-4 lg:flex-row">
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
                    Object.keys(realocacoes).length === 0
                  );
                }}
              />
            </div>
            <div className="flex flex-col items-start gap-1">
              <label htmlFor="name" className="font-semibold">
                Motivo da Realocação:
              </label>
              <select
                required
                name="justificativa"
                id="justificativa"
                defaultValue={justificativa}
                onChange={(evt) => {
                  setJustificativa(evt.target.value);
                }}
                className="w-full resize-none rounded border border-slate-300 p-2 text-sm disabled:cursor-not-allowed"
                disabled={
                  realocarRequerimentosMutation.isPending ||
                  isFetching ||
                  Object.keys(realocacoes).length === 0
                }
              >
                <option value="">Selecione</option>
                <option value="Horário Alterado">Horário Alterado</option>
                <option value="outro">Outro</option>
              </select>
              {justificativa === "outro" ? (
                <textarea
                  required={justificativa === "outro"}
                  id="justificativaOutro"
                  name="justificativaOutro"
                  placeholder="A justificativa será inclusa no email."
                  className="w-full resize-none rounded border border-slate-300 p-2 text-sm disabled:cursor-not-allowed"
                  value={justificativaOutro}
                  onChange={(evt) => {
                    setJustificativaOutro(evt.target.value);
                  }}
                  disabled={
                    justificativa !== "outro" ||
                    realocarRequerimentosMutation.isPending ||
                    isFetching ||
                    Object.keys(realocacoes).length === 0
                  }
                  rows={1}
                  cols={40}
                />
              ) : null}
            </div>
          </div>
          <div className="mb-2 grid grid-cols-5 justify-items-center border-y-2 border-slate-300 px-4 py-2 font-semibold">
            <h2 className="justify-self-start">Direcionamento</h2>
            <h2>Quantidade</h2>
            <h2>Realocar requerimentos?</h2>
            <h2>Manter horários?</h2>
            <h2>Novo horário</h2>
          </div>
          <div className="mb-2 grid grid-cols-5">
            {isFetching ? (
              <span className="col-span-5">
                <LoaderIcon className="mx-auto animate-spin text-slate-500 duration-2000" />
              </span>
            ) : (
              <>
                {Object.keys(realocacoes).length > 0 ? (
                  Object.values(realocacoes).map((realocacao) => (
                    <div
                      key={nanoid()}
                      className="col-span-5 mb-2 grid grid-cols-5 justify-items-center border-b border-slate-300 px-4 pb-2 pt-2"
                    >
                      <span className="justify-self-start">
                        {realocacao.direcionamento_name}
                      </span>
                      <span>{realocacao.quantidade}</span>
                      <span>
                        <input
                          disabled={realocarRequerimentosMutation.isPending}
                          checked={
                            realocacoes[realocacao.direcionamento_id].realocar
                          }
                          onChange={(evt) => {
                            setRealocacoes((st) => ({
                              ...st,
                              [+evt.target.name]: {
                                ...st[+evt.target.name],
                                realocar: !st[+evt.target.name].realocar,
                              },
                            }));
                          }}
                          type="checkbox"
                          name={`${realocacao.direcionamento_id}`}
                        />
                      </span>
                      <span>
                        <input
                          disabled={
                            realocarRequerimentosMutation.isPending ||
                            !realocacao.realocar
                          }
                          checked={
                            realocacoes[realocacao.direcionamento_id]
                              .manterHorario
                          }
                          onChange={(evt) => {
                            setRealocacoes((st) => ({
                              ...st,
                              [+evt.target.name]: {
                                ...st[+evt.target.name],
                                manterHorario:
                                  !st[+evt.target.name].manterHorario,
                              },
                            }));
                          }}
                          type="checkbox"
                          name={`${realocacao.direcionamento_id}`}
                        />
                      </span>
                      <span>
                        <TimePicker
                          required={!realocacao.manterHorario}
                          disabled={
                            realocarRequerimentosMutation.isPending ||
                            realocacao.manterHorario
                          }
                          className="rounded px-2 py-1 text-base disabled:text-slate-400 md:text-lg"
                          minTime="00:00"
                          maxTime="23:00"
                          value={realocacao.novoHorario}
                          onChange={(evt) => {
                            setRealocacoes((st) => ({
                              ...st,
                              [+evt.target.name]: {
                                ...st[+evt.target.name],
                                novoHorario: evt.target.value,
                              },
                            }));
                          }}
                          step={1800}
                          name={`${realocacao.direcionamento_id}`}
                        />
                      </span>
                    </div>
                  ))
                ) : (
                  <span className="col-span-5 mt-4 justify-self-center">
                    Nenhum registro foi encontrado, selecione a data a ser
                    cancelada.
                  </span>
                )}
              </>
            )}
          </div>
          <div className="px-4">
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
