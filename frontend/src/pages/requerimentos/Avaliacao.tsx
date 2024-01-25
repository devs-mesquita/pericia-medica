import * as React from "react";
import DatePicker from "@/components/ui/datepicker";
import TimePicker from "@/components/ui/timepicker";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuthHeader } from "react-auth-kit";
import {
  Direcionamento,
  DirecionamentoConfig,
  Requerimento,
} from "@/types/interfaces";
import { nanoid } from "nanoid";
import {
  FileBarChart2Icon,
  FilePlus2Icon,
  PaperclipIcon,
  ViewIcon,
} from "lucide-react";
import ConfirmationDialog, {
  AppDialog,
  handleConfirmation,
  dialogInitialState,
} from "@/components/ui/ConfirmationDialog";
import { useAtom } from "jotai";
import { notificationAtom } from "@/store";
import { useNavigate, useParams } from "react-router-dom";
import { format } from "date-fns";

const API_URL = import.meta.env.VITE_API_URL;

const IMG_EXTENSIONS = ["jpg", "jpeg", "png", "jfif", "webp", "gif", "bmp"];

type AvaliacaoMutationParams = {
  direcionamento_id: number | "recusado";
  data_agenda: Date | undefined;
  hora_agenda: string;
  justificativa_recusa: string;
  observacao_avaliador: string;
};

type AvaliacaoAPIResponse = {
  message: "ok";
};

export default function RequerimentoAvaliacaoPage() {
  document.title = "Avaliação de Requerimento";
  const setNotification = useAtom(notificationAtom)[1];
  const [dialog, setDialog] = React.useState<AppDialog>(dialogInitialState);
  const [date, setDate] = React.useState<Date | undefined>(undefined);
  const [time, setTime] = React.useState<string>("");
  const [observacaoAvaliador, setObservacaoAvaliador] =
    React.useState<string>("");
  const [justificativaRecusa, setJustificativaRecusa] =
    React.useState<string>("");
  const [justificativaRecusaOutro, setJustificativaRecusaOutro] =
    React.useState<string>("");
  const [direcionamentoID, setDirecionamentoID] = React.useState<
    number | "recusado"
  >();
  const [direcionamento, setDirecionamento] = React.useState<{
    atendimento_presencial: boolean;
    config: DirecionamentoConfig[];
  }>();

  const authHeader = useAuthHeader();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { id } = useParams();

  const handleChangeTime = (
    evt: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    setTime(evt.target.value);
  };

  const handleChangeObservacao = (
    evt: React.ChangeEvent<HTMLTextAreaElement>,
  ) => {
    setObservacaoAvaliador(evt.target.value);
  };

  const handleChangeJustificativaRecusa = (
    evt: React.ChangeEvent<HTMLSelectElement>,
  ) => {
    setJustificativaRecusa(evt.target.value);
  };

  const handleChangeJustificativaRecusaOutro = (
    evt: React.ChangeEvent<HTMLTextAreaElement>,
  ) => {
    setJustificativaRecusaOutro(evt.target.value);
  };

  const handleChangeDirecionamento = (
    evt: React.ChangeEvent<HTMLSelectElement>,
  ) => {
    setDate(undefined);
    setTime("");
    setJustificativaRecusa("");
    setJustificativaRecusaOutro("");
    if (evt.target.value === "recusado") {
      setDirecionamentoID(evt.target.value);
    } else {
      setDirecionamentoID(+evt.target.value);
    }
  };

  const { data: requerimento, isFetching: requerimentoIsFetching } = useQuery({
    queryKey: ["requerimentos", id],
    queryFn: async () => {
      const res = await fetch(`${API_URL}/api/requerimentos/${id}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: authHeader(),
        },
      });

      if (!res.ok) {
        throw await res.json();
      }

      return (await res.json()) as Requerimento;
    },
  });

  const { data, isFetching } = useQuery({
    queryKey: ["direcionamentos", "options"],
    queryFn: async () => {
      const res = await fetch(`${API_URL}/api/direcionamentos`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: authHeader(),
        },
      });

      if (!res.ok) {
        throw await res.json();
      }

      return (await res.json()) as Direcionamento[];
    },
  });

  React.useEffect(() => {
    if (data && direcionamentoID) {
      if (direcionamentoID === "recusado") {
        setDirecionamento(undefined);
        return;
      }

      const selectedDirecionamento = data.find(
        (d) => d.id === direcionamentoID,
      );

      if (!selectedDirecionamento) {
        setDirecionamento(undefined);
        return;
      }

      if (selectedDirecionamento) {
        const config = JSON.parse(
          selectedDirecionamento.config,
        ) as DirecionamentoConfig[];

        setDirecionamento({
          atendimento_presencial: selectedDirecionamento.atendimento_presencial,
          config,
        });
      }
    }
  }, [data, direcionamentoID]);

  const avaliacaoMutation = useMutation({
    mutationFn: async (data: AvaliacaoMutationParams) => {
      // send avaliação data to /requerimentos/${id}/avaliação (PATCH)
      const res = await fetch(`${API_URL}/api/requerimentos/${id}/avaliacao`, {
        method: "POST",
        body: JSON.stringify({
          ...data,
          data_agenda: data.data_agenda
            ? format(data.data_agenda, "yyyy-LL-dd")
            : null,
          _method: "PATCH",
        }),
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: authHeader(),
        },
      });

      if (!res.ok) {
        throw await res.json();
      }

      return (await res.json()) as AvaliacaoAPIResponse;
    },
    onError: (error) => {
      // show error
      if (error.message === "not-found") {
        setNotification({
          message: "O requerimento não foi encontrado.",
          type: "error",
        });
      } else {
        setNotification({
          message: "Ocorreu um erro.",
          type: "error",
        });
      }
    },
    onSuccess: () => {
      setNotification({
        message: "Requerimento avaliado com sucesso.",
        type: "success",
      });
      queryClient.invalidateQueries({ queryKey: ["requerimentos"] });
      navigate("/requerimentos");
    },
  });

  const handleSubmit = (evt: React.FormEvent<HTMLFormElement>) => {
    evt.preventDefault();

    if (!direcionamentoID) {
      setNotification({
        message: "Selecione um direcionamento.",
        type: "warning",
      });
      return;
    }

    if (direcionamento?.atendimento_presencial && (!time || !date)) {
      setNotification({
        message: "Selecione a data e hora do atendimento.",
        type: "warning",
      });
      return;
    }

    if (
      direcionamentoID === "recusado" &&
      (!justificativaRecusa ||
        (justificativaRecusa === "Outro" && !justificativaRecusaOutro))
    ) {
      setNotification({
        message: "Descreva a justificativa de recusa.",
        type: "warning",
      });
      return;
    }

    // Can send
    handleConfirmation({
      accept: () =>
        avaliacaoMutation.mutate({
          data_agenda: date,
          direcionamento_id: direcionamentoID,
          hora_agenda: time,
          justificativa_recusa:
            justificativaRecusa === "Outro"
              ? justificativaRecusaOutro
              : justificativaRecusa,
          observacao_avaliador: observacaoAvaliador,
        }),
      isPending: avaliacaoMutation.isPending,
      message: "Deseja confirmar a avaliação do requerimento?",
      setDialog,
    });
  };

  return (
    <div className="flex flex-1 flex-col gap-4">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="flex flex-col rounded-md bg-slate-100 p-3 shadow shadow-black/20">
          <div className="mb-2 flex w-full items-center justify-between gap-1 border-b-2 border-slate-300 px-2 pb-2 text-lg font-semibold">
            <h1 className="flex flex-1 items-center">
              <FileBarChart2Icon className="h-5 w-5" />
              <span className="ml-2">Requerimento</span>
              {requerimento?.status === "em-analise" ? (
                <span className="ml-auto rounded-full bg-slate-500 px-4 py-1 text-sm text-slate-50">
                  Em Análise
                </span>
              ) : requerimento?.status === "reagendamento-solicitado" ? (
                <span className="ml-auto rounded-full bg-amber-500 px-4 py-1 text-sm text-slate-50">
                  Reagendamento Solicitado
                </span>
              ) : requerimento?.status === "aguardando-confirmacao" ? (
                <span className="ml-auto rounded-full bg-blue-500 px-4 py-1 text-sm text-slate-50">
                  Aguardando Confirmação
                </span>
              ) : requerimento?.status === "confirmado" ? (
                <span className="ml-auto rounded-full bg-green-500 px-4 py-1 text-sm text-slate-50">
                  Confirmado
                </span>
              ) : requerimento?.status === "realocado" ? (
                <span className="ml-auto rounded-full bg-amber-500 px-4 py-1 text-sm text-slate-50">
                  Realocado
                </span>
              ) : requerimento?.status === "recusado" ? (
                <span className="ml-auto rounded-full bg-red-500 px-4 py-1 text-sm text-slate-50">
                  Recusado
                </span>
              ) : null}
            </h1>
          </div>
          <div className="font-semibold">
            <p>Protocolo: {requerimento?.protocolo}</p>
          </div>
        </div>
        <div className="flex flex-col rounded-md bg-slate-100 p-3 shadow shadow-black/20">
          <div className="mb-2 flex items-center justify-between gap-1 border-b-2 border-slate-300 px-2 pb-2 text-lg font-semibold">
            <h1 className="flex items-center">
              <PaperclipIcon className="h-5 w-5" />
              <span className="ml-2">Imagens e Documentos</span>
            </h1>
          </div>
          <div className="grid grid-cols-2">
            <div className="flex flex-col">
              <p className="mb-2 pb-1 text-xs font-semibold md:text-base">
                Atestado
              </p>
              <div className="grid grid-cols-3 gap-2">
                {requerimento?.atestado_files.map((attachment) => {
                  return IMG_EXTENSIONS.includes(attachment.extension) ? (
                    <a
                      href={`${API_URL}/storage/atestados/${attachment.filename}`}
                      target="_blank"
                      key={nanoid()}
                      className="relative h-[100px] w-[100px] rounded border border-slate-400 bg-slate-300 p-1"
                    >
                      <div className="absolute left-0 top-0 flex h-full w-full items-center justify-center rounded text-slate-50/60 opacity-0 hover:bg-black/25 hover:opacity-100">
                        <ViewIcon className="h-[32px] w-[32px]" />
                      </div>
                      <img
                        className="h-full w-full rounded object-contain"
                        src={`${API_URL}/storage/atestados/${attachment.filename}`}
                        alt="Atestado"
                      />
                    </a>
                  ) : (
                    <a
                      href={`${API_URL}/storage/atestados/${attachment.filename}`}
                      target="_blank"
                      key={nanoid()}
                      className="relative flex h-[100px] w-[100px] items-center justify-center rounded border border-slate-400 bg-slate-100 p-1 text-blue-500"
                    >
                      <div className="absolute left-0 top-0 flex h-full w-full items-center justify-center rounded text-slate-50/60 opacity-0 hover:bg-black/25 hover:opacity-100">
                        <ViewIcon className="h-[32px] w-[32px]" />
                      </div>
                      <FileBarChart2Icon className="h-[64px] w-[64px]" />
                    </a>
                  );
                })}
              </div>
            </div>
            {requerimento?.afastamento_files?.length ? (
              <div className="flex flex-col">
                <p className="mb-2 pb-1 text-xs font-semibold md:text-base">
                  Comprovante de Afastamento
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {requerimento?.afastamento_files.map((attachment) => {
                    return IMG_EXTENSIONS.includes(attachment.extension) ? (
                      <a
                        href={`${API_URL}/storage/afastamentos/${attachment.filename}`}
                        target="_blank"
                        key={nanoid()}
                        className="relative h-[100px] w-[100px] rounded border border-slate-400 bg-slate-300 p-1"
                      >
                        <div className="absolute left-0 top-0 flex h-full w-full items-center justify-center rounded text-slate-50/60 opacity-0 hover:bg-black/25 hover:opacity-100">
                          <ViewIcon className="h-[32px] w-[32px]" />
                        </div>
                        <img
                          className="h-full w-full rounded object-contain"
                          src={`${API_URL}/storage/afastamentos/${attachment.filename}`}
                          alt="Comprovante de Afastamento"
                        />
                      </a>
                    ) : (
                      <a
                        href={`${API_URL}/storage/afastamentos/${attachment.filename}`}
                        target="_blank"
                        key={nanoid()}
                        className="relative flex h-[100px] w-[100px] items-center justify-center rounded border border-slate-400 bg-slate-100 p-1 text-blue-500"
                      >
                        <div className="absolute left-0 top-0 flex h-full w-full items-center justify-center rounded text-slate-50/60 opacity-0 hover:bg-black/25 hover:opacity-100">
                          <ViewIcon className="h-[32px] w-[32px]" />
                        </div>
                        <FileBarChart2Icon className="h-[64px] w-[64px]" />
                      </a>
                    );
                  })}
                </div>
              </div>
            ) : null}
          </div>
        </div>
        {requerimento?.reagendamentos.length
          ? requerimento.reagendamentos.map((reagendamento, i) => {
              return (
                <div
                  key={nanoid()}
                  className="col-span-2 flex flex-col rounded-md bg-slate-100 p-3 shadow shadow-black/20"
                >
                  <div className="mb-2 flex items-center justify-between gap-1 border-b-2 border-slate-300 px-2 pb-2 text-lg font-semibold">
                    <h1 className="flex items-center">
                      <FilePlus2Icon className="h-5 w-5" />
                      <span className="ml-2">
                        Pedido de Reagendamento {i + 1}
                      </span>
                    </h1>
                  </div>
                  <div className="font-semibold">
                    <p>
                      Status:{" "}
                      <span className="">
                        {reagendamento.status === "em-analise" ? (
                          <span className="ml-auto rounded-full bg-slate-500 px-4 py-1 text-sm text-slate-50">
                            Em Análise
                          </span>
                        ) : reagendamento.status ===
                          "reagendamento-solicitado" ? (
                          <span className="ml-auto rounded-full bg-amber-500 px-4 py-1 text-sm text-slate-50">
                            Reagendamento Solicitado
                          </span>
                        ) : reagendamento.status ===
                          "aguardando-confirmacao" ? (
                          <span className="ml-auto rounded-full bg-blue-500 px-4 py-1 text-sm text-slate-50">
                            Aguardando Confirmação
                          </span>
                        ) : reagendamento.status === "confirmado" ? (
                          <span className="ml-auto rounded-full bg-green-500 px-4 py-1 text-sm text-slate-50">
                            Confirmado
                          </span>
                        ) : reagendamento.status === "realocado" ? (
                          <span className="ml-auto rounded-full bg-amber-500 px-4 py-1 text-sm text-slate-50">
                            Realocado
                          </span>
                        ) : reagendamento.status === "recusado" ? (
                          <span className="ml-auto rounded-full bg-red-500 px-4 py-1 text-sm text-slate-50">
                            Recusado
                          </span>
                        ) : null}
                      </span>
                    </p>
                  </div>
                </div>
              );
            })
          : null}
      </div>
      <form
        className="flex flex-col rounded-md bg-slate-100 p-3 shadow shadow-black/20"
        onSubmit={handleSubmit}
      >
        <div className="mb-2 flex items-center justify-between gap-1 border-b-2 border-slate-300 px-2 pb-2 text-lg font-semibold">
          <h1 className="flex items-center">
            <FileBarChart2Icon className="h-5 w-5" />
            <span className="ml-2">Avaliar Requerimento</span>
          </h1>
        </div>
        <div className="flex flex-col gap-4">
          <div className="flex flex-col items-start gap-4 md:flex-row md:gap-8">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold" htmlFor="direcionamento">
                Direcionamento:
              </label>
              <select
                disabled={
                  isFetching ||
                  requerimentoIsFetching ||
                  avaliacaoMutation.isPending
                }
                name="direcionamento"
                id="direcionamento"
                className="rounded bg-white p-2 text-base"
                onChange={handleChangeDirecionamento}
                value={direcionamentoID}
                required
              >
                {data ? (
                  <>
                    <option value="">-- Direcionamento --</option>
                    {data.map((direcionamento) => {
                      return (
                        <option key={nanoid()} value={direcionamento.id}>
                          {direcionamento.name}
                        </option>
                      );
                    })}
                    <option value="recusado">RECUSADO</option>
                  </>
                ) : (
                  <option value="">Carregando...</option>
                )}
              </select>
            </div>
            {direcionamento?.atendimento_presencial ? (
              <>
                {data && direcionamentoID && direcionamento ? (
                  <>
                    <div className="flex flex-col gap-2">
                      <label
                        className="text-sm font-semibold"
                        htmlFor="data_agenda"
                      >
                        Data do Agendamento:
                      </label>
                      <DatePicker
                        date={date}
                        setDate={setDate}
                        disabled={(date) => {
                          return (
                            date < new Date() ||
                            !direcionamento.config[date.getDay()].isEnabled
                          );
                        }}
                      />
                    </div>
                    {date ? (
                      <div className="flex flex-col gap-2">
                        <label
                          className="text-sm font-semibold"
                          htmlFor="hora_agenda"
                        >
                          Horário do Agendamento:
                        </label>
                        <TimePicker
                          required
                          id="hora_agenda"
                          className="rounded p-2 disabled:cursor-not-allowed disabled:bg-white disabled:text-slate-400"
                          disabled={
                            isFetching ||
                            requerimentoIsFetching ||
                            avaliacaoMutation.isPending
                          }
                          minTime={
                            direcionamento.config[date.getDay()].start || ""
                          }
                          maxTime={
                            direcionamento.config[date.getDay()].end || ""
                          }
                          value={time}
                          onChange={handleChangeTime}
                          step={1800}
                        />
                      </div>
                    ) : (
                      <div className="flex flex-col gap-2">
                        <label
                          className="text-sm font-semibold"
                          htmlFor="hora_agenda"
                        >
                          Horário do Agendamento:
                        </label>
                        <input
                          type="time"
                          className="rounded px-2 py-1 text-lg disabled:cursor-not-allowed disabled:bg-white disabled:text-slate-400"
                          disabled
                        />
                      </div>
                    )}
                  </>
                ) : null}
              </>
            ) : direcionamentoID === "recusado" ? (
              <>
                <div className="flex flex-col gap-2">
                  <label
                    className="text-sm font-semibold"
                    htmlFor="justificativaRecusa"
                  >
                    Justificativa de Recusa:
                  </label>
                  <select
                    required
                    value={justificativaRecusa}
                    onChange={handleChangeJustificativaRecusa}
                    name="justificativaRecusa"
                    id="justificativaRecusa"
                    className="resize-none rounded border border-slate-300 p-2 text-sm"
                    disabled={
                      isFetching ||
                      requerimentoIsFetching ||
                      avaliacaoMutation.isPending
                    }
                  >
                    <option value="">-- Justificativa --</option>
                    <option value="Documento Ilegível">
                      Documento Ilegível
                    </option>
                    <option value="Prazo Expirado">Prazo Expirado</option>
                    <option value="Outro">Outro</option>
                  </select>
                </div>
                {justificativaRecusa === "Outro" ? (
                  <div className="flex flex-col gap-2">
                    <label
                      className="text-sm font-semibold"
                      htmlFor="justificativaRecusaOutro"
                    >
                      Descreva a Justificativa:
                    </label>
                    <textarea
                      disabled={
                        isFetching ||
                        requerimentoIsFetching ||
                        avaliacaoMutation.isPending
                      }
                      required
                      value={justificativaRecusaOutro}
                      onChange={handleChangeJustificativaRecusaOutro}
                      name="justificativaRecusaOutro"
                      id="justificativaRecusaOutro"
                      className="w-full resize-none rounded border border-slate-300 p-2 text-sm"
                      rows={1}
                      cols={40}
                      placeholder="Descreva a justificativa."
                    ></textarea>
                  </div>
                ) : null}
              </>
            ) : null}
          </div>
          <div className="flex flex-col gap-2">
            <label
              className="self-start text-sm font-semibold"
              htmlFor="observacaoAvaliador"
            >
              Observação (opcional):
            </label>
            <textarea
              disabled={
                isFetching ||
                requerimentoIsFetching ||
                avaliacaoMutation.isPending
              }
              value={observacaoAvaliador}
              onChange={handleChangeObservacao}
              name="observacaoAvaliador"
              id="observacaoAvaliador"
              className="resize-none rounded border border-slate-300 p-2 text-sm"
              rows={2}
              placeholder="A observação será inclusa no e-mail de resposta."
            ></textarea>
          </div>
          <button
            type="submit"
            className="self-start rounded bg-green-500 px-4 py-2 font-semibold text-white hover:bg-green-600"
          >
            Avaliar Requerimento
          </button>
        </div>
      </form>
      {dialog.isOpen && (
        <ConfirmationDialog
          accept={dialog.accept}
          reject={dialog.reject}
          message={dialog.message}
          isPending={avaliacaoMutation.isPending}
        />
      )}
    </div>
  );
}
