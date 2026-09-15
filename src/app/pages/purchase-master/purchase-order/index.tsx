import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import {
  ChevronLeftIcon,
  PlusIcon,
  TrashIcon,
  CheckIcon,
} from "@heroicons/react/24/outline";
import {
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  RowSelectionState,
  SortingState,
  useReactTable,
} from "@tanstack/react-table";
import {
  Badge,
  Button,
  Input,
  Radio,
  Table,
  TBody,
  Td,
  Textarea,
  Th,
  THead,
  Tr,
} from "@/components/ui";
import { DatePicker } from "@/components/shared/form/Datepicker";
import { Combobox } from "@/components/shared/form/StyledCombobox";
import { Listbox } from "@/components/shared/form/StyledListbox";
import { Page } from "@/components/shared/Page";
import {
  SelectCell,
  SelectHeader,
} from "@/components/shared/table/SelectCheckbox";
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
  itemCode: string;
  item: string;
  hsn: string;
  qty: number;
  unit: string;
  rate: number;
  discount: number;
  gstPct: number;
  supplierId: number | null;
  supplierName: string;
  supplierNumber?: string;
  supplierEmail?: string;
  supplierCity?: string;
};

type DraftItem = {
  itemId: number | null;
  itemCode: string;
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
  itemId: null,
  itemCode: "",
  item: "",
  hsn: "",
  qty: 1,
  unit: "",
  rate: 0,
  discount: 0,
  gstPct: 0,
  supplierId: null,
  supplierName: "",
};

const locations = [
  { id: 1, name: "Main Warehouse" },
  { id: 2, name: "Branch Warehouse" },
];

const money = (value: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(value || 0);

function SectionCard({
  title,
  children,
  className = "",
}: {
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      className={`dark:border-dark-500 dark:bg-dark-700 rounded-xl border border-gray-200 bg-white shadow-sm ${className}`}
    >
      <div className="dark:border-dark-500 border-b border-gray-100 px-4 py-3 sm:px-5">
        <h2 className="dark:text-dark-50 text-sm font-bold text-gray-800">
          {title}
        </h2>
      </div>
      <div className="p-4 sm:p-5">{children}</div>
    </section>
  );
}

function FieldLabel({
  children,
  required,
}: {
  children: React.ReactNode;
  required?: boolean;
}) {
  return (
    <label className="input-label mb-1.5 block">
      <span className="input-label dark:text-dark-100 font-semibold text-gray-700">
        {children}
        {required && <span className="text-error ml-0.5">*</span>}
      </span>
    </label>
  );
}

function formatDateForApi(date: Date): string {
  const yr = date.getFullYear();
  const mo = String(date.getMonth() + 1).padStart(2, "0");
  const dy = String(date.getDate()).padStart(2, "0");
  return `${yr}-${mo}-${dy}`;
}

function formatDateForDisplay(value: string): string {
  if (!value) return "";
  const d = new Date(value);
  if (isNaN(d.getTime())) return value;
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  return `${dd}-${mm}-${yyyy}`;
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

  const filtered = itemCatalog.filter(
    (v) =>
      v.itemName.toLowerCase().includes(search.toLowerCase()) ||
      v.itemCode?.toLowerCase().includes(search.toLowerCase()) ||
      v.hsnCode?.toLowerCase().includes(search.toLowerCase()),
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
      {open && (
        <div className="fixed inset-0 z-40 bg-black/40" onClick={onClose} />
      )}
      <div
        className={
          "dark:bg-dark-700 fixed top-0 right-0 z-50 flex h-full flex-col bg-white shadow-2xl transition-transform duration-300 lg:w-[60%] " +
          (open ? "translate-x-0" : "translate-x-full")
        }
      >
        <div className="bg-primary flex flex-shrink-0 items-center justify-between px-5 py-4 text-white">
          <h3 className="text-base font-bold">Select Item</h3>
          <Button
            variant="flat"
            onClick={onClose}
            className="!text-white hover:!bg-white/20"
          >
            <TrashIcon className="hidden" />
            <span className="text-lg leading-none">×</span>
          </Button>
        </div>
        <div className="dark:border-dark-500 flex-shrink-0 border-b border-gray-100 px-5 py-3">
          <Input
            value={search}
            onChange={(e: any) => setSearch(e.target.value)}
            placeholder="Search by item code, name, HSN..."
          />
        </div>
        <div className="flex-1 overflow-auto">
          <table className="w-full min-w-[700px]">
            <thead className="dark:bg-dark-800 sticky top-0 z-10 bg-gray-50">
              <tr className="dark:border-dark-500 border-b border-gray-200">
                <th className="w-10 px-3 py-3" />
                {[
                  "Item Code",
                  "Item Name",
                  "HSN Code",
                  "Unit",
                  "Tax %",
                  "Purchase Price",
                ].map((h) => (
                  <th
                    key={h}
                    className="dark:text-dark-200 px-3 py-3 text-left text-xs font-bold tracking-wider whitespace-nowrap text-gray-500 uppercase"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((v) => (
                <tr
                  key={v.itemId}
                  onClick={() =>
                    setSelectedId((p) => (p === v.itemId ? null : v.itemId))
                  }
                  className={
                    "dark:border-dark-600 cursor-pointer border-b border-gray-100 transition-colors " +
                    (selectedId === v.itemId
                      ? "bg-primary/5"
                      : "dark:hover:bg-dark-600 hover:bg-gray-50")
                  }
                >
                  <td className="px-3 py-2.5">
                    <div
                      className={
                        "flex h-4 w-4 items-center justify-center rounded-full border-2 transition-all " +
                        (selectedId === v.itemId
                          ? "border-primary bg-primary"
                          : "dark:border-dark-400 border-gray-300")
                      }
                    >
                      {selectedId === v.itemId && (
                        <div className="h-1.5 w-1.5 rounded-full bg-white" />
                      )}
                    </div>
                  </td>
                  <td className="dark:text-dark-50 px-3 py-2.5 text-sm font-medium text-gray-800">
                    {v.itemCode}
                  </td>
                  <td className="dark:text-dark-200 px-3 py-2.5 text-sm text-gray-600">
                    {v.itemName}
                  </td>
                  <td className="dark:text-dark-200 px-3 py-2.5 text-sm text-gray-600">
                    {v.hsnCode}
                  </td>
                  <td className="dark:text-dark-200 px-3 py-2.5 text-sm text-gray-600">
                    {v.unit}
                  </td>
                  <td className="dark:text-dark-200 px-3 py-2.5 text-sm text-gray-600">
                    {v.taxSlab}%
                  </td>
                  <td className="dark:text-dark-50 px-3 py-2.5 text-sm font-medium text-gray-800">
                    {money(v.purchasePrice)}
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td
                    colSpan={7}
                    className="px-4 py-8 text-center text-sm text-gray-400"
                  >
                    No items found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="dark:border-dark-500 dark:bg-dark-800 flex flex-shrink-0 items-center justify-between gap-3 border-t border-gray-100 bg-gray-50 px-5 py-4">
          <span className="dark:text-dark-200 text-sm font-medium text-gray-500">
            {selectedId ? "1 item selected" : "No item selected"}
          </span>
          <div className="flex gap-3">
            <Button variant="outlined" color="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button
              color="primary"
              onClick={handleConfirm}
              disabled={!selectedId}
            >
              <PlusIcon className="mr-1 size-4" /> Add Selected
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
  {
    id: "select",
    header: SelectHeader,
    cell: SelectCell,
    enableSorting: false,
  },
  { accessorKey: "poNumber", header: "PO Number", cell: TextCell },
  {
    accessorKey: "poDate",
    header: "PO Date",
    cell: ({ getValue }: { getValue: () => string }) =>
      formatDateForDisplay(getValue()),
  },
  { accessorKey: "supplierName", header: "Supplier Name", cell: TextCell },
  {
    accessorKey: "deliveryLocation",
    header: "Delivery Location",
    cell: TextCell,
  },
  { accessorKey: "totalAmount", header: "Total Amount", cell: TextCell },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ getValue }: { getValue: () => string }) => {
      const status = getValue();
      const color = "success";

      return (
        <Badge variant="outlined" color={color} className="rounded-full">
          {status}
        </Badge>
      );
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
        const financialYearId = localStorage.getItem("financialYearId");
        const res = await Get(
          "purchase-order/list",
          { financialYearId },
          false,
        );
        if (res.data?.success) {
          setData(res.data.data || []);
        } else {
          toasterrormsg(
            res.data?.message || "Failed to load purchase order list.",
          );
        }
      } catch (err: any) {
        toasterrormsg(
          err?.response?.data?.message || "Failed to load purchase order list.",
        );
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const locationOptions = useMemo(
    () =>
      [...new Set(data.map((o) => o.deliveryLocation))]
        .filter(Boolean)
        .map((label) => ({ id: label, label })),
    [data],
  );
  const statusOptions = useMemo(
    () =>
      [...new Set(data.map((o) => o.status))]
        .filter(Boolean)
        .map((label) => ({ id: label, label })),
    [data],
  );
  const filteredPurchaseOrders = useMemo(
    () =>
      data.filter(
        (order) =>
          (!filterSupplier ||
            order.supplierName
              .toLowerCase()
              .includes(filterSupplier.toLowerCase())) &&
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
          onExportExcel={() =>
            exportToExcel(
              filteredPurchaseOrders.map((o) => ({
                ...o,
                poDate: formatDateForDisplay(o.poDate),
              })),
              purchaseOrderExportColumns,
              "purchase-orders",
            )
          }
          onExportPdf={() =>
            exportToPdf(
              filteredPurchaseOrders.map((o) => ({
                ...o,
                poDate: formatDateForDisplay(o.poDate),
              })),
              purchaseOrderExportColumns,
              "Purchase Order List",
              "purchase-orders",
            )
          }
          filterPanel={
            <div className="grid gap-4 sm:grid-cols-3">
              <Input
                label="Supplier Name"
                value={filterSupplier}
                onChange={(event) => setFilterSupplier(event.target.value)}
                placeholder="Filter by supplier name"
              />
              <Listbox
                data={[{ id: "", label: "All" }, ...locationOptions]}
                value={
                  [{ id: "", label: "All" }, ...locationOptions].find(
                    (option) => option.id === filterLocation,
                  ) || { id: "", label: "All" }
                }
                onChange={(option) => setFilterLocation(option.id)}
                label="Delivery Location"
                placeholder="All locations"
                displayField="label"
              />
              <Listbox
                data={[{ id: "", label: "All" }, ...statusOptions]}
                value={
                  [{ id: "", label: "All" }, ...statusOptions].find(
                    (option) => option.id === filterStatus,
                  ) || { id: "", label: "All" }
                }
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
          emptyMessage={
            loading
              ? "Loading purchase orders..."
              : "No purchase orders found. Click Create Purchase Order to add one."
          }
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
  const [serialNo, setSerialNo] = useState<number | null>(null);
  const [nextSerialBase, setNextSerialBase] = useState<number | null>(null);
  const [supplierSerialMap, setSupplierSerialMap] = useState<
    Record<number, number>
  >({});
  const [poDate, setPoDate] = useState(new Date().toISOString().slice(0, 10));
  const [requiredDate, setRequiredDate] = useState("");
  const [selectedLocation, setSelectedLocation] = useState(locations[0]);
  const [remarks, setRemarks] = useState("");

  const [itemCatalog, setItemCatalog] = useState<PoCatalogItem[]>([]);
  const [itemDrawerOpen, setItemDrawerOpen] = useState(false);
  const [lastPurchase, setLastPurchase] = useState<LastPurchase | null>(null);
  const [showSupplierPanel, setShowSupplierPanel] = useState(false);
  const [loadingSuppliers, setLoadingSuppliers] = useState(false);
  const [formErrors, setFormErrors] = useState<{ requiredDate?: string }>({});

  const [poSource, setPoSource] = useState<"indent" | "manual">("manual");
  const [selectedIndent, setSelectedIndent] = useState<any>(null);

  const [indentItems, setIndentItems] = useState<any[]>([]); // items coming from selected indent
  const [selectedSupplierId, setSelectedSupplierId] = useState<number | null>(
    null,
  );
  const [selectedSupplierName, setSelectedSupplierName] = useState<string>("");

  const [activeIndentItemId, setActiveIndentItemId] = useState<number | null>(
    null,
  );

  const [indentList, setIndentList] = useState<any[]>([]);
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [supplierLoading, setSupplierLoading] = useState(false);

  // Load indents for Combobox
  useEffect(() => {
    if (!isCreateView || poSource !== "indent") return;
    (async () => {
      try {
        const financialYearId = localStorage.getItem("financialYearId");
        const res = await Get("indent/for-po", { financialYearId }, false);
        if (res.data?.success) {
          setIndentList(res.data.data || []);
        }
      } catch (err) {
        // silent
      }
    })();
  }, [isCreateView, poSource]);

  const fetchIndentItems = async (indentId: number | string) => {
    try {
      const res = await Get(
        `purchase-order/indent-items/${indentId}`,
        {},
        false,
      );
      if (res.data?.success) {
        const rawItems = res.data.data || [];

        setIndentItems(
          rawItems.map((item: any, index: number) => {
            return {
              ...item,
              id: item.id || Date.now() + index,
              itemId: item.itemId ? Number(item.itemId) : null,
              rate: Number(item.rate) || 0,
              gstPct: Number(item.gstPct ?? item.taxSlab) || 0,
              netAmount: 0,
            };
          }),
        );
      }
    } catch (err) {
      toasterrormsg("Failed to load indent items");
    }
  };

  useEffect(() => {
    if (!isCreateView) return;

    const fetchPoNumber = async () => {
      try {
        const financialYearId = localStorage.getItem("financialYearId");

        const res = await Get(
          "purchase-order/next-po-no",
          { financialYearId },
          false,
        );

        console.log("PO number API response:", res.data);

        if (res.data?.success) {
          setPoNumber(res.data.data?.poNumber || "");
        }
      } catch (error) {
        console.error("PO number generation failed:", error);
      }
    };

    fetchPoNumber();
  }, [isCreateView]);

  /* ---- Serial No preview + base for per-supplier serials ---- */
  useEffect(() => {
    if (!isCreateView) return;
    (async () => {
      try {
        const financialYearId = localStorage.getItem("financialYearId");
        const res = await Get(
          "purchase-order/next-serial-no",
          { financialYearId },
          false,
        );
        if (res.data?.success) {
          const base = res.data.data?.serialNo ?? 1;
          setSerialNo(base);
          setNextSerialBase(base);
        }
      } catch (err) {
        // silent
      }
    })();
  }, [isCreateView]);

  const fetchSupplierInfo = async (
    itemId: number | null,
    _currentRate: number = 0,
  ) => {
    if (!itemId) {
      setLastPurchase(null);
      return;
    }
    try {
      const res = await Get(
        `purchase-order/item-supplier-info/${itemId}`,
        {},
        false,
      );
      if (res.data?.success) {
        setLastPurchase(res.data.data?.lastPurchase || null);
      } else {
        setLastPurchase(null);
      }
    } catch {
      setLastPurchase(null);
    }
  };

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

  /* ---- Item choose hone par: is item ke suppliers/last-purchase fetch karo ---- */
  const fetchSuppliers = async () => {
    try {
      setSupplierLoading(true);

      const res = await Get("master/account/supplier/list", {}, false);

      if (res.data?.success) {
        const supplierData = res.data.data || [];

        setSuppliers(supplierData);
      } else {
        setSuppliers([]);
      }
    } catch {
      setSuppliers([]);
    } finally {
      setSupplierLoading(false);
    }
  };

  useEffect(() => {
    if (!isCreateView) return;

    fetchSuppliers();
  }, [isCreateView]);

  const chooseDraftItem = (selected: PoCatalogItem | null) => {
    if (!selected) return;
    setDraft((current) => ({
      ...current,
      itemId: selected.itemId,
      itemCode: selected.itemCode,
      item: selected.itemName,
      hsn: selected.hsnCode,
      unit: selected.unit,
      gstPct: parseFloat(selected.taxSlab) || 0,
    }));
  };

  const handleSupplierSelect = (supplier: any) => {
    console.log("Selected Supplier:", supplier);

    setSelectedSupplierId(
      supplier.id || supplier.accountId || supplier.account_id,
    );

    setSelectedSupplierName(
      supplier.accountName || supplier.name || supplier.account_name || "",
    );
  };

  const removeItem = (id: number) => {
    setItems((current) => {
      const removed = current.find((item) => item.id === id);
      if (removed) {
        setIndentItems((prev) => [
          ...prev,
          {
            id: removed.id,
            itemId: removed.itemId,
            itemCode: removed.itemCode,
            itemName: removed.item,
            item: removed.item,
            hsn: removed.hsn,
            hsnCode: removed.hsn,
            unit: removed.unit,
            qty: removed.qty,
            rate: removed.rate,
            gstPct: removed.gstPct,
            taxSlab: String(removed.gstPct),
          },
        ]);
      }
      return current.filter((item) => item.id !== id);
    });
  };

  const totals = useMemo(
    () =>
      items.reduce(
        (summary, item) => {
          const gross = Number(item.qty) * Number(item.rate);
          const discount = (gross * Number(item.discount || 0)) / 100;
          const taxable = gross - discount;
          const tax = (taxable * Number(item.gstPct || 0)) / 100;
          return {
            taxable: summary.taxable + taxable,
            tax: summary.tax + tax,
            discount: summary.discount + discount,
          };
        },
        { taxable: 0, tax: 0, discount: 0 },
      ),
    [items],
  );
  const grandTotal = totals.taxable + totals.tax;

  const handleSave = () => {
    if (!requiredDate) {
      setFormErrors({ requiredDate: "Required Date is mandatory." });
      toasterrormsg("Required Date is mandatory.");
      return;
    }
    setFormErrors({});
    if (indentItems.length > 0) {
      toasterrormsg(
        "Please confirm (✓) a supplier for every item before saving.",
      );
      return;
    }
    if (items.length === 0) {
      toasterrormsg("Please add at least one item.");
      return;
    }
    if (items.some((i) => !i.supplierId)) {
      toasterrormsg("Please select a supplier for all items.");
      return;
    }

    const financialYearId = localStorage.getItem("financialYearId");
    navigate("/purchase-master/purchase-order/summary", {
      state: {
        draft: {
          financialYearId: Number(financialYearId),
          serialNo,
          poDate,
          requiredDate,
          branchId: selectedLocation?.id ? Number(selectedLocation.id) : null,
          narration: remarks,
          discountAmount: 0,
          roundAmount: 0,
          status: "Generated",
          items: items.map((i) => ({
            itemId: Number(i.itemId),
            supplierId: i.supplierId ? Number(i.supplierId) : null,
            supplierName: i.supplierName,
            serialNo: i.supplierId
              ? (supplierSerialMap[i.supplierId] ?? nextSerialBase)
              : null,

            supplierNumber: i.supplierNumber || "",
            supplierEmail: i.supplierEmail || "",
            supplierCity: i.supplierCity || "",
            itemCode: i.itemCode || "",
            itemName: i.item,
            hsnCode: i.hsn || "",
            uom: i.unit || "",
            qty: Number(i.qty),
            rate: Number(i.rate),
            discount: Number(i.discount) || 0,
            gstPct: Number(i.gstPct) || 0,
          })),
        },
      },
    });
  };

  if (!isCreateView) {
    return <PurchaseOrderList />;
  }

  return (
    <div className="dark:bg-dark-900 min-h-screen bg-gray-50 px-3 py-5 sm:px-4 lg:px-5">
      <div className="w-full max-w-none">
        <div className="dark:border-dark-500 mb-5 flex flex-col gap-3 border-b border-gray-200 pb-4 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="dark:text-dark-50 text-xl font-extrabold text-gray-800 sm:text-2xl">
            Create Purchase Order
          </h1>
          <div className="flex flex-wrap gap-2">
            <Link to="/purchase-master/purchase-order">
              <Button variant="outlined" className="gap-2">
                <ChevronLeftIcon className="size-4" /> Cancel
              </Button>
            </Link>

            <Button
              color="primary"
              disabled={submitting}
              onClick={() => handleSave()}
            >
              {submitting ? "Saving..." : "Generate PO"}
            </Button>
          </div>
        </div>

        {notice && (
          <div className="border-success/30 bg-success/10 text-success mb-5 flex items-center justify-between rounded-lg border px-4 py-3 text-sm font-medium">
            <span>{notice}</span>
            <button onClick={() => setNotice("")} aria-label="Dismiss message">
              ×
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 gap-5 2xl:grid-cols-[minmax(0,1fr)_300px]">
          <div className="space-y-5">
            <SectionCard title="PO Details">
              {/* Indent / Manual Tabs */}
              <div className="sm:col-span-2 xl:col-span-4">
                <FieldLabel>PO Source</FieldLabel>
                <div className="mb-4 flex gap-6">
                  <label className="flex cursor-pointer items-center gap-2">
                    <Radio
                      checked={poSource === "indent"}
                      onChange={() => setPoSource("indent")}
                      name="poSource"
                      color="primary"
                    />
                    <span className="text-sm font-medium">Indent</span>
                  </label>
                  <label className="flex cursor-pointer items-center gap-2">
                    <Radio
                      checked={poSource === "manual"}
                      onChange={() => {
                        setPoSource("manual");
                        setSelectedIndent(null);
                      }}
                      name="poSource"
                      color="primary"
                    />
                    <span className="text-sm font-medium">Manual</span>
                  </label>
                </div>
              </div>

              {/* Show Indent dropdown only when Indent is selected */}
              {poSource === "indent" && (
                <div className="sm:col-span-2 xl:col-span-2">
                  <FieldLabel required>Select Indent</FieldLabel>
                  <Combobox
                    data={indentList}
                    displayField="indentNo"
                    value={selectedIndent}
                    onChange={(val: any) => {
                      setSelectedIndent(val);
                      if (val) fetchIndentItems(val.indentId || val.id);
                    }}
                    placeholder="Search Indent (e.g. 007)"
                    searchFields={["indentNo"]}
                  />
                </div>
              )}
              <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <Input
                  label="Serial No"
                  classNames={{
                    labelText: "dark:text-dark-100 font-semibold text-gray-700",
                  }}
                  value={serialNo ?? ""}
                  readOnly
                  placeholder="Generating..."
                />

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
                    <p className="mt-1 text-xs text-red-500">
                      {formErrors.requiredDate}
                    </p>
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

                <div>
                  <FieldLabel required>Delivery Location</FieldLabel>
                  <Listbox
                    data={locations}
                    displayField="name"
                    value={selectedLocation}
                    onChange={setSelectedLocation}
                    placeholder="Select location"
                  />
                </div>
                <Textarea
                  label="Remarks"
                  rows={3}
                  value={remarks}
                  onChange={(e: any) => setRemarks(e.target.value)}
                  placeholder="Enter remarks..."
                  classNames={{
                    root: "sm:col-span-2 xl:col-span-4",
                    labelText: "dark:text-dark-100 font-semibold text-gray-700",
                  }}
                />
              </div>
            </SectionCard>

            <SectionCard title="Item Details">
              <div className="table-wrapper dark:border-dark-500 overflow-x-auto rounded-lg border border-gray-200">
                <Table hoverable className="w-full min-w-[1000px] text-left">
                  <THead>
                    <Tr>
                      <Th className="w-14 text-center">SR No</Th>
                      <Th>Item Code</Th>
                      <Th>Item Name</Th>
                      <Th>HSN</Th>
                      <Th>Unit</Th>
                      <Th className="text-right">Qty</Th>
                      <Th className="text-right">Rate</Th>
                      <Th className="text-center">Tax</Th>
                      <Th className="text-right">Net Amount</Th>
                      <Th className="w-16 text-center">Action</Th>
                    </Tr>
                  </THead>

                  <TBody>
                    {indentItems.length === 0 && items.length === 0 ? (
                      <Tr>
                        <Td
                          colSpan={10}
                          className="py-8 text-center text-sm text-gray-400"
                        >
                          {poSource === "indent"
                            ? "Select an Indent above to load items"
                            : "Switch to Manual or select Indent"}
                        </Td>
                      </Tr>
                    ) : (
                      <>
                        {indentItems.map((item, index) => {
                          const taxable =
                            Number(item.qty) * Number(item.rate || 0);
                          const taxAmt =
                            (taxable * Number(item.gstPct || 0)) / 100;
                          const netAmount = taxable + taxAmt;
                          return (
                            <Tr
                              key={item.id}
                              onClick={() => {
                                setActiveIndentItemId(item.id);
                                setSelectedSupplierId(null);
                                setSelectedSupplierName("");
                                fetchSupplierInfo(
                                  item.itemId,
                                  Number(item.rate) || 0,
                                );
                              }}
                              className={`cursor-pointer ${activeIndentItemId === item.id ? "bg-primary/5" : ""}`}
                            >
                              <Td className="text-center text-gray-400">
                                {index + 1}
                              </Td>
                              <Td>{item.itemCode}</Td>
                              <Td>{item.itemName || item.item}</Td>
                              <Td>{item.hsn || item.hsnCode}</Td>
                              <Td>{item.unit}</Td>
                              <Td className="text-right">{item.qty}</Td>
                              <Td>
                                <Input
                                  className="text-right"
                                  type="number"
                                  min="0"
                                  value={item.rate || ""}
                                  onClick={(e) => e.stopPropagation()}
                                  onChange={(e) => {
                                    const newRate = Number(e.target.value);
                                    setIndentItems((prev) =>
                                      prev.map((r) =>
                                        r.id === item.id
                                          ? { ...r, rate: newRate }
                                          : r,
                                      ),
                                    );
                                  }}
                                />
                              </Td>
                              <Td className="text-center">
                                <span className="bg-primary/10 text-primary rounded-full px-2 py-0.5 text-xs font-bold">
                                  {item.gstPct || 0}%
                                </span>
                              </Td>
                              <Td className="text-primary text-right font-semibold">
                                {money(netAmount)}
                              </Td>
                              <Td className="text-center">
                                <Button
                                  variant="soft"
                                  color="success"
                                  className="size-8 rounded-full p-0"
                                  disabled={!selectedSupplierId}
                                onClick={(e) => {
  e.stopPropagation();
  if (!selectedSupplierId) {
    toasterrormsg("Please select a supplier first.");
    return;
  }

  // 1. Find the full supplier object FIRST
  const fullSupplier = suppliers.find(
    (s) => (s.id ?? s.accountId ?? s.account_id) === selectedSupplierId,
  );

  // 2. Assign serial only the first time this supplier is used
  setSupplierSerialMap((prev) => {
    if (prev[selectedSupplierId!]) return prev;
    const usedCount = Object.keys(prev).length;
    const next = (nextSerialBase ?? 1) + usedCount;
    return { ...prev, [selectedSupplierId!]: next };
  });

  // 3. Add the item with contact details
  setItems((prev) => [
    ...prev,
    {
      id: Date.now(),
      itemId: item.itemId,
      itemCode: item.itemCode || "",
      item: item.itemName || item.item,
      hsn: item.hsn || item.hsnCode,
      qty: item.qty,
      unit: item.unit,
      rate: Number(item.rate) || 0,
      discount: 0,
      gstPct: item.gstPct || 0,
      supplierId: selectedSupplierId,
      supplierName: selectedSupplierName,
      supplierNumber: fullSupplier?.mobileNo || "",
      supplierEmail: fullSupplier?.email || "",
      supplierCity: fullSupplier?.cityName || fullSupplier?.stateName || "",
    },
  ]);

  setIndentItems((prev) => prev.filter((r) => r.id !== item.id));
}}
                                >
                                  <CheckIcon className="size-4.5" />
                                </Button>
                              </Td>
                            </Tr>
                          );
                        })}

                        {items.map((item, index) => {
                          const taxable =
                            item.qty *
                            item.rate *
                            (1 - (item.discount || 0) / 100);
                          const gstAmt = (taxable * item.gstPct) / 100;
                          const amount = taxable + gstAmt;
                          return (
                            <Tr key={item.id} className="bg-success/5">
                              <Td className="text-center text-gray-400">
                                {indentItems.length + index + 1}
                              </Td>
                              <Td>{item.itemCode || "—"}</Td>
                              <Td>
                                {item.item}
                                <span className="text-success block text-[10px]">
                                  ✓ Supplier: {item.supplierName}
                                </span>
                              </Td>
                              <Td>{item.hsn}</Td>
                              <Td>{item.unit}</Td>
                              <Td className="text-right">{item.qty}</Td>
                              <Td className="text-right">{money(item.rate)}</Td>
                              <Td className="text-center">
                                <span className="bg-primary/10 text-primary rounded-full px-2 py-0.5 text-xs font-bold">
                                  {item.gstPct}%
                                </span>
                              </Td>
                              <Td className="text-right font-semibold">
                                {money(amount)}
                              </Td>
                              <Td className="text-center">
                                <Button
                                  variant="flat"
                                  color="error"
                                  className="size-8 p-0"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    removeItem(item.id);
                                  }}
                                >
                                  <TrashIcon className="size-4.5" />
                                </Button>
                              </Td>
                            </Tr>
                          );
                        })}
                      </>
                    )}
                  </TBody>

                  {items.length > 0 && (
                    <tfoot>
                      <Tr className="border-primary/20 bg-primary/5 text-primary border-t-2 font-bold">
                        <Td colSpan={5}>Total (confirmed)</Td>
                        <Td className="text-right">
                          {items.reduce((t, i) => t + Number(i.qty), 0)}
                        </Td>
                        <Td colSpan={2} />
                        <Td className="text-right">{money(grandTotal)}</Td>
                        <Td />
                      </Tr>
                    </tfoot>
                  )}
                </Table>
              </div>
            </SectionCard>

            {items.length > 0 && (
              <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">
                <div className="xl:col-start-3">
                  <SectionCard title="Order Summary">
                    <div className="space-y-3">
                      <div className="dark:text-dark-200 flex justify-between text-sm text-gray-500">
                        <span>Sub Total</span>
                        <strong className="dark:text-dark-50 text-gray-800">
                          {money(totals.taxable + totals.discount)}
                        </strong>
                      </div>

                      <div className="dark:text-dark-200 flex justify-between text-sm text-gray-500">
                        <span>Taxable Amount</span>
                        <strong className="dark:text-dark-50 text-gray-800">
                          {money(totals.taxable)}
                        </strong>
                      </div>
                      <div className="dark:text-dark-200 flex justify-between text-sm text-gray-500">
                        <span>GST Amount</span>
                        <strong className="dark:text-dark-50 text-gray-800">
                          {money(totals.tax)}
                        </strong>
                      </div>
                      <div className="dark:border-dark-500 border-t border-gray-100 pt-3">
                        <span className="text-xs font-bold tracking-wide text-gray-400 uppercase">
                          Total Amount
                        </span>
                        <p className="text-primary mt-1 text-2xl font-extrabold">
                          {money(grandTotal)}
                        </p>
                      </div>
                    </div>
                  </SectionCard>
                </div>
              </div>
            )}

            <div className="dark:border-dark-500 flex flex-col-reverse gap-3 border-t border-gray-200 pt-5 sm:flex-row sm:justify-end">
              <Link to="/purchase-master/purchase-order">
                <Button variant="outlined">Cancel</Button>
              </Link>

              <Button
                color="primary"
                disabled={submitting}
                onClick={() => handleSave()}
              >
                Create Purchase Order
              </Button>
            </div>
          </div>

          <aside className="space-y-5">
            <SectionCard title="Supplier Suggestions">
              <div className="p-4">
                {supplierLoading ? (
                  <div className="text-center text-sm text-gray-400">
                    Loading suppliers...
                  </div>
                ) : suppliers.length === 0 ? (
                  <div className="text-center text-sm text-gray-400">
                    No suppliers found.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {/* Fixed height + scrollbar */}
                    <div className="max-h-[420px] space-y-2 overflow-y-auto pr-1">
                      {suppliers.map((supplier, index) => {
                        const supplierId =
                          supplier.id ??
                          supplier.accountId ??
                          supplier.account_id ??
                          index;

                        const supplierName =
                          supplier.accountName ??
                          supplier.name ??
                          supplier.account_name ??
                          "Unnamed Supplier";

                        // API response uses mobileNo
                        const supplierPhone = supplier.mobileNo ?? "";

                        const isSelected = selectedSupplierId === supplierId;

                        return (
                          <div
                            key={supplierId}
                            className={`flex cursor-pointer items-center gap-3 rounded-lg border px-3 py-3 transition ${
                              isSelected
                                ? "border-primary bg-primary/5"
                                : "dark:border-dark-500 dark:hover:bg-dark-600 hover:border-primary/50 border-gray-200 hover:bg-gray-50"
                            }`}
                            onClick={() => handleSupplierSelect(supplier)}
                          >
                            {/* Radio - LEFT */}
                            <div className="flex-shrink-0">
                              <Radio
                                checked={isSelected}
                                onChange={() => handleSupplierSelect(supplier)}
                                name="supplier"
                                color="primary"
                              />
                            </div>

                            {/* Supplier Name + Phone */}
                            <div className="min-w-0 flex-1">
                              <div className="dark:text-dark-50 truncate text-sm font-semibold text-gray-800">
                                {supplierName}
                              </div>

                              {supplierPhone && (
                                <div className="dark:text-dark-300 mt-0.5 text-xs text-gray-500">
                                  {supplierPhone}
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </SectionCard>

            <SectionCard title="Last Purchase History">
              {!lastPurchase ? (
                <p className="py-4 text-center text-xs text-gray-400">
                  No purchase history for this item yet.
                </p>
              ) : (
                <dl className="grid grid-cols-2 gap-y-2 text-xs">
                  <dt className="text-gray-500">Last Rate</dt>
                  <dd className="dark:text-dark-50 text-right font-semibold text-gray-700">
                    {money(lastPurchase.rate)}
                  </dd>
                  <dt className="text-gray-500">Last Qty</dt>
                  <dd className="dark:text-dark-50 text-right font-semibold text-gray-700">
                    {lastPurchase.qty}
                  </dd>
                  <dt className="text-gray-500">Last Supplier</dt>
                  <dd className="dark:text-dark-50 text-right font-semibold text-gray-700">
                    {lastPurchase.supplierName}
                  </dd>
                  <dt className="text-gray-500">Last Bill No</dt>
                  <dd className="text-primary text-right font-semibold">
                    {lastPurchase.purchaseBillNo}
                  </dd>
                  <dt className="text-gray-500">Last Date</dt>
                  <dd className="dark:text-dark-50 text-right font-semibold text-gray-700">
                    {lastPurchase.purchaseDate}
                  </dd>
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
