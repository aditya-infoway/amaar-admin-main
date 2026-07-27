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
import { ItemGroupDrawer } from "./CategoryDrawer";
import { columns, exportColumns } from "./columns";
import { emptyItemGroup, mapApiItemGroupToItemGroup, ItemGroup } from "./data";

export default function ItemGroupPage() {
  const [data, setData] = useState<ItemGroup[]>([]);
  const [loading, setLoading] = useState(true);

  const [globalFilter, setGlobalFilter] = useState("");
  const [sorting, setSorting] = useState<SortingState>([]);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState<ItemGroup | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [filterName, setFilterName] = useState("");
  const [filterStatus, setFilterStatus] = useState("");

  // naya state
  const [categoryOptions, setCategoryOptions] = useState<{ id: string; label: string }[]>([]);

  // ---- Fetch item categories once, for merging category names ----
  const fetchCategories = async () => {
    try {
      const res = await Get("master/itemcategory/list", {}, false);
      const list = res?.data?.data || [];
      setCategoryOptions(
        list.map((c: any) => ({ id: String(c.itemCategoryId), label: c.categoryName }))
      );
    } catch (error) {
      // ignore, table will show "-" for category
    }
  };

  // ---- Fetch item groups ----
  const fetchAll = async () => {
    setLoading(true);
    try {
      const response = await Get("master/itemgroup/list", {}, false);
      if (response.data?.success) {
        const mapped = (response.data.data || []).map(mapApiItemGroupToItemGroup);
        setData(mapped);
      } else {
        toasterrormsg(response.data?.message || "Failed to fetch item groups.");
      }
    } catch (error) {
      toasterrormsg("Something went wrong while fetching item group data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
    fetchAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // merge category name into rows once both are loaded
  const filteredData = useMemo(() => {
    return data
      .map((item) => ({
        ...item,
        categoryName:
          categoryOptions.find((c) => c.id === item.itemCategoryId)?.label || "",
      }))
      .filter((item) => {
        if (
          filterName &&
          !item.groupName.toLowerCase().includes(filterName.toLowerCase())
        )
          return false;
        if (filterStatus && item.status !== filterStatus) return false;
        return true;
      });
  }, [data, categoryOptions, filterName, filterStatus]);

  // ---- Save (create or update) via API ----
  const handleSave = async (item: ItemGroup) => {
    const payload = {
      groupName: item.groupName,
      itemCategoryId: Number(item.itemCategoryId),
      status: item.status,
    };

    try {
      if (item.id) {
        const response = await Put(
          "master/itemgroup/update",
          { itemGroupId: Number(item.id), ...payload },
          false
        );
        if (response.data?.success) {
          toastsuccessmsg(response.data?.message || "Item group updated successfully.");
          fetchAll();
        } else {
          toasterrormsg(response.data?.message || "Failed to update item group.");
        }
      } else {
        const response = await Post("master/itemgroup/create", payload, false);
        if (response.data?.success) {
          toastsuccessmsg(response.data?.message || "Item group created successfully.");
          fetchAll();
        } else {
          toasterrormsg(response.data?.message || "Failed to create item group.");
        }
      }
    } catch (error) {
      toasterrormsg("Something went wrong while saving the item group.");
    }
  };

  const handleDeleteOne = async (row: ItemGroup) => {
    try {
      const response = await Delete(
        "master/itemgroup/delete",
        { itemGroupId: Number(row.id) },
        false
      );
      if (response.data?.success) {
        toastsuccessmsg(response.data?.message || "Item group deleted successfully.");
        setData((prev) => prev.filter((item) => item.id !== row.id));
      } else {
        toasterrormsg(response.data?.message || "Failed to delete item group.");
      }
    } catch (error) {
      toasterrormsg("Something went wrong while deleting the item group.");
    }
  };

  const handleDeleteMany = async (rows: { original: ItemGroup }[]) => {
    try {
      await Promise.all(
        rows.map((r) =>
          Delete(
            "master/itemgroup/delete",
            { itemGroupId: Number(r.original.id) },
            false
          )
        )
      );
      const ids = new Set(rows.map((r) => r.original.id));
      setData((prev) => prev.filter((item) => !ids.has(item.id)));
      setRowSelection({});
      toastsuccessmsg("Selected item groups deleted successfully.");
    } catch (error) {
      toasterrormsg("Something went wrong while deleting item groups.");
    }
  };

  const table = useReactTable({
    data: filteredData,
    columns,
    state: { globalFilter, sorting, rowSelection },
    enableRowSelection: true,
    getRowId: (row) => row.id,
    meta: {
      openEditDrawer: (row: ItemGroup) => {
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
    <Page title="Item Group">
      <div className="transition-content w-full pb-5">
        <MasterToolbar
          title="Item Group"
          createLabel="Create Item Group"
          searchPlaceholder="Search item groups..."
          table={table}
          showFilters={showFilters}
          onToggleFilters={() => setShowFilters((v) => !v)}
          onCreate={() => {
            setEditing(emptyItemGroup());
            setDrawerOpen(true);
          }}
          onExportExcel={() =>
            exportToExcel(filteredData, exportColumns, "item-groups")
          }
          onExportPdf={() =>
            exportToPdf(
              filteredData,
              exportColumns,
              "Item Group List",
              "item-groups",
            )
          }
          filterPanel={
            <div className="grid gap-4 sm:grid-cols-3">
              <Input
                label="Item Group Name"
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
              ? "Loading item groups..."
              : "No item groups found. Click Create Item Group to add one."
          }
        />
      </div>

      <ItemGroupDrawer
        isOpen={drawerOpen}
        close={() => setDrawerOpen(false)}
        itemGroup={editing}
        onSave={handleSave}
      />
    </Page>
  );
}