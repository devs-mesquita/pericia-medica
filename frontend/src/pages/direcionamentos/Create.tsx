import * as React from "react";
import DatePicker from "@/components/ui/datepicker";
import TimePicker from "@/components/ui/timepicker";

export default function DirecionamentoCreatePage() {
  const [date, setDate] = React.useState<Date | undefined>(undefined);
  const [time, setTime] = React.useState<string>("");

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
    <div className="flex items-center">
      <DatePicker
        date={date}
        setDate={setDate}
        disabled={(date) => {
          return date < new Date() || !direcionamento[date.getDay()].isOn;
        }}
      />
      {date && (
        <TimePicker
          className="rounded px-2 py-1"
          minTime={direcionamento[date.getDay()].inicio}
          maxTime={direcionamento[date.getDay()].fim}
          value={time}
          onChange={setTime}
        />
      )}
    </div>
  );
}
