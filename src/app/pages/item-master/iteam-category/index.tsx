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
import { Input } from "@/components/ui";
import { Listbox } from "@/components/shared/form/StyledListbox";
import { fuzzyFilter } from "@/utils/react-table/fuzzyFilter";
import { Get, Post, Put, Delete, toastsuccessmsg, toasterrormsg } from "@/ApiHelper";
import { exportToExcel, exportToPdf } from "../shared/export";
import { MasterTable } from "../shared/MasterTable";
import { MasterToolbar } from "../shared/MasterToolbar";
import { statusOptions } from "../shared/constants";
import { ItemCategoryDrawer } from "./CategoryDrawer";
import { columns, exportColumns } from "./columns";
import { emptyItemCategory, mapApiItemCategoryToItemCategory, ItemCategory } from "./data";

export default function ItemCategoryPage() {
  const [data, setData] = useState<ItemCategory[]>([]);
  const [loading, setLoading] = useState(true);

  const [globalFilter, setGlobalFilter] = useState("");
  const [sorting, setSorting] = useState<SortingState>([]);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState<ItemCategory | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [filterName, setFilterName] = useState("");
  const [filterStatus, setFilterStatus] = useState("");

  // ---- Fetch item categories ----
  const fetchAll = async () => {
    setLoading(true);
    try {
      const response = await Get("master/itemcategory/list", {}, false);
      if (response.data?.success) {
        setData((response.data.data || []).map(mapApiItemCategoryToItemCategory));
      } else {
        toasterrormsg(response.data?.message || "Failed to fetch item categories.");
      }
    } catch (error) {
      toasterrormsg("Something went wrong while fetching item category data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filteredData = useMemo(() => {
    return data.filter((item) => {
      if (
        filterName &&
        !item.categoryName.toLowerCase().includes(filterName.toLowerCase())
      )
        return false;
      if (filterStatus && item.status !== filterStatus) return false;
      return true;
    });
  }, [data, filterName, filterStatus]);

  // ---- Save (create or update) via API ----
  const handleSave = async (item: ItemCategory) => {
    const payload = {
      categoryName: item.categoryName,
      status: item.status,
    };

    try {
      if (item.id) {
        const response = await Put(
          "master/itemcategory/update",
          { itemCategoryId: Number(item.id), ...payload },
          false
        );
        if (response.data?.success) {
          toastsuccessmsg(response.data?.message || "Item category updated successfully.");
          fetchAll();
        } else {
          toasterrormsg(response.data?.message || "Failed to update item category.");
        }
      } else {
        const response = await Post("master/itemcategory/create", payload, false);
        if (response.data?.success) {
          toastsuccessmsg(response.data?.message || "Item category created successfully.");
          fetchAll();
        } else {
          toasterrormsg(response.data?.message || "Failed to create item category.");
        }
      }
    } catch (error) {
      toasterrormsg("Something went wrong while saving the item category.");
    }
  };

  const handleDeleteOne = async (row: ItemCategory) => {
    try {
      const response = await Delete(
        "master/itemcategory/delete",
        { itemCategoryId: Number(row.id) },
        false
      );
      if (response.data?.success) {
        toastsuccessmsg(response.data?.message || "Item category deleted successfully.");
        setData((prev) => prev.filter((item) => item.id !== row.id));
      } else {
        toasterrormsg(response.data?.message || "Failed to delete item category.");
      }
    } catch (error) {
      toasterrormsg("Something went wrong while deleting the item category.");
    }
  };

  const handleDeleteMany = async (rows: { original: ItemCategory }[]) => {
    try {
      await Promise.all(
        rows.map((r) =>
          Delete(
            "master/itemcategory/delete",
            { itemCategoryId: Number(r.original.id) },
            false
          )
        )
      );
      const ids = new Set(rows.map((r) => r.original.id));
      setData((prev) => prev.filter((item) => !ids.has(item.id)));
      setRowSelection({});
      toastsuccessmsg("Selected item categories deleted successfully.");
    } catch (error) {
      toasterrormsg("Something went wrong while deleting item categories.");
    }
  };

  const table = useReactTable({
    data: filteredData,
    columns,
    state: { globalFilter, sorting, rowSelection },
    enableRowSelection: true,
    getRowId: (row) => row.id,
    meta: {
      openEditDrawer: (row: ItemCategory) => {
        setEditing(row);
        setDrawerOpen(true);
      },
      deleteRow: (row) => handleDeleteOne(row.original),
      deleteRows: (rows) => handleDeleteMany(rows),
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
          createLabel="Create Item Category"
          searchPlaceholder="Search item categories..."
          table={table}
          showFilters={showFilters}
          onToggleFilters={() => setShowFilters((v) => !v)}
          onCreate={() => {
            setEditing(emptyItemCategory());
            setDrawerOpen(true);
          }}
          onExportExcel={() =>
            exportToExcel(filteredData, exportColumns, "item-categories")
          }
          onExportPdf={() =>
            exportToPdf(
              filteredData,
              exportColumns,
              "Item Category List",
              "item-categories",
            )
          }
          filterPanel={
            <div className="grid gap-4 sm:grid-cols-3">
              <Input
                label="Item Category Name"
                value={filterName}
                onChange={(e) => setFilterName(e.target.value)}
                placeholder="Filter by name"
              />
              <Listbox
                data={[{ id: "", label: "All" }, ...statusOptions]}
                value={
                  [{ id: "", label: "All" }, ...statusOptions].find(
                    (item) => item.id === filterStatus,
                  ) || { id: "", label: "All" }
                }
                onChange={(item) => setFilterStatus(item.id)}
                label="Status"
                placeholder="All statuses"
                displayField="label"
              />
            </div>
          }
        />

        <MasterTable
          table={table}
          columnCount={columns.length}
          emptyMessage={
            loading
              ? "Loading item categories..."
              : "No item categories found. Click Create Item Category to add one."
          }
        />
      </div>

      <ItemCategoryDrawer
        isOpen={drawerOpen}
        close={() => setDrawerOpen(false)}
        itemCategory={editing}
        onSave={handleSave}
      />
    </Page>
  );
}