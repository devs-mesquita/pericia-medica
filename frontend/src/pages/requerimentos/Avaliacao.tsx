import * as React from "react";
import DatePicker from "@/components/ui/datepicker";
import TimePicker from "@/components/ui/timepicker";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useAuthHeader } from "react-auth-kit";
import { Direcionamento, DirecionamentoConfig } from "@/types/interfaces";
import { nanoid } from "nanoid";
import { FileBarChart2Icon } from "lucide-react";
import ConfirmationDialog, {
  AppDialog,
  dialogInitialState,
  handleConfirmation,
} from "@/components/ui/ConfirmationDialog";

const API_URL = import.meta.env.VITE_API_URL;

export default function RequerimentoAvaliacaoPage() {
  document.title = "Avaliação de Requerimento";
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
    number | "RECUSADO"
  >();
  const [direcionamento, setDirecionamento] = React.useState<{
    atendimento_presencial: boolean;
    config: DirecionamentoConfig[];
  }>();

  const authHeader = useAuthHeader();

  const handleChangeTime = (evt: React.ChangeEvent<HTMLInputElement>) => {
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
    if (evt.target.value === "RECUSADO") {
      setDirecionamentoID(evt.target.value);
    } else {
      setDirecionamentoID(+evt.target.value);
    }
  };

  const { data, isFetching } = useQuery({
    queryKey: ["direcionamento-options"],
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
      if (direcionamentoID === "RECUSADO") {
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
    mutationFn: async (data) => {
      // send avaliação data to /requerimentos/${id}/avaliação (PATCH)
    },
    onError: () => {
      // show error
    },
    onSuccess: () => {
      // invalidate "requerimentos"
      // navigate /requerimentos
    },
  });

  const handleSubmit = (evt: React.FormEvent<HTMLFormElement>) => {
    evt.preventDefault();

    if (!direcionamento) {
      // Selecione um direcionamento.
      return;
    }

    if (direcionamento.atendimento_presencial && (!time || !date)) {
      // Selecione a data e hora do atendimento.
      return;
    }

    if (
      direcionamentoID === "RECUSADO" &&
      (!justificativaRecusa ||
        (justificativaRecusa === "Outro" && !justificativaRecusaOutro))
    ) {
      // Descreva a justificativa de recusa.
      return;
    }

    // Can send
    handleConfirmation({
      accept: () => avaliacaoMutation.mutate(),
      isPending: avaliacaoMutation.isPending,
      message: "Deseja confirmar a avaliação do requerimento?",
      setDialog,
    });
  };

  return (
    <>
      <form
        className="flex flex-1 flex-col rounded-md bg-slate-100 p-3 shadow shadow-black/20"
        onSubmit={handleSubmit}
      >
        <div className="mb-2 flex items-center justify-between gap-1 border-b-2 border-slate-300 px-2 pb-2 text-lg font-semibold">
          <h1 className="flex items-center">
            <FileBarChart2Icon className="h-5 w-5" />
            <span className="ml-2">Avaliação de Requerimento</span>
          </h1>
        </div>
        <div className="flex flex-col gap-4">
          <div className="flex gap-12">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold" htmlFor="direcionamento">
                Direcionamento:
              </label>
              <select
                disabled={isFetching}
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
                    <option value="RECUSADO">RECUSADO</option>
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
                          className="rounded px-2 py-1 text-lg disabled:cursor-not-allowed disabled:bg-white disabled:text-slate-400"
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
            ) : direcionamentoID === "RECUSADO" ? (
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
          isPending={dialog.isPending}
        />
      )}
    </>
  );
}
