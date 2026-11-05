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
import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router";
import * as XLSX from "xlsx";
import { Page } from "@/components/shared/Page";
import { Input } from "@/components/ui";
import { Button } from "@/components/ui/Button";
import { Listbox } from "@/components/shared/form/StyledListbox";
import { fuzzyFilter } from "@/utils/react-table/fuzzyFilter";
import { Get, Post, Delete, toastsuccessmsg, toasterrormsg } from "@/ApiHelper";
import { exportToExcel, exportToPdf, importFromExcel } from "../shared/export";
import { MasterTable } from "../shared/MasterTable";
import { MasterToolbar } from "../shared/MasterToolbar";
import { statusOptions } from "../shared/constants";
import { downloadBomImportTemplate } from "../shared/bomImportTemplate";
import { columns, exportColumns } from "./columns";
import { mapApiBOM2ToBOM2, BOM2 } from "./data";
import clsx from "clsx";
import { Boxes, GitBranch, Upload, Download, X } from "lucide-react";
import { createPortal } from "react-dom";
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

  // ---- Import Excel state ----
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importOpen, setImportOpen] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const readBomExcel = async (
    file: File,
    mapping: Record<string, string>,
  ): Promise<any[]> => {
    const buf = await file.arrayBuffer();
    const wb = XLSX.read(buf, { type: "array" });
    const ws = wb.Sheets[wb.SheetNames[0]];
    const json = XLSX.utils.sheet_to_json<any>(ws, { defval: "", raw: true });

    const norm = (s: string) => String(s).trim().toLowerCase();
    const map: Record<string, string> = {};
    Object.entries(mapping).forEach(([k, v]) => (map[norm(k)] = v));

    return json.map((row) => {
      const out: any = {};
      Object.keys(row).forEach((h) => {
        const key = map[norm(h)];
        if (key) out[key] = row[h];
      });
      return out;
    });
  };
  const closeImportModal = () => {
    setImportOpen(false);
    setImportFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleImportExcel = async () => {
    if (!importFile) return toasterrormsg("Please select a file first.");
    const file = importFile;
    setImporting(true);
    try {
      const columnMapping = {
        Parent: "parentCode",
        Item: "parentName",
        "S. No.": "serialNo",
        Child: "childCode",
        "Child Name": "childName",
        UOM: "uom",
        QPV: "qty",
        L: "length",
        W: "width",
        T: "thickness",
      } as const;

      const rawData = await readBomExcel(file, columnMapping);

      const clean = (v: any) => String(v ?? "").trim();
      const num = (v: any) =>
        v === undefined || v === null || v === "" ? 0 : Number(v) || 0;

      // 1. Clean rows (blank rows skip)
      const rows = rawData
        .filter((r: any) => clean(r.parentCode) && clean(r.childCode))
        .map((r: any) => ({
          parentCode: clean(r.parentCode),
          parentName: clean(r.parentName),
          serialNo: num(r.serialNo),
          childCode: clean(r.childCode),
          childName: clean(r.childName),
          uom: clean(r.uom),
          qty: num(r.qty) || 1,
          length: num(r.length),
          width: num(r.width),
          thickness: num(r.thickness),
        }));

      if (rows.length === 0) {
        return toasterrormsg("No valid rows found in the file.");
      }

      // 2. Root parent dhundo (jo kisi ka child nahi hai)
      const childSet = new Set(rows.map((r) => r.childCode));
      const parentCodes = Array.from(new Set(rows.map((r) => r.parentCode)));
      const roots = parentCodes.filter((code) => !childSet.has(code));

      if (roots.length === 0) {
        return toasterrormsg(
          "Root parent not found. Please check Parent / Child codes.",
        );
      }

      // 3. Parent -> children map
      const childrenMap = new Map<string, typeof rows>();
      rows.forEach((r) => {
        if (!childrenMap.has(r.parentCode)) childrenMap.set(r.parentCode, []);
        childrenMap.get(r.parentCode)!.push(r);
      });

      const parentNameMap = new Map<string, string>();
      rows.forEach((r) => {
        if (!parentNameMap.has(r.parentCode)) {
          parentNameMap.set(r.parentCode, r.parentName);
        }
      });

      // 4. Har root ke liye pura tree (saare descendants) collect karo
      const boms = roots.map((rootCode) => {
        const components: typeof rows = [];
        const visited = new Set<string>();
        const queue = [rootCode];

        while (queue.length) {
          const current = queue.shift()!;
          if (visited.has(current)) continue;
          visited.add(current);
          (childrenMap.get(current) || []).forEach((child) => {
            components.push(child);
            queue.push(child.childCode);
          });
        }

        return {
          bomCode: rootCode,
          bomName: parentNameMap.get(rootCode) || rootCode,
          itemCode: rootCode,
          quantity: 1,
          unit: "NO",
          status: "Active",
          components,
        };
      });

      const response = await Post("master/bom/bulk-import", { boms }, false);

      if (response.data?.success) {
        toastsuccessmsg(
          response.data?.message || "BOMs imported successfully.",
        );
        closeImportModal();
        fetchAll();
      } else {
        const errors = response.data?.data;
        toasterrormsg(
          Array.isArray(errors) && errors.length > 0
            ? `Import rejected. ${errors
                .slice(0, 3)
                .map((e: any) => `Row ${e.row}: ${e.reason}`)
                .join(" | ")}${errors.length > 3 ? " ..." : ""}`
            : response.data?.message || "Import failed.",
        );
      }
    } catch (error) {
      toasterrormsg("Failed to import Excel file. Please check the format.");
    } finally {
      setImporting(false);
    }
  };
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
          importButton={
            <Button
              variant="outlined"
              className="h-9 gap-2 rounded-md px-3 text-sm"
              onClick={() => setImportOpen(true)}
            >
              <Upload className="size-4" />
              <span>Import Excel</span>
            </Button>
          }
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

        {/* Hidden file input for import */}
        <input
          ref={fileInputRef}
          type="file"
          accept=".xlsx,.xls,.csv"
          className="hidden"
          onChange={(e) => {
            setImportFile(e.target.files?.[0] ?? null);
          }}
        />

        {/* Always visible tabs – BOM / Sub BOM */}
        <div className="dark:border-dark-500 mt-4 mb-4 flex cursor-pointer items-center gap-6 border-b border-gray-200 px-(--margin-x)">
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

      {/* Import Modal */}
      {importOpen &&
        createPortal(
          <div className="fixed inset-0 z-[9999] flex items-start justify-center overflow-y-auto bg-black/50 px-4 pt-10">
            <div className="dark:bg-dark-700 w-full max-w-2xl rounded-lg bg-white shadow-xl">
              <div className="dark:border-dark-500 flex items-center justify-between border-b border-gray-200 px-6 py-4">
                <h3 className="text-lg font-semibold">Import BOM</h3>
                <button type="button" onClick={closeImportModal}>
                  <X className="size-5" />
                </button>
              </div>

              <div className="space-y-5 p-6">
                <button
                  type="button"
                  onClick={() => downloadBomImportTemplate()}
                  className="text-primary-600 flex cursor-pointer items-center gap-2 text-sm"
                >
                  <Download className="size-4" /> Download sample template
                </button>

                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="dark:border-dark-400 flex min-h-50 cursor-pointer flex-col items-center justify-center gap-3 rounded-md border-2 border-dashed border-gray-300 p-10 text-sm"
                >
                  <Upload className="size-6" />
                  <span className="text-sm">
                    {importFile
                      ? importFile.name
                      : "Select an Excel / CSV file"}
                  </span>
                </div>
              </div>

              <div className="dark:border-dark-500 flex justify-end gap-2 border-t border-gray-200 px-6 py-4">
                <Button variant="outlined" onClick={closeImportModal}>
                  Close
                </Button>
                <Button
                  onClick={handleImportExcel}
                  disabled={!importFile || importing}
                >
                  {importing ? "Importing..." : "Import"}
                </Button>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </Page>
  );
}
