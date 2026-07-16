import {
  getCoreRowModel, getFilteredRowModel, getPaginationRowModel, getSortedRowModel,
  RowSelectionState, SortingState, useReactTable,
} from "@tanstack/react-table";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";

import { Page } from "@/components/shared/Page";
import { Input } from "@/components/ui";
import { Listbox } from "@/components/shared/form/StyledListbox";
import { fuzzyFilter } from "@/utils/react-table/fuzzyFilter";
import { Get, Delete, toastsuccessmsg, toasterrormsg } from "@/ApiHelper";
import { exportToExcel, exportToPdf } from "../master/shared/export";
import { MasterTable } from "../master/shared/MasterTable";
import { MasterToolbar } from "../master/shared/MasterToolbar";
import { columns, exportColumns } from "./columns";
import { ItemMaster, mapApiItemMasterToItemMaster } from "./data";

export default function ItemMasterListPage() {
  const navigate = useNavigate();
  const [data, setData] = useState<ItemMaster[]>([]);
  const [loading, setLoading] = useState(true);

  const [globalFilter, setGlobalFilter] = useState("");
  const [sorting, setSorting] = useState<SortingState>([]);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [showFilters, setShowFilters] = useState(false);
  const [filterCode, setFilterCode] = useState("");
  const [filterCategory, setFilterCategory] = useState("");

  const categoryFilterOptions = useMemo(() => {
    const unique = Array.from(new Set(data.map((item) => item.categoryName).filter(Boolean)));
    return [
      { id: "", label: "All" },
      ...unique.map((name) => ({ id: name as string, label: name as string })),
    ];
  }, [data]);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const response = await Get("master/itemmaster/list", {}, false);
      if (response.data?.success) {
        setData((response.data.data || []).map(mapApiItemMasterToItemMaster));
      } else {
        toasterrormsg(response.data?.message || "Failed to fetch items.");
      }
    } catch (error) {
      toasterrormsg("Something went wrong while fetching item data.");
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
      if (filterCode && !item.itemCode.toLowerCase().includes(filterCode.toLowerCase())) return false;
      if (filterCategory && item.categoryName !== filterCategory) return false;
      return true;
    });
  }, [data, filterCode, filterCategory]);

  const handleDeleteOne = async (row: ItemMaster) => {
    try {
      const response = await Delete("master/itemmaster/delete", { itemId: Number(row.id) }, false);
      if (response.data?.success) {
        toastsuccessmsg(response.data?.message || "Item deleted successfully.");
        setData((prev) => prev.filter((item) => item.id !== row.id));
      } else {
        toasterrormsg(response.data?.message || "Failed to delete item.");
      }
    } catch (error) {
      toasterrormsg("Something went wrong while deleting the item.");
    }
  };

  const handleDeleteMany = async (rows: { original: ItemMaster }[]) => {
    try {
      await Promise.all(
        rows.map((r) => Delete("master/itemmaster/delete", { itemId: Number(r.original.id) }, false))
      );
      const ids = new Set(rows.map((r) => r.original.id));
      setData((prev) => prev.filter((item) => !ids.has(item.id)));
      setRowSelection({});
      toastsuccessmsg("Selected items deleted successfully.");
    } catch (error) {
      toasterrormsg("Something went wrong while deleting items.");
    }
  };

  const table = useReactTable({
    data: filteredData,
    columns,
    state: { globalFilter, sorting, rowSelection },
    enableRowSelection: true,
    getRowId: (row) => row.id,
    meta: {
      openEditDrawer: (row: ItemMaster) => navigate(`/item-master/edit/${row.id}`),
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
    <Page title="Item Master">
      <div className="transition-content w-full pb-5">
        <MasterToolbar
          title="Item Master"
          createLabel="Create Item"
          searchPlaceholder="Search items..."
          table={table}
          showFilters={showFilters}
          onToggleFilters={() => setShowFilters((v) => !v)}
          onCreate={() => navigate("/item-master/create")}
          onExportExcel={() => exportToExcel(filteredData, exportColumns, "item-master")}
          onExportPdf={() => exportToPdf(filteredData, exportColumns, "Item Master List", "item-master")}
          filterPanel={
            <div className="grid gap-4 sm:grid-cols-3">
              <Input
                label="Item Code"
                value={filterCode}
                onChange={(e) => setFilterCode(e.target.value)}
                placeholder="Filter by code"
              />
              <Listbox
                data={categoryFilterOptions}
                value={
                  categoryFilterOptions.find((item) => item.id === filterCategory) ||
                  categoryFilterOptions[0]
                }
                onChange={(item) => setFilterCategory(item.id)}
                label="Item Category"
                placeholder="All categories"
                displayField="label"
              />
            </div>
          }
        />
        <MasterTable
          table={table}
          columnCount={columns.length}
          emptyMessage={loading ? "Loading items..." : "No items found. Click Create Item to add one."}
        />
      </div>
    </Page>
  );
}