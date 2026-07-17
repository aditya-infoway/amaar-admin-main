import { useEffect, useMemo, useState } from "react";
import { Page } from "@/components/shared/Page";
import { Table, THead, TBody, Th, Tr, Td, Card, Button, Input, Badge } from "@/components/ui";
import { Get, Put, Post, toastsuccessmsg, toasterrormsg } from "@/ApiHelper";
import { BarcodeItem, mapApiToBarcodeItem } from "./data";
import { BarcodePreview } from "./BarcodePreview";
import { PrintLabelModal } from "./PrintLabelModal";

export default function BarcodeManagerPage() {
  const [items, setItems] = useState<BarcodeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<"pending" | "generated">("pending");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [copies, setCopies] = useState<Record<string, number>>({});
  const [manualDraft, setManualDraft] = useState<Record<string, string>>({});
  const [savingId, setSavingId] = useState<string | null>(null);
  const [generatingId, setGeneratingId] = useState<string | null>(null);
  const [bulkGenerating, setBulkGenerating] = useState(false);
  const [printOpen, setPrintOpen] = useState(false);

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

  const filteredPending = useMemo(
    () => pendingItems.filter((i) => i.itemName.toLowerCase().includes(search.toLowerCase())),
    [pendingItems, search],
  );
  const filteredGenerated = useMemo(
    () => generatedItems.filter((i) => i.itemName.toLowerCase().includes(search.toLowerCase())),
    [generatedItems, search],
  );

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = (rows: BarcodeItem[]) => {
    const allSelected = rows.every((r) => selected.has(r.id));
    setSelected((prev) => {
      const next = new Set(prev);
      rows.forEach((r) => (allSelected ? next.delete(r.id) : next.add(r.id)));
      return next;
    });
  };

  // ---- Manual barcode save ----
  const handleManualSave = async (itemId: string) => {
    const value = manualDraft[itemId] ?? "";
    setSavingId(itemId);
    try {
      const res = await Put("master/itemmaster/set-barcode", { itemId: Number(itemId), barcode: value }, false);
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
    const ids = Array.from(selected).filter((id) => pendingItems.some((i) => i.id === id));
    if (ids.length === 0) {
      toasterrormsg("Please select at least one pending item.");
      return;
    }
    setBulkGenerating(true);
    try {
      const res = await Post(
        "master/itemmaster/bulk-generate",
        { itemIds: ids.map(Number) },
        false,
      );
      if (res.data?.success) {
        toastsuccessmsg("Barcodes generated successfully.");
        setSelected(new Set());
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

  const selectedGeneratedForPrint = useMemo(
    () =>
      generatedItems
        .filter((i) => selected.has(i.id))
        .map((item) => ({ item, copies: copies[item.id] || 1 })),
    [generatedItems, selected, copies],
  );

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
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search item name..."
              className="max-w-xs"
            />
            {activeTab === "pending" ? (
              <Button
                color="primary"
                onClick={handleBulkGenerate}
                disabled={bulkGenerating}
              >
                {bulkGenerating ? "Generating..." : `Generate (${selected.size})`}
              </Button>
            ) : (
              <Button
                color="primary"
                onClick={() => setPrintOpen(true)}
                disabled={selectedGeneratedForPrint.length === 0}
              >
                Print
              </Button>
            )}
          </div>

          {/* Pending Table */}
          {activeTab === "pending" && (
            <div className="table-wrapper overflow-x-auto">
              <Table hoverable className="w-full text-left">
                <THead>
                  <Tr>
                    <Th>
                      <input
                        type="checkbox"
                        checked={filteredPending.length > 0 && filteredPending.every((r) => selected.has(r.id))}
                        onChange={() => toggleSelectAll(filteredPending)}
                      />
                    </Th>
                    <Th>#</Th>
                    <Th>Item Name</Th>
                    <Th>MRP</Th>
                    <Th>Stock</Th>
                    <Th>Manual Barcode</Th>
                    <Th>Generated Barcode</Th>
                    <Th>Action</Th>
                  </Tr>
                </THead>
                <TBody>
                  {loading ? (
                    <Tr><Td colSpan={8} className="text-center py-6">Loading...</Td></Tr>
                  ) : filteredPending.length === 0 ? (
                    <Tr><Td colSpan={8} className="text-center py-6">No pending items found.</Td></Tr>
                  ) : (
                    filteredPending.map((item, idx) => (
                      <Tr key={item.id}>
                        <Td>
                          <input
                            type="checkbox"
                            checked={selected.has(item.id)}
                            onChange={() => toggleSelect(item.id)}
                          />
                        </Td>
                        <Td>{idx + 1}</Td>
                        <Td className="font-medium">{item.itemName}</Td>
                        <Td>₹{item.mrp}</Td>
                        <Td>
                          <Badge color={item.stock > 0 ? "success" : "error"}>
                            {item.stock > 0 ? `✓ ${item.stock}` : "Out"}
                          </Badge>
                        </Td>
                        <Td>
                          <div className="flex gap-1.5">
                            <Input
                              value={manualDraft[item.id] ?? ""}
                              onChange={(e) =>
                                setManualDraft((prev) => ({ ...prev, [item.id]: e.target.value }))
                              }
                              placeholder="Manual..."
                              className="w-32"
                            />
                            <Button
                              onClick={() => handleManualSave(item.id)}
                              disabled={savingId === item.id || !manualDraft[item.id]}
                              className="px-2 text-xs"
                            >
                              {savingId === item.id ? "..." : "Save"}
                            </Button>
                          </div>
                        </Td>
                        <Td>
                          <span className="text-xs italic text-orange-500">Not generated</span>
                        </Td>
                        <Td>
                          <Button
                            color="primary"
                            onClick={() => handleAutoGenerate(item.id)}
                            disabled={generatingId === item.id}
                            className="text-xs"
                          >
                            {generatingId === item.id ? "..." : "Auto"}
                          </Button>
                        </Td>
                      </Tr>
                    ))
                  )}
                </TBody>
              </Table>
            </div>
          )}

          {/* Generated Table */}
          {activeTab === "generated" && (
            <div className="table-wrapper overflow-x-auto">
              <Table hoverable className="w-full text-left">
                <THead>
                  <Tr>
                    <Th>
                      <input
                        type="checkbox"
                        checked={filteredGenerated.length > 0 && filteredGenerated.every((r) => selected.has(r.id))}
                        onChange={() => toggleSelectAll(filteredGenerated)}
                      />
                    </Th>
                    <Th>#</Th>
                    <Th>Item Name</Th>
                    <Th>Category</Th>
                    <Th>MRP</Th>
                    <Th>S.Price</Th>
                    <Th>Stock</Th>
                    <Th>Barcode</Th>
                    <Th>Copies</Th>
                    <Th>Preview</Th>
                    <Th>Print</Th>
                    <Th>Update</Th>
                  </Tr>
                </THead>
                <TBody>
                  {loading ? (
                    <Tr><Td colSpan={11} className="text-center py-6">Loading...</Td></Tr>
                  ) : filteredGenerated.length === 0 ? (
                    <Tr><Td colSpan={11} className="text-center py-6">No generated barcodes found.</Td></Tr>
                  ) : (
                    filteredGenerated.map((item, idx) => (
                      <Tr key={item.id}>
                        <Td>
                          <input
                            type="checkbox"
                            checked={selected.has(item.id)}
                            onChange={() => toggleSelect(item.id)}
                          />
                        </Td>
                        <Td>{idx + 1}</Td>
                        <Td className="font-medium">{item.itemName}</Td>
                        <Td>
                          <Badge color="info">{item.categoryName || "—"}</Badge>
                        </Td>
                        <Td>₹{item.mrp}</Td>
                        <Td>₹{item.salesPrice}</Td>
                        <Td>
                          <Badge color={item.stock > 0 ? "success" : "error"}>
                            {item.stock > 0 ? `✓ ${item.stock}` : "Out"}
                          </Badge>
                        </Td>
                        <Td className="font-mono text-xs">{item.barcode}</Td>
                        <Td>
                          <div className="flex items-center gap-1.5">
                            <Button
                              isIcon
                              className="size-6"
                              onClick={() =>
                                setCopies((prev) => ({
                                  ...prev,
                                  [item.id]: Math.max(0, (prev[item.id] || 0) - 1),
                                }))
                              }
                            >
                              -
                            </Button>
                            <Input
                              value={String(copies[item.id] ?? 0)}
                              onChange={(e) =>
                                setCopies((prev) => ({
                                  ...prev,
                                  [item.id]: Number(e.target.value) || 0,
                                }))
                              }
                              className="w-14 text-center"
                            />
                            <Button
                              isIcon
                              className="size-6"
                              onClick={() =>
                                setCopies((prev) => ({ ...prev, [item.id]: (prev[item.id] || 0) + 1 }))
                              }
                            >
                              +
                            </Button>
                          </div>
                        </Td>
                        <Td>
                          <BarcodePreview value={item.barcode} height={30} width={1} fontSize={8} />
                        </Td>
                        <Td>
                          <Button
                            variant="outlined"
                            className="text-xs"
                            onClick={() => {
                              setSelected(new Set([item.id]));
                              setCopies((prev) => ({ ...prev, [item.id]: prev[item.id] || 1 }));
                              setPrintOpen(true);
                            }}
                          >
                            Print
                          </Button>
                        </Td>
                        <Td>
                          <div className="flex items-center gap-1.5">
                            <Input
                              value={manualDraft[item.id] ?? item.barcode}
                              onChange={(e) =>
                                setManualDraft((prev) => ({ ...prev, [item.id]: e.target.value }))
                              }
                              disabled={item.barcodeType === "generate"}
                              className="w-32 font-mono text-xs"
                            />
                            {item.barcodeType === "manual" && (
                              <Button
                                onClick={() => handleManualSave(item.id)}
                                disabled={savingId === item.id}
                                className="px-2 text-xs"
                              >
                                {savingId === item.id ? "..." : "Save"}
                              </Button>
                            )}
                          </div>
                        </Td>
                      </Tr>
                    ))
                  )}
                </TBody>
              </Table>
            </div>
          )}
        </Card>
      </div>

      <PrintLabelModal
        isOpen={printOpen}
        close={() => setPrintOpen(false)}
        items={selectedGeneratedForPrint}
      />
    </Page>
  );
}