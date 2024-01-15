import * as React from "react";
import DatePicker from "@/components/ui/datepicker";

export default function DirecionamentoCreatePage() {
  const [date, setDate] = React.useState<Date>();

  const direcionamento = [
    { dia: "Domingo", fim: "", isOn: 0, index: 0, inicio: "" },
    { dia: "Segunda", fim: "", isOn: 0, index: 1, inicio: "" },
    { dia: "Terça", fim: "13:00", isOn: 1, index: 2, inicio: "13:00" },
    { dia: "Quarta", fim: "09:30", isOn: 1, index: 3, inicio: "09:30" },
    { dia: "Quinta", fim: "16:00", isOn: 1, index: 4, inicio: "16:00" },
    { dia: "Sexta", fim: "", isOn: 0, index: 5, inicio: "" },
    { dia: "Sábado", fim: "", isOn: 0, index: 6, inicio: "" },
  ];

  return (
    <div>
      <DatePicker
        date={date}
        setDate={setDate}
        disabled={(date) => {
          return date < new Date() || !direcionamento[date.getDay()].isOn;
        }}
      />
      <pre>{date && JSON.stringify(direcionamento[date.getDay()])}</pre>
    </div>
  );
}
