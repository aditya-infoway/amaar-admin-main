import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import { ChevronLeftIcon, PlusIcon, TrashIcon, CheckIcon } from "@heroicons/react/24/outline";
import {
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  RowSelectionState,
  SortingState,
  useReactTable,
} from "@tanstack/react-table";
import { Badge, Button, Input, Radio, Table, TBody, Td, Textarea, Th, THead, Tr } from "@/components/ui";
import { DatePicker } from "@/components/shared/form/Datepicker";
import { Combobox } from "@/components/shared/form/StyledCombobox";
import { Listbox } from "@/components/shared/form/StyledListbox";
import { Page } from "@/components/shared/Page";
import { SelectCell, SelectHeader } from "@/components/shared/table/SelectCheckbox";
import { fuzzyFilter } from "@/utils/react-table/fuzzyFilter";
import { Get, Post, toasterrormsg, toastsuccessmsg } from "@/ApiHelper";
import { MasterTable } from "../shared/MasterTable";
import { MasterToolbar } from "../shared/MasterToolbar";
import { exportToExcel, exportToPdf } from "../shared/export";
import { TextCell } from "../shared/tableCells";

/* ───────────────────────── TYPES ───────────────────────── */
type PoCatalogItem = {
  itemId: number;
  itemCode: string;
  itemName: string;
  hsnCode: string;
  unit: string;
  taxSlab: string;
  purchasePrice: number;
};

type SupplierSuggestion = {
  supplierId: number;
  supplierName: string;
  rate: number;
  qty: number;
  purchaseDate: string;
  purchaseBillNo: string;
};

type LastPurchase = {
  supplierId: number;
  supplierName: string;
  rate: number;
  qty: number;
  purchaseDate: string;
  purchaseBillNo: string;
};

type OrderItem = {
  id: number;
  itemId: number;
  item: string;
  hsn: string;
  qty: number;
  unit: string;
  rate: number;
  discount: number;
  gstPct: number;
  supplierId: number | null;
  supplierName: string;
};

type DraftItem = {
  itemId: number | null;
  item: string;
  hsn: string;
  qty: number;
  unit: string;
  rate: number;
  discount: number;
  gstPct: number;
  supplierId: number | null;
  supplierName: string;
};

const emptyDraft: DraftItem = {
  itemId: null, item: "", hsn: "", qty: 1, unit: "", rate: 0, discount: 0, gstPct: 0,
  supplierId: null, supplierName: "",
};

const locations = [{ id: 1, name: "Main Warehouse" }, { id: 2, name: "Branch Warehouse" }];

const money = (value: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 2 }).format(value || 0);

function SectionCard({ title, children, className = "" }: { title: string; children: React.ReactNode; className?: string }) {
  return (
    <section className={`rounded-xl border border-gray-200 bg-white shadow-sm dark:border-dark-500 dark:bg-dark-700 ${className}`}>
      <div className="border-b border-gray-100 px-4 py-3 dark:border-dark-500 sm:px-5">
        <h2 className="text-sm font-bold text-gray-800 dark:text-dark-50">{title}</h2>
      </div>
      <div className="p-4 sm:p-5">{children}</div>
    </section>
  );
}

function FieldLabel({ children, required }: { children: React.ReactNode; required?: boolean }) {
  return <label className="input-label mb-1.5 block"><span className="input-label font-semibold text-gray-700 dark:text-dark-100">{children}{required && <span className="ml-0.5 text-error">*</span>}</span></label>;
}

function formatDateForApi(date: Date): string {
  const yr = date.getFullYear();
  const mo = String(date.getMonth() + 1).padStart(2, "0");
  const dy = String(date.getDate()).padStart(2, "0");
  return `${yr}-${mo}-${dy}`;
}

function FormDate({ label, value, onChange, required }: { label: string; value: string; onChange: (value: string) => void; required?: boolean }) {
  return (
    <div>
      <FieldLabel required={required}>{label}</FieldLabel>
      <DatePicker
        value={value}
        onChange={(dates) => { const date = dates?.[0]; onChange(date ? formatDateForApi(date) : ""); }}
        options={{ dateFormat: "d-m-Y", defaultDate: value || undefined }}
        placeholder="Select date"
      />
    </div>
  );
}

/* ───────────────────────── ITEM SELECT DRAWER (Plus icon se open) ───────────────────────── */
function ItemSelectDrawer({
  open,
  onClose,
  onSelect,
  itemCatalog,
}: {
  open: boolean;
  onClose: () => void;
  onSelect: (item: PoCatalogItem) => void;
  itemCatalog: PoCatalogItem[];
}) {
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<number | null>(null);

  useEffect(() => {
    if (!open) {
      setSearch("");
      setSelectedId(null);
    }
  }, [open]);

  const filtered = itemCatalog.filter((v) =>
    v.itemName.toLowerCase().includes(search.toLowerCase()) ||
    v.itemCode?.toLowerCase().includes(search.toLowerCase()) ||
    v.hsnCode?.toLowerCase().includes(search.toLowerCase())
  );

  const handleConfirm = () => {
    const selected = itemCatalog.find((v) => v.itemId === selectedId);
    if (!selected) return;
    onSelect(selected);
    setSelectedId(null);
    onClose();
  };

  return (
    <>
      {open && <div className="fixed inset-0 bg-black/40 z-40" onClick={onClose} />}
      <div className={"fixed top-0 right-0 h-full lg:w-[60%] bg-white dark:bg-dark-700 z-50 shadow-2xl flex flex-col transition-transform duration-300 " + (open ? "translate-x-0" : "translate-x-full")}>
        <div className="flex items-center justify-between px-5 py-4 bg-primary text-white flex-shrink-0">
          <h3 className="font-bold text-base">Select Item</h3>
          <Button variant="flat" onClick={onClose} className="!text-white hover:!bg-white/20">
            <TrashIcon className="hidden" />
            <span className="text-lg leading-none">×</span>
          </Button>
        </div>
        <div className="px-5 py-3 border-b border-gray-100 dark:border-dark-500 flex-shrink-0">
          <Input value={search} onChange={(e: any) => setSearch(e.target.value)} placeholder="Search by item code, name, HSN..." />
        </div>
        <div className="flex-1 overflow-auto">
          <table className="w-full min-w-[700px]">
            <thead className="sticky top-0 bg-gray-50 dark:bg-dark-800 z-10">
              <tr className="border-b border-gray-200 dark:border-dark-500">
                <th className="px-3 py-3 w-10" />
                {["Item Code", "Item Name", "HSN Code", "Unit", "Tax %", "Purchase Price"].map((h) => (
                  <th key={h} className="px-3 py-3 text-left text-xs font-bold text-gray-500 dark:text-dark-200 uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((v) => (
                <tr
                  key={v.itemId}
                  onClick={() => setSelectedId((p) => (p === v.itemId ? null : v.itemId))}
                  className={"border-b border-gray-100 dark:border-dark-600 cursor-pointer transition-colors " + (selectedId === v.itemId ? "bg-primary/5" : "hover:bg-gray-50 dark:hover:bg-dark-600")}
                >
                  <td className="px-3 py-2.5">
                    <div className={"w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all " + (selectedId === v.itemId ? "border-primary bg-primary" : "border-gray-300 dark:border-dark-400")}>
                      {selectedId === v.itemId && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                    </div>
                  </td>
                  <td className="px-3 py-2.5 text-sm font-medium text-gray-800 dark:text-dark-50">{v.itemCode}</td>
                  <td className="px-3 py-2.5 text-sm text-gray-600 dark:text-dark-200">{v.itemName}</td>
                  <td className="px-3 py-2.5 text-sm text-gray-600 dark:text-dark-200">{v.hsnCode}</td>
                  <td className="px-3 py-2.5 text-sm text-gray-600 dark:text-dark-200">{v.unit}</td>
                  <td className="px-3 py-2.5 text-sm text-gray-600 dark:text-dark-200">{v.taxSlab}%</td>
                  <td className="px-3 py-2.5 text-sm font-medium text-gray-800 dark:text-dark-50">{money(v.purchasePrice)}</td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={7} className="px-4 py-8 text-center text-sm text-gray-400">No items found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="px-5 py-4 border-t border-gray-100 dark:border-dark-500 flex gap-3 justify-between items-center bg-gray-50 dark:bg-dark-800 flex-shrink-0">
          <span className="text-sm font-medium text-gray-500 dark:text-dark-200">{selectedId ? "1 item selected" : "No item selected"}</span>
          <div className="flex gap-3">
            <Button variant="outlined" color="secondary" onClick={onClose}>Cancel</Button>
            <Button color="primary" onClick={handleConfirm} disabled={!selectedId}>
              <PlusIcon className="size-4 mr-1" /> Add Selected
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}

/* ───────────────────────── LIST PAGE (dynamic) ───────────────────────── */
type PurchaseOrderRow = {
  id: string;
  poNumber: string;
  poDate: string;
  supplierName: string;
  deliveryLocation: string;
  totalAmount: string;
  status: string;
};

const purchaseOrderColumns = [
  { id: "select", header: SelectHeader, cell: SelectCell, enableSorting: false },
  { accessorKey: "poNumber", header: "PO Number", cell: TextCell },
  { accessorKey: "poDate", header: "PO Date", cell: TextCell },
  { accessorKey: "supplierName", header: "Supplier Name", cell: TextCell },
  { accessorKey: "deliveryLocation", header: "Delivery Location", cell: TextCell },
  { accessorKey: "totalAmount", header: "Total Amount", cell: TextCell },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ getValue }: { getValue: () => string }) => {
      const status = getValue();
      const color = status === "Generated" ? "success" : "warning";
      return <Badge variant="outlined" color={color} className="rounded-full">{status}</Badge>;
    },
  },
];

const purchaseOrderExportColumns = [
  { key: "poNumber" as const, header: "PO Number" },
  { key: "poDate" as const, header: "PO Date" },
  { key: "supplierName" as const, header: "Supplier Name" },
  { key: "deliveryLocation" as const, header: "Delivery Location" },
  { key: "totalAmount" as const, header: "Total Amount" },
  { key: "status" as const, header: "Status" },
];

function PurchaseOrderList() {
  const navigate = useNavigate();
  const [data, setData] = useState<PurchaseOrderRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [globalFilter, setGlobalFilter] = useState("");
  const [sorting, setSorting] = useState<SortingState>([]);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [showFilters, setShowFilters] = useState(false);
  const [filterSupplier, setFilterSupplier] = useState("");
  const [filterLocation, setFilterLocation] = useState("");
  const [filterStatus, setFilterStatus] = useState("");

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const financialYearId = sessionStorage.getItem("financialYearId");
        const res = await Get("purchase-order/list", { financialYearId }, false);
        if (res.data?.success) {
          setData(res.data.data || []);
        } else {
          toasterrormsg(res.data?.message || "Failed to load purchase order list.");
        }
      } catch (err: any) {
        toasterrormsg(err?.response?.data?.message || "Failed to load purchase order list.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const locationOptions = useMemo(
    () => [...new Set(data.map((o) => o.deliveryLocation))].filter(Boolean).map((label) => ({ id: label, label })),
    [data],
  );
  const statusOptions = useMemo(
    () => [...new Set(data.map((o) => o.status))].filter(Boolean).map((label) => ({ id: label, label })),
    [data],
  );
  const filteredPurchaseOrders = useMemo(
    () => data.filter((order) =>
      (!filterSupplier || order.supplierName.toLowerCase().includes(filterSupplier.toLowerCase())) &&
      (!filterLocation || order.deliveryLocation === filterLocation) &&
      (!filterStatus || order.status === filterStatus),
    ),
    [data, filterSupplier, filterLocation, filterStatus],
  );

  const table = useReactTable({
    data: filteredPurchaseOrders,
    columns: purchaseOrderColumns,
    state: { globalFilter, sorting, rowSelection },
    enableRowSelection: true,
    getRowId: (row) => row.id,
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
    <Page title="Purchase Order">
      <div className="transition-content w-full pb-5">
        <MasterToolbar
          title="Purchase Order"
          createLabel="Create Purchase Order"
          searchPlaceholder="Search purchase orders..."
          table={table}
          showFilters={showFilters}
          onToggleFilters={() => setShowFilters((value) => !value)}
          onCreate={() => navigate("/purchase-master/purchase-order/create")}
          onExportExcel={() => exportToExcel(filteredPurchaseOrders, purchaseOrderExportColumns, "purchase-orders")}
          onExportPdf={() => exportToPdf(filteredPurchaseOrders, purchaseOrderExportColumns, "Purchase Order List", "purchase-orders")}
          filterPanel={
            <div className="grid gap-4 sm:grid-cols-3">
              <Input label="Supplier Name" value={filterSupplier} onChange={(event) => setFilterSupplier(event.target.value)} placeholder="Filter by supplier name" />
              <Listbox
                data={[{ id: "", label: "All" }, ...locationOptions]}
                value={[{ id: "", label: "All" }, ...locationOptions].find((option) => option.id === filterLocation) || { id: "", label: "All" }}
                onChange={(option) => setFilterLocation(option.id)}
                label="Delivery Location"
                placeholder="All locations"
                displayField="label"
              />
              <Listbox
                data={[{ id: "", label: "All" }, ...statusOptions]}
                value={[{ id: "", label: "All" }, ...statusOptions].find((option) => option.id === filterStatus) || { id: "", label: "All" }}
                onChange={(option) => setFilterStatus(option.id)}
                label="Status"
                placeholder="All statuses"
                displayField="label"
              />
            </div>
          }
        />
        <MasterTable
          table={table}
          columnCount={purchaseOrderColumns.length}
          emptyMessage={loading ? "Loading purchase orders..." : "No purchase orders found. Click Create Purchase Order to add one."}
        />
      </div>
    </Page>
  );
}

/* ───────────────────────── CREATE / MAIN PAGE ───────────────────────── */
export default function PurchaseOrderPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const isCreateView = location.pathname.endsWith("/create");

  const [items, setItems] = useState<OrderItem[]>([]);
  const [draft, setDraft] = useState<DraftItem>(emptyDraft);
  const [notice, setNotice] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [poNumber, setPoNumber] = useState("");
  const [poDate, setPoDate] = useState(new Date().toISOString().slice(0, 10));
  const [requiredDate, setRequiredDate] = useState("");
  const [selectedLocation, setSelectedLocation] = useState(locations[0]);
  const [remarks, setRemarks] = useState("");

  const [itemCatalog, setItemCatalog] = useState<PoCatalogItem[]>([]);
  const [itemDrawerOpen, setItemDrawerOpen] = useState(false);
  const [supplierSuggestions, setSupplierSuggestions] = useState<SupplierSuggestion[]>([]);
  const [lastPurchase, setLastPurchase] = useState<LastPurchase | null>(null);
  const [showSupplierPanel, setShowSupplierPanel] = useState(false);
  const [loadingSuppliers, setLoadingSuppliers] = useState(false);
  const [formErrors, setFormErrors] = useState<{ requiredDate?: string }>({});

  const unitOptions = ["NOS", "KG", "LTR", "BOX", "SET"].map((name) => ({ id: name, name }));

  /* ---- PO Number generate karo (purchase bill jaisa hi voucher generator) ---- */
  useEffect(() => {
    if (!isCreateView) return;
    (async () => {
      try {
        const financialYearId = sessionStorage.getItem("financialYearId");
        const res = await Get("purchase-order/next-po-no", { financialYearId }, false);
        if (res.data?.success) {
          setPoNumber(res.data.data?.poNumber || "");
        } else {
          toasterrormsg(res.data?.message || "Failed to generate PO No.");
        }
      } catch (err: any) {
        toasterrormsg(err?.response?.data?.message || "Failed to generate PO No.");
      }
    })();
  }, [isCreateView]);

  /* ---- Item catalog fetch (combobox ke liye) ---- */
  useEffect(() => {
    if (!isCreateView) return;
    (async () => {
      try {
        const res = await Get("master/itemmaster/purchase-list", {}, false);
        if (res.data?.success) setItemCatalog(res.data.data || []);
      } catch (err) {
        // fail silently — combobox simply won't show suggestions
      }
    })();
  }, [isCreateView]);

  const updateDraft = (key: keyof DraftItem, value: string | number) => {
    setDraft((current) => ({ ...current, [key]: value }));
  };

  /* ---- Item choose hone par: is item ke suppliers/last-purchase fetch karo ---- */
  const fetchSupplierInfo = async (itemId: number, fallbackRate: number) => {
    setLoadingSuppliers(true);
    setShowSupplierPanel(true);
    try {
      const res = await Get(`purchase-order/item-suppliers/${itemId}`, {}, false);
      if (res.data?.success) {
        const { suppliers, lastPurchase: lp, fallback } = res.data.data;
        setSupplierSuggestions(suppliers || []);
        setLastPurchase(lp || null);

        if (suppliers && suppliers.length > 0) {
          // ---- lowest rate wala supplier auto-select ----
          const lowest = suppliers[0];
          setDraft((d) => ({ ...d, rate: Number(lowest.rate), supplierId: lowest.supplierId, supplierName: lowest.supplierName }));
        } else {
          // ---- koi purchase history nahi to itemmaster ka rate ----
          const rate = fallback?.purchasePrice ?? fallbackRate;
          setDraft((d) => ({ ...d, rate: Number(rate) || 0, supplierId: null, supplierName: "" }));
        }
      }
    } catch (err) {
      toasterrormsg("Failed to load supplier info for this item.");
    } finally {
      setLoadingSuppliers(false);
    }
  };

  const chooseDraftItem = (selected: PoCatalogItem | null) => {
    if (!selected) return;
    setDraft((current) => ({
      ...current,
      itemId: selected.itemId,
      item: selected.itemName,
      hsn: selected.hsnCode,
      unit: selected.unit,
      gstPct: parseFloat(selected.taxSlab) || 0,
    }));
    fetchSupplierInfo(selected.itemId, Number(selected.purchasePrice) || 0);
  };

  /* ---- User manually kisi aur supplier ko select kare to uski rate set ho ---- */
  const selectSupplier = (s: SupplierSuggestion) => {
    setDraft((d) => ({ ...d, rate: Number(s.rate), supplierId: s.supplierId, supplierName: s.supplierName }));
  };

  const draftAmount = useMemo(() => {
    const gross = Number(draft.qty) * Number(draft.rate);
    const discount = gross * Number(draft.discount || 0) / 100;
    const taxable = gross - discount;
    const tax = taxable * Number(draft.gstPct || 0) / 100;
    return taxable + tax;
  }, [draft]);

  const canAddDraft = draft.itemId !== null && draft.item.trim() !== "" && Number(draft.qty) > 0;

  const addDraftToItems = () => {
    if (!canAddDraft || draft.itemId === null) return;
    setItems((current) => [...current, { id: Date.now(), ...draft, itemId: draft.itemId as number }]);
    setDraft(emptyDraft);
    // ---- item add hote hi Supplier Suggestions hide, next item select karne par phir show hoga ----
    setSupplierSuggestions([]);
    setLastPurchase(null);
    setShowSupplierPanel(false);
  };

  const removeItem = (id: number) => setItems((current) => current.filter((item) => item.id !== id));

  const totals = useMemo(() => items.reduce((summary, item) => {
    const gross = Number(item.qty) * Number(item.rate);
    const discount = gross * Number(item.discount || 0) / 100;
    const taxable = gross - discount;
    const tax = taxable * Number(item.gstPct || 0) / 100;
    return { taxable: summary.taxable + taxable, tax: summary.tax + tax, discount: summary.discount + discount };
  }, { taxable: 0, tax: 0, discount: 0 }), [items]);
  const grandTotal = totals.taxable + totals.tax;

  /* ---- Poora form reset karo (naya PO banane ke liye ready) ---- */
const resetForm = async () => {
  setItems([]);
  setDraft(emptyDraft);
  setRemarks("");
  setRequiredDate("");
  setFormErrors({});
  setPoDate(new Date().toISOString().slice(0, 10));
  setSelectedLocation(locations[0]);
  setSupplierSuggestions([]);
  setLastPurchase(null);
  setShowSupplierPanel(false);

  try {
    const financialYearId = sessionStorage.getItem("financialYearId");
    const res = await Get("purchase-order/next-po-no", { financialYearId }, false);
    if (res.data?.success) {
      setPoNumber(res.data.data?.poNumber || "");
    }
  } catch (err) {
    // fail silently
  }
};

const handleSave = async (status: "Draft" | "Generated") => {
  if (!requiredDate) {
    setFormErrors({ requiredDate: "Required Date is mandatory." });
    toasterrormsg("Required Date is mandatory.");
    return;
  }
  setFormErrors({});
  if (items.length === 0) {
    toasterrormsg("Please add at least one item.");
    return;
  }
  setSubmitting(true);
  try {
    const financialYearId = sessionStorage.getItem("financialYearId");
    const payload = {
      financialYearId,
      poNumber, poDate, requiredDate,
      branchId: selectedLocation?.id || null,
      narration: remarks,
      discountAmount: 0,
      roundAmount: 0,
      status,
      items: items.map((i) => ({
        itemId: i.itemId,
        supplierId: i.supplierId || null,
        itemName: i.item,
        hsnCode: i.hsn,
        uom: i.unit,
        qty: i.qty,
        rate: i.rate,
        discount: i.discount,
        gstPct: i.gstPct,
      })),
    };

    const res = await Post("purchase-order/create", payload, false);
    if (res.data?.success) {
      toastsuccessmsg(res.data?.message || "Purchase order saved successfully.");
      navigate("/purchase-master/purchase-order"); // 👈 redirect to list page
    } else {
      toasterrormsg(res.data?.message || "Failed to save purchase order.");
    }
  } catch (err: any) {
    toasterrormsg(err?.response?.data?.message || "Something went wrong while saving.");
  } finally {
    setSubmitting(false);
  }
};

  if (!isCreateView) {
    return <PurchaseOrderList />;
  }

  return (
    <div className="min-h-screen bg-gray-50 px-3 py-5 dark:bg-dark-900 sm:px-4 lg:px-5">
      <div className="w-full max-w-none">
        <div className="mb-5 flex flex-col gap-3 border-b border-gray-200 pb-4 dark:border-dark-500 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-xl font-extrabold text-gray-800 dark:text-dark-50 sm:text-2xl">Create Purchase Order</h1>
          <div className="flex flex-wrap gap-2">
            <Link to="/purchase-master/purchase-order"><Button variant="outlined" className="gap-2"><ChevronLeftIcon className="size-4" /> Cancel</Button></Link>
            <Button variant="outlined" color="primary" disabled={submitting} onClick={() => handleSave("Draft")}>
              {submitting ? "Saving..." : "Save Draft"}
            </Button>
            <Button color="primary" disabled={submitting} onClick={() => handleSave("Generated")}>
              {submitting ? "Saving..." : "Generate PO"}
            </Button>
          </div>
        </div>

        {notice && <div className="mb-5 flex items-center justify-between rounded-lg border border-success/30 bg-success/10 px-4 py-3 text-sm font-medium text-success"><span>{notice}</span><button onClick={() => setNotice("")} aria-label="Dismiss message">×</button></div>}

        <div className="grid grid-cols-1 gap-5 2xl:grid-cols-[minmax(0,1fr)_300px]">
          <div className="space-y-5">
            <SectionCard title="PO Details">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <Input label="PO Number" classNames={{ labelText: "font-semibold text-gray-700 dark:text-dark-100" }} value={poNumber} readOnly placeholder="Generating..." />

              <div>
                <FieldLabel required>Required Date</FieldLabel>
                <DatePicker
                  // label="Required Date"
                  value={requiredDate}
                  onChange={(selectedDates: Date[]) => {
                    const picked = selectedDates?.[0];
                    const formatted = picked ? formatDateForApi(picked) : "";
                    setRequiredDate(formatted);
                    setFormErrors((e) => ({ ...e, requiredDate: undefined }));
                  }}
                  placeholder="Select Date"
                />
                {formErrors.requiredDate && (
                  <p className="text-xs text-red-500 mt-1">{formErrors.requiredDate}</p>
                )}
              </div>

              <div>
                <FieldLabel>PO Date</FieldLabel>
                <DatePicker
                  // label="PO Date"
                  value={poDate}
                  onChange={(selectedDates: Date[]) => {
                    const picked = selectedDates?.[0];
                    setPoDate(picked ? formatDateForApi(picked) : "");
                  }}
                  placeholder="Select Date"
                />
              </div>

              <div><FieldLabel required>Delivery Location</FieldLabel><Listbox data={locations} displayField="name" value={selectedLocation} onChange={setSelectedLocation} placeholder="Select location" /></div>
              <Textarea label="Remarks" rows={3} value={remarks} onChange={(e: any) => setRemarks(e.target.value)} placeholder="Enter remarks..." classNames={{ root: "sm:col-span-2 xl:col-span-4", labelText: "font-semibold text-gray-700 dark:text-dark-100" }} />
            </div>
          </SectionCard>

            <SectionCard title="Item Details">
              <div className="mb-4 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                <p className="text-sm text-gray-500 dark:text-dark-200">Search an item in the row below, then confirm to add it to the order.</p>
              </div>
              <div className="table-wrapper overflow-x-auto rounded-lg border border-gray-200 dark:border-dark-500">
                <Table hoverable className="w-full min-w-[1000px] text-left rtl:text-right">
                  <THead>
                    <Tr>
                      <Th className="w-12 bg-gray-200 text-center font-semibold uppercase text-gray-800 dark:bg-dark-800 dark:text-dark-100">#</Th>
                      <Th className="min-w-56 bg-gray-200 font-semibold uppercase text-gray-800 dark:bg-dark-800 dark:text-dark-100">Item Details</Th>
                      <Th className="w-28 bg-gray-200 font-semibold uppercase text-gray-800 dark:bg-dark-800 dark:text-dark-100">HSN/SAC</Th>
                      <Th className="w-40 bg-gray-200 text-right font-semibold uppercase text-gray-800 dark:bg-dark-800 dark:text-dark-100">Qty</Th>
                      <Th className="w-28 bg-gray-200 font-semibold uppercase text-gray-800 dark:bg-dark-800 dark:text-dark-100">UOM</Th>
                      <Th className="w-32 bg-gray-200 text-right font-semibold uppercase text-gray-800 dark:bg-dark-800 dark:text-dark-100">Rate (₹)</Th>
                      <Th className="w-28 bg-gray-200 text-right font-semibold uppercase text-gray-800 dark:bg-dark-800 dark:text-dark-100">Discount %</Th>
                      <Th className="w-24 bg-gray-200 text-center font-semibold uppercase text-gray-800 dark:bg-dark-800 dark:text-dark-100">GST %</Th>
                      <Th className="w-36 bg-gray-200 text-right font-semibold uppercase text-gray-800 dark:bg-dark-800 dark:text-dark-100">Amount (₹)</Th>
                      <Th className="w-16 bg-gray-200 font-semibold uppercase text-gray-800 dark:bg-dark-800 dark:text-dark-100">Action</Th>
                    </Tr>
                  </THead>
                  <TBody>
                    {/* Entry row */}
                    <Tr className="border-b-2 border-primary/20 bg-primary/5">
                      <Td className="text-center">
                        <Button
                          variant="soft"
                          color="primary"
                          className="size-8 rounded-full p-0"
                          onClick={() => setItemDrawerOpen(true)}
                          aria-label="Open item selector"
                        >
                          <PlusIcon className="size-4.5" />
                        </Button>
                      </Td>
                      <Td>
                        <Combobox
                          data={itemCatalog}
                          displayField="itemName"
                          value={itemCatalog.find((option) => option.itemId === draft.itemId) || null}
                          onChange={(selected: any) => chooseDraftItem(selected)}
                          placeholder="Search item"
                          searchFields={["itemName", "itemCode", "hsnCode"]}
                        />
                      </Td>
                      <Td><div className="px-2 py-1.5 text-sm text-gray-500">{draft.hsn || "—"}</div></Td>
                      <Td><Input className="text-right" min="1" type="number" value={draft.qty} onChange={(e) => updateDraft("qty", Number(e.target.value))} /></Td>
                      <Td><div className="px-2 py-1.5 text-sm text-gray-500">{draft.unit || "—"}</div></Td>
                      <Td><Input className="text-right" min="0" type="number" value={draft.rate} onChange={(e) => updateDraft("rate", Number(e.target.value))} /></Td>
                      <Td><Input className="text-right" min="0" type="number" value={draft.discount} onChange={(e) => updateDraft("discount", Number(e.target.value))} /></Td>
                      <Td className="text-center">
                        {draft.gstPct ? (
                          <span className="bg-primary/10 text-primary px-2 py-0.5 rounded-full font-bold text-xs">{draft.gstPct}%</span>
                        ) : (
                          <span className="text-gray-300 text-xs">—</span>
                        )}
                      </Td>
                      <Td className="text-right font-semibold text-primary">{money(draftAmount)}</Td>
                      <Td className="text-center">
                        <Button variant="soft" color="success" className="size-8 rounded-full p-0" onClick={addDraftToItems} disabled={!canAddDraft} aria-label="Add item to order">
                          <CheckIcon className="size-4.5" />
                        </Button>
                      </Td>
                    </Tr>

                    {items.length === 0 && (
                      <Tr>
                        <Td colSpan={10} className="bg-white py-6 text-center text-sm text-gray-400 dark:bg-dark-700">
                          No items added. Use the search row above to add an item.
                        </Td>
                      </Tr>
                    )}

                    {items.map((item, index) => {
                      const taxable = item.qty * item.rate * (1 - item.discount / 100);
                      const gstAmt = taxable * item.gstPct / 100;
                      const amount = taxable + gstAmt;
                      return (
                        <Tr key={item.id} className="border-b border-gray-200 dark:border-b-dark-500">
                          <Td className="bg-white text-center font-medium text-gray-400 dark:bg-dark-700">{index + 1}</Td>
                          <Td className="bg-white font-medium text-gray-700 dark:bg-dark-700 dark:text-dark-50">
                            {item.item}
                            {item.supplierName && <span className="block text-[10px] text-gray-400">Supplier: {item.supplierName}</span>}
                          </Td>
                          <Td className="bg-white text-gray-500 dark:bg-dark-700 dark:text-dark-200">{item.hsn}</Td>
                          <Td className="bg-white text-right text-gray-500 dark:bg-dark-700 dark:text-dark-200">{item.qty}</Td>
                          <Td className="bg-white text-gray-500 dark:bg-dark-700 dark:text-dark-200">{item.unit}</Td>
                          <Td className="bg-white text-right text-gray-500 dark:bg-dark-700 dark:text-dark-200">{money(item.rate)}</Td>
                          <Td className="bg-white text-right text-gray-500 dark:bg-dark-700 dark:text-dark-200">{item.discount}%</Td>
                          <Td className="bg-white text-center">
                            <span className="bg-primary/10 text-primary px-2 py-0.5 rounded-full font-bold text-xs">{item.gstPct}%</span>
                          </Td>
                          <Td className="bg-white text-right font-semibold text-gray-800 dark:bg-dark-700 dark:text-dark-50">{money(amount)}</Td>
                          <Td className="bg-white text-center dark:bg-dark-700">
                            <Button variant="flat" color="error" onClick={() => removeItem(item.id)} className="size-8 p-0" aria-label="Remove item">
                              <TrashIcon className="size-4.5 stroke-1" />
                            </Button>
                          </Td>
                        </Tr>
                      );
                    })}
                  </TBody>
                  <tfoot>
                    <Tr className="border-t-2 border-primary/20 bg-primary/5 font-bold text-primary">
                      <Td colSpan={3}>Total</Td>
                      <Td className="text-right">{items.reduce((total, item) => total + Number(item.qty), 0)}</Td>
                      <Td colSpan={4} />
                      <Td className="text-right">{money(grandTotal)}</Td>
                      <Td />
                    </Tr>
                  </tfoot>
                </Table>
              </div>
            </SectionCard>

            <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">
              <SectionCard title="Attachments">
                <div className="flex min-h-36 flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-200 px-4 text-center text-sm text-gray-400 dark:border-dark-500">
                  <label className="cursor-pointer font-medium text-primary hover:underline">
                    Drag & Drop files here or Browse
                    <input type="file" className="hidden" multiple />
                  </label>
                  <span className="mt-1 text-xs">Supports: PDF, JPG, PNG (Max. 5MB)</span></div>
                </SectionCard>
              <SectionCard title="Terms & Conditions">
                <textarea rows={5} className="form-textarea w-full text-sm" defaultValue={"1. Material should be as per the quality mentioned in our enquiry.\n2. Delivery should be completed on or before the required date.\n3. Please mention our PO number in your challan.\n4. Subject to local jurisdiction."} />
              </SectionCard>
              <SectionCard title="Order Summary">
                <div className="space-y-3">
                  <div className="flex justify-between text-sm text-gray-500 dark:text-dark-200"><span>Sub Total</span><strong className="text-gray-800 dark:text-dark-50">{money(totals.taxable + totals.discount)}</strong></div>
                  <div className="flex justify-between text-sm text-gray-500 dark:text-dark-200"><span>Discount</span><strong className="text-gray-800 dark:text-dark-50">{money(totals.discount)}</strong></div>
                  <div className="flex justify-between text-sm text-gray-500 dark:text-dark-200"><span>Taxable Amount</span><strong className="text-gray-800 dark:text-dark-50">{money(totals.taxable)}</strong></div>
                  <div className="flex justify-between text-sm text-gray-500 dark:text-dark-200"><span>GST Amount</span><strong className="text-gray-800 dark:text-dark-50">{money(totals.tax)}</strong></div>
                  <div className="border-t border-gray-100 pt-3 dark:border-dark-500"><span className="text-xs font-bold uppercase tracking-wide text-gray-400">Total Amount</span><p className="mt-1 text-2xl font-extrabold text-primary">{money(grandTotal)}</p></div>
                </div>
              </SectionCard>
            </div>

            <div className="flex flex-col-reverse gap-3 border-t border-gray-200 pt-5 dark:border-dark-500 sm:flex-row sm:justify-end">
              <Link to="/purchase-master/purchase-order"><Button variant="outlined">Cancel</Button></Link>
              <Button variant="outlined" color="primary" disabled={submitting} onClick={() => handleSave("Draft")}>Save as Draft</Button>
              <Button color="primary" disabled={submitting} onClick={() => handleSave("Generated")}>Create Purchase Order</Button>
            </div>
          </div>

          <aside className="space-y-5">
            <SectionCard title="Supplier Suggestions">
              {loadingSuppliers ? (
                <p className="py-4 text-center text-xs text-gray-400">Loading suppliers...</p>
              ) : !showSupplierPanel ? (
                <p className="py-4 text-center text-xs text-gray-400">Select an item to see supplier suggestions.</p>
              ) : supplierSuggestions.length === 0 ? (
                <p className="py-4 text-center text-xs text-gray-400">No previous purchase found for this item — rate taken from item master.</p>
              ) : (
                <>
                  <p className="mb-3 text-xs text-primary">Based on last purchase rate</p>
                  {supplierSuggestions.map((s, index) => (
                    <button
                      type="button"
                      key={s.supplierId}
                      onClick={() => selectSupplier(s)}
                      className={`mb-3 w-full rounded-lg border p-3 text-left transition-colors ${draft.supplierId === s.supplierId ? "border-success/50 bg-success/5" : "border-gray-200 hover:border-primary/40 dark:border-dark-500"}`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="flex gap-2 text-sm font-semibold text-gray-700 dark:text-dark-50">
                          <Radio checked={draft.supplierId === s.supplierId} onChange={() => selectSupplier(s)} name="supplier" color="primary" />
                          {s.supplierName}
                        </span>
                        {index === 0 && <span className="rounded bg-success/15 px-1.5 py-0.5 text-[10px] font-bold text-success">Recommended</span>}
                      </div>
                      <div className="mt-3 grid grid-cols-2 gap-y-1 text-xs text-gray-500">
                        <span>Last Rate</span><strong className="text-right text-gray-700 dark:text-dark-50">{money(s.rate)}</strong>
                        <span>Last Qty</span><strong className="text-right text-gray-700 dark:text-dark-50">{s.qty}</strong>
                        <span>Last Bill No</span><strong className="text-right text-gray-700 dark:text-dark-50">{s.purchaseBillNo}</strong>
                        <span>Last Date</span><strong className="text-right text-gray-700 dark:text-dark-50">{s.purchaseDate}</strong>
                      </div>
                    </button>
                  ))}
                </>
              )}
            </SectionCard>

            <SectionCard title="Last Purchase History">
              {!lastPurchase ? (
                <p className="py-4 text-center text-xs text-gray-400">No purchase history for this item yet.</p>
              ) : (
                <dl className="grid grid-cols-2 gap-y-2 text-xs">
                  <dt className="text-gray-500">Last Rate</dt><dd className="text-right font-semibold text-gray-700 dark:text-dark-50">{money(lastPurchase.rate)}</dd>
                  <dt className="text-gray-500">Last Qty</dt><dd className="text-right font-semibold text-gray-700 dark:text-dark-50">{lastPurchase.qty}</dd>
                  <dt className="text-gray-500">Last Supplier</dt><dd className="text-right font-semibold text-gray-700 dark:text-dark-50">{lastPurchase.supplierName}</dd>
                  <dt className="text-gray-500">Last Bill No</dt><dd className="text-right font-semibold text-primary">{lastPurchase.purchaseBillNo}</dd>
                  <dt className="text-gray-500">Last Date</dt><dd className="text-right font-semibold text-gray-700 dark:text-dark-50">{lastPurchase.purchaseDate}</dd>
                </dl>
              )}
            </SectionCard>
          </aside>
        </div>
      </div>

      <ItemSelectDrawer
        open={itemDrawerOpen}
        onClose={() => setItemDrawerOpen(false)}
        onSelect={(selected) => chooseDraftItem(selected)}
        itemCatalog={itemCatalog}
      />
    </div>
  );
}