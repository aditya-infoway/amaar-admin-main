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
import { exportToExcel, exportToPdf } from "../shared/export";
import { MasterTable } from "../shared/MasterTable";
import { MasterToolbar } from "../shared/MasterToolbar";
import { masterStorage } from "../shared/storage";
import { columns, exportColumns } from "./columns";
import { VariantStructure } from "./data";

export default function VariantStructurePage() {
  const navigate = useNavigate();
  const [data, setData] = useState<VariantStructure[]>(() =>
    masterStorage.getVariantStructures(),
  );
  const [globalFilter, setGlobalFilter] = useState("");
  const [sorting, setSorting] = useState<SortingState>([]);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [showFilters, setShowFilters] = useState(false);
  const [filterCode, setFilterCode] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [filterModel, setFilterModel] = useState("");

  const categoryOptions = useMemo(
    () =>
      [...new Set(data.map((item) => item.categoryName))]
        .filter(Boolean)
        .map((name) => ({ id: name, label: name })),
    [data],
  );

  const modelOptions = useMemo(
    () =>
      [...new Set(data.map((item) => item.modelName))]
        .filter(Boolean)
        .map((name) => ({ id: name, label: name })),
    [data],
  );

  const filteredData = useMemo(() => {
    return data.filter((item) => {
      if (
        filterCode &&
        !item.variantCode.toLowerCase().includes(filterCode.toLowerCase())
      )
        return false;
      if (filterCategory && item.categoryName !== filterCategory) return false;
      if (filterModel && item.modelName !== filterModel) return false;
      return true;
    });
  }, [data, filterCode, filterCategory, filterModel]);

  const persist = (next: VariantStructure[]) => {
    setData(next);
    masterStorage.saveVariantStructures(next);
  };

  const table = useReactTable({
    data: filteredData,
    columns,
    state: { globalFilter, sorting, rowSelection },
    enableRowSelection: true,
    getRowId: (row) => row.id,
    meta: {
      openEditDrawer: (row: VariantStructure) =>
        navigate(`/master/variant-structure/edit/${row.id}`),
      deleteRow: (row) =>
        persist(data.filter((item) => item.id !== row.original.id)),
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
    <Page title="Variant Structure">
      <div className="transition-content w-full pb-5">
        <MasterToolbar
          title="Variant Structure"
          createLabel="Create Variant Structure"
          searchPlaceholder="Search variant structures..."
          table={table}
          showFilters={showFilters}
          onToggleFilters={() => setShowFilters((v) => !v)}
          onCreate={() => navigate("/master/variant-structure/create")}
          onExportExcel={() =>
            exportToExcel(filteredData, exportColumns, "variant-structures")
          }
          onExportPdf={() =>
            exportToPdf(
              filteredData,
              exportColumns,
              "Variant Structure List",
              "variant-structures",
            )
          }
          filterPanel={
            <div className="grid gap-4 sm:grid-cols-3">
              <Input
                label="Variant Code"
                value={filterCode}
                onChange={(e) => setFilterCode(e.target.value)}
                placeholder="Filter by variant code"
              />
              <Listbox
                data={[{ id: "", label: "All" }, ...categoryOptions]}
                value={
                  [{ id: "", label: "All" }, ...categoryOptions].find(
                    (item) => item.id === filterCategory,
                  ) || { id: "", label: "All" }
                }
                onChange={(item) => setFilterCategory(item.id)}
                label="Category Name"
                placeholder="All categories"
                displayField="label"
              />
              <Listbox
                data={[{ id: "", label: "All" }, ...modelOptions]}
                value={
                  [{ id: "", label: "All" }, ...modelOptions].find(
                    (item) => item.id === filterModel,
                  ) || { id: "", label: "All" }
                }
                onChange={(item) => setFilterModel(item.id)}
                label="Model Name"
                placeholder="All models"
                displayField="label"
              />
            </div>
          }
        />

        <MasterTable
          table={table}
          columnCount={columns.length}
          emptyMessage="No variant structures found. Click Create Variant Structure to add one."
        />
      </div>
    </Page>
  );
}
