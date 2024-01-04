import { useLocation, Navigate } from "react-router-dom";

type ConfirmationPageState = {
  message: "new-requirement" | "reschedule-request" | "confirmed-presence";
  protocolo: string;
};

export default function RequerimentoConfirmationPage() {
  const location = useLocation();
  const data = location.state as ConfirmationPageState;

  return data.message === "new-requirement" ? (
    <div className="mx-4 mt-10 flex max-w-[600px] flex-col border border-green-300 bg-green-100 px-4 py-3 text-center shadow sm:mx-auto">
      <h2 className="text-lg font-bold text-green-800">
        Requerimento registrado com sucesso.
      </h2>
      <h3>
        <span className="font-bold">Protocolo:</span> {data.protocolo}
      </h3>
      <div className="my-2 bg-black/20 pt-[2px]" />
      <p className="mb-2">
        As informações do seu requerimento serão enviadas ao e-mail informado,
        fique atento e{" "}
        <span className="font-bold">VERIFIQUE SUA CAIXA DE SPAM</span>.
      </p>
      <p>A resposta com o agendamento poderá se dar em até 48 horas úteis.</p>
    </div>
  ) : data.message === "confirmed-presence" ? (
    <div className="mx-4 mt-10 flex max-w-[600px] flex-col border border-green-300 bg-green-100 px-4 py-3 text-center shadow sm:mx-auto">
      <h2 className="text-lg font-bold text-green-800">
        Requerimento confirmado com sucesso.
      </h2>
      <h3>
        <span className="font-bold">Protocolo:</span> {data.protocolo}
      </h3>
      <div className="my-2 bg-black/20 pt-[2px]" />
      <p>
        Compareça ao local direcionado na data e hora informados, seguindo as
        demais instruções informadas por e-mail.
      </p>
    </div>
  ) : data.message === "reschedule-request" ? (
    <div className="mx-4 mt-10 flex max-w-[600px] flex-col border border-green-300 bg-green-100 px-4 py-3 text-center shadow sm:mx-auto">
      <h2 className="text-lg font-bold text-green-800">
        Reagendamento solicitado com sucesso.
      </h2>
      <h3>
        <span className="font-bold">Protocolo:</span> {data.protocolo}
      </h3>
      <div className="my-2 bg-black/20 pt-[2px]" />
      <p className="mb-2">
        As informações do reagendamento serão enviadas ao e-mail informado,
        fique atento e{" "}
        <span className="font-bold">VERIFIQUE SUA CAIXA DE SPAM</span>.
      </p>
      <p>A resposta com o reagendamento poderá se dar em até 48 horas úteis.</p>
    </div>
  ) : (
    <Navigate to="/" />
  );
}
