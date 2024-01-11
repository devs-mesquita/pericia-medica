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

export type DataFetchConfig<T> = {
  page: number;
  per_page: number;
  sort: Record<keyof T, "asc" | "desc" | "">;
  filter: { id: string; value: string }[];
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
  columnFilters: ColumnFiltersState;
  setColumnFilters: OnChangeFn<ColumnFiltersState>;
  setSorting: OnChangeFn<SortingState>;
  sorting: SortingState;
  pagination: PaginationState;
  pageCount: number;
  setPagination: OnChangeFn<PaginationState>;
  tableTitle: string;
  tableIcon: JSX.Element;
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
  tableTitle,
  tableIcon,
}: DataTableProps<TData, TValue>) {
  const table = useReactTable({
    data,
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
  });

  return (
    <>
      <h1 className="mb-2 flex items-center gap-1 border-b-2 border-slate-300 pb-2 text-lg font-semibold">
        {tableIcon}
        <span className="ml-1">{tableTitle}</span>
      </h1>
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                return (
                  <TableHead key={header.id}>
                    <div className="flex flex-col items-start font-bold text-slate-700">
                      <div
                        {...{
                          className: header.column.getCanSort()
                            ? "cursor-pointer select-none"
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
                            asc: " ↑",
                            desc: " ↓",
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
                          className="text-light-50 my-1 rounded border px-2 py-1 font-normal"
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
      <div className="mt-auto flex items-center justify-end space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          Anterior
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          Próximo
        </Button>
      </div>
    </>
  );
}
