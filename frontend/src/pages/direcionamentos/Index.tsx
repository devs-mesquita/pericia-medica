import * as React from "react";
import { DataTable, Paginated } from "@/components/DataTable/data-table";
import type { Direcionamento } from "@/types/interfaces";
import { format } from "date-fns";
import {
  ColumnDef,
  ColumnFiltersState,
  PaginationState,
  SortingState,
} from "@tanstack/react-table";
import { EditIcon, PlusSquareIcon, SendIcon } from "lucide-react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useAuthHeader } from "react-auth-kit";

const API_URL = import.meta.env.VITE_API_URL;

const columns: ColumnDef<Direcionamento>[] = [
  {
    accessorKey: "name",
    header: "Nome",
    enableColumnFilter: true,
    enableSorting: true,
  },
  {
    accessorKey: "sem_atendimento",
    header: "Possui atendimento?",
    cell: ({ row }) => {
      return row.getValue("sem_atendimento") ? "Não" : "Sim";
    },
    enableColumnFilter: false,
    enableSorting: true,
  },
  {
    accessorKey: "created_at",
    header: "Data de Criação",
    cell: ({ row }) => {
      return format(row.getValue("created_at"), "dd/LL/yyyy");
    },
    enableColumnFilter: true,
    enableSorting: true,
  },
  {
    enableColumnFilter: false,
    enableSorting: false,
    accessorKey: "id",
    header: () => <div className="text-right">Ações</div>,
    cell: ({ row }) => {
      return (
        <div className="flex w-full justify-end">
          <Link
            className="rounded bg-yellow-500 p-2 text-white hover:bg-yellow-600"
            to={`/direcionamentos/${row.getValue("id")}/edit`}
          >
            <EditIcon className="h-5 w-5" />
          </Link>
        </div>
      );
    },
  },
];

export default function DirecionamentoIndexPage() {
  const authHeader = useAuthHeader();

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

  const { data, refetch } = useQuery<Paginated<Direcionamento[]>>({
    queryKey: ["direcionamentos"],
    queryFn: async () => {
      const requestBody = {
        page: pagination.pageIndex + 1,
        per_page: pagination.pageSize,
        sorting,
        columnFilters,
      };

      const res = await fetch(`${API_URL}/api/direcionamentos/query`, {
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

      return (await res.json()) as Paginated<Direcionamento[]>;
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
              <SendIcon className="h-5 w-5" />
              <span className="ml-2">Direcionamentos</span>
            </h1>
            <Link
              className="rounded bg-green-500 p-1 text-white hover:bg-green-600"
              to="/direcionamentos/create"
            >
              <PlusSquareIcon className="h-5 w-5" />
            </Link>
          </div>
        }
      />
    </div>
  );
}
