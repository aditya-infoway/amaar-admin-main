import {
  ArrowDownTrayIcon,
  DocumentArrowDownIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
  PlusIcon,
} from "@heroicons/react/24/outline";
import { Table } from "@tanstack/react-table";
import clsx from "clsx";
import { ReactNode } from "react";

import { Button, Input } from "@/components/ui";

interface MasterToolbarProps<T> {
  title: string;
  searchPlaceholder: string;
  table: Table<T>;
  onCreate?: () => void;
  createLabel?: string;
  showFilters: boolean;
  onToggleFilters: () => void;
  onExportExcel: () => void;
  onExportPdf: () => void;
  filterPanel?: ReactNode;
}

export function MasterToolbar<T>({
  title,
  searchPlaceholder,
  table,
  showFilters,
  onToggleFilters,
  onExportExcel,
  onExportPdf,
  filterPanel,
  onCreate,
  createLabel,
}: MasterToolbarProps<T>) {
  return (
    <div className="table-toolbar px-(--margin-x) pt-4">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 className="dark:text-dark-50 text-xl font-medium tracking-wide text-gray-800">
          {title}
        </h2>
        <div className="flex flex-wrap items-center gap-2">
          {/* ✅ NEW — sirf tab render hoga jab onCreate diya gaya ho */}
          {onCreate && (
            <Button
              color="primary"
              className="h-9 gap-2 rounded-md px-3 text-sm"
              onClick={onCreate}
            >
              <PlusIcon className="size-4" />
              <span>{createLabel || "Create"}</span>
            </Button>
          )}
          <Button
            variant="outlined"
            className="h-9 gap-2 rounded-md px-3 text-sm"
            onClick={onToggleFilters}
          >
            <FunnelIcon
              className={clsx("size-4", showFilters && "text-primary-600")}
            />
            <span>Filter</span>
          </Button>
          <Button
            variant="outlined"
            className="h-9 gap-2 rounded-md px-3 text-sm"
            onClick={onExportExcel}
          >
            <ArrowDownTrayIcon className="size-4 text-success-600" />
            <span>Excel</span>
          </Button>
          <Button
            variant="outlined"
            className="h-9 gap-2 rounded-md px-3 text-sm"
            onClick={onExportPdf}
          >
            <DocumentArrowDownIcon className="size-4 text-error-600" />
            <span>PDF</span>
          </Button>
        </div>
      </div>

      <div className="mt-4 max-w-sm">
        <Input
          value={table.getState().globalFilter}
          onChange={(e) => table.setGlobalFilter(e.target.value)}
          prefix={<MagnifyingGlassIcon className="size-4" />}
          classNames={{
            input: "ring-primary-500/50 h-9 text-sm focus:ring-3",
          }}
          placeholder={searchPlaceholder}
        />
      </div>

      {showFilters && filterPanel && (
        <div className="mt-4 rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-dark-500 dark:bg-dark-600">
          {filterPanel}
        </div>
      )}
    </div>
  );
}
