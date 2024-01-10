import * as React from "react";
import {
  DataTable,
  DataFetchConfig,
  Paginated,
} from "@/components/DataTable/data-table";
import type { Direcionamento } from "@/types/interfaces";
import { ColumnDef } from "@tanstack/react-table";
import { EditIcon } from "lucide-react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useAuthHeader } from "react-auth-kit";

const API_URL = import.meta.env.VITE_API_URL;

const columns: ColumnDef<Direcionamento>[] = [
  {
    accessorKey: "name",
    header: "Nome",
  },
  {
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

  const [direcionamentoFetchConfig, setDirecionamentoFetchConfig] =
    React.useState<DataFetchConfig<Direcionamento>>({
      page: 1,
      per_page: 10,
      sort: {
        id: "",
        name: "",
        config: "",
        sem_atendimento: "asc",
        created_at: "",
        deleted_at: "",
        updated_at: "",
      },
      filter: {
        id: "",
        name: "",
        sem_atendimento: "",
        config: "",
        created_at: "",
        deleted_at: "",
        updated_at: "",
      },
    });

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
        body: JSON.stringify(direcionamentoFetchConfig),
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

  return (
    <div className="flex flex-1 flex-col rounded-md bg-slate-100 p-3 shadow shadow-black/20">
      <DataTable
        columns={columns}
        data={data.data}
        setDataFetchConfig={setDirecionamentoFetchConfig}
      />
    </div>
  );
}
