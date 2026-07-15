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
import { ModelDrawer } from "./ModelDrawer";
import { createColumns, exportColumns } from "./columns";
import { emptyModel, mapApiModelToModel, Model } from "./data";

interface OptionItem {
  id: string;
  label: string;
}

export default function ModelPage() {
  const [data, setData] = useState<Model[]>([]);
  const [categories, setCategories] = useState<OptionItem[]>([]);
  const [series, setSeries] = useState<
    { id: string; label: string; categoryId: string }[]
  >([]);
  const [loading, setLoading] = useState(true);

  const [globalFilter, setGlobalFilter] = useState("");
  const [sorting, setSorting] = useState<SortingState>([]);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState<Model | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [filterCategory, setFilterCategory] = useState("");
  const [filterCode, setFilterCode] = useState("");
  const [filterStatus, setFilterStatus] = useState("");

  // ---- Fetch categories, series and models ----
  const fetchAll = async () => {
    setLoading(true);
    try {
      const [categoryRes, seriesRes, modelRes] = await Promise.all([
        Get("master/category/list", {}, false),
        Get("master/productseries/list", {}, false),
        Get("master/model/list", {}, false),
      ]);

      if (categoryRes.data?.success) {
        setCategories(
          (categoryRes.data.data || []).map((item: any) => ({
            id: String(item.categoryId),
            label: item.categoryName,
          }))
        );
      }

      if (seriesRes.data?.success) {
        setSeries(
          (seriesRes.data.data || []).map((item: any) => ({
            id: String(item.productSeriesId),
            label: item.seriesName,
            categoryId: String(item.categoryId),
          }))
        );
      }

      if (modelRes.data?.success) {
        setData((modelRes.data.data || []).map(mapApiModelToModel));
      } else {
        toasterrormsg(modelRes.data?.message || "Failed to fetch models.");
      }
    } catch (error) {
      toasterrormsg("Something went wrong while fetching model data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getCategoryName = (id: string) =>
    categories.find((item) => item.id === id)?.label || "";
  const getSeriesName = (id: string) =>
    series.find((item) => item.id === id)?.label || "";

  const columns = useMemo(
    () => createColumns(getCategoryName, getSeriesName),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [categories.length, series.length],
  );

  const filteredData = useMemo(() => {
    return data.filter((item) => {
      if (filterCategory && item.categoryId !== filterCategory) return false;
      if (
        filterCode &&
        !item.modelCode.toLowerCase().includes(filterCode.toLowerCase())
      )
        return false;
      if (filterStatus && item.status !== filterStatus) return false;
      return true;
    });
  }, [data, filterCategory, filterCode, filterStatus]);

  const exportRows = filteredData.map((row) => ({
    ...row,
    categoryName: getCategoryName(row.categoryId),
    seriesName: getSeriesName(row.seriesId),
  }));

  // ---- Save (create or update) via API ----
  const handleSave = async (item: Model) => {
    const payload = {
      categoryId: Number(item.categoryId),
      seriesId: Number(item.seriesId),
      modelCode: item.modelCode,
      modelName: item.modelName,
      capacity: item.capacity,
      length: item.length,
      width: item.width,
      height: item.height,
      standardWeight: item.standardWeight,
      status: item.status,
    };

    try {
      if (item.id) {
        const response = await Put(
          "master/model/update",
          { modelId: Number(item.id), ...payload },
          false
        );
        if (response.data?.success) {
          toastsuccessmsg(response.data?.message || "Model updated successfully.");
          fetchAll();
        } else {
          toasterrormsg(response.data?.message || "Failed to update model.");
        }
      } else {
        const response = await Post("master/model/create", payload, false);
        if (response.data?.success) {
          toastsuccessmsg(response.data?.message || "Model created successfully.");
          fetchAll();
        } else {
          toasterrormsg(response.data?.message || "Failed to create model.");
        }
      }
    } catch (error) {
      toasterrormsg("Something went wrong while saving the model.");
    }
  };

  const handleDeleteOne = async (row: Model) => {
    try {
      const response = await Delete(
        "master/model/delete",
        { modelId: Number(row.id) },
        false
      );
      if (response.data?.success) {
        toastsuccessmsg(response.data?.message || "Model deleted successfully.");
        setData((prev) => prev.filter((item) => item.id !== row.id));
      } else {
        toasterrormsg(response.data?.message || "Failed to delete model.");
      }
    } catch (error) {
      toasterrormsg("Something went wrong while deleting the model.");
    }
  };

  const handleDeleteMany = async (rows: { original: Model }[]) => {
    try {
      await Promise.all(
        rows.map((r) =>
          Delete("master/model/delete", { modelId: Number(r.original.id) }, false)
        )
      );
      const ids = new Set(rows.map((r) => r.original.id));
      setData((prev) => prev.filter((item) => !ids.has(item.id)));
      setRowSelection({});
      toastsuccessmsg("Selected models deleted successfully.");
    } catch (error) {
      toasterrormsg("Something went wrong while deleting models.");
    }
  };

  const table = useReactTable({
    data: filteredData,
    columns,
    state: { globalFilter, sorting, rowSelection },
    enableRowSelection: true,
    getRowId: (row) => row.id,
    meta: {
      openEditDrawer: (row: Model) => {
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
    <Page title="Model">
      <div className="transition-content w-full pb-5">
        <MasterToolbar
          title="Model"
          createLabel="Create Model"
          searchPlaceholder="Search models..."
          table={table}
          showFilters={showFilters}
          onToggleFilters={() => setShowFilters((v) => !v)}
          onCreate={() => {
            setEditing(emptyModel());
            setDrawerOpen(true);
          }}
          onExportExcel={() => exportToExcel(exportRows, exportColumns, "models")}
          onExportPdf={() =>
            exportToPdf(exportRows, exportColumns, "Model List", "models")
          }
          filterPanel={
            <div className="grid gap-4 sm:grid-cols-3">
              <Listbox
                data={[{ id: "", label: "All" }, ...categories]}
                value={
                  [{ id: "", label: "All" }, ...categories].find(
                    (item) => item.id === filterCategory,
                  ) || { id: "", label: "All" }
                }
                onChange={(item) => setFilterCategory(item.id)}
                label="Category"
                placeholder="All categories"
                displayField="label"
              />
              <Input
                label="Model Code"
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
          emptyMessage={
            loading
              ? "Loading models..."
              : "No models found. Click Create Model to add one."
          }
        />
      </div>
      <ModelDrawer
        isOpen={drawerOpen}
        close={() => setDrawerOpen(false)}
        model={editing}
        categories={categories}
        series={series}
        onSave={handleSave}
      />
    </Page>
  );
}