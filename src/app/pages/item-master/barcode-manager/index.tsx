import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  RowSelectionState,
  useReactTable,
} from "@tanstack/react-table";
import { useEffect, useMemo, useState } from "react";

import { Page } from "@/components/shared/Page";
import { Table, THead, TBody, Th, Tr, Td, Card, Button, Input } from "@/components/ui";
import { Get, Put, Post, toastsuccessmsg, toasterrormsg } from "@/ApiHelper";
import { fuzzyFilter } from "@/utils/react-table/fuzzyFilter";
import { BarcodeItem, mapApiToBarcodeItem } from "./data";
import { createPendingColumns, createGeneratedColumns } from "./columns";
import { PrintLabelModal } from "./PrintLabelModal";

export default function BarcodeManagerPage() {
  const [items, setItems] = useState<BarcodeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [globalFilter, setGlobalFilter] = useState("");
  const [activeTab, setActiveTab] = useState<"pending" | "generated">("pending");

  const [pendingRowSelection, setPendingRowSelection] = useState<RowSelectionState>({});
  const [generatedRowSelection, setGeneratedRowSelection] = useState<RowSelectionState>({});

  const [copies, setCopies] = useState<Record<string, number>>({});
  const [manualDraft, setManualDraft] = useState<Record<string, string>>({});
  const [savingId, setSavingId] = useState<string | null>(null);
  const [generatingId, setGeneratingId] = useState<string | null>(null);
  const [bulkGenerating, setBulkGenerating] = useState(false);
  const [printOpen, setPrintOpen] = useState(false);
  const [printSingleId, setPrintSingleId] = useState<string | null>(null);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const res = await Get("master/itemmaster/list", {}, false);
      if (res.data?.success) {
        setItems((res.data.data || []).map(mapApiToBarcodeItem));
      } else {
        toasterrormsg(res.data?.message || "Failed to fetch items.");
      }
    } catch (err) {
      toasterrormsg("Something went wrong while fetching items.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const pendingItems = useMemo(() => items.filter((i) => !i.barcode), [items]);
  const generatedItems = useMemo(() => items.filter((i) => i.barcode), [items]);

  // ---- Manual barcode save ----
  const handleManualSave = async (itemId: string) => {
    const value = manualDraft[itemId] ?? "";
    setSavingId(itemId);
    try {
      const res = await Put(
        "master/itemmaster/set-barcode",
        { itemId: Number(itemId), barcode: value },
        false,
      );
      if (res.data?.success) {
        toastsuccessmsg("Barcode saved successfully.");
        fetchAll();
      } else {
        toasterrormsg(res.data?.message || "Failed to save barcode.");
      }
    } catch (err) {
      toasterrormsg("Something went wrong while saving barcode.");
    } finally {
      setSavingId(null);
    }
  };

  const handleManualChange = (id: string, value: string) => {
    setManualDraft((prev) => ({ ...prev, [id]: value }));
  };

  // ---- Auto generate single ----
  const handleAutoGenerate = async (itemId: string) => {
    setGeneratingId(itemId);
    try {
      const res = await Post("master/itemmaster/auto-generate", { itemId: Number(itemId) }, false);
      if (res.data?.success) {
        toastsuccessmsg("Barcode generated successfully.");
        fetchAll();
      } else {
        toasterrormsg(res.data?.message || "Failed to generate barcode.");
      }
    } catch (err) {
      toasterrormsg("Something went wrong while generating barcode.");
    } finally {
      setGeneratingId(null);
    }
  };

  // ---- Bulk generate selected (Pending tab) ----
  const handleBulkGenerate = async () => {
    const ids = Object.keys(pendingRowSelection).filter((id) => pendingRowSelection[id]);
    if (ids.length === 0) {
      toasterrormsg("Please select at least one pending item.");
      return;
    }
    setBulkGenerating(true);
    try {
      const res = await Post("master/itemmaster/bulk-generate", { itemIds: ids.map(Number) }, false);
      if (res.data?.success) {
        toastsuccessmsg("Barcodes generated successfully.");
        setPendingRowSelection({});
        fetchAll();
      } else {
        toasterrormsg(res.data?.message || "Failed to generate barcodes.");
      }
    } catch (err) {
      toasterrormsg("Something went wrong while generating barcodes.");
    } finally {
      setBulkGenerating(false);
    }
  };

  const handleCopiesChange = (id: string, value: number) => {
    setCopies((prev) => ({ ...prev, [id]: value }));
  };

  const handlePrintOne = (id: string) => {
    setPrintSingleId(id);
    setCopies((prev) => ({ ...prev, [id]: prev[id] || 1 }));
    setPrintOpen(true);
  };

  const pendingColumns = useMemo(
    () =>
      createPendingColumns({
        manualDraft,
        onManualChange: handleManualChange,
        onManualSave: handleManualSave,
        savingId,
        onAutoGenerate: handleAutoGenerate,
        generatingId,
      }),
    [manualDraft, savingId, generatingId],
  );

  const generatedColumns = useMemo(
    () =>
      createGeneratedColumns({
        copies,
        onCopiesChange: handleCopiesChange,
        onPrintOne: handlePrintOne,
        manualDraft,
        onManualChange: handleManualChange,
        onManualSave: handleManualSave,
        savingId,
      }),
    [copies, manualDraft, savingId],
  );

  const pendingTable = useReactTable({
    data: pendingItems,
    columns: pendingColumns,
    state: { globalFilter, rowSelection: pendingRowSelection },
    enableRowSelection: true,
    getRowId: (row) => row.id,
    filterFns: { fuzzy: fuzzyFilter },
    globalFilterFn: fuzzyFilter,
    onGlobalFilterChange: setGlobalFilter,
    onRowSelectionChange: setPendingRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  const generatedTable = useReactTable({
    data: generatedItems,
    columns: generatedColumns,
    state: { globalFilter, rowSelection: generatedRowSelection },
    enableRowSelection: true,
    getRowId: (row) => row.id,
    filterFns: { fuzzy: fuzzyFilter },
    globalFilterFn: fuzzyFilter,
    onGlobalFilterChange: setGlobalFilter,
    onRowSelectionChange: setGeneratedRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  const activeTable = activeTab === "pending" ? pendingTable : generatedTable;

  const selectedGeneratedForPrint = useMemo(() => {
    if (printSingleId) {
      const item = generatedItems.find((i) => i.id === printSingleId);
      return item ? [{ item, copies: copies[item.id] || 1 }] : [];
    }
    const selectedIds = Object.keys(generatedRowSelection).filter((id) => generatedRowSelection[id]);
    return generatedItems
      .filter((i) => selectedIds.includes(i.id))
      .map((item) => ({ item, copies: copies[item.id] || 1 }));
  }, [generatedItems, generatedRowSelection, copies, printSingleId]);

  const closePrintModal = () => {
    setPrintOpen(false);
    setPrintSingleId(null);
  };

  return (
    <Page title="Barcode Manager">
      <div className="transition-content w-full px-(--margin-x) pb-8">
        <div className="flex items-center justify-between py-5">
          <div>
            <h2 className="dark:text-dark-50 text-xl font-bold text-gray-800">Barcode Manager</h2>
            <p className="dark:text-dark-300 text-sm text-gray-500">
              Generate, manage &amp; print labels
            </p>
          </div>
          <Button onClick={fetchAll} variant="outlined">
            Refresh
          </Button>
        </div>

        <Card className="p-4">
          {/* Tabs */}
          <div className="dark:border-dark-500 mb-4 flex gap-4 border-b border-gray-200">
            <button
              className={`border-b-2 px-1 pb-2 text-sm font-medium ${
                activeTab === "pending"
                  ? "border-primary-600 text-primary-600"
                  : "border-transparent text-gray-500"
              }`}
              onClick={() => setActiveTab("pending")}
            >
              Pending ({pendingItems.length})
            </button>
            <button
              className={`border-b-2 px-1 pb-2 text-sm font-medium ${
                activeTab === "generated"
                  ? "border-primary-600 text-primary-600"
                  : "border-transparent text-gray-500"
              }`}
              onClick={() => setActiveTab("generated")}
            >
              Generated ({generatedItems.length})
            </button>
          </div>

          {/* Search + actions */}
          <div className="mb-4 flex items-center justify-between gap-3">
            <Input
              value={globalFilter}
              onChange={(e) => setGlobalFilter(e.target.value)}
              placeholder="Search item name..."
              className="max-w-xs"
            />
            {activeTab === "pending" ? (
              <Button color="primary" onClick={handleBulkGenerate} disabled={bulkGenerating}>
                {bulkGenerating
                  ? "Generating..."
                  : `Generate (${Object.keys(pendingRowSelection).filter((id) => pendingRowSelection[id]).length})`}
              </Button>
            ) : (
              <Button
                color="primary"
                onClick={() => {
                  setPrintSingleId(null);
                  setPrintOpen(true);
                }}
                disabled={Object.keys(generatedRowSelection).filter((id) => generatedRowSelection[id]).length === 0}
              >
                Print
              </Button>
            )}
          </div>

          {/* Table — theme datatable pattern */}
          <div className="table-wrapper min-w-full grow overflow-x-auto">
            <Table hoverable className="w-full text-left rtl:text-right">
              <THead>
                {activeTable.getHeaderGroups().map((headerGroup) => (
                  <Tr key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <Th
                        key={header.id}
                        className="dark:bg-dark-800 dark:text-dark-100 bg-gray-200 font-semibold text-gray-800 uppercase first:ltr:rounded-tl-lg last:ltr:rounded-tr-lg first:rtl:rounded-tr-lg last:rtl:rounded-tl-lg"
                      >
                        {header.isPlaceholder
                          ? null
                          : flexRender(header.column.columnDef.header, header.getContext())}
                      </Th>
                    ))}
                  </Tr>
                ))}
              </THead>
              <TBody>
                {loading ? (
                  <Tr>
                    <Td colSpan={activeTable.getAllColumns().length} className="py-6 text-center">
                      Loading...
                    </Td>
                  </Tr>
                ) : activeTable.getRowModel().rows.length === 0 ? (
                  <Tr>
                    <Td colSpan={activeTable.getAllColumns().length} className="py-6 text-center">
                      {activeTab === "pending" ? "No pending items found." : "No generated barcodes found."}
                    </Td>
                  </Tr>
                ) : (
                  activeTable.getRowModel().rows.map((row) => (
                    <Tr
                      key={row.id}
                      className="dark:border-b-dark-500 relative border-y border-transparent border-b-gray-200"
                    >
                      {row.getVisibleCells().map((cell) => (
                        <Td key={cell.id} className="dark:bg-dark-900 relative bg-white">
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </Td>
                      ))}
                    </Tr>
                  ))
                )}
              </TBody>
            </Table>
          </div>
        </Card>
      </div>

      <PrintLabelModal isOpen={printOpen} close={closePrintModal} items={selectedGeneratedForPrint} />
    </Page>
  );
}