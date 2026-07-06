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

import { Page } from "@/components/shared/Page";
import { Input } from "@/components/ui";
import { Listbox } from "@/components/shared/form/StyledListbox";
import { fuzzyFilter } from "@/utils/react-table/fuzzyFilter";
import { exportToExcel, exportToPdf } from "../shared/export";
import { MasterTable } from "../shared/MasterTable";
import { MasterToolbar } from "../shared/MasterToolbar";
import { statusOptions } from "../shared/constants";
import {
  getCategoryLabel,
  masterStorage,
} from "../shared/storage";
import { ProductSeriesDrawer } from "./ProductSeriesDrawer";
import { createColumns, exportColumns } from "./columns";
import { emptyProductSeries, ProductSeries } from "./data";

export default function ProductSeriesPage() {
  const categories = masterStorage.getCategories();
  const [data, setData] = useState<ProductSeries[]>(() =>
    masterStorage.getProductSeries(),
  );
  const [globalFilter, setGlobalFilter] = useState("");
  const [sorting, setSorting] = useState<SortingState>([]);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState<ProductSeries | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [filterCategory, setFilterCategory] = useState("");
  const [filterCode, setFilterCode] = useState("");
  const [filterStatus, setFilterStatus] = useState("");

  const getCategoryName = (id: string) => getCategoryLabel(categories, id);
  const columns = useMemo(
    () => createColumns(getCategoryName),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [categories.length],
  );

  const filteredData = useMemo(() => {
    return data.filter((item) => {
      if (filterCategory && item.categoryId !== filterCategory) return false;
      if (filterCode && !item.seriesCode.toLowerCase().includes(filterCode.toLowerCase()))
        return false;
      if (filterStatus && item.status !== filterStatus) return false;
      return true;
    });
  }, [data, filterCategory, filterCode, filterStatus]);

  const exportRows = filteredData.map((row) => ({
    ...row,
    categoryName: getCategoryName(row.categoryId),
  }));

  const persist = (next: ProductSeries[]) => {
    setData(next);
    masterStorage.saveProductSeries(next);
  };

  const table = useReactTable({
    data: filteredData,
    columns,
    state: { globalFilter, sorting, rowSelection },
    enableRowSelection: true,
    getRowId: (row) => row.id,
    meta: {
      openEditDrawer: (row: ProductSeries) => {
        setEditing(row);
        setDrawerOpen(true);
      },
      deleteRow: (row) => {
        persist(data.filter((item) => item.id !== row.original.id));
      },
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

  const categoryOptions = categories.map((item) => ({
    id: item.id,
    label: item.categoryName,
  }));

  return (
    <Page title="Product Series">
      <div className="transition-content w-full pb-5">
        <MasterToolbar
          title="Product Series"
          createLabel="Create Product Series"
          searchPlaceholder="Search product series..."
          table={table}
          showFilters={showFilters}
          onToggleFilters={() => setShowFilters((v) => !v)}
          onCreate={() => {
            setEditing(emptyProductSeries());
            setDrawerOpen(true);
          }}
          onExportExcel={() =>
            exportToExcel(exportRows, exportColumns, "product-series")
          }
          onExportPdf={() =>
            exportToPdf(exportRows, exportColumns, "Product Series List", "product-series")
          }
          filterPanel={
            <div className="grid gap-4 sm:grid-cols-3">
              <Listbox
                data={[{ id: "", label: "All" }, ...categoryOptions]}
                value={
                  [{ id: "", label: "All" }, ...categoryOptions].find(
                    (item) => item.id === filterCategory,
                  ) || { id: "", label: "All" }
                }
                onChange={(item) => setFilterCategory(item.id)}
                label="Category"
                placeholder="All categories"
                displayField="label"
              />
              <Input
                label="Series Code"
                value={filterCode}
                onChange={(e) => setFilterCode(e.target.value)}
                placeholder="Filter by code"
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
          emptyMessage="No product series found. Click Create Product Series to add one."
        />
      </div>

      <ProductSeriesDrawer
        isOpen={drawerOpen}
        close={() => setDrawerOpen(false)}
        series={editing}
        onSave={(item) => {
          const exists = data.some((row) => row.id === item.id);
          persist(
            exists
              ? data.map((row) => (row.id === item.id ? item : row))
              : [item, ...data],
          );
        }}
      />
    </Page>
  );
}
