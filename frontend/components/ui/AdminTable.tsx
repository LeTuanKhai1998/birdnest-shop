import * as React from 'react';
import { LoadingOrEmpty } from '@/components/ui/LoadingOrEmpty';
import {
  Table,
  TableHead,
  TableHeader,
  TableRow,
  TableBody,
  TableCell,
  TableFooter,
} from '@/components/ui/table';

interface AdminTableProps<T> {
  columns: {
    key: keyof T | string;
    label: string;
    align?: 'left' | 'center' | 'right';
  }[];
  data: T[];
  loading?: boolean;
  emptyMessage?: string;
  pagination?: React.ReactNode;
  actions?: (row: T) => React.ReactNode;
  exportButtons?: React.ReactNode;
  statusBadgeRenderer?: (status: unknown) => React.ReactNode;
}

export function AdminTable<
  T extends { id: string | number } = { id: string | number },
>({
  columns,
  data,
  loading,
  emptyMessage = 'No data found.',
  pagination,
  actions,
  exportButtons,
  statusBadgeRenderer,
}: AdminTableProps<T>) {
  return (
    <div className="w-full bg-white dark:bg-neutral-800 rounded-xl shadow p-6 overflow-x-auto">
      {exportButtons && <div className="flex gap-2 mb-4">{exportButtons}</div>}
      <Table className="min-w-full border border-gray-200 divide-y divide-gray-200">
        <TableHeader>
          <TableRow>
            {columns.map((col) => (
              <TableHead
                key={col.key as string}
                className={`py-3 px-4 text-base font-semibold text-left align-middle bg-white ${col.align === 'center' ? 'text-center' : col.align === 'right' ? 'text-right' : 'text-left'}`}
              >
                {col.label}
              </TableHead>
            ))}
            {actions && (
              <TableHead className="py-3 px-4 text-right align-middle bg-white">
                Actions
              </TableHead>
            )}
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            <TableRow>
              <TableCell
                colSpan={columns.length + (actions ? 1 : 0)}
                className="text-center py-8"
              >
                <LoadingOrEmpty loading />
              </TableCell>
            </TableRow>
          ) : data.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={columns.length + (actions ? 1 : 0)}
                className="text-center py-8 text-gray-400"
              >
                <LoadingOrEmpty>{emptyMessage}</LoadingOrEmpty>
              </TableCell>
            </TableRow>
          ) : (
            data.map((row) => (
              <TableRow
                key={row.id}
                className="hover:bg-gray-50 dark:hover:bg-neutral-700 transition divide-y divide-gray-200"
              >
                {columns.map((col) => (
                  <TableCell
                    key={col.key as string}
                    className={`py-3 px-4 text-sm align-middle ${col.align === 'center' ? 'text-center' : col.align === 'right' ? 'text-right' : 'text-left'}`}
                  >
                    {statusBadgeRenderer && col.key === 'status'
                      ? statusBadgeRenderer(row[col.key as keyof T])
                      : (row[col.key as keyof T] as React.ReactNode)}
                  </TableCell>
                ))}
                {actions && (
                  <TableCell className="py-3 px-4 text-right align-middle">
                    {actions(row)}
                  </TableCell>
                )}
              </TableRow>
            ))
          )}
        </TableBody>
        {pagination && (
          <TableFooter>
            <TableRow>
              <TableCell
                colSpan={columns.length + (actions ? 1 : 0)}
                className="py-3 px-4 text-right align-middle"
              >
                {pagination}
              </TableCell>
            </TableRow>
          </TableFooter>
        )}
      </Table>
    </div>
  );
}
