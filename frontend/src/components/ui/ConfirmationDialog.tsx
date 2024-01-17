import React from "react";
import ReactDOM from "react-dom";
import { useAtom } from "jotai";
import { notificationAtom } from "@/store";

interface ConfirmationDialogProps {
  message: string;
  accept: () => void;
  reject: () => void;
}

export default function ConfirmationDialog({
  message,
  accept,
  reject,
}: ConfirmationDialogProps) {
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const setNotification = useAtom(notificationAtom)[1];

  const handleAccept = async () => {
    try {
      setIsLoading(true);
      await accept();
      setIsLoading(false);
    } catch (error) {
      console.error(error);
      setIsLoading(false);
      setNotification({ message: "Ocorreu um erro.", type: "error" });
    }
  };

  return ReactDOM.createPortal(
    <>
      <div
        className="fixed z-40 h-screen w-screen bg-black/30 backdrop-blur-sm"
        onClick={reject}
      ></div>
      <div className="fixed left-1/2 top-1/2 z-50 flex max-h-[90vh] w-72 max-w-[90vw] translate-x-[-50%] translate-y-[-50%] flex-col gap-3 overflow-auto rounded bg-slate-100 p-4 sm:w-[30rem] md:w-[36rem] lg:w-[42rem]">
        <h2 className="text-center text-white/90">{message}</h2>
        <div className="flex w-full gap-4">
          <button
            onClick={handleAccept}
            disabled={isLoading}
            className="flex-1 rounded bg-slate-500/40 bg-gradient-to-r px-4 py-1 text-white text-white/80 shadow shadow-black/20 hover:bg-slate-500/75 hover:text-white disabled:bg-slate-500/10"
          >
            {isLoading ? "Carregando..." : "CONFIRMAR"}
          </button>
          <button
            onClick={reject}
            disabled={isLoading}
            className="flex-1 rounded bg-slate-400 px-4 py-1 text-white hover:bg-slate-500 disabled:bg-slate-400/25"
          >
            CANCELAR
          </button>
        </div>
      </div>
    </>,
    document.querySelector<HTMLDivElement>("#modal")!,
  );
}
