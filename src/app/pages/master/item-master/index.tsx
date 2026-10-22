import {
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  RowSelectionState,
  SortingState,
  useReactTable,
} from "@tanstack/react-table";
import { useEffect, useMemo, useState, useRef } from "react";
import { useNavigate } from "react-router";
import { Page } from "@/components/shared/Page";
import { Input } from "@/components/ui";
import { Button } from "@/components/ui/Button";
import { Listbox } from "@/components/shared/form/StyledListbox";
import { fuzzyFilter } from "@/utils/react-table/fuzzyFilter";
import { Get, Post, Delete, toastsuccessmsg, toasterrormsg } from "@/ApiHelper";
import { exportToExcel, exportToPdf, importFromExcel } from "./shared/export";
import { MasterTable } from "./shared/MasterTable";
import { MasterToolbar } from "./shared/MasterToolbar";
import { columns, exportColumns } from "./columns";
import { ItemMaster, mapApiItemMasterToItemMaster } from "./data";
import { Upload, Download, X } from "lucide-react";
import { downloadItemImportTemplate } from "./shared/itemImportTemplate";

export default function ItemMasterListPage() {
  const navigate = useNavigate();
  const [data, setData] = useState<ItemMaster[]>([]);
  const [loading, setLoading] = useState(true);

  const [globalFilter, setGlobalFilter] = useState("");
  const [sorting, setSorting] = useState<SortingState>([]);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [showFilters, setShowFilters] = useState(false);
  const [filterCode, setFilterCode] = useState("");
  const [filterCategory, setFilterCategory] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importOpen, setImportOpen] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);

  const categoryFilterOptions = useMemo(() => {
    const unique = Array.from(
      new Set(data.map((item) => item.categoryName).filter(Boolean)),
    );
    return [
      { id: "", label: "All" },
      ...unique.map((name) => ({ id: name as string, label: name as string })),
    ];
  }, [data]);

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
        "Item Code": "itemCode",
        "Item Name": "itemName",
        "Short Name": "shortName",
        "HSN Code": "hsnCode",
        "Item Location": "itemLocation",
        "Item Category": "categoryName",
        Group: "groupName",
        "Unit / UOM": "unit",
        "Thickness (mm)": "thickness",
        "Length (mm)": "length",
        "Width (mm)": "width",
        "Weight (kg)": "weight",
        "Tax Slab": "taxSlab",
        "Stock Mapping": "stockMapping",
        "Min Qty": "minQty",
        "Max Qty": "maxQty",
        "Opening Stock": "openingStock",
        "Stock Value": "stockValue",
        "Auto Generate Barcode": "barcodeType", // ← change this
        "Generate Barcode": "barcodeType",
      } as const;

      const importedData = await importFromExcel<Partial<ItemMaster>>(
        file,
        columnMapping,
      );

      const response = await Post(
        "master/itemmaster/bulk-import",
        { items: importedData },
        false,
      );

      if (response.data?.success) {
        toastsuccessmsg(
          response.data?.message || "Items imported successfully.",
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

  const fetchAll = async () => {
    setLoading(true);
    try {
      const response = await Get("master/itemmaster/list", {}, false);
      if (response.data?.success) {
        setData((response.data.data || []).map(mapApiItemMasterToItemMaster));
      } else {
        toasterrormsg(response.data?.message || "Failed to fetch items.");
      }
    } catch (error) {
      toasterrormsg("Something went wrong while fetching item data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filteredData = useMemo(() => {
    return data.filter((item) => {
      if (
        filterCode &&
        !item.itemCode.toLowerCase().includes(filterCode.toLowerCase())
      )
        return false;
      if (filterCategory && item.categoryName !== filterCategory) return false;
      return true;
    });
  }, [data, filterCode, filterCategory]);

  const handleDeleteOne = async (row: ItemMaster) => {
    try {
      const response = await Delete(
        "master/itemmaster/delete",
        { itemId: Number(row.id) },
        false,
      );
      if (response.data?.success) {
        toastsuccessmsg(response.data?.message || "Item deleted successfully.");
        setData((prev) => prev.filter((item) => item.id !== row.id));
      } else {
        toasterrormsg(response.data?.message || "Failed to delete item.");
      }
    } catch (error) {
      toasterrormsg("Something went wrong while deleting the item.");
    }
  };

  const handleDeleteMany = async (rows: { original: ItemMaster }[]) => {
    try {
      await Promise.all(
        rows.map((r) =>
          Delete(
            "master/itemmaster/delete",
            { itemId: Number(r.original.id) },
            false,
          ),
        ),
      );
      const ids = new Set(rows.map((r) => r.original.id));
      setData((prev) => prev.filter((item) => !ids.has(item.id)));
      setRowSelection({});
      toastsuccessmsg("Selected items deleted successfully.");
    } catch (error) {
      toasterrormsg("Something went wrong while deleting items.");
    }
  };

  const table = useReactTable({
    data: filteredData,
    columns,
    state: { globalFilter, sorting, rowSelection },
    enableRowSelection: true,
    getRowId: (row) => row.id,
    meta: {
      openEditDrawer: (row: ItemMaster) =>
        navigate(`/master/item-master/edit/${row.id}`),
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
    <Page title="Item Master">
      <div className="transition-content w-full pb-5">
        <MasterToolbar
          title="Item Master"
          createLabel="Create Item"
          searchPlaceholder="Search items..."
          table={table}
          showFilters={showFilters}
          onToggleFilters={() => setShowFilters((v) => !v)}
          onCreate={() => navigate("/master/item-master/create")}
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
            exportToExcel(filteredData, exportColumns, "item-master")
          }
          onExportPdf={() =>
            exportToPdf(
              filteredData,
              exportColumns,
              "Item Master List",
              "item-master",
            )
          }
          filterPanel={
            <div className="grid gap-4 sm:grid-cols-3">
              <Input
                label="Item Code"
                value={filterCode}
                onChange={(e) => setFilterCode(e.target.value)}
                placeholder="Filter by code"
              />
              <Listbox
                data={categoryFilterOptions}
                value={
                  categoryFilterOptions.find(
                    (item) => item.id === filterCategory,
                  ) || categoryFilterOptions[0]
                }
                onChange={(item) => setFilterCategory(item.id)}
                label="Item Category"
                placeholder="All categories"
                displayField="label"
              />
            </div>
          }
        />

        <input
          ref={fileInputRef}
          type="file"
          accept=".xlsx,.xls,.csv"
          className="hidden"
          onChange={(e) => {
            setImportFile(e.target.files?.[0] ?? null);
          }}
        />

        <MasterTable
          table={table}
          columnCount={columns.length}
          emptyMessage={
            loading
              ? "Loading items..."
              : "No items found. Click Create Item to add one."
          }
          bordered
        />
      </div>
      {importOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="dark:bg-dark-700 w-full max-w-md rounded-lg bg-white shadow-xl">
            <div className="flex items-center justify-between border-b px-5 py-3">
              <h3 className="font-semibold">Import Items</h3>
              <button onClick={closeImportModal}>
                <X className="size-4" />
              </button>
            </div>
            <div className="space-y-4 p-5">
              <button
                type="button"
                onClick={() => downloadItemImportTemplate()}
                className="text-primary-600 flex cursor-pointer items-center gap-2 text-sm"
              >
                <Download className="size-4" /> Download sample template
              </button>
              <div
                onClick={() => fileInputRef.current?.click()}
                className="flex cursor-pointer flex-col items-center gap-2 rounded-md border-2 border-dashed p-8 text-sm"
              >
                <Upload className="size-6" />
                <span>
                  {importFile ? importFile.name : "Select an Excel / CSV file"}
                </span>
              </div>
            </div>
            <div className="flex justify-end gap-2 border-t px-5 py-3">
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
        </div>
      )}
    </Page>
  );
}
