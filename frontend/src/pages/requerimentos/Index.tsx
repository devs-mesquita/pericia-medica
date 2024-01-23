import * as React from "react";
import { DataTable, Paginated } from "@/components/DataTable/data-table";
import type { Requerimento } from "@/types/interfaces";
import {
  ColumnDef,
  ColumnFiltersState,
  PaginationState,
  SortingState,
} from "@tanstack/react-table";
import {
  CheckCircle2Icon,
  EditIcon,
  EyeIcon,
  FileBarChart2Icon,
  XCircleIcon,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuthHeader } from "react-auth-kit";
import { useAtom } from "jotai";
import { notificationAtom } from "@/store";
import ConfirmationDialog, {
  AppDialog,
  dialogInitialState,
  handleConfirmation,
} from "@/components/ui/ConfirmationDialog";
import { format } from "date-fns";

const API_URL = import.meta.env.VITE_API_URL;

type PresencaAPIResponse = {
  message: "ok" | "not-found";
  presenca: boolean;
};

export default function RequerimentosIndexPage() {
  document.title = "Requerimentos Em Análise";

  const authHeader = useAuthHeader();
  const setNotification = useAtom(notificationAtom)[1];
  const queryClient = useQueryClient();

  const [dialog, setDialog] = React.useState<AppDialog>(dialogInitialState);

  const requerimentoPresencaMutation = useMutation({
    mutationFn: async ({ id, presenca }: { id: number; presenca: boolean }) => {
      const res = await fetch(`${API_URL}/api/requerimentos/${id}/presenca`, {
        method: "POST",
        body: JSON.stringify({ _method: "PATCH", presenca }),
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: authHeader(),
        },
      });

      if (!res.ok) {
        throw await res.json();
      }

      return (await res.json()) as PresencaAPIResponse;
    },
    onSuccess: (data) => {
      setNotification({
        message: `${
          data.presenca ? "Presença" : "Falta"
        } atribuída com sucesso.`,
        type: "success",
      });
      setDialog(dialogInitialState);
      queryClient.invalidateQueries({ queryKey: ["requerimentos"] });
    },
    onError: () => {
      setNotification({
        message: "Ocorreu um erro.",
        type: "error",
      });
    },
  });

  const columns: ColumnDef<Requerimento>[] = [
    {
      accessorKey: "nome",
      header: "Nome",
      enableColumnFilter: true,
      enableSorting: true,
      cell: ({ row }) => {
        return row.original.nome.length <= 11
          ? row.original.nome
          : `${row.original.nome.slice(0, 11)}...`;
      },
    },
    {
      accessorKey: "matricula",
      header: "Matrícula",
      enableColumnFilter: true,
      enableSorting: true,
    },
    {
      accessorKey: "protocolo",
      header: "Protocolo",
      enableColumnFilter: true,
      enableSorting: true,
    },
    {
      accessorKey: "last_movement_at",
      header: "Última Movimentação",
      enableColumnFilter: false,
      enableSorting: true,
      cell: ({ row }) => {
        return format(row.getValue("last_movement_at"), "dd/LL/yyyy H:mm");
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      enableColumnFilter: true,
      enableSorting: true,
      cell: ({ row }) => {
        let lastStatus = "";
        switch (
          row.original.reagendamentos.length > 0
            ? row.original.reagendamentos[
                row.original.reagendamentos.length - 1
              ].status
            : row.original.status
        ) {
          case "em-analise":
            lastStatus = "Em Análise";
            break;
          case "aguardando-confirmacao":
            lastStatus = "Aguardando Confirmação";
            break;
          case "reagendamento-solicitado":
            lastStatus = "Reagendamento Solicitado";
            break;
          case "realocado":
            lastStatus = "Realocado";
            break;
          case "recusado":
            lastStatus = "Recusado";
            break;
          case "confirmado":
            lastStatus = "Confirmado";
            break;
        }
        return lastStatus;
      },
    },
    {
      accessorKey: "direcionamento_id",
      header: "Direcionamento",
      enableColumnFilter: true,
      enableSorting: true,
      cell: ({ row }) => {
        return row.original.direcionamento?.name || "";
      },
    },
    {
      accessorKey: "agenda_datetime",
      header: "Data/Hora Agendada",
      enableColumnFilter: false,
      enableSorting: true,
      cell: ({ row }) => {
        let lastDate =
          row.original.reagendamentos.length > 0
            ? row.original.reagendamentos[
                row.original.reagendamentos.length - 1
              ]?.agenda_datetime || ""
            : row.original?.agenda_datetime || "";

        return lastDate ? format(lastDate || "", "dd/LL/yyyy H:mm") : "";
      },
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
              className="rounded bg-blue-500 p-2 text-white hover:bg-blue-600"
              to={`/requerimentos/${row.getValue("id")}/avaliacao`}
              title="Avaliar requerimento."
            >
              <EditIcon className="h-5 w-5" />
            </Link>
            <Link
              className="rounded bg-cyan-500 p-2 text-white hover:bg-cyan-600"
              to={`/requerimentos/${row.getValue("id")}`}
              title="Visualizar requerimento."
            >
              <EyeIcon className="h-5 w-5" />
            </Link>
            {row.original.status === "aguardando-confirmacao" && (
              <>
                <form
                  onSubmit={(evt) => {
                    evt.preventDefault();
                    handleConfirmation({
                      accept: () =>
                        requerimentoPresencaMutation.mutate({
                          id: row.original.id,
                          presenca: true,
                        }),
                      isPending: requerimentoPresencaMutation.isPending,
                      message: `Deseja confirmar a atribuição de presença?`,
                      setDialog,
                    });
                  }}
                >
                  <button
                    type="submit"
                    className="rounded bg-green-500 p-2 text-white hover:bg-green-600"
                    title="Confirmar presença."
                  >
                    <CheckCircle2Icon className="h-5 w-5" />
                  </button>
                </form>
                <form
                  onSubmit={(evt) => {
                    evt.preventDefault();
                    handleConfirmation({
                      accept: () =>
                        requerimentoPresencaMutation.mutate({
                          id: row.original.id,
                          presenca: false,
                        }),
                      isPending: requerimentoPresencaMutation.isPending,
                      message: "Deseja confirmar a atribuição de falta?",
                      setDialog,
                    });
                  }}
                >
                  <button
                    type="submit"
                    className="rounded bg-red-500 p-2 text-white hover:bg-red-600"
                    title="Atribuir falta."
                  >
                    <XCircleIcon className="h-5 w-5" />
                  </button>
                </form>
              </>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "avaliador_id",
      header: "Avaliador",
      enableColumnFilter: false,
      enableSorting: true,
      cell: ({ row }) => {
        let lastAvaliador =
          row.original.reagendamentos.length > 0
            ? row.original.reagendamentos[
                row.original.reagendamentos.length - 1
              ]?.avaliador?.name || ""
            : row.original?.avaliador?.name || "";

        return lastAvaliador;
      },
    },
  ];

  // Filtros
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    [],
  );

  // Ordenações
  const [sorting, setSorting] = React.useState<SortingState>([
    { id: "last_movement_at", desc: true },
    { id: "status", desc: true },
  ]);

  // Página atual, quantidade por página
  const [pagination, setPagination] = React.useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });

  // Quantidade de Páginas
  const [pageCount, setPageCount] = React.useState(1);

  const { data, refetch, isFetching } = useQuery<Paginated<Requerimento[]>>({
    queryKey: ["requerimentos"],
    queryFn: async () => {
      const requestBody = {
        page: pagination.pageIndex + 1,
        per_page: pagination.pageSize,
        sorting,
        columnFilters,
      };

      const res = await fetch(`${API_URL}/api/requerimentos/query`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: authHeader(),
        },
        body: JSON.stringify({ ...requestBody, section: "ativos" }),
      });

      if (!res.ok) {
        throw await res.json();
      }

      return (await res.json()) as Paginated<Requerimento[]>;
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
              <FileBarChart2Icon className="h-5 w-5" />
              <span className="ml-2">Requerimentos Em Análise</span>
            </h1>
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
