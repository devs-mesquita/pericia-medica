import * as React from "react";
import TimePicker from "@/components/ui/timepicker";
import { useAuthHeader } from "react-auth-kit";
import { Direcionamento } from "@/types/interfaces";
import { nanoid } from "nanoid";
import { SendIcon } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL;

export default function DirecionamentoCreatePage() {
  const [time, setTime] = React.useState<string>("");
  const authHeader = useAuthHeader();

  return (
    <div className="flex flex-1 flex-col rounded-md bg-slate-100 p-2 pt-1 shadow shadow-black/20">
      <h1 className="mb-2 flex items-center justify-center border-b-2 border-slate-300 py-3">
        <SendIcon className="h-5 w-5" />
        <span className="ml-1 font-semibold">Criar Novo Direcionamento</span>
      </h1>
      <div className="flex flex-1 flex-col rounded border border-slate-300">
        <div className="grid grid-cols-4 items-center justify-items-center border-b-2 border-slate-300 py-2 font-semibold">
          <h2 className="ml-4 justify-self-start">Dia da Semana</h2>
          <h2>Habilitar dia?</h2>
          <h2>Horário Mínimo</h2>
          <h2>Horário Máximo</h2>
        </div>
        <form className="flex flex-col">
          <div className="grid grid-cols-4 items-center justify-items-center border-b border-slate-300">
            <h3 className="ml-4 justify-self-start">Domingo</h3>
            <input type="checkbox" name="" id="" />
            <TimePicker
              className="rounded px-2 py-1 text-lg disabled:bg-white"
              minTime="00:00"
              maxTime="23:00"
              value={time}
              onChange={setTime}
              step={3600}
            />
            <TimePicker
              className="rounded px-2 py-1 text-lg disabled:bg-white"
              minTime="00:00"
              maxTime="23:00"
              value={time}
              onChange={setTime}
              step={3600}
            />
          </div>
          <div className="grid grid-cols-4 items-center justify-items-center border-b border-slate-300">
            <h3 className="ml-4 justify-self-start">Segunda-Feira</h3>
            <input type="checkbox" name="" id="" />
            <TimePicker
              className="rounded px-2 py-1 text-lg disabled:bg-white"
              minTime="00:00"
              maxTime="23:00"
              value={time}
              onChange={setTime}
              step={3600}
            />
            <TimePicker
              className="rounded px-2 py-1 text-lg disabled:bg-white"
              minTime="00:00"
              maxTime="23:00"
              value={time}
              onChange={setTime}
              step={3600}
            />
          </div>
          <div className="grid grid-cols-4 items-center justify-items-center border-b border-slate-300">
            <h3 className="ml-4 justify-self-start">Terça-Feira</h3>
            <input type="checkbox" name="" id="" />
            <TimePicker
              className="rounded px-2 py-1 text-lg disabled:bg-white"
              minTime="00:00"
              maxTime="23:00"
              value={time}
              onChange={setTime}
              step={3600}
            />
            <TimePicker
              className="rounded px-2 py-1 text-lg disabled:bg-white"
              minTime="00:00"
              maxTime="23:00"
              value={time}
              onChange={setTime}
              step={3600}
            />
          </div>
          <div className="grid grid-cols-4 items-center justify-items-center border-b border-slate-300">
            <h3 className="ml-4 justify-self-start">Quarta-Feira</h3>
            <input type="checkbox" name="" id="" />
            <TimePicker
              className="rounded px-2 py-1 text-lg disabled:bg-white"
              minTime="00:00"
              maxTime="23:00"
              value={time}
              onChange={setTime}
              step={3600}
            />
            <TimePicker
              className="rounded px-2 py-1 text-lg disabled:bg-white"
              minTime="00:00"
              maxTime="23:00"
              value={time}
              onChange={setTime}
              step={3600}
            />
          </div>
          <div className="grid grid-cols-4 items-center justify-items-center border-b border-slate-300">
            <h3 className="ml-4 justify-self-start">Quinta-Feira</h3>
            <input type="checkbox" name="" id="" />
            <TimePicker
              className="rounded px-2 py-1 text-lg disabled:bg-white"
              minTime="00:00"
              maxTime="23:00"
              value={time}
              onChange={setTime}
              step={3600}
            />
            <TimePicker
              className="rounded px-2 py-1 text-lg disabled:bg-white"
              minTime="00:00"
              maxTime="23:00"
              value={time}
              onChange={setTime}
              step={3600}
            />
          </div>
          <div className="grid grid-cols-4 items-center justify-items-center border-b border-slate-300">
            <h3 className="ml-4 justify-self-start">Sexta-Feira</h3>
            <input type="checkbox" name="" id="" />
            <TimePicker
              className="rounded px-2 py-1 text-lg disabled:bg-white"
              minTime="00:00"
              maxTime="23:00"
              value={time}
              onChange={setTime}
              step={3600}
            />
            <TimePicker
              className="rounded px-2 py-1 text-lg disabled:bg-white"
              minTime="00:00"
              maxTime="23:00"
              value={time}
              onChange={setTime}
              step={3600}
            />
          </div>
          <div className="grid grid-cols-4 items-center justify-items-center border-b border-slate-300">
            <h3 className="ml-4 justify-self-start">Sábado</h3>
            <input type="checkbox" name="" id="" />
            <TimePicker
              className="rounded px-2 py-1 text-lg disabled:bg-white"
              minTime="00:00"
              maxTime="23:00"
              value={time}
              onChange={setTime}
              step={3600}
            />
            <TimePicker
              className="rounded px-2 py-1 text-lg disabled:bg-white"
              minTime="00:00"
              maxTime="23:00"
              value={time}
              onChange={setTime}
              step={3600}
            />
          </div>
          <div className="flex items-center gap-2">
            <div className="flex">
              <label htmlFor="sem_atendimento">Possui atendimento?</label>
              <input
                type="checkbox"
                name=""
                className="ml-2"
                id="sem_atendimento"
              />
            </div>
            <div className="flex gap-2">
              <button className="rounded bg-green-500 px-3 py-2 font-semibold text-white">
                CRIAR
              </button>
              <button className="rounded bg-slate-400 px-3 py-2 font-semibold text-white">
                CANCELAR
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
