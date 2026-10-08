import {
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  RowSelectionState,
  SortingState,
  useReactTable,
} from "@tanstack/react-table";
import { useEffect, useMemo, useState } from "react";

import { Page } from "@/components/shared/Page";
import { fuzzyFilter } from "@/utils/react-table/fuzzyFilter";
import { Delete, Get, toasterrormsg, toastsuccessmsg } from "@/ApiHelper";

import { exportToExcel, exportToPdf } from "../../shared/export";
import { MasterTable } from "../../shared/MasterTable";
import { MasterToolbar } from "../../shared/MasterToolbar";

import { ItemCategoryDrawer } from "./ItemCategoryDrawer";
import { createColumns, createExportColumns } from "./columns";
import { emptyItemCategory, type ItemCategory } from "./data";

export default function ItemCategoryPage() {
  const [data, setData] = useState<ItemCategory[]>([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [sorting, setSorting] = useState<SortingState>([]);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState<ItemCategory | null>(null);

  const fetchList = async () => {
    try {
      // ⚠️ endpoint apne backend ke hisaab se
         const financialYearId = localStorage.getItem("financialYearId");

    const response = await Get(
      "itemcategory-stage/list",
      financialYearId ? { financialYearId } : {},
      false,
    );

      if (response?.data?.success || response?.data?.status === 200) {
        setData(response?.data?.data || []);
      } else {
        console.error("Item category list failed:", response?.data);
      }
    } catch (error) {
      console.error("Item category list error:", error);
    }
  };

  useEffect(() => {
    fetchList();
  }, []);

  const columns = useMemo(() => createColumns(), []);
  const exportColumns = useMemo(() => createExportColumns(), []);

  const table = useReactTable({
    data,
    columns,
    state: { globalFilter, sorting, rowSelection },
    enableRowSelection: true,
    getRowId: (row) => String(row.id),

    meta: {
      openEditDrawer: (row: ItemCategory) => {
        setEditing(row);
        setDrawerOpen(true);
      },

      deleteRow: async (row: any) => {
        try {
          const response = await Delete(
            `itemcategory-stage/${row.original.id}`,
            {},
            false,
          );

          if (response?.data?.success || response?.data?.status === 200) {
            setData((prev) =>
              prev.filter((i) => String(i.id) !== String(row.original.id)),
            );
            toastsuccessmsg(response?.data?.message || "Deleted successfully");
          } else {
            toasterrormsg(response?.data?.message || "Failed to delete.");
          }
        } catch (error: any) {
          toasterrormsg(
            error?.response?.data?.message ||
              error?.message ||
              "Something went wrong while deleting.",
          );
        }
      },

      deleteRows: async (rows: any[]) => {
        try {
          const ids = rows.map((row) => row.original.id);
          await Promise.all(
            ids.map((id) => Delete(`itemcategory-stage/${id}`, {}, false)),
          );
          const idSet = new Set(ids.map(String));
          setData((prev) => prev.filter((i) => !idSet.has(String(i.id))));
          setRowSelection({});
          toastsuccessmsg("Selected items deleted successfully");
        } catch (error: any) {
          toasterrormsg(
            error?.response?.data?.message ||
              error?.message ||
              "Something went wrong while deleting.",
          );
        }
      },
    },

    filterFns: { fuzzy: fuzzyFilter },
    globalFilterFn: fuzzyFilter,
    onGlobalFilterChange: setGlobalFilter,
    onSortingChange: setSorting,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  return (
    <Page title="Item Category">
      <div className="transition-content w-full pb-5">
        <MasterToolbar
          title="Item Category"
          createLabel="Add Item Category"
          searchPlaceholder="Search item category..."
          table={table}
          showFilters={false}
          onToggleFilters={() => {}}
          onCreate={() => {
            setEditing(emptyItemCategory());
            setDrawerOpen(true);
          }}
          onExportExcel={() =>
            exportToExcel(data, exportColumns, "item_category")
          }
          onExportPdf={() =>
            exportToPdf(data, exportColumns, "Item Category List", "item_category")
          }
        />

        <MasterTable
          table={table}
          columnCount={columns.length}
          emptyMessage="No item category found. Click Add Item Category to add one."
        />
      </div>

      <ItemCategoryDrawer
        isOpen={drawerOpen}
        close={() => {
          setDrawerOpen(false);
          setEditing(null);
        }}
        itemCategory={editing}
        onSave={fetchList}
      />
    </Page>
  );
}