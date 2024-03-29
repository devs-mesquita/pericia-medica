import * as React from "react";
import ReactDOM from "react-dom";
import { useAtom } from "jotai";
import { notificationAtom } from "@/store";
import { LoaderIcon } from "lucide-react";

export interface AppDialog {
  isOpen: boolean;
  isPending: boolean;
  message: string;
  accept: () => void;
  reject: () => void;
}

export type HandleConfirmationParams = {
  isPending: boolean;
  message: string;
  setDialog: React.Dispatch<React.SetStateAction<Omit<AppDialog, "setDialog">>>;
  accept: () => void;
  reject?: () => void;
};

interface ConfirmationDialogProps {
  message: string;
  accept: () => void;
  reject: () => void;
  isPending: boolean;
}

export const dialogInitialState: AppDialog = {
  isOpen: false,
  message: "",
  accept: () => {},
  reject: () => {},
  isPending: false,
};

export const handleConfirmation = ({
  accept = () => {},
  message = "Deseja confimar a operação?",
  setDialog,
  reject = () => {
    setDialog(() => dialogInitialState);
  },
  isPending = false,
}: HandleConfirmationParams) => {
  setDialog({
    isOpen: true,
    accept,
    reject,
    message,
    isPending,
  });
};

export default function ConfirmationDialog({
  message,
  accept,
  reject,
  isPending,
}: ConfirmationDialogProps) {
  const setNotification = useAtom(notificationAtom)[1];

  const handleAccept = async () => {
    try {
      accept();
    } catch (error) {
      setNotification({ message: "Ocorreu um erro.", type: "error" });
    }
  };

  return ReactDOM.createPortal(
    <>
      <div
        className="fixed z-40 h-screen w-screen bg-black/30 backdrop-blur-[1px]"
        onClick={reject}
      ></div>
      <div className="fixed left-1/2 top-1/2 z-50 flex max-h-[90vh] w-72 max-w-[90vw] translate-x-[-50%] translate-y-[-50%] flex-col gap-3 overflow-auto rounded bg-slate-100 p-4 sm:w-[30rem] md:w-[36rem] lg:w-[42rem]">
        <h2 className="text-center text-slate-900">{message}</h2>
        <div className="flex w-full gap-4">
          {isPending ? (
            <LoaderIcon className="mx-auto animate-spin cursor-wait text-slate-700 duration-2000" />
          ) : (
            <>
              <button
                onClick={handleAccept}
                disabled={isPending}
                className="flex-1 rounded bg-green-700 bg-gradient-to-r px-4 py-1 font-semibold text-white shadow shadow-black/20 hover:bg-green-800 hover:text-white disabled:bg-slate-500/10"
              >
                CONFIRMAR
              </button>
              <button
                onClick={reject}
                disabled={isPending}
                className="flex-1 rounded bg-slate-400 px-4 py-1 font-semibold text-white hover:bg-slate-500 disabled:bg-slate-400/25"
              >
                CANCELAR
              </button>
            </>
          )}
        </div>
      </div>
    </>,
    document.querySelector<HTMLDivElement>("#modal")!,
  );
}
