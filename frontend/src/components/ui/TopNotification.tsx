import { useAtom } from "jotai";
import { notificationAtom, notificationInitialState } from "@/store";
import { XIcon } from "lucide-react";

export default function TopNotification() {
  const [notification, setNotification] = useAtom(notificationAtom);
  return (
    <>
      {notification.message.length > 0 ? (
        <div
          className={`grid grid-cols-[1fr_2fr_1fr] px-4 py-1 font-bold ${
            notification.type === "error"
              ? "bg-red-300 text-red-900"
              : notification.type === "success"
                ? "bg-green-300 text-green-900"
                : notification.type === "warning"
                  ? "bg-yellow-300 text-yellow-900"
                  : "bg-blue-300 text-blue-900"
          }`}
        >
          <span className="col-start-2 text-center">
            {notification.message}
          </span>
          <button
            onClick={() => setNotification(notificationInitialState)}
            className="col-start-3 self-center justify-self-end text-center"
          >
            <XIcon className="h-5 w-5" />
          </button>
        </div>
      ) : (
        ""
      )}
    </>
  );
}
