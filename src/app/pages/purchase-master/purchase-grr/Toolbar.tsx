// src/app/pages/grr/Toolbar.tsx
import clsx from "clsx";
import { Table } from "@tanstack/react-table";
import { CollapsibleSearch } from "@/components/shared/CollapsibleSearch";
import { GrrItem } from "./data";
import { TableConfig } from "./TableConfig"; 
import { MenuActions } from "./MenuActions"; 

export function Toolbar({ table }: { table: Table<GrrItem> }) {
  const isFullScreenEnabled = table.getState().tableSettings?.enableFullScreen;

  return (
    <div className={clsx("flex items-center justify-between", isFullScreenEnabled && "px-4 sm:px-5")}>
      <h2 className="dark:text-dark-100 truncate text-base font-medium tracking-wide text-gray-800">
        Item Details
      </h2>
      <div className={clsx("flex", isFullScreenEnabled && "ltr:-mr-2 rtl:-ml-2")}>
        <CollapsibleSearch
          placeholder="Search here..."
          value={table.getState().globalFilter}
          onChange={(e) => table.setGlobalFilter(e.target.value)}
        />
        {/* ADD THESE TWO LINES */}
        <TableConfig table={table} />
        <MenuActions />
      </div>
    </div>
  );
}