import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { SendIcon } from "lucide-react";

export type DataFetchConfig<T> = {
  page: number;
  per_page: number;
  sort: Record<keyof T, "asc" | "desc" | "">;
  filter: Record<keyof T, any>;
};

export type Paginated<T> = {
  data: T;
  page: number;
  per_page: number;
  last_page: number;
};

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  setDataFetchConfig: React.Dispatch<
    React.SetStateAction<DataFetchConfig<TData>>
  >;
}

export function DataTable<TData, TValue>({
  columns,
  data,
}: DataTableProps<TData, TValue>) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <>
      <h1 className="flex items-center gap-1 border-slate-300 text-lg font-semibold">
        <SendIcon className="h-5 w-5" />
        <span className="ml-1">Direcionamentos</span>
      </h1>
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                return (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                  </TableHead>
                );
              })}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                data-state={row.getIsSelected() && "selected"}
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center">
                Nenhum registro foi encontrado.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </>
  );
}
