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
import { CategoryDrawer } from "./CategoryDrawer";
import { columns, exportColumns } from "./columns";
import { Category, emptyCategory } from "./data";

// ---- API response ka raw shape (backend se jo aata he) ----
interface ApiCategory {
  categoryId: number;
  companyId: number;
  code: string;
  categoryName: string;
  status: string;
}

// ---- backend ka data -> frontend ka Category type me convert ----
const mapToCategory = (item: ApiCategory): Category => ({
  id: String(item.categoryId),
  code: item.code,
  categoryName: item.categoryName,
  status: item.status,
});

export default function CategoryPage() {
  const [data, setData] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [globalFilter, setGlobalFilter] = useState("");
  const [sorting, setSorting] = useState<SortingState>([]);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [filterCode, setFilterCode] = useState("");
  const [filterName, setFilterName] = useState("");
  const [filterStatus, setFilterStatus] = useState("");

  // ---------------- LIST ----------------
  const fetchList = async () => {
    try {
      setLoading(true);
      const response = await Get("master/category/list", {}, false);
      const list = (response.data?.data || []).map(mapToCategory);
      setData(list);
    } catch (err) {
      toasterrormsg("Failed to load categories");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchList();
  }, []);

  const filteredData = useMemo(() => {
    return data.filter((item) => {
      if (filterCode && !item.code.toLowerCase().includes(filterCode.toLowerCase()))
        return false;
      if (
        filterName &&
        !item.categoryName.toLowerCase().includes(filterName.toLowerCase())
      )
        return false;
      if (filterStatus && item.status !== filterStatus) return false;
      return true;
    });
  }, [data, filterCode, filterName, filterStatus]);

  // ---------------- DELETE (single) ----------------
  const handleDeleteRow = async (row: Row<Category>) => {
  try {
    await Delete(
      "master/category/delete",
      {
        categoryId: Number(row.original.id),
      },
      false
    );

    toastsuccessmsg("Category deleted successfully");
    fetchList();
  } catch {
    toasterrormsg("Failed to delete category");
  }
};

  // ---------------- DELETE (bulk) ----------------
  const handleDeleteRows = async (rows: { original: Category }[]) => {
    try {
      await Promise.all(
        rows.map((r) =>
          Delete("master/category/delete", { categoryId: Number(r.original.id) }, false),
        ),
      );
      toastsuccessmsg("Categories deleted successfully");
      setRowSelection({});
      fetchList();
    } catch (err) {
      toasterrormsg("Failed to delete categories");
    }
  };

  // ---------------- CREATE / UPDATE ----------------
  const handleSave = async (item: Category) => {
    try {
      if (item.id) {
        await Put(
          "master/category/update",
          {
            categoryId: Number(item.id),
            categoryName: item.categoryName,
            status: item.status,
          },
          false,
        );
        toastsuccessmsg("Category updated successfully");
      } else {
        await Post(
          "master/category/create",
          {
            categoryName: item.categoryName,
            status: item.status,
          },
          false,
        );
        toastsuccessmsg("Category created successfully");
      }
      fetchList();
    } catch (err) {
      toasterrormsg("Failed to save category");
    }
  };

  const table = useReactTable({
    data: filteredData,
    columns,
    state: { globalFilter, sorting, rowSelection },
    enableRowSelection: true,
    getRowId: (row) => row.id,
    meta: {
      openEditDrawer: (row: Category) => {
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
    <Page title="Category">
      <div className="transition-content w-full pb-5">
        <MasterToolbar
          title="Category"
          createLabel="Create Category"
          searchPlaceholder="Search categories..."
          table={table}
          showFilters={showFilters}
          onToggleFilters={() => setShowFilters((v) => !v)}
          onCreate={() => {
            setEditing(emptyCategory());
            setDrawerOpen(true);
          }}
          onExportExcel={() =>
            exportToExcel(filteredData, exportColumns, "categories")
          }
          onExportPdf={() =>
            exportToPdf(filteredData, exportColumns, "Category List", "categories")
          }
          filterPanel={
            <div className="grid gap-4 sm:grid-cols-3">
              <Input
                label="Category Name"
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
              ? "Loading..."
              : "No categories found. Click Create Category to add one."
          }
        />
      </div>

      <CategoryDrawer
        isOpen={drawerOpen}
        close={() => setDrawerOpen(false)}
        category={editing}
        onSave={handleSave}
      />
    </Page>
  );
}