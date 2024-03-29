import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate, useParams } from "react-router-dom";
import { LoaderIcon } from "lucide-react";
import React from "react";
import { useAuthHeader } from "react-auth-kit";
import { notificationAtom } from "@/store";
import { useAtom } from "jotai";
import { AppNotification, User } from "@/types/interfaces";
import { errorFromApi } from "@/lib/utils";

type UserEditForm = {
  name: string;
  email: string;
  role: "" | "Guest" | "User" | "Admin" | "Super-Admin";
};
type UserShowResponse = {
  user: User;
};

const API_URL = import.meta.env.VITE_API_URL;

const notificationMessages: Record<string, AppNotification> = {
  "not-found": {
    message: "O usuário não foi encontrado.",
    type: "error",
  },
  "email-conflict": {
    message: "O email informado já está em uso.",
    type: "error",
  },
  ok: {
    message: "Usuário modificado com sucesso.",
    type: "success",
  },
} as const;

type APIMessage = "ok" | "not-found" | "email-conflict";

export default function UserCreatePage() {
  document.title = "Modificar Usuário";

  const setNotification = useAtom(notificationAtom)[1];
  const authHeader = useAuthHeader();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { id } = useParams();

  const { data, isFetching } = useQuery({
    queryKey: ["users", id],
    queryFn: async () => {
      const res = await fetch(`${API_URL}/api/users/${id}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: authHeader(),
        },
      });

      if (!res.ok) {
        throw await res.json();
      }

      return (await res.json()) as UserShowResponse;
    },
  });

  const editUserMutation = useMutation({
    mutationFn: async (data: UserEditForm) => {
      const res = await fetch(`${API_URL}/api/users/${id}`, {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: authHeader(),
        },
        method: "POST",
        body: JSON.stringify({ ...data, _method: "PATCH" }),
      });

      if (!res.ok) {
        throw await res.json();
      }

      return await res.json();
    },
    onSuccess: ({ message }) => {
      setNotification(notificationMessages[message]);
      queryClient.invalidateQueries({
        queryKey: ["users"],
      });
      navigate("/users");
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

  const [form, setForm] = React.useState<UserEditForm>({
    name: "",
    email: "",
    role: "",
  });

  const handleChange = (
    evt: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    setForm((st) => ({
      ...st,
      [evt.target.name]: evt.target.value,
    }));
  };

  const handleSubmit = (evt: React.FormEvent<HTMLFormElement>) => {
    evt.preventDefault();
    editUserMutation.mutate(form);
  };

  React.useEffect(() => {
    if (data) {
      setForm({
        email: data.user.email,
        name: data.user.name,
        role: data.user.role,
      });
    }
  }, [data]);

  return (
    <div className="mx-auto w-full max-w-[700px] rounded-lg shadow shadow-black/30">
      <div className="rounded-t-lg border border-slate-300 bg-slate-50 p-2 text-center">
        <h1 className="font-semibold">Modificar Usuário</h1>
      </div>
      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-2 rounded-b-lg border border-t-0 border-slate-300 bg-slate-50"
      >
        <div className="flex flex-col gap-4 px-4 pb-2 pt-4">
          <div className="group flex flex-1 flex-col gap-1">
            <label htmlFor="">Nome Completo:</label>
            <input
              required
              value={form.name}
              onChange={handleChange}
              disabled={editUserMutation.isPending || isFetching}
              name="name"
              className="rounded border border-slate-300 bg-white p-2 text-slate-700 outline-none focus:border-slate-500 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-600/80"
              placeholder="Arthur de Oliveira Vecchi"
              type="text"
            />
          </div>
          <div className="flex flex-1 flex-col gap-1">
            <label htmlFor="">Email:</label>
            <input
              required
              value={form.email}
              onChange={handleChange}
              name="email"
              className="rounded border border-slate-300 bg-white p-2 text-slate-700 outline-none focus:border-slate-500 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-600/80"
              disabled={editUserMutation.isPending || isFetching}
              placeholder="arthur.oliveira@mesquita.rj.gov.br"
              type="email"
            />
          </div>
          <div className="flex flex-1 flex-col gap-1">
            <label htmlFor="">Nível de Acesso:</label>
            <select
              required
              value={form.role}
              onChange={handleChange}
              disabled={editUserMutation.isPending || isFetching}
              name="role"
              className="rounded border border-slate-300 bg-white p-2 text-slate-700 outline-none focus:border-slate-500 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-600/80"
            >
              <option value="">-- Selecione --</option>
              <option value="Guest">Visitante</option>
              <option value="User">Usuário</option>
              <option value="Admin">Administrador</option>
              <option value="Super-Admin">Super Administrador</option>
            </select>
          </div>
        </div>
        <div className="flex justify-center gap-4 pb-4">
          {!editUserMutation.isPending ? (
            <>
              <button
                type="submit"
                className="col-start-2 flex min-w-[115px] justify-center rounded bg-green-600 px-4 py-1 text-center text-sm font-semibold uppercase text-white hover:bg-green-700"
              >
                SALVAR
              </button>
              <Link
                to="/users"
                className="col-start-3 min-w-[115px] rounded bg-slate-500 px-4 py-1 text-center text-sm font-semibold uppercase text-white hover:bg-slate-600"
              >
                CANCELAR
              </Link>
            </>
          ) : (
            <button
              disabled
              className="col-start-2 flex cursor-wait justify-center rounded bg-green-500 px-4 py-1 text-center uppercase text-green-50"
            >
              <LoaderIcon className="animate-spin text-white duration-2000" />
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
