import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  ColumnFiltersState,
  OnChangeFn,
  SortingState,
  PaginationState,
} from "@tanstack/react-table";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { Button } from "../ui/button";
import { LoaderIcon, MoveDownIcon, MoveUpIcon } from "lucide-react";

export type DataFetchConfig<T> = {
  page: number;
  per_page: number;
  sort: Record<keyof T, "asc" | "desc" | "">;
  filter: { id: string; value: string }[];
};

export type Paginated<T> = {
  data: T;
  last_page: number;
  from: number;
  to: number;
  total: number;
  per_page: number;
  current_page: number;
};

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: Paginated<TData[]>;
  columnFilters: ColumnFiltersState;
  setColumnFilters: OnChangeFn<ColumnFiltersState>;
  setSorting: OnChangeFn<SortingState>;
  sorting: SortingState;
  pagination: PaginationState;
  pageCount: number;
  setPagination: OnChangeFn<PaginationState>;
  tableHeadElement: JSX.Element;
  isFetching: boolean;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  columnFilters,
  setColumnFilters,
  setSorting,
  sorting,
  pagination,
  pageCount,
  setPagination,
  tableHeadElement,
  isFetching,
}: DataTableProps<TData, TValue>) {
  const table = useReactTable({
    defaultColumn: {
      size: 100,
    },
    data: data.data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    onColumnFiltersChange: setColumnFilters,
    state: {
      sorting,
      columnFilters,
      pagination,
    },
    onSortingChange: setSorting,
    pageCount,
    onPaginationChange: setPagination,
    autoResetPageIndex: false,
  });

  return (
    <>
      {tableHeadElement}
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                return (
                  <TableHead key={header.id}>
                    <div
                      style={{ width: `${header.getSize()}px` }}
                      className="flex flex-col items-start font-bold text-slate-700"
                    >
                      <div
                        {...{
                          className: header.column.getCanSort()
                            ? "cursor-pointer select-none flex items-center"
                            : "",
                          onClick: header.column.getToggleSortingHandler(),
                        }}
                      >
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                        {
                          {
                            asc: <MoveUpIcon className="inline h-5 w-5" />,
                            desc: <MoveDownIcon className="inline h-5 w-5" />,
                          }[(header.column.getIsSorted() as string) ?? null]
                        }
                      </div>
                      {header.column.getCanFilter() ? (
                        <input
                          type="text"
                          onChange={(evt) =>
                            header.column.setFilterValue(evt.target.value)
                          }
                          value={
                            (header.column.getFilterValue() ?? "") as string
                          }
                          className="text-light-50 my-1 w-full rounded border px-2 py-1 font-normal"
                          placeholder={`Filtrar ${header.column.columnDef.header}`}
                        />
                      ) : null}
                    </div>
                  </TableHead>
                );
              })}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows?.length > 0 && !isFetching ? (
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
                {isFetching ? (
                  <LoaderIcon className="mx-auto animate-spin text-slate-700 duration-2000" />
                ) : (
                  "Nenhum registro foi encontrado."
                )}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
      <div className="mt-auto grid grid-cols-1 items-center justify-between space-y-1 border-t-2 border-slate-300 px-2 pt-2 md:grid-cols-3 md:space-x-2 md:space-y-0">
        <div className="text-sm">
          Mostrando de {data.from} até {data.to} de {data.total} registros
        </div>
        <div className="text-sm md:justify-self-center">
          Página {data.current_page} de {data.last_page}
        </div>
        <div className="flex items-center space-x-2 md:justify-self-end">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage() || isFetching}
          >
            Anterior
          </Button>
          <div className="rounded border border-slate-200 bg-white px-2 py-1">
            {pagination.pageIndex + 1}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage() || isFetching}
          >
            Próximo
          </Button>
        </div>
      </div>
    </>
  );
}
