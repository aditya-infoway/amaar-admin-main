import {
  getCoreRowModel, getFilteredRowModel, getPaginationRowModel,
  getSortedRowModel, RowSelectionState, SortingState, useReactTable,
} from "@tanstack/react-table";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";

import { Page } from "@/components/shared/Page";
import { Input } from "@/components/ui";
import { Listbox } from "@/components/shared/form/StyledListbox";
import { fuzzyFilter } from "@/utils/react-table/fuzzyFilter";
import { Get, Delete, toastsuccessmsg, toasterrormsg } from "@/ApiHelper";
import { exportToExcel, exportToPdf } from "../shared/export";
import { MasterTable } from "../shared/MasterTable";
import { MasterToolbar } from "../shared/MasterToolbar";
import { columns, exportColumns } from "./columns";
import { VariantStructure } from "./data";

export default function VariantStructurePage() {
  const navigate = useNavigate();
  const [data, setData] = useState<VariantStructure[]>([]);
  const [loading, setLoading] = useState(true);
  const [globalFilter, setGlobalFilter] = useState("");
  const [sorting, setSorting] = useState<SortingState>([]);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [showFilters, setShowFilters] = useState(false);
  const [filterCode, setFilterCode] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [filterModel, setFilterModel] = useState("");

  const fetchList = async () => {
    setLoading(true);
    try {
      const response = await Get("master/variantstructure/list", {}, false);
      if (response.data?.success) {
        const mapped: VariantStructure[] = (response.data.data || []).map((row: any) => ({
          id: String(row.variantStructureId),
          variantId: String(row.variantId),
          variantCode: row.variantCode || "",
          categoryCode: "—",
          categoryName: row.categoryName || "",
          seriesCode: "—",
          seriesName: row.seriesName || "",
          modelCode: "—",
          modelName: row.modelName || "",
          capacity: row.capacity || "",
          axleType: row.axleCount || "",
          bodyLength: row.bodyLength || "",
          bodyWidth: row.bodyWidth || "",
          bodyHeight: row.bodyHeight || "",
          standardWeight: "—",
          bodyType: row.bodyType || "",
          axleBrand: row.axleBrand || "",
          hydraulicBrand: row.hydraulicBrand || "",
          tyreBrand: row.tyreBrand || "",
          targetCost: String(row.targetCost ?? ""),
          sellingMarkup: String(row.sellingPrice ?? ""),
        }));
        setData(mapped);
      } else {
        toasterrormsg(response.data?.message || "Failed to fetch variant structures.");
      }
    } catch (error) {
      toasterrormsg("Something went wrong while fetching variant structures.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchList();
  }, []);

  const categoryOptions = useMemo(
    () => [...new Set(data.map((item) => item.categoryName))].filter(Boolean).map((name) => ({ id: name, label: name })),
    [data],
  );
  const modelOptions = useMemo(
    () => [...new Set(data.map((item) => item.modelName))].filter(Boolean).map((name) => ({ id: name, label: name })),
    [data],
  );

  const filteredData = useMemo(() => {
    return data.filter((item) => {
      if (filterCode && !item.variantCode.toLowerCase().includes(filterCode.toLowerCase())) return false;
      if (filterCategory && item.categoryName !== filterCategory) return false;
      if (filterModel && item.modelName !== filterModel) return false;
      return true;
    });
  }, [data, filterCode, filterCategory, filterModel]);

  const handleDeleteOne = async (row: VariantStructure) => {
    try {
      const response = await Delete("master/variantstructure/delete", { variantStructureId: Number(row.id) }, false);
      if (response.data?.success) {
        toastsuccessmsg(response.data?.message || "Variant structure deleted successfully.");
        setData((prev) => prev.filter((item) => item.id !== row.id));
      } else {
        toasterrormsg(response.data?.message || "Failed to delete variant structure.");
      }
    } catch (error) {
      toasterrormsg("Something went wrong while deleting the variant structure.");
    }
  };

  const handleDeleteMany = async (rows: { original: VariantStructure }[]) => {
    try {
      await Promise.all(
        rows.map((r) => Delete("master/variantstructure/delete", { variantStructureId: Number(r.original.id) }, false)),
      );
      const ids = new Set(rows.map((r) => r.original.id));
      setData((prev) => prev.filter((item) => !ids.has(item.id)));
      setRowSelection({});
      toastsuccessmsg("Selected variant structures deleted successfully.");
    } catch (error) {
      toasterrormsg("Something went wrong while deleting variant structures.");
    }
  };

  const table = useReactTable({
    data: filteredData,
    columns,
    state: { globalFilter, sorting, rowSelection },
    enableRowSelection: true,
    getRowId: (row) => row.id,
    meta: {
      openEditDrawer: (row: VariantStructure) => navigate(`/master/variant-structure/edit/${row.id}`),
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
          onExportExcel={() => exportToExcel(filteredData, exportColumns, "variant-structures")}
          onExportPdf={() => exportToPdf(filteredData, exportColumns, "Variant Structure List", "variant-structures")}
          filterPanel={
            <div className="grid gap-4 sm:grid-cols-3">
              <Input label="Variant Code" value={filterCode} onChange={(e) => setFilterCode(e.target.value)} placeholder="Filter by variant code" />
              <Listbox
                data={[{ id: "", label: "All" }, ...categoryOptions]}
                value={[{ id: "", label: "All" }, ...categoryOptions].find((i) => i.id === filterCategory) || { id: "", label: "All" }}
                onChange={(item) => setFilterCategory(item.id)}
                label="Category Name"
                placeholder="All categories"
                displayField="label"
              />
              <Listbox
                data={[{ id: "", label: "All" }, ...modelOptions]}
                value={[{ id: "", label: "All" }, ...modelOptions].find((i) => i.id === filterModel) || { id: "", label: "All" }}
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
          emptyMessage={loading ? "Loading variant structures..." : "No variant structures found. Click Create Variant Structure to add one."}
        />
      </div>
    </Page>
  );
}