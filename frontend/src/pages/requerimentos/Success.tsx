import { useLocation, Navigate } from "react-router-dom";

type SuccessPageState = {
  message: string;
  protocolo: string;
};

export default function RequerimentoSuccessPage() {
  document.title = "Sucesso!";

  const location = useLocation();
  const data = location.state as SuccessPageState;

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
  ) : data.message === "already-confirmado" || data.message === "confirmar" ? (
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
  ) : data.message === "solicitar-reagendamento" ? (
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
  ) : data.message === "recusado" ? (
    <div className="mx-4 mt-10 flex max-w-[600px] flex-col border border-red-300 bg-red-100 px-4 py-3 text-center shadow sm:mx-auto">
      <h2 className="text-lg font-bold text-red-800">
        Este requerimento foi recusado.
      </h2>
      <h3>
        <span className="font-bold">Protocolo:</span> {data.protocolo}
      </h3>
      <div className="my-2 bg-black/20 pt-[2px]" />
      <p>O requerimento foi recusado após análise.</p>
    </div>
  ) : data.message === "em-analise" ? (
    <div className="mx-4 mt-10 flex max-w-[600px] flex-col border border-slate-300 bg-slate-100 px-4 py-3 text-center shadow sm:mx-auto">
      <h2 className="text-lg font-bold text-slate-800">
        Este requerimento está em análise.
      </h2>
      <h3>
        <span className="font-bold">Protocolo:</span> {data.protocolo}
      </h3>
      <div className="my-2 bg-black/20 pt-[2px]" />
      <p className="mb-2">
        As informações do agendamento serão enviadas ao e-mail informado, fique
        atento e <span className="font-bold">VERIFIQUE SUA CAIXA DE SPAM</span>.
      </p>
      <p>A resposta com o agendamento poderá se dar em até 48 horas úteis.</p>
    </div>
  ) : (
    <Navigate to="/" />
  );
}
