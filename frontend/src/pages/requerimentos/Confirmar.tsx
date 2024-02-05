import React from "react";
import { useMutation } from "@tanstack/react-query";

import { notificationAtom } from "@/store";
import { useAtom } from "jotai";
import { useNavigate } from "react-router-dom";
import { LoaderIcon } from "lucide-react";
import { AppNotification } from "@/types/interfaces";

const API_URL = import.meta.env.VITE_API_URL;

type ConfirmarRequerimentoForm = {
  protocolo: string;
  opcao: "" | "confirmar" | "solicitar-reagendamento";
  justificativa_requerente: string;
  justificativa_outro: string;
};
type ConfirmarRequerimentoResponse = {
  protocolo: string;
} & (
  | {
      message:
        | "not-found"
        | "already-confirmado"
        | "recusado"
        | "em-analise"
        | "bad-request";
    }
  | {
      message: "ok";
      opcao: "confirmar" | "solicitar-reagendamento";
    }
);

const defaultMessageKeys = ["not-found", "bad-request"];
const defaultMessages: Record<string, AppNotification> = {
  "not-found": {
    message: "O protocolo informado é inválido.",
    type: "error",
  },
  "bad-request": {
    message: "Erro de requisição.",
    type: "error",
  },
  error: {
    message: "Ocorreu um erro.",
    type: "error",
  },
};

export default function RequerimentoConfirmarPage() {
  document.title = "Confirmação de Requerimento";

  const navigate = useNavigate();
  const setNotification = useAtom(notificationAtom)[1];

  const confirmarRequerimentoMutation = useMutation({
    mutationFn: async (form: ConfirmarRequerimentoForm) => {
      const res = await fetch(
        `${API_URL}/api/requerimentos/${form.protocolo.toUpperCase()}/confirmacao`,
        {
          method: "POST",
          body: JSON.stringify({
            ...form,
            justificativa_requerente:
              form.justificativa_requerente === "outro"
                ? form.justificativa_outro
                : form.justificativa_requerente,
          }),
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
        },
      );

      if (!res.ok) {
        throw await res.json();
      }

      return (await res.json()) as ConfirmarRequerimentoResponse;
    },
    onError: (error) => {
      if (defaultMessageKeys.includes(error.message)) {
        setNotification(defaultMessages[error.message]);
      } else {
        setNotification(defaultMessages["error"]);
      }
    },
    onSuccess: (data) => {
      console.log(data);
      navigate("/success", {
        state: {
          message: data.message === "ok" ? data.opcao : data.message,
          protocolo: data.protocolo,
        },
      });
    },
  });

  const [form, setForm] = React.useState<ConfirmarRequerimentoForm>({
    protocolo: "",
    opcao: "",
    justificativa_requerente: "",
    justificativa_outro: "",
  });

  const handleChange = (
    evt: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    setForm((st) => ({ ...st, [evt.target.name]: evt.target.value }));
  };

  const handleSubmit = (evt: React.FormEvent<HTMLFormElement>) => {
    evt.preventDefault();
    confirmarRequerimentoMutation.mutate(form);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-6 flex max-w-[500px] flex-col self-center rounded-lg shadow-sm shadow-black/30 md:w-[700px] lg:w-[975px] xl:w-[1152px]"
    >
      <div className="rounded-t-md border border-b-0 border-black/20 bg-slate-200 p-2">
        <h1 className="text-center text-xl font-normal">
          Confirmação de Requerimento
        </h1>
      </div>
      <div className="flex flex-col gap-4 border border-black/20 bg-slate-100 p-4 md:gap-5">
        <div className="flex flex-1 flex-col gap-1">
          <label htmlFor="">Protocolo do Requerimento:</label>
          <input
            maxLength={12}
            min={12}
            disabled={confirmarRequerimentoMutation.isPending}
            value={form.protocolo}
            onChange={handleChange}
            className="rounded border border-slate-300 p-2 outline-none focus:border-slate-500 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-600/80"
            type="text"
            name="protocolo"
            placeholder="Código do Protocolo"
            required
          />
        </div>
        <div className="flex flex-1 flex-col gap-1">
          <label htmlFor="">Selecione a opção desejada:</label>
          <div className="flex pt-1">
            <div>
              <input
                required
                type="radio"
                name="opcao"
                value="confirmar"
                id="confirmar"
                className="peer invisible absolute"
                onChange={handleChange}
                disabled={confirmarRequerimentoMutation.isPending}
                defaultChecked={form.opcao === "confirmar"}
              />
              <label
                htmlFor="confirmar"
                className="rounded-l border border-green-500 border-r-slate-600 p-2 font-bold text-green-500 peer-checked:bg-green-500 peer-checked:text-white"
              >
                Confirmar Presença
              </label>
            </div>
            <div>
              <input
                required
                type="radio"
                name="opcao"
                value="solicitar-reagendamento"
                id="solicitar-reagendamento"
                className="peer invisible absolute"
                onChange={handleChange}
                disabled={confirmarRequerimentoMutation.isPending}
                defaultChecked={form.opcao === "solicitar-reagendamento"}
              />
              <label
                htmlFor="solicitar-reagendamento"
                className="rounded-r border border-l-0 border-red-500 p-2 font-bold text-red-500 peer-checked:bg-red-500 peer-checked:text-white"
              >
                Solicitar Reagendamento
              </label>
            </div>
          </div>
        </div>
        {form.opcao === "solicitar-reagendamento" && (
          <div className="flex flex-1 flex-col gap-1">
            <label htmlFor="justificativa_requerente">Justificativa:</label>
            <select
              required={form.opcao === "solicitar-reagendamento"}
              onChange={handleChange}
              disabled={confirmarRequerimentoMutation.isPending}
              id="justificativa_requerente"
              name="justificativa_requerente"
              className="rounded border border-slate-300 p-2 outline-none focus:border-slate-500 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-600/80"
            >
              <option value="">Selecione...</option>
              <option value="motivo-1">Motivo Um</option>
              <option value="outro">Outro</option>
            </select>
            {form.justificativa_requerente === "outro" ? (
              <textarea
                required={
                  form.opcao === "solicitar-reagendamento" &&
                  form.justificativa_requerente === "outro"
                }
                onChange={handleChange}
                disabled={confirmarRequerimentoMutation.isPending}
                id="justificativa_requerente"
                name="justificativa_requerente"
                className="rounded border border-slate-300 p-2 outline-none focus:border-slate-500 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-600/80"
                placeholder="Descreva a justificativa para o reagendamento."
                maxLength={150}
              ></textarea>
            ) : null}
          </div>
        )}
      </div>
      <div className="flex justify-center rounded-b-md border border-t-0 border-black/20 bg-slate-200 p-2">
        <button
          disabled={confirmarRequerimentoMutation.isPending}
          className="rounded-lg bg-green-600 px-3 py-1 text-lg font-medium text-white drop-shadow hover:bg-green-700 disabled:cursor-not-allowed disabled:bg-green-400"
        >
          {confirmarRequerimentoMutation.isPending ? (
            <LoaderIcon className="animate-spin text-green-100 duration-2000" />
          ) : (
            "Enviar"
          )}
        </button>
      </div>
    </form>
  );
}
