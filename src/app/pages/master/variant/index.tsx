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
import { VariantDrawer } from "./VariantDrawer";
import { createColumns, exportColumns } from "./columns";
import { emptyVariant, mapApiVariantToVariant, Variant } from "./data";

interface LookupOption {
  id: string;
  label: string;
}

export default function VariantPage() {
  const [data, setData] = useState<Variant[]>([]);
  const [loading, setLoading] = useState(true);

  const [categories, setCategories] = useState<LookupOption[]>([]);
  const [seriesList, setSeriesList] = useState<LookupOption[]>([]);
  const [modelList, setModelList] = useState<LookupOption[]>([]);
  const [bodyTypes, setBodyTypes] = useState<LookupOption[]>([]);
  const [axleBrands, setAxleBrands] = useState<LookupOption[]>([]);
  const [hydraulicBrands, setHydraulicBrands] = useState<LookupOption[]>([]);
  const [tyreBrands, setTyreBrands] = useState<LookupOption[]>([]);

  const [globalFilter, setGlobalFilter] = useState("");
  const [sorting, setSorting] = useState<SortingState>([]);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState<Variant | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [filterCategory, setFilterCategory] = useState("");
  const [filterCode, setFilterCode] = useState("");

  // ---- Fetch variants + all lookup lists for display labels ----
  const fetchAll = async () => {
    setLoading(true);
    try {
      const [
        variantRes,
        categoryRes,
        seriesRes,
        modelRes,
        bodyTypeRes,
        axleBrandRes,
        hydraulicBrandRes,
        tyreBrandRes,
      ] = await Promise.all([
        Get("master/variant/list", {}, false),
        Get("master/category/list", {}, false),
        Get("master/productseries/list", {}, false),
        Get("master/model/list", {}, false),
        Get("master/bodytype/list", {}, false),
        Get("master/axlebrand/list", {}, false),
        Get("master/hydraulicbrand/list", {}, false),
        Get("master/tyrebrand/list", {}, false),
      ]);

      if (variantRes.data?.success) {
        setData((variantRes.data.data || []).map(mapApiVariantToVariant));
      } else {
        toasterrormsg(variantRes.data?.message || "Failed to fetch variants.");
      }

      if (categoryRes.data?.success) {
        setCategories(
          (categoryRes.data.data || []).map((item: any) => ({
            id: String(item.categoryId),
            label: item.categoryName,
          }))
        );
      }
      if (seriesRes.data?.success) {
        setSeriesList(
          (seriesRes.data.data || []).map((item: any) => ({
            id: String(item.productSeriesId),
            label: item.seriesName,
          }))
        );
      }
      if (modelRes.data?.success) {
        setModelList(
          (modelRes.data.data || []).map((item: any) => ({
            id: String(item.modelId),
            label: item.modelName,
          }))
        );
      }
      if (bodyTypeRes.data?.success) {
        setBodyTypes(
          (bodyTypeRes.data.data || []).map((item: any) => ({
            id: String(item.bodyTypeId),
            label: item.bodyTypeName,
          }))
        );
      }
      if (axleBrandRes.data?.success) {
        setAxleBrands(
          (axleBrandRes.data.data || []).map((item: any) => ({
            id: String(item.axleBrandId),
            label: item.axleBrandName,
          }))
        );
      }
      if (hydraulicBrandRes.data?.success) {
        setHydraulicBrands(
          (hydraulicBrandRes.data.data || []).map((item: any) => ({
            id: String(item.hydraulicBrandId),
            label: item.hydraulicBrandName,
          }))
        );
      }
      if (tyreBrandRes.data?.success) {
        setTyreBrands(
          (tyreBrandRes.data.data || []).map((item: any) => ({
            id: String(item.tyreBrandId),
            label: item.tyreBrandName,
          }))
        );
      }
    } catch (error) {
      toasterrormsg("Something went wrong while fetching variant data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getCategoryName = (id: string) => categories.find((item) => item.id === id)?.label || "—";
  const getSeriesName = (id: string) => seriesList.find((item) => item.id === id)?.label || "—";
  const getModelName = (id: string) => modelList.find((item) => item.id === id)?.label || "—";
  const getBodyTypeName = (id: string) => bodyTypes.find((item) => item.id === id)?.label || "—";
  const getAxleBrandName = (id: string) => axleBrands.find((item) => item.id === id)?.label || "—";
  const getHydraulicBrandName = (id: string) => hydraulicBrands.find((item) => item.id === id)?.label || "—";
  const getTyreBrandName = (id: string) => tyreBrands.find((item) => item.id === id)?.label || "—";

  const columns = useMemo(
    () =>
      createColumns(
        getCategoryName,
        getSeriesName,
        getModelName,
        getBodyTypeName,
        getAxleBrandName,
        getHydraulicBrandName,
        getTyreBrandName,
      ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [categories, seriesList, modelList, bodyTypes, axleBrands, hydraulicBrands, tyreBrands],
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
    bodyTypeName: getBodyTypeName(row.bodyTypeId),
    axleBrandName: getAxleBrandName(row.axleBrandId),
    hydraulicBrandName: getHydraulicBrandName(row.hydraulicBrandId),
    tyreBrandName: getTyreBrandName(row.tyreBrandId),
  }));

  // ---- Save (create or update) via API ----
  const handleSave = async (item: Variant) => {
    const payload = {
      categoryId: Number(item.categoryId),
      seriesId: Number(item.seriesId),
      modelId: Number(item.modelId),
      variantCode: item.variantCode,
      variantName: item.variantName,
      bodyTypeId: Number(item.bodyTypeId),
      axleBrandId: Number(item.axleBrandId),
      hydraulicBrandId: Number(item.hydraulicBrandId),
      tyreBrandId: Number(item.tyreBrandId),
      targetCost: Number(item.targetCost),
      sellingPrice: Number(item.sellingPrice),
      status: item.status,
    };

    try {
      if (item.id) {
        const response = await Put(
          "master/variant/update",
          { variantId: Number(item.id), ...payload },
          false
        );
        if (response.data?.success) {
          toastsuccessmsg(response.data?.message || "Variant updated successfully.");
          fetchAll();
        } else {
          toasterrormsg(response.data?.message || "Failed to update variant.");
        }
      } else {
        const response = await Post("master/variant/create", payload, false);
        if (response.data?.success) {
          toastsuccessmsg(response.data?.message || "Variant created successfully.");
          fetchAll();
        } else {
          toasterrormsg(response.data?.message || "Failed to create variant.");
        }
      }
    } catch (error) {
      toasterrormsg("Something went wrong while saving the variant.");
    }
  };

  const handleDeleteOne = async (row: Variant) => {
    try {
      const response = await Delete(
        "master/variant/delete",
        { variantId: Number(row.id) },
        false
      );
      if (response.data?.success) {
        toastsuccessmsg(response.data?.message || "Variant deleted successfully.");
        setData((prev) => prev.filter((item) => item.id !== row.id));
      } else {
        toasterrormsg(response.data?.message || "Failed to delete variant.");
      }
    } catch (error) {
      toasterrormsg("Something went wrong while deleting the variant.");
    }
  };

  const handleDeleteMany = async (rows: { original: Variant }[]) => {
    try {
      await Promise.all(
        rows.map((r) =>
          Delete("master/variant/delete", { variantId: Number(r.original.id) }, false)
        )
      );
      const ids = new Set(rows.map((r) => r.original.id));
      setData((prev) => prev.filter((item) => !ids.has(item.id)));
      setRowSelection({});
      toastsuccessmsg("Selected variants deleted successfully.");
    } catch (error) {
      toasterrormsg("Something went wrong while deleting variants.");
    }
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
                label="Variant Code"
                value={filterCode}
                onChange={(e) => setFilterCode(e.target.value)}
                placeholder="Filter by code"
              />
            </div>
          }
        />
        <MasterTable
          table={table}
          columnCount={columns.length}
          emptyMessage={
            loading ? "Loading variants..." : "No variants found. Click Create Variant to add one."
          }
        />
      </div>
      <VariantDrawer
        isOpen={drawerOpen}
        close={() => setDrawerOpen(false)}
        variant={editing}
        onSave={handleSave}
      />
    </Page>
  );
}