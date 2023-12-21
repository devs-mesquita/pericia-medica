import { useMutation } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { EyeIcon, EyeOffIcon, LoaderIcon, LockIcon } from "lucide-react";
import React from "react";
import { useAuthHeader, useSignOut } from "react-auth-kit";
import { notificationAtom } from "@/store";
import { useAtom } from "jotai";

type ChangePasswordData = {
  currentPassword: string;
  newPassword: string;
  newPasswordConfirmation: string;
};

const API_URL = import.meta.env.VITE_API_URL;

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
        body: JSON.stringify({
          currentPassword,
          newPassword,
          newPasswordConfirmation,
        }),
      });

      const data = await res.json();
      return data;
    },
    onSuccess: () => {
      signOut();
      setNotification({
        message: "Senha alterada com sucesso, efetue o acesso novamente.",
        type: "success",
      });
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
  };

  return (
    <div className="mb-auto mt-16 rounded-lg shadow">
      <div className="rounded-t-lg border border-black/5 bg-slate-600/10 p-2 text-center">
        <h1>Alterar Senha</h1>
      </div>
      <form onSubmit={handleSubmit} className="flex flex-col gap-2">
        <div className="flex flex-col gap-4 px-4 pb-2 pt-4">
          <div className="flex flex-1 flex-col gap-1">
            <label htmlFor="">Senha Atual:</label>
            <div className="flex items-center gap-2 rounded border border-slate-300 bg-white p-2 text-slate-700 outline-none focus-within:border-indigo-600 focus:border-slate-500 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-600/80">
              <LockIcon className="h-5 w-5" />
              <input
                required
                value={form.currentPassword}
                onChange={handleChange}
                name="currentPassword"
                className="rounded outline-none"
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
                required
                type="checkbox"
                name="showCurrentPassword"
                id="showCurrentPassword"
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
                value={form.newPassword}
                onChange={handleChange}
                name="newPassword"
                className="rounded outline-none"
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
                required
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
                value={form.newPasswordConfirmation}
                onChange={handleChange}
                name="newPasswordConfirmation"
                className="rounded outline-none"
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
                className="col-start-2 flex justify-center rounded-full bg-roxo px-2 py-1 text-center text-sm font-semibold uppercase text-white"
              >
                Confirmar
              </button>
              <Link
                to="/home"
                className="col-start-3 rounded-full bg-slate-400 px-2 py-1 text-center text-sm font-semibold uppercase text-white"
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
