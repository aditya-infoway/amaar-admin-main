import {
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  Row,
  RowSelectionState,
  SortingState,
  useReactTable,
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
import { statusOptions } from "../shared/constants";
import { columns, exportColumns } from "./columns";
import { emptyBOM2, mapApiBOM2ToBOM2, BOM2 } from "./data";
import clsx from "clsx";
import { Boxes, GitBranch } from "lucide-react";

export default function BOM2Page() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);

  const [globalFilter, setGlobalFilter] = useState("");
  const [sorting, setSorting] = useState<SortingState>([]);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [showFilters, setShowFilters] = useState(false);
  const [filterItemName, setFilterItemName] = useState("");
  const [filterBOMName, setFilterBOMName] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [activeTab, setActiveTab] = useState<"bom" | "subBom">("bom");
  const [data, setData] = useState<BOM2[]>([]);
  const [subBomData, setSubBomData] = useState<BOM2[]>([]);

  // ---- Fetch BOM2 items ----
  const fetchAll = async () => {
    setLoading(true);
    try {
      const [bomRes, subRes] = await Promise.all([
        Get("master/bom/list", {}, false),
        Get("master/bom/sub-bom/list", {}, false),
      ]);

      if (bomRes.data?.success) {
        setData((bomRes.data.data || []).map(mapApiBOM2ToBOM2));
      } else {
        toasterrormsg(bomRes.data?.message || "Failed to fetch BOM items.");
      }

      if (subRes.data?.success) {
        setSubBomData((subRes.data.data || []).map(mapApiBOM2ToBOM2));
      }
    } catch (error) {
      toasterrormsg("Something went wrong while fetching BOM data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filteredData = useMemo(() => {
    const source = activeTab === "bom" ? data : subBomData;

    return source.filter((item) => {
      if (
        filterItemName &&
        !item.itemName.toLowerCase().includes(filterItemName.toLowerCase())
      )
        return false;
      if (
        filterBOMName &&
        !item.bomName.toLowerCase().includes(filterBOMName.toLowerCase())
      )
        return false;
      if (filterStatus && item.status !== filterStatus) return false;
      return true;
    });
  }, [
    data,
    subBomData,
    filterItemName,
    filterBOMName,
    filterStatus,
    activeTab,
  ]);

  const table = useReactTable({
    data: filteredData,
    columns,
    state: { globalFilter, sorting, rowSelection },
    enableRowSelection: true,
    getRowId: (row) => row.id,
    meta: {
      viewRow: (row: BOM2) =>
        navigate(`/master/item-master/bom/view/${row.bomId}`),

      openEditDrawer: (row: BOM2) =>
        navigate(`/master/item-master/bom/edit/${row.bomId}`),

      deleteRow: async (row: Row<BOM2>) => {
        try {
          const response = await Delete(
            "master/bom/delete",
            { bomId: row.original.bomId },
            false,
          );
          if (response.data?.success) {
            toastsuccessmsg("BOM deleted successfully.");
            fetchAll();
          } else {
            toasterrormsg(response.data?.message || "Failed to delete BOM.");
          }
        } catch (error) {
          toasterrormsg("Something went wrong while deleting BOM.");
        }
      },
      deleteRows: async (rows) => {
        try {
          await Promise.all(
            rows.map((r) =>
              Delete("master/bom/delete", { bomId: r.original.bomId }, false),
            ),
          );
          toastsuccessmsg("Selected BOMs deleted successfully.");
          setRowSelection({});
          fetchAll();
        } catch (error) {
          toasterrormsg("Something went wrong while deleting BOMs.");
        }
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
    <Page title="BOM">
      <div className="transition-content w-full pb-5">
        <MasterToolbar
          title="BOM"
          createLabel="Create BOM"
          searchPlaceholder="Search BOM items..."
          table={table}
          showFilters={showFilters}
          onToggleFilters={() => setShowFilters((v) => !v)}
          onCreate={() => navigate("/master/item-master/bom/create")}
          onExportExcel={() =>
            exportToExcel(filteredData, exportColumns, "bom2")
          }
          onExportPdf={() =>
            exportToPdf(filteredData, exportColumns, "BOM2 List", "bom2")
          }
          filterPanel={
            <div className="grid gap-4 sm:grid-cols-3">
              <Input
                label="Item Name"
                value={filterItemName}
                onChange={(e) => setFilterItemName(e.target.value)}
                placeholder="Filter by item name"
              />
              <Input
                label="BOM Name"
                value={filterBOMName}
                onChange={(e) => setFilterBOMName(e.target.value)}
                placeholder="Filter by BOM name"
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

      {/* Always visible tabs – BOM / Sub BOM */}
<div className="dark:border-dark-500 mt-4 mb-4 ml-6 flex cursor-pointer items-center gap-6 border-b border-gray-200 px-1">
  {/* BOM Tab */}
  <button
    type="button"
    onClick={() => setActiveTab("bom")}
    className={clsx(
      "relative flex cursor-pointer items-center gap-2 pb-3 text-sm font-medium transition-colors",
      activeTab === "bom"
        ? "text-primary-600 dark:text-primary-400"
        : "dark:text-dark-300 dark:hover:text-dark-100 text-gray-500 hover:text-gray-700",
    )}
  >
    <Boxes className="size-4" />

    <span>BOM</span>

    {activeTab === "bom" && (
      <span className="bg-primary-600 dark:bg-primary-400 absolute right-0 bottom-0 left-0 h-0.5 rounded-full" />
    )}
  </button>

  {/* Sub BOM Tab */}
  <button
    type="button"
    onClick={() => setActiveTab("subBom")}
    className={clsx(
      "relative flex cursor-pointer items-center gap-2 pb-3 text-sm font-medium transition-colors",
      activeTab === "subBom"
        ? "text-primary-600 dark:text-primary-400"
        : "dark:text-dark-300 dark:hover:text-dark-100 text-gray-500 hover:text-gray-700",
    )}
  >
    <GitBranch className="size-4" />

    <span>Sub BOM</span>

    {activeTab === "subBom" && (
      <span className="bg-primary-600 dark:bg-primary-400 absolute right-0 bottom-0 left-0 h-0.5 rounded-full" />
    )}
  </button>
</div>
        <MasterTable
          table={table}
          columnCount={columns.length}
          emptyMessage={
            loading
              ? "Loading BOM items..."
              : activeTab === "bom"
                ? "No BOM items found. Click Create BOM to add one."
                : "No Sub BOM items found."
          }
        />
      </div>
    </Page>
  );
}
