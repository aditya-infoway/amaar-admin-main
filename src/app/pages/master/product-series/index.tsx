import {
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  RowSelectionState,
  SortingState,
  useReactTable,
  Row,
} from "@tanstack/react-table";
import { useEffect, useMemo, useState } from "react";

import { Page } from "@/components/shared/Page";
import { Input } from "@/components/ui";
import { Listbox } from "@/components/shared/form/StyledListbox";
import { fuzzyFilter } from "@/utils/react-table/fuzzyFilter";
import { Get, Post, Put, Delete, toasterrormsg, toastsuccessmsg } from "@/ApiHelper";
import { exportToExcel, exportToPdf } from "../shared/export";
import { MasterTable } from "../shared/MasterTable";
import { MasterToolbar } from "../shared/MasterToolbar";
import { statusOptions } from "../shared/constants";
import { ProductSeriesDrawer } from "./ProductSeriesDrawer";
import { createColumns, exportColumns } from "./columns";
import { emptyProductSeries, ProductSeries } from "./data";

// ---- API se jo category list aati hai ----
interface ApiCategory {
  categoryId: number;
  categoryName: string;
}

// ---- API se jo product series aati hai ----
interface ApiProductSeries {
  productSeriesId: number;
  companyId: number;
  categoryId: number;
  seriesCode: string;
  seriesName: string;
  capacity: string;
  status: string;
}

const mapToProductSeries = (item: ApiProductSeries): ProductSeries => ({
  id: String(item.productSeriesId),
  categoryId: String(item.categoryId),
  seriesCode: item.seriesCode,
  seriesName: item.seriesName,
  capacity: item.capacity,
  status: item.status as ProductSeries["status"],
});

export default function ProductSeriesPage() {
  const [data, setData] = useState<ProductSeries[]>([]);
  const [categories, setCategories] = useState<{ id: string; label: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [globalFilter, setGlobalFilter] = useState("");
  const [sorting, setSorting] = useState<SortingState>([]);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState<ProductSeries | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [filterCategory, setFilterCategory] = useState("");
  const [filterCode, setFilterCode] = useState("");
  const [filterStatus, setFilterStatus] = useState("");

  // ---------------- Category dropdown ke liye fetch ----------------
  const fetchCategories = async () => {
    try {
      const response = await Get("master/category/list", {}, false);
      const list: ApiCategory[] = response.data?.data || [];
      setCategories(
        list.map((item) => ({
          id: String(item.categoryId),
          label: item.categoryName,
        })),
      );
    } catch (err) {
      toasterrormsg("Failed to load categories");
    }
  };

  // ---------------- LIST ----------------
  const fetchList = async () => {
    try {
      setLoading(true);
      const response = await Get("master/productseries/list", {}, false);
      const list = (response.data?.data || []).map(mapToProductSeries);
      setData(list);
    } catch (err) {
      toasterrormsg("Failed to load product series");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
    fetchList();
  }, []);

  const getCategoryName = (id: string) =>
    categories.find((item) => item.id === id)?.label || "";

  const columns = useMemo(
    () => createColumns(getCategoryName),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [categories.length],
  );

  const filteredData = useMemo(() => {
    return data.filter((item) => {
      if (filterCategory && item.categoryId !== filterCategory) return false;
      if (
        filterCode &&
        !item.seriesCode.toLowerCase().includes(filterCode.toLowerCase())
      )
        return false;
      if (filterStatus && item.status !== filterStatus) return false;
      return true;
    });
  }, [data, filterCategory, filterCode, filterStatus]);

  const exportRows = filteredData.map((row) => ({
    ...row,
    categoryName: getCategoryName(row.categoryId),
  }));

  // ---------------- DELETE (single) ----------------
const handleDeleteRow = async (row: Row<ProductSeries>) => {
  try {
    await Delete(
      "master/productseries/delete",
      {
        productSeriesId: Number(row.original.id),
      },
      false
    );

    toastsuccessmsg("Product series deleted successfully");
    fetchList();
  } catch {
    toasterrormsg("Failed to delete product series");
  }
};

  // ---------------- DELETE (bulk) ----------------
  const handleDeleteRows = async (rows: { original: ProductSeries }[]) => {
    try {
      await Promise.all(
        rows.map((r) =>
          Delete(
            "master/productseries/delete",
            { productSeriesId: Number(r.original.id) },
            false,
          ),
        ),
      );
      toastsuccessmsg("Product series deleted successfully");
      setRowSelection({});
      fetchList();
    } catch (err) {
      toasterrormsg("Failed to delete product series");
    }
  };

  // ---------------- CREATE / UPDATE ----------------
  const handleSave = async (item: ProductSeries) => {
    try {
      if (item.id) {
        await Put(
          "master/productseries/update",
          {
            productSeriesId: Number(item.id),
            categoryId: Number(item.categoryId),
            seriesName: item.seriesName,
            capacity: item.capacity,
            status: item.status,
          },
          false,
        );
        toastsuccessmsg("Product series updated successfully");
      } else {
        await Post(
          "master/productseries/create",
          {
            categoryId: Number(item.categoryId),
            seriesName: item.seriesName,
            capacity: item.capacity,
            status: item.status,
          },
          false,
        );
        toastsuccessmsg("Product series created successfully");
      }
      fetchList();
    } catch (err) {
      toasterrormsg("Failed to save product series");
    }
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
      deleteRow: handleDeleteRow,
      deleteRows: handleDeleteRows,
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
          emptyMessage={
            loading
              ? "Loading..."
              : "No product series found. Click Create Product Series to add one."
          }
        />
      </div>

      <ProductSeriesDrawer
        isOpen={drawerOpen}
        close={() => setDrawerOpen(false)}
        series={editing}
        categories={categories}
        onSave={handleSave}
      />
    </Page>
  );
}