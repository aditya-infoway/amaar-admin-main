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
import {
  getCategoryLabel,
  getModelLabel,
  getSeriesLabel,
  masterStorage,
} from "../shared/storage";
import { VariantDrawer } from "./VariantDrawer";
import { createColumns, exportColumns } from "./columns";
import { emptyVariant, Variant } from "./data";

export default function VariantPage() {
  const categories = masterStorage.getCategories();
  const series = masterStorage.getProductSeries();
  const models = masterStorage.getModels();
  const [data, setData] = useState<Variant[]>(() => masterStorage.getVariants());
  const [globalFilter, setGlobalFilter] = useState("");
  const [sorting, setSorting] = useState<SortingState>([]);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState<Variant | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [filterCategory, setFilterCategory] = useState("");
  const [filterCode, setFilterCode] = useState("");

  const getCategoryName = (id: string) => getCategoryLabel(categories, id);
  const getSeriesName = (id: string) => getSeriesLabel(series, id);
  const getModelName = (id: string) => getModelLabel(models, id);
  const columns = useMemo(
    () => createColumns(getCategoryName, getSeriesName, getModelName),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [categories.length, series.length, models.length],
  );

  const filteredData = useMemo(() => {
    return data.filter((item) => {
      if (filterCategory && item.categoryId !== filterCategory) return false;
      if (filterCode && !item.variantCode.toLowerCase().includes(filterCode.toLowerCase()))
        return false;
      return true;
    });
  }, [data, filterCategory, filterCode]);

  const exportRows = filteredData.map((row) => ({
    ...row,
    categoryName: getCategoryName(row.categoryId),
    seriesName: getSeriesName(row.seriesId),
    modelName: getModelName(row.modelId),
  }));

  const persist = (next: Variant[]) => {
    setData(next);
    masterStorage.saveVariants(next);
  };

  const table = useReactTable({
    data: filteredData,
    columns,
    state: { globalFilter, sorting, rowSelection },
    enableRowSelection: true,
    getRowId: (row) => row.id,
    meta: {
      openEditDrawer: (row: Variant) => {
        setEditing(row);
        setDrawerOpen(true);
      },
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

  const categoryOptions = categories.map((item) => ({
    id: item.id,
    label: item.categoryName,
  }));

  return (
    <Page title="Variant">
      <div className="transition-content w-full pb-5">
        <MasterToolbar
          title="Variant"
          createLabel="Create Variant"
          searchPlaceholder="Search variants..."
          table={table}
          showFilters={showFilters}
          onToggleFilters={() => setShowFilters((v) => !v)}
          onCreate={() => {
            setEditing(emptyVariant());
            setDrawerOpen(true);
          }}
          onExportExcel={() => exportToExcel(exportRows, exportColumns, "variants")}
          onExportPdf={() => exportToPdf(exportRows, exportColumns, "Variant List", "variants")}
          filterPanel={
            <div className="grid gap-4 sm:grid-cols-2">
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
              <Input label="Variant Code" value={filterCode} onChange={(e) => setFilterCode(e.target.value)} placeholder="Filter by code" />
            </div>
          }
        />
        <MasterTable table={table} columnCount={columns.length} emptyMessage="No variants found. Click Create Variant to add one." />
      </div>
      <VariantDrawer
        isOpen={drawerOpen}
        close={() => setDrawerOpen(false)}
        variant={editing}
        onSave={(item) => {
          const exists = data.some((row) => row.id === item.id);
          persist(exists ? data.map((row) => (row.id === item.id ? item : row)) : [item, ...data]);
        }}
      />
    </Page>
  );
}
