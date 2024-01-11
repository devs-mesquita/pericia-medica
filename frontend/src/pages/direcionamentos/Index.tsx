import * as React from "react";
import { DataTable, Paginated } from "@/components/DataTable/data-table";
import type { Direcionamento } from "@/types/interfaces";
import {
  ColumnDef,
  ColumnFiltersState,
  PaginationState,
  SortingState,
} from "@tanstack/react-table";
import { EditIcon, SendIcon } from "lucide-react";
import { Link } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
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
    header: "Presencial",
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
            className="rounded bg-yellow-500 p-2 hover:bg-yellow-600"
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
  const queryClient = useQueryClient();

  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    [],
  );
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [pagination, setPagination] = React.useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });

  const [pageCount, setPageCount] = React.useState(1);

  const { data } = useQuery<Paginated<Direcionamento[]>>({
    queryKey: ["direcionamentos"],
    queryFn: async () => {
      const res = await fetch(`${API_URL}/api/direcionamentos/query`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: authHeader(),
        },
        body: JSON.stringify({}),
      });

      if (!res.ok) {
        throw await res.json();
      }

      return (await res.json()) as Paginated<Direcionamento[]>;
    },
    initialData: {
      data: [],
      page: 1,
      per_page: 10,
      last_page: 1,
    },
  });

  React.useEffect(() => {
    // apply states
  }, [data]);

  React.useEffect(() => {
    console.log(columnFilters, sorting, pagination);
    const interv = setTimeout(() => {
      queryClient.invalidateQueries({ queryKey: ["direcionamentos"] });
    }, 1000);

    return () => {
      clearTimeout(interv);
    };
  }, [columnFilters, sorting, pagination]);

  return (
    <div className="flex flex-1 flex-col rounded-md bg-slate-100 p-3 shadow shadow-black/20">
      <DataTable
        columnFilters={columnFilters}
        columns={columns}
        data={data.data}
        setColumnFilters={setColumnFilters}
        setSorting={setSorting}
        sorting={sorting}
        pagination={pagination}
        setPagination={setPagination}
        pageCount={pageCount}
        tableIcon={<SendIcon className="h-5 w-5" />}
        tableTitle="Direcionamentos"
      />
    </div>
  );
}
