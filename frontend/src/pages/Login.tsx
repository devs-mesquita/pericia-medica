import React from "react";
import { z } from "zod";
import { User, AppNotification } from "@/types/interfaces";
import { useMutation } from "@tanstack/react-query";
import { useSignIn, useIsAuthenticated } from "react-auth-kit";
import { Navigate, useNavigate } from "react-router-dom";
import { useAtom } from "jotai";
import { notificationAtom } from "@/store";

const API_URL = import.meta.env.VITE_API_URL;

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});
type LoginCredentials = z.infer<typeof loginSchema>;

type AuthData = {
  authorization: {
    token: string;
    expires_in: number;
    type: string;
  };
  user: User;
};

const defaultMessageKeys = ["wrong-credentials"];
const defaultMessages: Record<string, AppNotification> = {
  "invalid-credentials": {
    message: "Credenciais inválidas.",
    type: "error",
  },
};

export default function Login() {
  const navigate = useNavigate();
  const signIn = useSignIn();
  const isAuthenticated = useIsAuthenticated();

  const setNotification = useAtom(notificationAtom)[1];

  const loginMutation = useMutation({
    mutationFn: async ({ email, password }: LoginCredentials) => {
      const res = await fetch(`${API_URL}/api/login`, {
        method: "POST",
        body: JSON.stringify({ email, password }),
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      });
      return (await res.json()) as AuthData;
    },
    onError: (error) => {
      if (defaultMessageKeys.includes(error.message)) {
        setNotification(defaultMessages[error.message]);
      } else {
        setNotification(defaultMessages["error"]);
      }
    },
    onSuccess: (data) => {
      signIn({
        token: data.authorization.token,
        refreshToken: data.authorization.token,
        tokenType: data.authorization.type,
        expiresIn: data.authorization.expires_in,
        refreshTokenExpireIn: data.authorization.expires_in,
        authState: { user: data.user },
      });

      navigate("/home");
    },
  });

  const [form, setForm] = React.useState<LoginCredentials>({
    email: "",
    password: "",
  });

  const handleChange = (evt: React.ChangeEvent<HTMLInputElement>) => {
    setForm((st) => ({ ...st, [evt.target.name]: evt.target.value }));
  };

  const handleSubmit = async (evt: React.FormEvent<HTMLFormElement>) => {
    evt.preventDefault();
    const result = loginSchema.safeParse(form);
    if (result.success) {
      loginMutation.mutate(form);
    } else {
      setNotification(defaultMessages["invalid-credentials"]);
    }
  };

  return isAuthenticated() ? (
    <Navigate to="/home" />
  ) : (
    <form
      onSubmit={handleSubmit}
      className="mx-auto mt-8 w-[300px] rounded-lg shadow shadow-black/20 md:w-[500px]"
    >
      <div className="border-b border-black/5">
        <h2 className="rounded-t-xl bg-slate-600/10 p-2 text-center text-xl tracking-wide shadow shadow-black/20">
          SEMAD
        </h2>
      </div>
      <div className="p-4">
        <div className="mb-4 flex flex-col">
          <label htmlFor="email">Email:</label>
          <input
            required
            onChange={handleChange}
            type="email"
            className="w-full rounded border border-roxo p-2 text-sm outline-none focus:border-indigo-600"
            name="email"
            id="email"
            placeholder="arthur.oliveira@mesquita.rj.gov.br"
          />
        </div>
        <div className="mb-2 flex flex-col">
          <label htmlFor="password">Senha:</label>
          <input
            required
            onChange={handleChange}
            type="password"
            className="w-full rounded border border-roxo p-2 text-sm outline-none focus:border-indigo-600"
            name="password"
            id="password"
            placeholder="••••••"
          />
        </div>
      </div>
      <div className="flex justify-center rounded-b-xl border-t border-black/10 p-2 shadow shadow-black/20">
        <button className="rounded-3xl border border-slate-600/20 bg-slate-600/20 px-4 py-1 text-center shadow shadow-black/30 outline-none hover:bg-slate-700/30 focus:border-indigo-600">
          Login
        </button>
      </div>
    </form>
  );
}
