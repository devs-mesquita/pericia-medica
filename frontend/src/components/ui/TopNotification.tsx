import { useAtom } from "jotai";
import { notificationAtom, notificationInitialState } from "@/store";
import { XIcon } from "lucide-react";

export default function TopNotification() {
  const [notification, setNotification] = useAtom(notificationAtom);
  return (
    <>
      {notification.message.length > 0 ? (
        <div
          className={`grid grid-cols-3 px-4 py-1 font-bold ${
            notification.type === "error"
              ? "bg-red-400 text-red-900"
              : notification.type === "success"
                ? "bg-green-400 text-green-900"
                : notification.type === "warning"
                  ? "bg-yellow-500 text-yellow-900"
                  : "bg-blue-400 text-blue-900"
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
