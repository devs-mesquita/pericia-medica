import * as React from "react";
import TimePicker from "@/components/ui/timepicker";
import { useAuthHeader } from "react-auth-kit";
import { LoaderIcon, SendIcon } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { Link, useNavigate } from "react-router-dom";
import { useAtom } from "jotai";
import { notificationAtom } from "@/store";

const API_URL = import.meta.env.VITE_API_URL;

type DirecionamentoResponse = {
  message: string;
};

export default function DirecionamentoCreatePage() {
  document.title = "Novo Direcionamento";
  const authHeader = useAuthHeader();
  const navigate = useNavigate();
  const setNotification = useAtom(notificationAtom)[1];

  const [form, setForm] = React.useState({
    name: "",
    atendimento_presencial: "",
    config: [
      {
        weekdayIndex: 0,
        weekday: "Domingo",
        start: "",
        isEnabled: false,
        end: "",
      },
      {
        weekdayIndex: 1,
        weekday: "Segunda",
        start: "",
        isEnabled: false,
        end: "",
      },
      {
        weekdayIndex: 2,
        weekday: "Terça",
        start: "",
        isEnabled: false,
        end: "",
      },
      {
        weekdayIndex: 3,
        weekday: "Quarta",
        start: "",
        isEnabled: false,
        end: "",
      },
      {
        weekdayIndex: 4,
        weekday: "Quinta",
        start: "",
        isEnabled: false,
        end: "",
      },
      {
        weekdayIndex: 5,
        weekday: "Sexta",
        start: "",
        isEnabled: false,
        end: "",
      },
      {
        weekdayIndex: 6,
        weekday: "Sábado",
        start: "",
        isEnabled: false,
        end: "",
      },
    ],
  });

  const handleChange = (evt: React.ChangeEvent<HTMLInputElement>) => {
    setForm((st) => ({
      ...st,
      [evt.target.name]: evt.target.value,
    }));
  };

  const handleChangeConfig = (evt: React.ChangeEvent<HTMLInputElement>) => {
    setForm((st) => ({
      ...st,
      config: st.config.map((c) => {
        if (!evt.target.dataset.weekdayIndex) return c;

        if (c.weekdayIndex === +evt.target.dataset.weekdayIndex) {
          return { ...c, [evt.target.name]: evt.target.value };
        }

        return c;
      }),
    }));
  };

  const handleToggleConfig = (evt: React.ChangeEvent<HTMLInputElement>) => {
    setForm((st) => ({
      ...st,
      config: st.config.map((c) => {
        if (!evt.target.dataset.weekdayIndex) return c;

        if (c.weekdayIndex === +evt.target.dataset.weekdayIndex) {
          return { ...c, [evt.target.name]: !c.isEnabled };
        }

        return c;
      }),
    }));
  };

  const createDirecionamentoMutation = useMutation({
    mutationFn: async (data: typeof form) => {
      const res = await fetch(`${API_URL}/api/direcionamentos`, {
        method: "POST",
        body: JSON.stringify(data),
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: authHeader(),
        },
      });

      if (!res.ok) {
        throw await res.json();
      }

      return (await res.json()) as DirecionamentoResponse;
    },
    onSuccess: () => {
      setNotification({
        message: "Direcionamento criado com sucesso.",
        type: "success",
      });
      navigate("/direcionamentos");
    },
    onError: (error) => {
      if (error.message === "name-conflict") {
        setNotification({
          message: "Um direcionamento com o mesmo nome já existe.",
          type: "error",
        });
      } else {
        setNotification({
          message: "Ocorreu um erro.",
          type: "error",
        });
      }
    },
  });

  const handleSubmit = (evt: React.FormEvent<HTMLFormElement>) => {
    evt.preventDefault();
    createDirecionamentoMutation.mutate(form);
  };

  return (
    <div className="flex flex-1 flex-col rounded-md bg-slate-100 p-2 pt-1 shadow shadow-black/20">
      <h1 className="mb-2 flex items-center justify-center border-b-2 border-slate-300 py-3">
        <SendIcon className="h-5 w-5" />
        <span className="ml-1 font-semibold">Novo Direcionamento</span>
      </h1>
      <form
        onSubmit={handleSubmit}
        className="flex flex-1 flex-col rounded border border-slate-300"
      >
        <div className="mb-6 flex flex-col gap-6 pl-4 pt-4">
          <div className="flex flex-col items-start gap-1">
            <label htmlFor="name" className="font-semibold">
              Nome do Direcionamento:
            </label>
            <input
              id="name"
              disabled={createDirecionamentoMutation.isPending}
              value={form.name}
              onChange={handleChange}
              className="rounded border border-slate-300 p-2 outline-none focus:border-slate-500 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-600/80"
              type="text"
              name="name"
              placeholder="Ex.: Atendimento Pericial"
              required
            />
          </div>
          <div className="flex flex-col">
            <label htmlFor="" className="font-semibold">
              O direcionamento possui atendimento presencial?
            </label>
            <div className="flex gap-6 pl-3">
              <label
                htmlFor="atendimento_presencial_sim"
                className="flex gap-2"
              >
                <input
                  disabled={createDirecionamentoMutation.isPending}
                  onChange={handleChange}
                  value="sim"
                  type="radio"
                  id="atendimento_presencial_sim"
                  name="atendimento_presencial"
                  checked={form.atendimento_presencial === "sim"}
                  required
                />
                <span>Sim</span>
              </label>
              <label
                htmlFor="atendimento_presencial_nao"
                className="flex gap-2"
              >
                <input
                  disabled={createDirecionamentoMutation.isPending}
                  onChange={handleChange}
                  type="radio"
                  id="atendimento_presencial_nao"
                  name="atendimento_presencial"
                  checked={form.atendimento_presencial === "nao"}
                  value="nao"
                  required
                />
                <span>Não</span>
              </label>
            </div>
          </div>
        </div>
        <h2 className="mb-2 border-t-2 border-slate-300 pt-2 text-center text-xl font-bold">
          Atendimento Presencial
        </h2>
        <div className="grid grid-cols-4 items-center justify-items-center border-y-2 border-slate-300 py-2 font-semibold">
          <h3 className="ml-4 justify-self-start">Dia da Semana</h3>
          <h3>Habilitar dia?</h3>
          <h3>Horário Mínimo</h3>
          <h3>Horário Máximo</h3>
        </div>
        <div className="flex flex-col">
          <div className="mb-2 grid grid-cols-4 items-center justify-items-center border-b border-slate-300 pb-2 pt-2">
            <h3 className="ml-4 justify-self-start">Domingo</h3>
            <input
              disabled={
                createDirecionamentoMutation.isPending ||
                form.atendimento_presencial === "nao"
              }
              checked={form.config[0].isEnabled}
              onChange={handleToggleConfig}
              type="checkbox"
              name="isEnabled"
              data-weekday-index="0"
              id=""
            />
            <TimePicker
              required={form.config[0].isEnabled}
              disabled={
                createDirecionamentoMutation.isPending ||
                !form.config[0].isEnabled
              }
              className="rounded px-2 py-1 text-lg disabled:text-slate-400"
              minTime="00:00"
              maxTime="23:00"
              value={form.config[0].start}
              onChange={handleChangeConfig}
              step={1800}
              dataWeekdayIndex="0"
              name="start"
            />
            <TimePicker
              required={form.config[0].isEnabled}
              disabled={
                createDirecionamentoMutation.isPending ||
                !form.config[0].isEnabled
              }
              className="rounded px-2 py-1 text-lg disabled:text-slate-400"
              minTime={form.config[0].start || "00:00"}
              maxTime="23:00"
              value={form.config[0].end}
              onChange={handleChangeConfig}
              step={1800}
              dataWeekdayIndex="0"
              name="end"
            />
          </div>
          <div className="mb-2 grid grid-cols-4 items-center justify-items-center border-b border-slate-300 pb-2">
            <h3 className="ml-4 justify-self-start">Segunda-Feira</h3>
            <input
              disabled={
                createDirecionamentoMutation.isPending ||
                form.atendimento_presencial === "nao"
              }
              checked={form.config[1].isEnabled}
              onChange={handleToggleConfig}
              type="checkbox"
              name="isEnabled"
              data-weekday-index="1"
              id=""
            />
            <TimePicker
              required={form.config[1].isEnabled}
              disabled={
                createDirecionamentoMutation.isPending ||
                !form.config[1].isEnabled
              }
              className="rounded px-2 py-1 text-lg disabled:text-slate-400"
              minTime="00:00"
              maxTime="23:00"
              value={form.config[1].start}
              onChange={handleChangeConfig}
              step={1800}
              dataWeekdayIndex="1"
              name="start"
            />
            <TimePicker
              required={form.config[1].isEnabled}
              disabled={
                createDirecionamentoMutation.isPending ||
                !form.config[1].isEnabled
              }
              className="rounded px-2 py-1 text-lg disabled:text-slate-400"
              minTime={form.config[1].start || "00:00"}
              maxTime="23:00"
              value={form.config[1].end}
              onChange={handleChangeConfig}
              step={1800}
              dataWeekdayIndex="1"
              name="end"
            />
          </div>
          <div className="mb-2 grid grid-cols-4 items-center justify-items-center border-b border-slate-300 pb-2">
            <h3 className="ml-4 justify-self-start">Terça-Feira</h3>
            <input
              disabled={
                createDirecionamentoMutation.isPending ||
                form.atendimento_presencial === "nao"
              }
              checked={form.config[2].isEnabled}
              onChange={handleToggleConfig}
              type="checkbox"
              name="isEnabled"
              data-weekday-index="2"
              id=""
            />
            <TimePicker
              required={form.config[2].isEnabled}
              disabled={
                createDirecionamentoMutation.isPending ||
                !form.config[2].isEnabled
              }
              className="rounded px-2 py-1 text-lg disabled:text-slate-400"
              minTime="00:00"
              maxTime="23:00"
              value={form.config[2].start}
              onChange={handleChangeConfig}
              step={1800}
              dataWeekdayIndex="2"
              name="start"
            />
            <TimePicker
              required={form.config[2].isEnabled}
              disabled={
                createDirecionamentoMutation.isPending ||
                !form.config[2].isEnabled
              }
              className="rounded px-2 py-1 text-lg disabled:text-slate-400"
              minTime={form.config[2].start || "00:00"}
              maxTime="23:00"
              value={form.config[2].end}
              onChange={handleChangeConfig}
              step={1800}
              dataWeekdayIndex="2"
              name="end"
            />
          </div>
          <div className="mb-2 grid grid-cols-4 items-center justify-items-center border-b border-slate-300 pb-2">
            <h3 className="ml-4 justify-self-start">Quarta-Feira</h3>
            <input
              disabled={
                createDirecionamentoMutation.isPending ||
                form.atendimento_presencial === "nao"
              }
              checked={form.config[3].isEnabled}
              onChange={handleToggleConfig}
              type="checkbox"
              name="isEnabled"
              data-weekday-index="3"
              id=""
            />
            <TimePicker
              required={form.config[3].isEnabled}
              disabled={
                createDirecionamentoMutation.isPending ||
                !form.config[3].isEnabled
              }
              className="rounded px-2 py-1 text-lg disabled:text-slate-400"
              minTime="00:00"
              maxTime="23:00"
              value={form.config[3].start}
              onChange={handleChangeConfig}
              step={1800}
              dataWeekdayIndex="3"
              name="start"
            />
            <TimePicker
              required={form.config[3].isEnabled}
              disabled={
                createDirecionamentoMutation.isPending ||
                !form.config[3].isEnabled
              }
              className="rounded px-2 py-1 text-lg disabled:text-slate-400"
              minTime={form.config[3].start || "00:00"}
              maxTime="23:00"
              value={form.config[3].end}
              onChange={handleChangeConfig}
              step={1800}
              dataWeekdayIndex="3"
              name="end"
            />
          </div>
          <div className="mb-2 grid grid-cols-4 items-center justify-items-center border-b border-slate-300 pb-2">
            <h3 className="ml-4 justify-self-start">Quinta-Feira</h3>
            <input
              disabled={
                createDirecionamentoMutation.isPending ||
                form.atendimento_presencial === "nao"
              }
              checked={form.config[4].isEnabled}
              onChange={handleToggleConfig}
              type="checkbox"
              name="isEnabled"
              data-weekday-index="4"
              id=""
            />
            <TimePicker
              required={form.config[4].isEnabled}
              disabled={
                createDirecionamentoMutation.isPending ||
                !form.config[4].isEnabled
              }
              className="rounded px-2 py-1 text-lg disabled:text-slate-400"
              minTime="00:00"
              maxTime="23:00"
              value={form.config[4].start}
              onChange={handleChangeConfig}
              step={1800}
              dataWeekdayIndex="4"
              name="start"
            />
            <TimePicker
              required={form.config[4].isEnabled}
              disabled={
                createDirecionamentoMutation.isPending ||
                !form.config[4].isEnabled
              }
              className="rounded px-2 py-1 text-lg disabled:text-slate-400"
              minTime={form.config[4].start || "00:00"}
              maxTime="23:00"
              value={form.config[4].end}
              onChange={handleChangeConfig}
              step={1800}
              dataWeekdayIndex="4"
              name="end"
            />
          </div>
          <div className="mb-2 grid grid-cols-4 items-center justify-items-center border-b border-slate-300 pb-2">
            <h3 className="ml-4 justify-self-start">Sexta-Feira</h3>
            <input
              disabled={
                createDirecionamentoMutation.isPending ||
                form.atendimento_presencial === "nao"
              }
              checked={form.config[5].isEnabled}
              onChange={handleToggleConfig}
              type="checkbox"
              name="isEnabled"
              data-weekday-index="5"
              id=""
            />
            <TimePicker
              required={form.config[5].isEnabled}
              disabled={
                createDirecionamentoMutation.isPending ||
                !form.config[5].isEnabled
              }
              className="rounded px-2 py-1 text-lg disabled:text-slate-400"
              minTime="00:00"
              maxTime="23:00"
              value={form.config[5].start}
              onChange={handleChangeConfig}
              step={1800}
              dataWeekdayIndex="5"
              name="start"
            />
            <TimePicker
              required={form.config[5].isEnabled}
              disabled={
                createDirecionamentoMutation.isPending ||
                !form.config[5].isEnabled
              }
              className="rounded px-2 py-1 text-lg disabled:text-slate-400"
              minTime={form.config[5].start || "00:00"}
              maxTime="23:00"
              value={form.config[5].end}
              onChange={handleChangeConfig}
              step={1800}
              dataWeekdayIndex="5"
              name="end"
            />
          </div>
          <div className="grid grid-cols-4 items-center justify-items-center border-b border-slate-300 pb-2">
            <h3 className="ml-4 justify-self-start">Sábado</h3>
            <input
              disabled={
                createDirecionamentoMutation.isPending ||
                form.atendimento_presencial === "nao"
              }
              checked={form.config[6].isEnabled}
              onChange={handleToggleConfig}
              type="checkbox"
              name="isEnabled"
              data-weekday-index="6"
              id=""
            />
            <TimePicker
              required={form.config[6].isEnabled}
              disabled={
                createDirecionamentoMutation.isPending ||
                !form.config[6].isEnabled
              }
              className="rounded px-2 py-1 text-lg disabled:text-slate-400"
              minTime="00:00"
              maxTime="23:00"
              value={form.config[6].start}
              onChange={handleChangeConfig}
              step={1800}
              dataWeekdayIndex="6"
              name="start"
            />
            <TimePicker
              required={form.config[6].isEnabled}
              disabled={
                createDirecionamentoMutation.isPending ||
                !form.config[6].isEnabled
              }
              className="rounded px-2 py-1 text-lg disabled:text-slate-400"
              minTime={form.config[6].start || "00:00"}
              maxTime="23:00"
              value={form.config[6].end}
              onChange={handleChangeConfig}
              step={1800}
              dataWeekdayIndex="6"
              name="end"
            />
          </div>
          <div className="my-4 flex flex-col items-center">
            <div className="flex gap-8">
              {createDirecionamentoMutation.isPending ? (
                <LoaderIcon className="animate-spin text-slate-700 duration-2000" />
              ) : (
                <>
                  <button
                    type="submit"
                    className="min-w-[120px] rounded bg-green-500 px-3 py-2 text-center font-semibold text-white hover:bg-green-600"
                  >
                    CRIAR
                  </button>
                  <Link
                    to="/direcionamentos"
                    className="min-w-[120px] rounded bg-slate-400 px-3 py-2 text-center font-semibold text-white hover:bg-slate-500"
                  >
                    CANCELAR
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
