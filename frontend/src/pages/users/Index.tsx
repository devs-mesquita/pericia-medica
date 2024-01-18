import * as React from "react";
import { DataTable, Paginated } from "@/components/DataTable/data-table";
import type { AppDialog, User } from "@/types/interfaces";
import {
  ColumnDef,
  ColumnFiltersState,
  PaginationState,
  SortingState,
} from "@tanstack/react-table";
import {
  BanIcon,
  EditIcon,
  PlusSquareIcon,
  PowerIcon,
  BookUserIcon,
  RotateCcwIcon,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuthHeader } from "react-auth-kit";
import { useAtom } from "jotai";
import { notificationAtom } from "@/store";
import ConfirmationDialog from "@/components/ui/ConfirmationDialog";

type DeleteUserResponse = {
  user: User;
};

const API_URL = import.meta.env.VITE_API_URL;

export default function UserIndexPage() {
  document.title = "Usuários";
  
  const authHeader = useAuthHeader();
  const setNotification = useAtom(notificationAtom)[1];
  const queryClient = useQueryClient();

  const dialogInitialState: AppDialog = {
    isOpen: false,
    message: "",
    accept: () => {},
    reject: () => {},
    isPending: false,
  };

  const [dialog, setDialog] = React.useState<AppDialog>(dialogInitialState);

  const handleConfirmation = (
    accept: () => void,
    isPending: boolean,
    message: string = "Deseja confimar a operação?",
    reject = () => {
      setDialog(() => dialogInitialState);
    },
  ) => {
    setDialog({
      isOpen: true,
      accept,
      reject,
      message,
      isPending,
    });
  };

  const resetUserPasswordMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`${API_URL}/api/users/${id}/resetpassword`, {
        method: "POST",
        body: JSON.stringify({ _method: "PATCH" }),
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: authHeader(),
        },
      });

      if (!res.ok) {
        throw await res.json();
      }

      return (await res.json()) as DeleteUserResponse;
    },
    onSuccess: () => {
      setNotification({
        message: "Senha restaurada com sucesso.",
        type: "success",
      });
      setDialog(dialogInitialState);
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
    onError: () => {
      setNotification({
        message: "Ocorreu um erro.",
        type: "error",
      });
    },
  });

  const deleteUserMutation = useMutation({
    mutationFn: async (id: number) => {
      console.log(id);

      const res = await fetch(`${API_URL}/api/users/${id}`, {
        method: "POST",
        body: JSON.stringify({ _method: "DELETE" }),
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: authHeader(),
        },
      });

      if (!res.ok) {
        throw await res.json();
      }

      return (await res.json()) as DeleteUserResponse;
    },
    onSuccess: (data) => {
      setNotification({
        message: `Usuário ${
          data.user.deleted_at ? "desativado" : "reativado"
        } com sucesso.`,
        type: "success",
      });
      setDialog(dialogInitialState);
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
    onError: () => {
      setNotification({
        message: "Ocorreu um erro.",
        type: "error",
      });
    },
  });

  const columns: ColumnDef<User>[] = [
    {
      accessorKey: "name",
      header: "Nome",
      enableColumnFilter: true,
      enableSorting: true,
    },
    {
      accessorKey: "email",
      header: "Email",
      enableColumnFilter: true,
      enableSorting: true,
    },
    {
      accessorKey: "role",
      header: "Nível de Acesso",
      enableColumnFilter: true,
      enableSorting: true,
      cell: ({ row }) => {
        let role = "";
        switch (row.getValue("role")) {
          case "Guest":
            role = "Visitante";
            break;
          case "User":
            role = "Usuário";
            break;
          case "Admin":
            role = "Administrador";
            break;
          case "Super-Admin":
            role = "Super Administrador";
            break;
        }
        return role;
      },
    },
    {
      accessorKey: "deleted_at",
      header: "Status",
      cell: ({ row }) => {
        return row.getValue("deleted_at") ? "Desativado" : "Ativo";
      },
      enableColumnFilter: false,
      enableSorting: true,
    },
    {
      enableColumnFilter: false,
      enableSorting: false,
      accessorKey: "id",
      header: () => <div className="text-right">Ações</div>,
      cell: ({ row }) => {
        return (
          <div className="flex w-full justify-end gap-4">
            <Link
              className="rounded bg-yellow-500 p-2 text-white hover:bg-yellow-600"
              to={`/users/${row.getValue("id")}/edit`}
              title="Modificar usuário."
            >
              <EditIcon className="h-5 w-5" />
            </Link>
            <form
              onSubmit={(evt) => {
                evt.preventDefault();
                handleConfirmation(
                  () => resetUserPasswordMutation.mutate(row.original.id),
                  resetUserPasswordMutation.isPending,
                  `Deseja confirmar a restauração de senha do usuário ${
                    row.original.name.split(" ")[0]
                  }?`,
                );
              }}
            >
              <button
                type="submit"
                className="rounded bg-blue-500 p-2 text-white hover:bg-blue-600"
                title="Restaurar senha."
              >
                <RotateCcwIcon className="h-5 w-5" />
              </button>
            </form>
            <form
              onSubmit={(evt) => {
                evt.preventDefault();
                handleConfirmation(
                  () => deleteUserMutation.mutate(row.original.id),
                  deleteUserMutation.isPending,
                  `Deseja confirmar a ${
                    row.original.deleted_at ? "reativação" : "desativação"
                  } do usuário?`,
                );
              }}
            >
              {row.original.deleted_at ? (
                <button
                  type="submit"
                  className="rounded bg-green-500 p-2 text-white hover:bg-green-600"
                  title="Reativar usuário."
                >
                  <PowerIcon className="h-5 w-5" />
                </button>
              ) : (
                <button
                  type="submit"
                  className="rounded bg-red-500 p-2 text-white hover:bg-red-600"
                  title="Desativar usuário."
                >
                  <BanIcon className="h-5 w-5" />
                </button>
              )}
            </form>
          </div>
        );
      },
    },
  ];

  // Filtros
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    [],
  );

  // Ordenações
  const [sorting, setSorting] = React.useState<SortingState>([]);

  // Página atual, quantidade por página
  const [pagination, setPagination] = React.useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });

  // Quantidade de Páginas
  const [pageCount, setPageCount] = React.useState(1);

  const { data, refetch, isFetching } = useQuery<Paginated<User[]>>({
    queryKey: ["users"],
    queryFn: async () => {
      const requestBody = {
        page: pagination.pageIndex + 1,
        per_page: pagination.pageSize,
        sorting,
        columnFilters,
      };

      const res = await fetch(`${API_URL}/api/users/query`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: authHeader(),
        },
        body: JSON.stringify(requestBody),
      });

      if (!res.ok) {
        throw await res.json();
      }

      return (await res.json()) as Paginated<User[]>;
    },
    initialData: {
      data: [],
      last_page: 1,
      from: 1,
      to: 1,
      total: 1,
      per_page: 10,
      current_page: 1,
    },
  });

  React.useEffect(() => {
    setPageCount(data.last_page);
    if (data.data.length === 0 && data.current_page > 1) {
      setPagination((st) => ({ ...st, pageIndex: 0 }));
    }
  }, [data]);

  React.useEffect(() => {
    const interv = setTimeout(() => {
      refetch();
    }, 250);

    return () => {
      clearTimeout(interv);
    };
  }, [columnFilters, sorting, pagination]);

  return (
    <div className="flex flex-1 flex-col rounded-md bg-slate-100 p-3 shadow shadow-black/20">
      <DataTable
        isFetching={isFetching}
        columnFilters={columnFilters}
        columns={columns}
        data={data}
        setColumnFilters={setColumnFilters}
        setSorting={setSorting}
        sorting={sorting}
        pagination={pagination}
        setPagination={setPagination}
        pageCount={pageCount}
        tableHeadElement={
          <div className="mb-2 flex items-center justify-between gap-1 border-b-2 border-slate-300 px-2 pb-2 text-lg font-semibold">
            <h1 className="flex items-center">
              <BookUserIcon className="h-5 w-5" />
              <span className="ml-2">Usuários</span>
            </h1>
            <Link
              className="rounded bg-green-500 p-1 text-white hover:bg-green-600"
              to="/users/create"
            >
              <PlusSquareIcon className="h-5 w-5" />
            </Link>
          </div>
        }
      />
      {dialog.isOpen && (
        <ConfirmationDialog
          accept={dialog.accept}
          reject={dialog.reject}
          message={dialog.message}
          isPending={dialog.isPending}
        />
      )}
    </div>
  );
}
