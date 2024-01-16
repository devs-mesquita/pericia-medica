import * as React from "react";
import DatePicker from "@/components/ui/datepicker";
import TimePicker from "@/components/ui/timepicker";
import { useQuery } from "@tanstack/react-query";
import { useAuthHeader } from "react-auth-kit";
import { Direcionamento } from "@/types/interfaces";
import { nanoid } from "nanoid";

const API_URL = import.meta.env.VITE_API_URL;

export default function RequerimentoAvaliacaoPage() {
  const [date, setDate] = React.useState<Date | undefined>(undefined);
  const [time, setTime] = React.useState<string>("");

  const authHeader = useAuthHeader();

  const { data, isFetching } = useQuery({
    queryKey: ["direcionamentos"],
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

  const direcionamento = [
    { dia: "Domingo", inicio: "", isOn: 0, index: 0, fim: "" },
    { dia: "Segunda", inicio: "", isOn: 0, index: 1, fim: "" },
    { dia: "Terça", inicio: "09:00", isOn: 1, index: 2, fim: "12:00" },
    { dia: "Quarta", inicio: "09:00", isOn: 1, index: 3, fim: "15:00" },
    { dia: "Quinta", inicio: "16:00", isOn: 1, index: 4, fim: "16:00" },
    { dia: "Sexta", inicio: "", isOn: 0, index: 5, fim: "" },
    { dia: "Sábado", inicio: "", isOn: 0, index: 6, fim: "" },
  ];

  return (
    <div className="flex items-center gap-1">
      <select
        disabled={isFetching}
        name=""
        id=""
        className="rounded bg-white p-2 text-base"
      >
        {data ? (
          data.map((direcionamento) => {
            return (
              <option key={nanoid()} value={direcionamento.id}>
                {direcionamento.name}
              </option>
            );
          })
        ) : (
          <option value="">Carregando...</option>
        )}
      </select>
      <DatePicker
        date={date}
        setDate={setDate}
        disabled={(date) => {
          return date < new Date() || !direcionamento[date.getDay()].isOn;
        }}
      />
      {date ? (
        <TimePicker
          className="rounded px-2 py-1 text-lg disabled:bg-white"
          minTime={direcionamento[date.getDay()].inicio}
          maxTime={direcionamento[date.getDay()].fim}
          value={time}
          onChange={setTime}
        />
      ) : (
        <input
          type="time"
          className="rounded px-2 py-1 text-lg disabled:bg-white"
          disabled
        />
      )}
    </div>
  );
}
