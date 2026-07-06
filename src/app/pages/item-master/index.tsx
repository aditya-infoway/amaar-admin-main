import {
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  RowSelectionState,
  SortingState,
  useReactTable,
} from "@tanstack/react-table";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router";

import { Page } from "@/components/shared/Page";
import { Input } from "@/components/ui";
import { Listbox } from "@/components/shared/form/StyledListbox";
import { fuzzyFilter } from "@/utils/react-table/fuzzyFilter";
import { exportToExcel, exportToPdf } from "../master/shared/export";
import { MasterTable } from "../master/shared/MasterTable";
import { MasterToolbar } from "../master/shared/MasterToolbar";
import {
  itemCategoryOptions,
  itemTypeOptions,
} from "../master/shared/constants";
import { masterStorage } from "../master/shared/storage";
import { createColumns, exportColumns } from "./columns";
import { ItemMaster } from "./data";

function getLabel(
  options: { id: string; label: string }[],
  id: string,
): string {
  return options.find((item) => item.id === id)?.label || "—";
}

export default function ItemMasterListPage() {
  const navigate = useNavigate();
  const [data, setData] = useState<ItemMaster[]>(() => masterStorage.getItems());
  const [globalFilter, setGlobalFilter] = useState("");
  const [sorting, setSorting] = useState<SortingState>([]);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [showFilters, setShowFilters] = useState(false);
  const [filterCode, setFilterCode] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [filterType, setFilterType] = useState("");

  const columns = useMemo(
    () => createColumns(getLabel, itemCategoryOptions, itemTypeOptions),
    [],
  );

  const filteredData = useMemo(() => {
    return data.filter((item) => {
      if (filterCode && !item.itemCode.toLowerCase().includes(filterCode.toLowerCase()))
        return false;
      if (filterCategory && item.itemCategory !== filterCategory) return false;
      if (filterType && item.itemType !== filterType) return false;
      return true;
    });
  }, [data, filterCode, filterCategory, filterType]);

  const exportRows = filteredData.map((row) => ({
    ...row,
    itemCategoryLabel: getLabel(itemCategoryOptions, row.itemCategory),
    itemTypeLabel: getLabel(itemTypeOptions, row.itemType),
  }));

  const persist = (next: ItemMaster[]) => {
    setData(next);
    masterStorage.saveItems(next);
  };

  const table = useReactTable({
    data: filteredData,
    columns,
    state: { globalFilter, sorting, rowSelection },
    enableRowSelection: true,
    getRowId: (row) => row.id,
    meta: {
      openEditDrawer: (row: ItemMaster) => navigate(`/item-master/edit/${row.id}`),
      deleteRow: (row) => persist(data.filter((item) => item.id !== row.original.id)),
      deleteRows: (rows) => {
        const ids = new Set(rows.map((r) => r.original.id));
        persist(data.filter((item) => !ids.has(item.id)));
        setRowSelection({});
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
          onExportExcel={() => exportToExcel(exportRows, exportColumns, "item-master")}
          onExportPdf={() =>
            exportToPdf(exportRows, exportColumns, "Item Master List", "item-master")
          }
          filterPanel={
            <div className="grid gap-4 sm:grid-cols-3">
              <Input label="Item Code" value={filterCode} onChange={(e) => setFilterCode(e.target.value)} placeholder="Filter by code" />
              <Listbox
                data={[{ id: "", label: "All" }, ...itemCategoryOptions]}
                value={
                  [{ id: "", label: "All" }, ...itemCategoryOptions].find(
                    (item) => item.id === filterCategory,
                  ) || { id: "", label: "All" }
                }
                onChange={(item) => setFilterCategory(item.id)}
                label="Item Category"
                placeholder="All categories"
                displayField="label"
              />
              <Listbox
                data={[{ id: "", label: "All" }, ...itemTypeOptions]}
                value={
                  [{ id: "", label: "All" }, ...itemTypeOptions].find(
                    (item) => item.id === filterType,
                  ) || { id: "", label: "All" }
                }
                onChange={(item) => setFilterType(item.id)}
                label="Item Type"
                placeholder="All types"
                displayField="label"
              />
            </div>
          }
        />
        <MasterTable
          table={table}
          columnCount={columns.length}
          emptyMessage="No items found. Click Create Item to add one."
        />
      </div>
    </Page>
  );
}
