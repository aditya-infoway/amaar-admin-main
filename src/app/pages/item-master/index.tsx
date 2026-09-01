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
import { Upload } from "lucide-react";

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

  const categoryFilterOptions = useMemo(() => {
    const unique = Array.from(
      new Set(data.map((item) => item.categoryName).filter(Boolean)),
    );
    return [
      { id: "", label: "All" },
      ...unique.map((name) => ({ id: name as string, label: name as string })),
    ];
  }, [data]);

  const handleImportExcel = async (file: File) => {
    try {
      const columnMapping = {
        "Item Code": "itemCode",
        "Item Name": "itemName",
        "Short Name": "shortName",
        "Item Category": "categoryName",
        Group: "groupName",
        // 'Sales Price': 'salesPrice',
        // 'MRP': 'mrp',
        Barcode: "barcode",
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

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (error) {
      toasterrormsg("Failed to import Excel file. Please check the format.");
    }
  };

  const triggerFileUpload = () => {
    fileInputRef.current?.click();
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
        navigate(`/item-master/edit/${row.id}`),
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
          onCreate={() => navigate("/item-master/create")}
          importButton={
            <Button
              variant="outlined"
              className="h-9 gap-2 rounded-md px-3 text-sm"
              onClick={triggerFileUpload}
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
            const file = e.target.files?.[0];
            if (file) {
              handleImportExcel(file);
            }
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
        />
      </div>
    </Page>
  );
}
