import { useMutation } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { EyeIcon, EyeOffIcon, LoaderIcon, LockIcon } from "lucide-react";
import React from "react";
import { useAuthHeader, useSignOut } from "react-auth-kit";
import { notificationAtom } from "@/store";
import { useAtom } from "jotai";
import { AppNotification } from "@/types/interfaces";
import { errorFromApi } from "@/lib/utils";

type ChangePasswordData = {
  currentPassword: string;
  newPassword: string;
  newPasswordConfirmation: string;
};

const API_URL = import.meta.env.VITE_API_URL;

const notificationMessages: Record<string, AppNotification> = {
  "wrong-confirm-password": {
    message: "A confirmação deve ser igual à nova senha.",
    type: "error",
  },
  "not-found": {
    message: "O usuário não foi encontrado.",
    type: "error",
  },
  "wrong-current-password": {
    message: "A senha atual está incorreta.",
    type: "error",
  },
  ok: {
    message: "Senha alterada com sucesso, efetue o acesso novamente.",
    type: "success",
  },
} as const;

type APIMessage =
  | "ok"
  | "wrong-current-password"
  | "wrong-confirm-password"
  | "not-found";

export default function ChangePasswordPage() {
  const setNotification = useAtom(notificationAtom)[1];
  const authHeader = useAuthHeader();
  const signOut = useSignOut();

  const changePasswordMutation = useMutation({
    mutationFn: async ({
      currentPassword,
      newPassword,
      newPasswordConfirmation,
    }: ChangePasswordData) => {
      const res = await fetch(`${API_URL}/api/changepassword`, {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: authHeader(),
        },
        method: "POST",
        body: JSON.stringify({
          currentPassword,
          newPassword,
          newPasswordConfirmation,
        }),
      });

      if (!res.ok) {
        throw await res.json();
      }

      return await res.json();
    },
    onSuccess: ({ message }) => {
      signOut();
      setNotification(notificationMessages[message]);
    },
    onError: (err) => {
      console.log(err);
      if (errorFromApi<{ message: APIMessage }>(err, "message")) {
        setNotification(notificationMessages[err.message]);
      } else {
        setNotification({
          message: "Ocorreu um erro.",
          type: "error",
        });
      }
    },
  });

  const [form, setForm] = React.useState({
    currentPassword: "",
    newPassword: "",
    newPasswordConfirmation: "",
  });

  const handleChange = (evt: React.ChangeEvent<HTMLInputElement>) => {
    setForm((st) => ({
      ...st,
      [evt.target.name]: evt.target.value,
    }));
  };

  const [formUI, setFormUI] = React.useState({
    showCurrentPassword: false,
    showNewPasswordConfirmation: false,
    showNewPassword: false,
  });
  const handleUIToggle = (evt: React.ChangeEvent<HTMLInputElement>) => {
    setFormUI((st) => ({
      ...st,
      [evt.target.name]: !evt.target.defaultChecked,
    }));
  };

  const handleSubmit = (evt: React.FormEvent<HTMLFormElement>) => {
    evt.preventDefault();
    changePasswordMutation.mutate({
      currentPassword: form.currentPassword,
      newPassword: form.newPassword,
      newPasswordConfirmation: form.newPasswordConfirmation,
    });
  };

  return (
    <div className="mb-auto mt-16 rounded-lg shadow">
      <div className="rounded-t-lg border border-black/10 bg-slate-100 p-2 text-center">
        <h1 className="font-semibold">Alterar Senha</h1>
      </div>
      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-2 rounded-b-lg border border-t-0 border-black/10 bg-slate-100"
      >
        <div className="flex flex-col gap-4 px-4 pb-2 pt-4">
          <div className="group flex flex-1 flex-col gap-1">
            <label htmlFor="">Senha Atual:</label>
            <div className="flex items-center gap-2 rounded border border-slate-300 bg-white p-2 text-slate-700 outline-none focus-within:border-indigo-600 focus:border-slate-500 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-600/80">
              <LockIcon className="h-5 w-5" />
              <input
                required
                value={form.currentPassword}
                onChange={handleChange}
                disabled={changePasswordMutation.isPending}
                name="currentPassword"
                className="rounded px-2 outline-none disabled:cursor-not-allowed disabled:bg-slate-300"
                placeholder="••••••"
                type={formUI.showCurrentPassword ? "text" : "password"}
              />
              <label htmlFor="showCurrentPassword" className="cursor-pointer">
                {formUI.showCurrentPassword ? (
                  <EyeOffIcon className="h-5 w-5" />
                ) : (
                  <EyeIcon className="h-5 w-5" />
                )}
              </label>
              <input
                type="checkbox"
                name="showCurrentPassword"
                id="showCurrentPassword"
                disabled={changePasswordMutation.isPending}
                onChange={handleUIToggle}
                className="invisible absolute"
                defaultChecked={formUI.showCurrentPassword}
              />
            </div>
          </div>
          <div className="flex flex-1 flex-col gap-1">
            <label htmlFor="">Nova Senha:</label>
            <div className="flex items-center gap-2 rounded border border-slate-300 bg-white p-2 text-slate-700 outline-none focus-within:border-indigo-600 focus:border-slate-500 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-600/80">
              <LockIcon className="h-5 w-5" />
              <input
                required
                value={form.newPassword}
                onChange={handleChange}
                name="newPassword"
                className="rounded px-2 outline-none disabled:cursor-not-allowed disabled:bg-slate-300"
                disabled={changePasswordMutation.isPending}
                placeholder="••••••"
                type={formUI.showNewPassword ? "text" : "password"}
              />
              <label htmlFor="showNewPassword" className="cursor-pointer">
                {formUI.showNewPassword ? (
                  <EyeOffIcon className="h-5 w-5" />
                ) : (
                  <EyeIcon className="h-5 w-5" />
                )}
              </label>
              <input
                type="checkbox"
                name="showNewPassword"
                id="showNewPassword"
                onChange={handleUIToggle}
                className="invisible absolute"
                defaultChecked={formUI.showNewPassword}
              />
            </div>
          </div>
          <div className="flex flex-1 flex-col gap-1">
            <label htmlFor="">Confirmar Nova Senha:</label>
            <div className="flex items-center gap-2 rounded border border-slate-300 bg-white p-2 text-slate-700 outline-none focus-within:border-indigo-600 focus:border-slate-500 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-600/80">
              <LockIcon className="h-5 w-5" />
              <input
                required
                value={form.newPasswordConfirmation}
                onChange={handleChange}
                disabled={changePasswordMutation.isPending}
                name="newPasswordConfirmation"
                className="rounded px-2 outline-none disabled:cursor-not-allowed disabled:bg-slate-300"
                placeholder="••••••"
                type={formUI.showNewPasswordConfirmation ? "text" : "password"}
              />
              <label
                htmlFor="showNewPasswordConfirmation"
                className="cursor-pointer"
              >
                {formUI.showNewPasswordConfirmation ? (
                  <EyeOffIcon className="h-5 w-5" />
                ) : (
                  <EyeIcon className="h-5 w-5" />
                )}
              </label>
              <input
                type="checkbox"
                name="showNewPasswordConfirmation"
                id="showNewPasswordConfirmation"
                onChange={handleUIToggle}
                className="invisible absolute"
                defaultChecked={formUI.showNewPasswordConfirmation}
              />
            </div>
          </div>
        </div>
        <div className="flex justify-center gap-4 pb-4">
          {!changePasswordMutation.isPending ? (
            <>
              <button
                type="submit"
                className="col-start-2 flex justify-center rounded-full bg-roxo px-4 py-1 text-center text-sm font-semibold uppercase text-white hover:bg-roxo-lighter"
              >
                Confirmar
              </button>
              <Link
                to="/home"
                className="col-start-3 rounded-full bg-slate-500 px-4 py-1 text-center text-sm font-semibold uppercase text-white hover:bg-slate-400"
              >
                Cancelar
              </Link>
            </>
          ) : (
            <button className="col-start-2 flex justify-center rounded-full bg-roxo px-4 py-1 text-center uppercase text-white">
              <LoaderIcon className="animate-spin text-white duration-2000" />
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
