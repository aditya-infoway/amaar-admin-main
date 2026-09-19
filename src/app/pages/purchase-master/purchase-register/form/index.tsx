import { useState, useRef, useCallback, useEffect, useMemo } from "react";
import { Button } from "@/components/ui";
import { Input } from "@/components/ui";
import { DatePicker } from "@/components/shared/form/Datepicker";
import { Combobox } from "@/components/shared/form/StyledCombobox";
import { Listbox } from "@/components/shared/form/StyledListbox";
import { Link, useNavigate } from "react-router";
import { Get, Post, toasterrormsg, toastsuccessmsg } from "@/ApiHelper";

/* ─────────────────────────────────────────────
   ICONS
───────────────────────────────────────────── */
const Icon = {
  Back: () => (
    <svg
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      viewBox="0 0 24 24"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
    </svg>
  ),
  Plus: () => (
    <svg
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.5}
      viewBox="0 0 24 24"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
    </svg>
  ),
  Upload: () => (
    <svg
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
      />
    </svg>
  ),
  Trash: () => (
    <svg
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
      />
    </svg>
  ),
  Close: () => (
    <svg
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M6 18L18 6M6 6l12 12"
      />
    </svg>
  ),
  Save: () => (
    <svg
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"
      />
    </svg>
  ),
  Print: () => (
    <svg
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
      />
    </svg>
  ),
  File: () => (
    <svg
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
      />
    </svg>
  ),
  CloudUp: () => (
    <svg
      className="h-10 w-10"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
      />
    </svg>
  ),
  Paperclip: () => (
    <svg
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.586-6.586a4 4 0 00-5.656-5.656l-6.586 6.586a6 6 0 108.485 8.485L20.5 13"
      />
    </svg>
  ),
  Search: () => (
    <svg
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
      />
    </svg>
  ),
  Car: () => (
    <svg
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M13 16H6l-2-5 3-3h8l3 3-1 5zm4-5h2l1 5h-4"
      />
    </svg>
  ),
  Check: () => (
    <svg
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.5}
      viewBox="0 0 24 24"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  ),
  UploadCloud: () => (
    <svg
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
      />
    </svg>
  ),
  Bank: () => (
    <svg
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3 21h18M4 10h16M12 3L4 7v3h16V7l-8-4zM6 10v8m4-8v8m4-8v8m4-8v8"
      />
    </svg>
  ),
};

/* ─────────────────────────────────────────────
   HELPERS
───────────────────────────────────────────── */
const INR = (n: number) =>
  "₹ " +
  Number(n || 0).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

const FMT3 = (n: number) =>
  Number(n || 0).toLocaleString("en-IN", {
    minimumFractionDigits: 3,
    maximumFractionDigits: 3,
  });

const FMT2 = (n: number) =>
  Number(n || 0).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

function numInWords(amount: number): string {
  const a = [
    "",
    "One",
    "Two",
    "Three",
    "Four",
    "Five",
    "Six",
    "Seven",
    "Eight",
    "Nine",
    "Ten",
    "Eleven",
    "Twelve",
    "Thirteen",
    "Fourteen",
    "Fifteen",
    "Sixteen",
    "Seventeen",
    "Eighteen",
    "Nineteen",
  ];
  const b = [
    "",
    "",
    "Twenty",
    "Thirty",
    "Forty",
    "Fifty",
    "Sixty",
    "Seventy",
    "Eighty",
    "Ninety",
  ];
  const words = (n: number): string => {
    if (n === 0) return "";
    if (n < 20) return a[n] + " ";
    if (n < 100) return b[Math.floor(n / 10)] + " " + a[n % 10] + " ";
    if (n < 1000) return a[Math.floor(n / 100)] + " Hundred " + words(n % 100);
    if (n < 100000)
      return words(Math.floor(n / 1000)) + "Thousand " + words(n % 1000);
    if (n < 10000000)
      return words(Math.floor(n / 100000)) + "Lakh " + words(n % 100000);
    return words(Math.floor(n / 10000000)) + "Crore " + words(n % 10000000);
  };
  return (words(Math.round(amount)) + "Only").replace(/\s+/g, " ").trim();
}

function calcItem(item: any): any {
  const taxable =
    (item.qty || 0) * (item.rate || 0) * (1 - (item.discount || 0) / 100);
  const gstAmt = (taxable * (item.gstPct || 18)) / 100;
  return { ...item, taxable, gstAmt, total: taxable + gstAmt };
}

/* ─────────────────────────────────────────────
   SHARED FORM PRIMITIVES
───────────────────────────────────────────── */
function FieldLabel({ children, required }: any) {
  return (
    <label className="mb-1 block text-sm text-gray-700 dark:text-gray-300">
      {children}
      {required && <span className="ml-0.5 text-red-500">*</span>}
    </label>
  );
}

function Card({ title, titleRight, children, className = "" }: any) {
  return (
    <div
      className={
        "rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800 " +
        className
      }
    >
      {title && (
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-3 dark:border-gray-700">
          <h3 className="text-xs font-bold tracking-wider text-gray-500 uppercase dark:text-gray-400">
            {title}
          </h3>
          {titleRight}
        </div>
      )}
      <div className="p-5">{children}</div>
    </div>
  );
}

// ✅ NEW — formatDateForApi helper, jaisa doosre working module me hai
function formatDateForApi(date: Date): string {
  const yr = date.getFullYear();
  const mo = String(date.getMonth() + 1).padStart(2, "0");
  const dy = String(date.getDate()).padStart(2, "0");
  return `${yr}-${mo}-${dy}`;
}

/* ─────────────────────────────────────────────
   DATA
───────────────────────────────────────────── */

const TERMS_OPTIONS = [
  { id: "Credit", name: "Credit" },
  { id: "Cash", name: "Cash" },
  { id: "Bank", name: "Bank" },
];

const UOM_OPTIONS = [
  { id: 1, name: "KG" },
  { id: 2, name: "NOS" },
  { id: 3, name: "MTR" },
  { id: 4, name: "LTR" },
  { id: 5, name: "PCS" },
  { id: 6, name: "SET" },
];
const GST_OPTIONS = [
  { id: 1, name: "28%" },
  { id: 2, name: "18%" },
  { id: 3, name: "12%" },
  { id: 4, name: "5%" },
  { id: 5, name: "0%" },
];
const ITEM_NAME_OPTIONS = [
  { id: 1, name: "MS Plate 10 MM" },
  { id: 2, name: "MS Channel 100 MM" },
  { id: 3, name: "MS Beam 200 MM" },
  { id: 4, name: "Hydraulic Cylinder 5 Ton" },
  { id: 5, name: "13T Axle" },
];

const GROUP_OPTIONS = [
  { id: 1, name: "Sundry Creditors" },
  { id: 2, name: "Sundry Debtors" },
  { id: 3, name: "Bank Accounts" },
  { id: 4, name: "Cash in Hand" },
  { id: 5, name: "Loans (Liability)" },
];
const STATE_OPTIONS = [
  { id: 1, name: "Gujarat" },
  { id: 2, name: "Maharashtra" },
  { id: 3, name: "Rajasthan" },
  { id: 4, name: "Karnataka" },
  { id: 5, name: "Tamil Nadu" },
  { id: 6, name: "Delhi" },
  { id: 7, name: "Punjab" },
];
const DISTRICT_OPTIONS = [
  { id: 1, name: "Ahmedabad" },
  { id: 2, name: "Surat" },
  { id: 3, name: "Rajkot" },
  { id: 4, name: "Vadodara" },
  { id: 5, name: "Amreli" },
  { id: 6, name: "Bhavnagar" },
  { id: 7, name: "Junagadh" },
];

const INIT_ITEMS: any[] = [];

/* ─────────────────────────────────────────────
   INLINE SEARCH ROW
───────────────────────────────────────────── */
const EMPTY_ROW = {
  itemId: null as number | null,
  itemCode: "",
  itemName: "",
  hsnCode: "",
  uom: "",
  qty: "",
  rate: "",
  discount: "0",
  gstPct: "",
  _codeQ: "",
  _nameQ: "",
  _filled: false,
};

function BankDetailsDrawer({
  open,
  onClose,
  bankDetails,
  setBankDetails,
}: any) {
  const sf = (k: string, v: any) =>
    setBankDetails((b: any) => ({ ...b, [k]: v }));
  const PAYMENT_MODES = ["UPI", "NEFT", "RTGS", "IMPS", "CHEQUE", "CARD"];
  const [touched, setTouched] = useState(false);

  const handleSave = () => {
    setTouched(true);
    if (!bankDetails.paymentMode) return;
    if (
      bankDetails.paymentMode === "CHEQUE" &&
      (!bankDetails.chequeNo.trim() || !bankDetails.chequeDate.trim())
    )
      return;
    onClose();
    setTouched(false);
  };

  return (
    <>
      {open && (
        <div className="fixed inset-0 z-40 bg-black/40" onClick={onClose} />
      )}
      <div
        className={
          "fixed top-0 right-0 z-50 flex h-full flex-col bg-white shadow-2xl transition-transform duration-300 lg:w-[40%] dark:bg-gray-800 " +
          (open ? "translate-x-0" : "translate-x-full")
        }
      >
        <div className="bg-primary flex flex-shrink-0 items-center justify-between px-5 py-4 text-white">
          <h3 className="text-base font-bold">Bank Details</h3>
          <Button
            variant="flat"
            onClick={onClose}
            className="!text-white hover:!bg-white/20"
          >
            <Icon.Close />
          </Button>
        </div>
        <div className="flex-1 space-y-4 overflow-y-auto p-5">
          <div>
            <FieldLabel required>Payment Mode</FieldLabel>
            <div className="grid grid-cols-3 gap-2">
              {PAYMENT_MODES.map((mode) => (
                <label
                  key={mode}
                  className="hover:border-primary/50 flex cursor-pointer items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm dark:border-gray-600"
                >
                  <input
                    type="radio"
                    name="paymentMode"
                    checked={bankDetails.paymentMode === mode}
                    onChange={() => sf("paymentMode", mode)}
                  />
                  {mode}
                </label>
              ))}
            </div>
            {touched && !bankDetails.paymentMode && (
              <p className="mt-1 text-xs text-red-500">
                Please select a payment mode.
              </p>
            )}
          </div>

          {bankDetails.paymentMode === "CHEQUE" && (
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Cheque No *"
                placeholder="Cheque No"
                value={bankDetails.chequeNo}
                onChange={(e: any) => sf("chequeNo", e.target.value)}
              />
              <DatePicker
                label="Cheque Date *"
                value={bankDetails.chequeDate}
                onChange={(selectedDates: Date[]) => {
                  const picked = selectedDates?.[0];
                  sf("chequeDate", picked ? formatDateForApi(picked) : "");
                }}
                placeholder="Select Date"
              />
              <div className="col-span-2">
                <DatePicker
                  label="Clear Date"
                  value={bankDetails.clearDate}
                  onChange={(selectedDates: Date[]) => {
                    const picked = selectedDates?.[0];
                    sf("clearDate", picked ? formatDateForApi(picked) : "");
                  }}
                  placeholder="Select Date"
                />
              </div>
            </div>
          )}

          <div>
            <FieldLabel>Narration</FieldLabel>
            <textarea
              rows={3}
              value={bankDetails.narration}
              onChange={(e) => sf("narration", e.target.value)}
              className="focus:ring-primary/40 focus:border-primary w-full resize-none rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:ring-2 focus:outline-none dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200"
            />
          </div>
        </div>
        <div className="flex flex-shrink-0 justify-end gap-3 border-t border-gray-100 bg-gray-50 px-5 py-4 dark:border-gray-700 dark:bg-gray-900">
          <Button variant="outlined" color="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button color="primary" onClick={handleSave} className="gap-2">
            <Icon.Save /> Save Bank Details
          </Button>
        </div>
      </div>
    </>
  );
}

/* ─────────────────────────────────────────────
   VEHICLE ITEM DRAWER  (single-select)
───────────────────────────────────────────── */
interface VehicleCatalogItem {
  id: string;
  itemId: number | null;
  itemCode: string;
  itemName: string;
  categoryName: string;
  groupName: string;
  unit: string;
  taxSlab: string;
  salesPrice: number;
  barcode: string;
  hsnCode: string;
  supplierId?: number | null;
}

const mapApiVehicleItem = (item: any): VehicleCatalogItem => ({
  id: String(item.itemId),
  itemId: item.itemId || null,
  itemCode: item.itemCode || "",
  itemName: item.itemName || "",
  categoryName: item.categoryName || "",
  groupName: item.groupName || "",
  unit: item.unit || "",
  taxSlab: item.taxSlab || "0",
  salesPrice: Number(item.salesPrice) || 0,
  barcode: item.barcode || "",
  hsnCode: item.hsnCode || "",
  supplierId: item.supplierId ?? null,
});

function AddItemSelector({
  itemCatalog,
  onAdd,
}: {
  itemCatalog: VehicleCatalogItem[];
  onAdd: (item: any) => void;
}) {
  const [row, setRow] = useState({ ...EMPTY_ROW });
  const [touched, setTouched] = useState(false);

  useEffect(() => {
    setRow({ ...EMPTY_ROW });
    setTouched(false);
  }, [itemCatalog]);

  const fill = (m: VehicleCatalogItem) => {
    setRow({
      itemId: m.itemId,
      itemCode: m.itemCode,
      itemName: m.itemName,
      hsnCode: m.hsnCode,
      uom: m.unit,
      qty: "",
      rate: String(m.salesPrice),
      discount: "0",
      gstPct: String(m.taxSlab),
      _codeQ: m.itemCode,
      _nameQ: m.itemName,
      _filled: true,
    });
    setTouched(false);
  };

  const handleAdd = () => {
    setTouched(true);
    if (!row.itemCode || !row.itemName || !row.qty || !row.itemId) return;
    onAdd(
      calcItem({
        id: Date.now(),
        itemId: row.itemId,
        itemCode: row.itemCode,
        itemName: row.itemName,
        hsnCode: row.hsnCode,
        uom: row.uom,
        qty: parseFloat(row.qty) || 0,
        rate: parseFloat(row.rate) || 0,
        discount: parseFloat(row.discount) || 0,
        gstPct: parseFloat(row.gstPct) || 0,
      }),
    );
    setRow({ ...EMPTY_ROW });
    setTouched(false);
  };

  const qty = parseFloat(row.qty) || 0;
  const rate = parseFloat(row.rate) || 0;
  const disc = parseFloat(row.discount) || 0;
  const gstN = parseFloat(row.gstPct) || 0;
  const taxable = qty * rate * (1 - disc / 100);
  const gstAmt = (taxable * gstN) / 100;
  const total = taxable + gstAmt;

  const qtyInvalid = touched && !row.qty;
  const hasItem = !!row.itemId;

  const iCls =
    "w-full px-2.5 py-[8px] text-xs border border-gray-300 rounded-lg bg-white dark:bg-gray-800 dark:border-gray-600 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary placeholder-gray-300 dark:placeholder-gray-600 transition-all";
  const roCls =
    "w-full px-2.5 py-[8px] text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700/50 text-gray-700 dark:text-gray-300 select-none";

  return (
    <div className="space-y-4">
      {/* ─── ROW 1: Dropdown (half width) ─── */}
      <div className="w-1/2 min-w-[260px]">
        <FieldLabel required>Item Details</FieldLabel>
        <Combobox
          data={itemCatalog}
          displayField="itemName"
          value={itemCatalog.find((m) => m.itemId === row.itemId) || null}
          onChange={(selected: any) => {
            if (selected) fill(selected);
            else setRow({ ...EMPTY_ROW });
          }}
          placeholder="Select item"
          searchFields={["itemCode", "itemName"]}
          renderItem={(item: any) => (
            <div className="flex items-center justify-between gap-3 text-inherit">
              <div className="truncate">
                <span className="text-xs font-bold">{item.itemCode}</span>
                <span className="ml-2 text-sm">{item.itemName}</span>
              </div>
            </div>
          )}
        />
      </div>

      {/* ─── ROW 2: Read-only item info ─── */}
      <div className="grid grid-cols-12 gap-3">
        <div className="col-span-3">
          <FieldLabel>Item Code</FieldLabel>
          <div className={roCls + " text-center"}>{row.itemCode || "—"}</div>
        </div>

        <div className="col-span-5">
          <FieldLabel>Item Name</FieldLabel>
          <div className={roCls}>{row.itemName || "—"}</div>
        </div>

        <div className="col-span-2">
          <FieldLabel>HSN Code</FieldLabel>
          <div className={roCls + " text-center"}>{row.hsnCode || "—"}</div>
        </div>

        <div className="col-span-1">
          <FieldLabel>UOM</FieldLabel>
          <div className={roCls + " text-center"}>{row.uom || "—"}</div>
        </div>

        <div className="col-span-1">
          <FieldLabel>GST %</FieldLabel>
          <div className={roCls + " text-center"}>
            {row.gstPct ? (
              <span className="bg-primary/10 text-primary inline-block rounded-full px-1.5 py-0.5 text-xs font-bold">
                {row.gstPct}%
              </span>
            ) : (
              "—"
            )}
          </div>
        </div>
      </div>

      {/* ─── ROW 3: Editable + computed + action (all on one line) ─── */}
      <div className="grid grid-cols-12 items-end gap-3">
        <div className="col-span-1">
          <FieldLabel required>Qty</FieldLabel>
          <input
            type="number"
            min={0}
            value={row.qty}
            onChange={(e) => {
              setRow((r) => ({ ...r, qty: e.target.value }));
              setTouched(false);
            }}
            placeholder="Qty"
            className={[
              iCls,
              "text-right",
              qtyInvalid
                ? "border-red-400 bg-red-50 focus:border-red-400 focus:ring-red-300 dark:border-red-500 dark:bg-red-900/20"
                : row.qty
                  ? "border-green-400 focus:border-green-400 focus:ring-green-300 dark:border-green-600"
                  : "border-orange-300 dark:border-orange-600",
            ].join(" ")}
          />
        </div>

        <div className="col-span-2">
          <FieldLabel>Rate (₹)</FieldLabel>
          <input
            type="number"
            value={row.rate}
            onChange={(e) => setRow((r) => ({ ...r, rate: e.target.value }))}
            placeholder="0.00"
            className={iCls + " text-right"}
          />
        </div>

        <div className="col-span-2">
          <FieldLabel>Disc (%)</FieldLabel>
          <input
            type="number"
            value={row.discount}
            onChange={(e) =>
              setRow((r) => ({ ...r, discount: e.target.value }))
            }
            placeholder="0"
            className={iCls + " text-right"}
          />
        </div>

        <div className="col-span-2">
          <FieldLabel>Taxable (₹)</FieldLabel>
          <div className={roCls + " text-right"}>
            {row._filled || row.qty ? FMT2(taxable) : "—"}
          </div>
        </div>

        <div className="col-span-2">
          <FieldLabel>GST Amt (₹)</FieldLabel>
          <div className={roCls + " text-right"}>
            {row._filled || row.qty ? FMT2(gstAmt) : "—"}
          </div>
        </div>

        <div className="col-span-2">
          <FieldLabel>Total (₹)</FieldLabel>
          <div
            className={
              roCls +
              " text-right font-semibold text-gray-800 dark:text-gray-100"
            }
          >
            {row._filled || row.qty ? FMT2(total) : "—"}
          </div>
        </div>

        <div className="col-span-1 flex justify-start">
          <button
            type="button"
            onClick={handleAdd}
            disabled={!hasItem || !row.qty}
            title={
              !hasItem
                ? "Select an item from the dropdown first"
                : !row.qty
                  ? "Enter quantity"
                  : "Add item"
            }
            className={[
              "flex h-9 w-9 items-center justify-center rounded-full transition-all duration-200",
              hasItem && row.qty
                ? "bg-green-500 text-white shadow-md hover:scale-105 hover:bg-green-600 active:scale-95"
                : "cursor-not-allowed bg-gray-100 text-gray-300 dark:bg-gray-700 dark:text-gray-600",
            ].join(" ")}
          >
            <Icon.Check />
          </button>
        </div>
      </div>
    </div>
  );
}
/* ─────────────────────────────────────────────
   ADD ITEM DRAWER
───────────────────────────────────────────── */
function AddItemDrawer({ open, onClose, onAdd }: any) {
  const empty: any = {
    itemCode: "",
    itemName: [],
    category: [],
    group: [],
    uom: [],
    gstPct: [],
    salesPrice: "",
    barcode: "",
    hsnCode: "",
    qty: "",
    rate: "",
    discount: "0",
  };
  const [form, setForm] = useState(empty);
  const sf = (k: string, v: any) => setForm((f: any) => ({ ...f, [k]: v }));
  const qty = parseFloat(form.qty) || 0,
    rate = parseFloat(form.rate) || 0,
    disc = parseFloat(form.discount) || 0;
  const gstNum = parseFloat(form.gstPct?.[0]?.name || "18") || 18;
  const taxable = qty * rate * (1 - disc / 100),
    total = taxable * (1 + gstNum / 100);
  const handleAdd = () => {
    if (!form.itemName[0] || !form.qty || !form.rate) return;
    onAdd(
      calcItem({
        ...form,
        id: Date.now(),
        itemName: form.itemName[0]?.name || "",
        uom: form.uom[0]?.name || "KG",
        gstPct: gstNum,
        qty: parseFloat(form.qty),
        rate: parseFloat(form.rate),
        discount: parseFloat(form.discount) || 0,
      }),
    );
    setForm(empty);
    onClose();
  };
  return (
    <>
      {open && (
        <div className="fixed inset-0 z-40 bg-black/40" onClick={onClose} />
      )}
      <div
        className={
          "fixed top-0 right-0 z-50 flex h-full w-[400px] flex-col bg-white shadow-2xl transition-transform duration-300 dark:bg-gray-800 " +
          (open ? "translate-x-0" : "translate-x-full")
        }
      >
        <div className="bg-primary flex flex-shrink-0 items-center justify-between px-5 py-4 text-white">
          <h3 className="text-base font-bold">Add Item</h3>
          <Button
            variant="flat"
            onClick={onClose}
            className="!text-white hover:!bg-white/20"
          >
            <Icon.Close />
          </Button>
        </div>
        <div className="flex-1 space-y-4 overflow-y-auto p-5">
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Item Code"
              placeholder="Item code"
              value={form.itemCode}
              onChange={(e: any) => sf("itemCode", e.target.value)}
            />
            <div>
              <FieldLabel>UOM</FieldLabel>
              <Listbox
                data={UOM_OPTIONS}
                value={form.uom}
                onChange={(v: any) => sf("uom", v)}
                displayField="name"
                placeholder="UOM"
              />
            </div>
          </div>
          <div>
            <FieldLabel required>Item Name</FieldLabel>
            <Combobox
              data={ITEM_NAME_OPTIONS}
              displayField="name"
              value={form.itemName}
              onChange={(v: any) => sf("itemName", v)}
              placeholder="Select item"
              searchFields={["name"]}
            />
          </div>
          <Input
            label="HSN Code"
            placeholder="HSN Code"
            value={form.hsnCode}
            onChange={(e: any) => sf("hsnCode", e.target.value)}
          />
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Quantity *"
              placeholder="0"
              value={form.qty}
              onChange={(e: any) => sf("qty", e.target.value)}
              type="number"
            />
            <Input
              label="Rate (₹) *"
              placeholder="0.00"
              value={form.rate}
              onChange={(e: any) => sf("rate", e.target.value)}
              type="number"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Discount (%)"
              placeholder="0"
              value={form.discount}
              onChange={(e: any) => sf("discount", e.target.value)}
              type="number"
            />
            <div>
              <FieldLabel>GST %</FieldLabel>
              <Listbox
                data={GST_OPTIONS}
                value={form.gstPct}
                onChange={(v: any) => sf("gstPct", v)}
                displayField="name"
                placeholder="GST %"
              />
            </div>
          </div>
          <div className="space-y-2 border-t border-gray-100 pt-4 dark:border-gray-700">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Taxable Value</span>
              <span className="font-medium">{INR(taxable)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">GST Amount ({gstNum}%)</span>
              <span className="font-medium">
                {INR((taxable * gstNum) / 100)}
              </span>
            </div>
          </div>
          <div className="bg-primary/5 border-primary/20 flex items-center justify-between rounded-xl border p-4">
            <span className="text-primary text-sm font-bold">Total Amount</span>
            <span className="text-primary text-lg font-extrabold">
              {INR(total)}
            </span>
          </div>
        </div>
        <div className="flex flex-shrink-0 justify-end gap-3 border-t border-gray-100 bg-gray-50 px-5 py-4 dark:border-gray-700 dark:bg-gray-900">
          <Button variant="outlined" color="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button color="success" onClick={handleAdd} className="gap-2">
            <Icon.Plus /> Add Item
          </Button>
        </div>
      </div>
    </>
  );
}

/* ─────────────────────────────────────────────
   CREATE ACCOUNT DRAWER
───────────────────────────────────────────── */
function CreateAccountDrawer({ open, onClose }: any) {
  const [form, setForm] = useState({
    accountName: "",
    mobile: "",
    group: [],
    openingBalance: "0",
    drCr: [],
    country: [],
    state: [],
    stateCode: "24",
    district: [],
    city: [],
    address: "",
    gstNo: "",
  });
  const sf = (k: string, v: any) => setForm((f) => ({ ...f, [k]: v }));
  const DRCR = [
    { id: 1, name: "CR – Credit" },
    { id: 2, name: "DR – Debit" },
  ];
  const COUNTRY = [
    { id: 1, name: "India" },
    { id: 2, name: "USA" },
    { id: 3, name: "UAE" },
    { id: 4, name: "UK" },
    { id: 5, name: "Singapore" },
  ];
  return (
    <>
      {open && (
        <div className="fixed inset-0 z-40 bg-black/40" onClick={onClose} />
      )}
      <div
        className={
          "fixed top-0 right-0 z-50 flex h-full flex-col bg-white shadow-2xl transition-transform duration-300 lg:w-[50%] dark:bg-gray-800 " +
          (open ? "translate-x-0" : "translate-x-full")
        }
      >
        <div className="bg-primary flex flex-shrink-0 items-center justify-between px-5 py-4 text-white">
          <h3 className="text-base font-bold">Create Account</h3>
          <button
            type="button"
            onClick={onClose}
            className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-full text-white transition-colors"
          >
            <Icon.Close />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-5">
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Account Name *"
              placeholder="Enter account name"
              value={form.accountName}
              onChange={(e: any) => sf("accountName", e.target.value)}
            />
            <Input
              label="Mobile"
              placeholder="Mobile number"
              value={form.mobile}
              onChange={(e: any) => sf("mobile", e.target.value)}
            />
            <div>
              <FieldLabel>Group</FieldLabel>
              <Combobox
                data={GROUP_OPTIONS}
                displayField="name"
                value={form.group}
                onChange={(v: any) => sf("group", v)}
                placeholder="Select group"
                searchFields={["name"]}
              />
            </div>
            <Input
              label="Opening Balance"
              value={form.openingBalance}
              onChange={(e: any) => sf("openingBalance", e.target.value)}
              type="number"
            />
            <div>
              <FieldLabel>Dr./Cr.</FieldLabel>
              <Listbox
                data={DRCR}
                value={form.drCr}
                onChange={(v: any) => sf("drCr", v)}
                displayField="name"
                placeholder="Select"
              />
            </div>
            <div>
              <FieldLabel>Country</FieldLabel>
              <Listbox
                data={COUNTRY}
                value={form.country}
                onChange={(v: any) => sf("country", v)}
                displayField="name"
                placeholder="Country"
              />
            </div>
            <div>
              <FieldLabel>State</FieldLabel>
              <Combobox
                data={STATE_OPTIONS}
                displayField="name"
                value={form.state}
                onChange={(v: any) => sf("state", v)}
                placeholder="Select state"
                searchFields={["name"]}
              />
            </div>
            <Input
              label="State Code"
              value={form.stateCode}
              onChange={(e: any) => sf("stateCode", e.target.value)}
            />
            <div>
              <FieldLabel>District</FieldLabel>
              <Combobox
                data={DISTRICT_OPTIONS}
                displayField="name"
                value={form.district}
                onChange={(v: any) => sf("district", v)}
                placeholder="Select district"
                searchFields={["name"]}
              />
            </div>
            <div>
              <FieldLabel>City</FieldLabel>
              <Combobox
                data={DISTRICT_OPTIONS}
                displayField="name"
                value={form.city}
                onChange={(v: any) => sf("city", v)}
                placeholder="Select city"
                searchFields={["name"]}
              />
            </div>
            <div className="col-span-2">
              <Input
                label="Address"
                placeholder="Enter address"
                value={form.address}
                onChange={(e: any) => sf("address", e.target.value)}
              />
            </div>
            <div className="col-span-2">
              <FieldLabel>GST No.</FieldLabel>
              <div className="flex gap-2">
                <Input
                  value={form.gstNo}
                  onChange={(e: any) => sf("gstNo", e.target.value)}
                  placeholder="Enter GST number"
                  className="flex-1"
                />
                <Button color="success" variant="outlined">
                  Verify
                </Button>
              </div>
            </div>
          </div>
        </div>
        <div className="flex flex-shrink-0 justify-end gap-3 border-t border-gray-100 bg-gray-50 px-5 py-4 dark:border-gray-700 dark:bg-gray-900">
          <Button variant="outlined" color="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button color="primary" className="gap-2">
            <Icon.Plus /> Create Account
          </Button>
        </div>
      </div>
    </>
  );
}

/* ─────────────────────────────────────────────
   MAIN PAGE
───────────────────────────────────────────── */
export default function VehiclePurchaseBill() {
  const navigate = useNavigate();
  const [billType, setBillType] = useState("manual");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [vehicleDrawerOpen, setVehicleDrawerOpen] = useState(false);
  const [addVehicleOpen, setAddVehicleOpen] = useState(false);
  const [accountDrawerOpen, setAccountDrawerOpen] = useState(false);
  const [items, setItems] = useState(INIT_ITEMS);

  const [remarks, setRemarks] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  type UploadedFile = {
    name: string;
    size: string;
  };

  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [locationOptions, setLocationOptions] = useState<
    { id: number; name: string }[]
  >([]);

  // ---- Shared item catalog (search row + vehicle drawer dono ke liye) ----
  const [itemCatalog, setItemCatalog] = useState<VehicleCatalogItem[]>([]);

  // ---- Dynamic Purchase Order list ----
  const [poOptions, setPoOptions] = useState<any[]>([]);
  const [loadingPo, setLoadingPo] = useState(false);

  // Fetch POs when user switches to "Purchase Order" mode
  useEffect(() => {
    if (billType !== "po") return;

    (async () => {
      setLoadingPo(true);
      try {
        const financialYearId = localStorage.getItem("financialYearId");
        // Use the same endpoint you already have for GRR / PO list
        // Example: purchaseorder/list  OR  grr/purchase-orders  (whichever is ready)
        const res = await Get(
          "purchase-order/list",
          { financialYearId },
          false,
        );
        // OR if you prefer the GRR one:
        // const res = await Get("purchase/grr/purchase-orders", { financialYearId }, false);

        if (res.data?.success) {
          setPoOptions(
            (res.data.data || []).map((p: any) => ({
              id: p.id || p.purchaseOrderId,
              name: p.poNumber,
              poNumber: p.poNumber,
              purchaseOrderId: p.id || p.purchaseOrderId,
              supplierName: p.supplierName || "",
              supplierNumber: p.supplierNumber || p.mobileNo || "",
              orderDate: p.poDate || p.orderDate || "",
              requestedDate: p.requiredDate || p.requestedDate || "",
              serialNo: p.serialNo,
              label: p.label || `${p.poNumber} | ${p.supplierName || ""}`,
            })),
          );
        } else {
          toasterrormsg(res.data?.message || "Failed to load Purchase Orders.");
        }
      } catch (err: any) {
        toasterrormsg(
          err?.response?.data?.message || "Failed to load Purchase Orders.",
        );
      } finally {
        setLoadingPo(false);
      }
    })();
  }, [billType]);

  useEffect(() => {
    (async () => {
      try {
        const res = await Get("master/branch/list", {}, false); // adjust endpoint
        if (res.data?.success) {
          setLocationOptions(
            (res.data.data || []).map((b: any) => ({
              id: b.branchId ?? b.id,
              name: b.branchName ?? b.name,
            })),
          );
        }
      } catch (err) {}
    })();
  }, []);

  const handlePoSelect = async (selected: any) => {
    if (!selected) {
      setHdr((h) => ({
        ...h,
        poNo: [],
        partyName: [],
        purchaseLocation: [{ id: 1, name: "Main Branch" }],
        orderDate: "",
      }));
      setItems([]);
      return;
    }

    // store selected PO
    setHdr((h) => ({
      ...h,
      poNo: [selected],
      orderDate:
        selected.poDate || selected.orderDate
          ? String(selected.poDate || selected.orderDate).slice(0, 10)
          : "",
    }));

    try {
      const res = await Get(
        `purchase-order/${selected.purchaseOrderId || selected.id}`,
        {},
        false,
      );

      if (!res.data?.success) {
        toasterrormsg(res.data?.message || "Failed to load PO details.");
        return;
      }

      const po = res.data.data;

      // ---- 1. Auto-fill Party (Supplier) from first item's supplierId ----
      const supplierId = po.items?.[0]?.supplierId;
      if (supplierId) {
        const matchedParty = partyOptions.find((p) => p.id === supplierId);
        if (matchedParty) {
          setHdr((h) => ({ ...h, partyName: [matchedParty] }));
        } else {
          // fallback if party list not yet loaded — use name from list API
          setHdr((h) => ({
            ...h,
            partyName: [
              {
                id: supplierId,
                name: selected.supplierName || "Supplier",
                mobile: "",
                balance: 0,
                drOrCr: "",
                stateName: "",
              },
            ],
          }));
        }
      }

      // ---- 2. Auto-fill Location (branch) ----
      if (po.branchId) {
        const loc = locationOptions.find((l) => l.id === po.branchId) || {
          id: po.branchId,
          name: `Branch #${po.branchId}`,
        };
        setHdr((h) => ({ ...h, purchaseLocation: [loc] }));
      }

      // ---- 3. Auto-fill items ----
      const poItems = (po.items || []).map((d: any) =>
        calcItem({
          id: Date.now() + Math.random(),
          itemId: d.itemId,
          itemCode: d.itemCode,
          itemName: d.itemName,
          hsnCode: d.hsnCode || "",
          uom: d.uom || "NOS",
          qty: Number(d.qty) || 0,
          rate: Number(d.rate) || 0,
          discount: Number(d.discount) || 0,
          gstPct: Number(d.gstPct) || 0,
        }),
      );

      setItems(poItems);
      clearError("items");
      clearError("partyName");
    } catch (err: any) {
      toasterrormsg(err?.response?.data?.message || "Failed to load PO items.");
    }
  };

  useEffect(() => {
    (async () => {
      try {
        const res = await Get("master/itemmaster/vehicle-list", {}, false);
        if (res.data?.success) {
          setItemCatalog((res.data.data || []).map(mapApiVehicleItem));
        }
      } catch (err) {
        // fail silently — inline search simply won't show suggestions
      }
    })();
  }, []);

  // ---- Party/Location option ka shape ----
  interface PartyOption {
    id: number | string;
    name: string;
    mobile?: string;
    balance?: number;
    drOrCr?: string;
    stateName?: string;
  }

  interface LocationOption {
    id: number;
    name: string;
  }

  interface HdrState {
    poNo: LocationOption[];
    poLocation: LocationOption[];
    orderDate: string;
    date: string;
    terms: string;
    partyName: PartyOption[];
    billNo: string;
    purchaseBillNo: string;
    purchaseDate: string;
    purchaseLocation: LocationOption[];
    dueDate: string;
    narration: string;
  }

  const [hdr, setHdr] = useState<HdrState>({
    poNo: [],
    poLocation: [{ id: 1, name: "Main Branch" }],
    orderDate: "",
    date: new Date().toISOString().slice(0, 10),
    terms: "Credit",
    partyName: [],
    billNo: "",
    purchaseBillNo: "",
    purchaseDate: "",
    purchaseLocation: [{ id: 1, name: "Main Branch" }],
    dueDate: "",
    narration: "",
  });

  const isFromPo = billType === "po" && hdr.poNo.length > 0;

  // ---- Field-level errors for client-side pre-submit checks ----
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const clearError = (key: string) =>
    setFormErrors((prev) => {
      if (!prev[key]) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });

  useEffect(() => {
    (async () => {
      try {
        const financialYearId = localStorage.getItem("financialYearId");
        const res = await Get(
          "purchase/next-bill-no",
          { financialYearId },
          false,
        );
        if (res.data?.success) {
          setHdr((h) => ({ ...h, billNo: res.data.data?.billNo || "" }));
        } else {
          // API validation / error message -> toaster
          toasterrormsg(res.data?.message || "Failed to generate Bill No.");
        }
      } catch (err: any) {
        toasterrormsg(
          err?.response?.data?.message || "Failed to generate Bill No.",
        );
      }
    })();
  }, []);

  // ---- Dynamic Party (Supplier) list ----
  const [partyOptions, setPartyOptions] = useState<any[]>([]);
  const [loadingParty, setLoadingParty] = useState(true);

  // ---- Dynamic Cash/Bank accounts ----
  const [cashAccountOptions, setCashAccountOptions] = useState<any[]>([]);
  const [bankAccountOptions, setBankAccountOptions] = useState<any[]>([]);
  const [cashAccount, setCashAccount] = useState<any[]>([]);
  const [bankAccount, setBankAccount] = useState<any[]>([]);

  // ---- Company state (GST same-state check ke liye) — UNCHANGED ----
  const [companyState, setCompanyState] = useState<string>("");

  const [bankDetailsOpen, setBankDetailsOpen] = useState(false);
  const [bankDetails, setBankDetails] = useState({
    paymentMode: "UPI",
    chequeNo: "",
    chequeDate: "",
    clearDate: "",
    narration: "",
  });

  const termsValue = hdr.terms;

  const setH = useCallback(
    (k: string) => (v: any) => setHdr((h) => ({ ...h, [k]: v })),
    [setHdr],
  );
  const setHInput = useCallback(
    (k: string) => (e: any) => setHdr((h) => ({ ...h, [k]: e.target.value })),
    [setHdr],
  );
  const setHDate = useCallback(
    (k: string) => (val: any) => setHdr((h) => ({ ...h, [k]: val })),
    [setHdr],
  );

  const [charges, setCharges] = useState({
    transport: 0,
    loading: 0,
    other: 0,
    discPct: 0,
    discAmt: 0,
    roundOff: 0,
  });
  const setC = (k: string) => (e: any) =>
    setCharges((c) => ({ ...c, [k]: parseFloat(e.target.value) || 0 }));

  // ---- Fetch dynamic Party (Supplier) list ----
  useEffect(() => {
    (async () => {
      try {
        setLoadingParty(true);
        const res = await Get("master/account/supplier/list", {}, false);
        if (res.data?.success) {
          setPartyOptions(
            (res.data.data || []).map((a: any) => ({
              id: a.id,
              name: a.accountName,
              mobile: a.mobileNo,
              balance: Number(a.currentBalance) || 0,
              drOrCr: a.currentDrOrCr,
              stateName: a.stateName || "",
            })),
          );
        } else {
          toasterrormsg(res.data?.message || "Failed to load supplier list.");
        }
      } catch (err: any) {
        toasterrormsg(
          err?.response?.data?.message || "Failed to load supplier list.",
        );
      } finally {
        setLoadingParty(false);
      }
    })();
  }, []);

  // ---- Fetch dynamic Cash accounts ----
  useEffect(() => {
    (async () => {
      try {
        const res = await Get("master/account/cash/list", {}, false);
        if (res.data?.success) {
          setCashAccountOptions(
            (res.data.data || []).map((a: any) => ({
              id: a.id,
              name: a.accountName,
              balance: Number(a.currentBalance) || 0,
            })),
          );
        }
      } catch (err) {}
    })();
  }, []);

  // ---- Fetch dynamic Bank accounts ----
  useEffect(() => {
    (async () => {
      try {
        const res = await Get("master/account/bank/list", {}, false);
        if (res.data?.success) {
          setBankAccountOptions(
            (res.data.data || []).map((a: any) => ({
              id: a.id,
              name: a.accountName,
              balance: Number(a.currentBalance) || 0,
            })),
          );
        }
      } catch (err) {}
    })();
  }, []);

  // ---- Fetch Company's state (GST logic ke liye) — UNCHANGED ----
  useEffect(() => {
    (async () => {
      try {
        const companyDetailsId = localStorage.getItem("companyDetailsId");
        const res = await Get(
          "superadmin/company-details",
          { companyDetailsId },
          false,
        );
        if (res.data?.success) {
          setCompanyState(res.data.data?.state || "");
        }
      } catch (err) {}
    })();
  }, []);

  // ---- GST same-state check — UNCHANGED ----
  const selectedParty = hdr.partyName[0]; // ab PartyOption | undefined, 'any' nahi

  // 👇 FIX: Combobox ke `value` ko hamesha usi `data` array (partyOptions) se
  // hi derive karo jo Combobox ko diya ja raha hai. Isse reference/identity
  // mismatch ki wajah se "select toh hota he par naam show nahi hota" wala
  // bug fix ho jaata he — kyunki Combobox ab exactly wahi object dekhega
  // jo uski apni `data` list mein bhi maujood he.
  const partyComboValue = useMemo(() => {
    if (!selectedParty) return null;
    const matched = partyOptions.find((p) => p.id === selectedParty.id);
    return matched || selectedParty;
  }, [selectedParty, partyOptions]);

  const partyFilteredCatalog = useMemo(() => {
    if (!selectedParty) return [];
    return itemCatalog.filter((i) => i.supplierId === selectedParty.id);
  }, [itemCatalog, selectedParty]);

  const cashComboValue = useMemo(() => {
    const sel = cashAccount[0];
    if (!sel) return null;
    const matched = cashAccountOptions.find((c) => c.id === sel.id);
    return matched || sel;
  }, [cashAccount, cashAccountOptions]);

  const bankComboValue = useMemo(() => {
    const sel = bankAccount[0];
    if (!sel) return null;
    const matched = bankAccountOptions.find((b) => b.id === sel.id);
    return matched || sel;
  }, [bankAccount, bankAccountOptions]);

  const companyStateClean = companyState?.trim().toLowerCase() || "";
  const partyStateClean = selectedParty?.stateName?.trim().toLowerCase() || "";

  const isSameState =
    !!companyStateClean &&
    !!partyStateClean &&
    companyStateClean === partyStateClean;

  const totTaxable = items.reduce((s: number, i: any) => s + i.taxable, 0);
  const totGST = items.reduce((s: number, i: any) => s + i.gstAmt, 0);
  const totOther = charges.transport + charges.loading + charges.other;
  const grandTotal =
    totTaxable + totGST + totOther - charges.discAmt + charges.roundOff;

  // ---- CGST/SGST vs IGST — UNCHANGED ----
  const cgstTotal = isSameState ? totGST / 2 : 0;
  const sgstTotal = isSameState ? totGST / 2 : 0;
  const igstTotal = isSameState ? 0 : totGST;

  // ✅ CHANGED — same itemId already list me ho to Qty merge + recalc, warna naya row
  const addItemFromPreview = (item: any) => {
    setItems((prev) => {
      const idx = prev.findIndex((i: any) => i.itemId === item.itemId);
      if (idx !== -1) {
        const existing = prev[idx];
        const mergedQty = (Number(existing.qty) || 0) + (Number(item.qty) || 0);
        const merged = calcItem({
          ...existing,
          qty: mergedQty, // rate/discount/gst existing row se hi rahega — consistency ke liye
        });
        const next = [...prev];
        next[idx] = merged;
        return next;
      }
      return [...prev, item];
    });
    clearError("items");
  };

  const removeItem = (id: any) =>
    setItems((prev) => prev.filter((i: any) => i.id !== id));

  const handleFileChange = (e: any) => {
    Array.from(e.target.files || []).forEach((f: any) =>
      setUploadedFiles((prev) => [
        ...prev,
        { name: f.name, size: `${Math.round(f.size / 1024)} KB` },
      ]),
    );
    if (e.target) e.target.value = "";
  };

  const [submitting, setSubmitting] = useState(false);

  // ---- Client-side pre-submit checks (field-level, not API errors) ----
  const validateBeforeSave = (): Record<string, string> => {
    const errors: Record<string, string> = {};

    if (!selectedParty) errors.partyName = "Please select Party Name.";
    if (!hdr.purchaseBillNo?.trim())
      errors.purchaseBillNo = "Purchase Bill No is required.";
    if (!hdr.purchaseDate) errors.purchaseDate = "Purchase Date is required.";
    if (items.length === 0) errors.items = "Please add at least one item.";
    else if (items.some((i: any) => !i.itemId))
      errors.items =
        "One or more items are missing item reference. Please re-add them.";

    if (termsValue === "Credit" && !hdr.dueDate)
      errors.dueDate = "Due Date is required for Credit terms.";
    if (termsValue === "Cash" && cashAccount.length === 0)
      errors.cashAccount = "Please select a Cash Account.";
    if (termsValue === "Bank") {
      if (bankAccount.length === 0)
        errors.bankAccount = "Please select a Bank Account.";
      if (!bankDetails.paymentMode)
        errors.bankDetails = "Please add Bank Details (Payment Mode).";
      if (
        bankDetails.paymentMode === "CHEQUE" &&
        (!bankDetails.chequeNo.trim() || !bankDetails.chequeDate.trim())
      ) {
        errors.bankDetails = "Cheque No and Cheque Date are required.";
      }
    }

    return errors;
  };

  const handleSaveBill = async () => {
    const errors = validateBeforeSave();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    setFormErrors({});
    setSubmitting(true);

    try {
      const financialYearId = localStorage.getItem("financialYearId");
      const companyId = localStorage.getItem("companyId");

      const payload = {
        financialYearId: financialYearId,
        terms: termsValue,
        accountId: selectedParty.id,
        billNo: hdr.billNo,
        purchaseBillNo: hdr.purchaseBillNo,
        purchaseDate: hdr.purchaseDate,
        branchId: hdr.purchaseLocation?.[0]?.id || null,
        dueDate: termsValue === "Credit" ? hdr.dueDate : null,
        narration: hdr.narration,

        transportCharge: charges.transport,
        loadingCharge: charges.loading,
        otherCharge: charges.other,
        discountPct: charges.discPct,
        discountAmount: charges.discAmt,
        roundAmount: charges.roundOff,

        createdBy: companyId ? Number(companyId) : undefined,
        createdType: "Super Admin",

        cashAccountId: termsValue === "Cash" ? cashAccount[0]?.id : null,
        bankAccountId: termsValue === "Bank" ? bankAccount[0]?.id : null,
        paymentMode: termsValue === "Bank" ? bankDetails.paymentMode : null,
        chequeNo:
          bankDetails.paymentMode === "CHEQUE" ? bankDetails.chequeNo : null,
        chequeDate:
          bankDetails.paymentMode === "CHEQUE" ? bankDetails.chequeDate : null,
        chequeClearDate:
          bankDetails.paymentMode === "CHEQUE" ? bankDetails.clearDate : null,
        bankNarration: termsValue === "Bank" ? bankDetails.narration : null,

        items: items.map((i: any) => ({
          itemId: i.itemId,
          itemCode: i.itemCode,
          itemName: i.itemName,
          hsnCode: i.hsnCode,
          uom: i.uom,
          qty: i.qty,
          rate: i.rate,
          discount: i.discount,
          taxable: i.taxable,
          gstPct: i.gstPct,
          gstAmt: i.gstAmt,
          total: i.total,
        })),
      };

      const res = await Post("purchase/create", payload, false);
      if (res.data?.success) {
        toastsuccessmsg(
          res.data?.message || "Purchase bill saved successfully.",
        );
        // 👇 create ke baad register list page par redirect
        navigate("/purchase-master/purchase-register");
      } else {
        // 👇 backend/API validation error message -> toaster
        toasterrormsg(res.data?.message || "Failed to save purchase bill.");
      }
    } catch (err: any) {
      toasterrormsg(
        err?.response?.data?.message || "Something went wrong while saving.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 shadow-none dark:bg-gray-900">
      <div className="w-full px-4 py-6 sm:px-6 lg:px-8">
        {/* TOP BAR */}
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-primary border-primary border-b-4 pb-1 text-xl font-extrabold">
            Vehicle Purchase Bill
          </h1>
          <Link
            to="/purchase-master/purchase-register"
            className="text-primary text-sm hover:underline"
          >
            <Button variant="outlined" className="gap-2">
              <Icon.Back /> Back
            </Button>
          </Link>
        </div>

        {/* HEADER FORM */}
        <Card className="mb-5 shadow-none">
          <div className="mb-5 flex gap-8">
            {[
              { val: "manual", label: "Manual" },
              { val: "po", label: "Purchase Order" },
            ].map(({ val, label }) => (
              <label
                key={val}
                className="group flex cursor-pointer items-center gap-2.5"
              >
                <div className="relative flex items-center">
                  <input
                    type="radio"
                    name="billType"
                    value={val}
                    checked={billType === val}
                    onChange={() => setBillType(val)}
                    className="sr-only"
                  />
                  <div
                    className={
                      "flex h-5 w-5 items-center justify-center rounded-full border-2 transition-all " +
                      (billType === val
                        ? "border-primary bg-primary"
                        : "group-hover:border-primary/60 border-gray-400 bg-white dark:bg-gray-700")
                    }
                  >
                    {billType === val && (
                      <div className="h-2 w-2 rounded-full bg-white" />
                    )}
                  </div>
                </div>
                <span
                  className={
                    "text-sm transition-colors " +
                    (billType === val
                      ? "text-primary font-medium"
                      : "text-gray-600 dark:text-gray-300")
                  }
                >
                  {label}
                </span>
              </label>
            ))}
          </div>

          {billType === "po" && (
            <div className="mb-5 grid grid-cols-1 gap-4 border-b border-gray-100 pb-5 sm:grid-cols-2 lg:grid-cols-3 dark:border-gray-700">
              <div>
                <FieldLabel required>Purchase Order No</FieldLabel>
                <Combobox
                  data={poOptions}
                  displayField="name" // or "label" if you want "PO-xxx | Supplier"
                  value={hdr.poNo[0] || null}
                  onChange={handlePoSelect}
                  placeholder={
                    loadingPo ? "Loading POs..." : "Select Purchase Order"
                  }
                  searchFields={["name", "poNumber", "supplierName"]}
                />
              </div>
              <div>
                <FieldLabel>Purchase Location</FieldLabel>
                <Listbox
                  data={locationOptions}
                  value={hdr.purchaseLocation}
                  onChange={(v: any) => {
                    if (isFromPo) return;
                    setH("purchaseLocation")(v);
                  }}
                  displayField="name"
                  placeholder="Location"
                  disabled={isFromPo}
                />
              </div>
              <DatePicker
                label="Order Date"
                value={hdr.orderDate}
                onChange={(selectedDates: Date[]) => {
                  const picked = selectedDates?.[0];
                  setHDate("orderDate")(picked ? formatDateForApi(picked) : "");
                }}
                placeholder="Select Date"
              />
            </div>
          )}

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            <DatePicker
              label="Date"
              value={hdr.date}
              onChange={(selectedDates: Date[]) => {
                const picked = selectedDates?.[0];
                setHDate("date")(picked ? formatDateForApi(picked) : "");
              }}
              placeholder="Select Date"
            />

            <div>
              <FieldLabel>Terms</FieldLabel>
              <Listbox
                data={TERMS_OPTIONS}
                value={TERMS_OPTIONS.find((t) => t.id === hdr.terms) || null}
                onChange={(val: any) =>
                  setHdr((h) => ({ ...h, terms: val?.id || "" }))
                }
                displayField="name"
                placeholder="Terms"
              />
            </div>

            {/* Party Name — dynamic + fixed display (matched item from partyOptions) */}
            <div className="sm:col-span-2">
              <FieldLabel required>Party Name</FieldLabel>
              <div className="flex items-center gap-2">
                <div className="min-w-0 flex-1">
                  <Combobox
                    data={partyOptions}
                    displayField="name"
                    value={partyComboValue}
                    onChange={(selected: any) => {
                      if (isFromPo) return; // 🔒 locked
                      setHdr((h) => ({
                        ...h,
                        partyName: selected ? [selected] : [],
                      }));
                      clearError("partyName");
                    }}
                    placeholder={
                      loadingParty
                        ? "Loading suppliers..."
                        : "Select or search party"
                    }
                    searchFields={["name"]}
                    disabled={isFromPo} // 🔒 if your Combobox supports disabled
                    // OR wrap in a div with pointer-events-none when isFromPo
                    renderItem={(item: any) => (
                      <div className="flex items-center justify-between gap-3">
                        <div className="truncate">
                          <span className="text-sm text-gray-600 dark:text-gray-300">
                            {item.name}
                          </span>
                          <span className="ml-2 text-sm font-medium">
                            ({item.mobile})
                          </span>
                        </div>
                        <span className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                          ₹{item.balance?.toLocaleString() ?? "0"} {item.drOrCr}
                        </span>
                      </div>
                    )}
                  />
                  {formErrors.partyName && (
                    <p className="mt-1 text-xs text-red-500">
                      {formErrors.partyName}
                    </p>
                  )}
                </div>

                {selectedParty && (
                  <span className="text-primary bg-primary/10 border-primary/20 flex-shrink-0 rounded-lg border px-2.5 py-1.5 text-xs font-bold whitespace-nowrap">
                    Bal: ₹{selectedParty.balance?.toLocaleString() ?? "0"}{" "}
                    {selectedParty.drOrCr}
                  </span>
                )}

                {/* Hide + button when locked from PO */}
                {!isFromPo && (
                  <button
                    type="button"
                    onClick={() => setAccountDrawerOpen(true)}
                    className="bg-primary hover:bg-primary/90 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg text-white shadow-sm transition-colors"
                    title="Create new account"
                  >
                    <Icon.Plus />
                  </button>
                )}
              </div>
            </div>

            <Input
              label="Bill No."
              value={hdr.billNo}
              onChange={setHInput("billNo")}
            />

            <div>
              <Input
                label="Purchase Bill No"
                placeholder="Enter Purchase Bill No."
                value={hdr.purchaseBillNo}
                onChange={(e: any) => {
                  setHInput("purchaseBillNo")(e);
                  clearError("purchaseBillNo");
                }}
              />
              {formErrors.purchaseBillNo && (
                <p className="mt-1 text-xs text-red-500">
                  {formErrors.purchaseBillNo}
                </p>
              )}
            </div>

            <div>
              <DatePicker
                label="Purchase Date"
                value={hdr.purchaseDate}
                onChange={(selectedDates: Date[]) => {
                  const picked = selectedDates?.[0];
                  const formatted = picked ? formatDateForApi(picked) : "";
                  setHDate("purchaseDate")(formatted);
                  clearError("purchaseDate");
                }}
                placeholder="Select Date"
              />
              {formErrors.purchaseDate && (
                <p className="mt-1 text-xs text-red-500">
                  {formErrors.purchaseDate}
                </p>
              )}
            </div>

            <div>
              <FieldLabel>Purchase Bill Upload</FieldLabel>
              <div className="flex h-[38px] w-full items-center overflow-hidden rounded-lg border border-gray-300 bg-white dark:border-gray-600 dark:bg-gray-800">
                <button
                  type="button"
                  onClick={() => fileRef.current && fileRef.current.click()}
                  className="h-full border-r border-gray-300 bg-gray-100 px-3 text-sm whitespace-nowrap transition-colors hover:bg-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
                >
                  Choose File
                </button>
                <span className="flex-1 truncate px-3 text-sm text-gray-400">
                  No file chosen
                </span>
                <input
                  ref={fileRef}
                  type="file"
                  className="hidden"
                  onChange={handleFileChange}
                  multiple
                />
              </div>
            </div>

            <div>
              <FieldLabel>Purchase Location</FieldLabel>
              <Listbox
                data={locationOptions} // ✅ dynamic
                value={hdr.purchaseLocation}
                onChange={setH("purchaseLocation")}
                displayField="name"
                placeholder="Location"
              />
            </div>

            {termsValue === "Credit" && (
              <div>
                <DatePicker
                  label="Due Date"
                  value={hdr.dueDate}
                  onChange={(selectedDates: Date[]) => {
                    const picked = selectedDates?.[0];
                    const formatted = picked ? formatDateForApi(picked) : "";
                    setHDate("dueDate")(formatted);
                    clearError("dueDate");
                  }}
                  placeholder="Select Date"
                />
                {formErrors.dueDate && (
                  <p className="mt-1 text-xs text-red-500">
                    {formErrors.dueDate}
                  </p>
                )}
              </div>
            )}

            {termsValue === "Cash" && (
              <div>
                <FieldLabel required>Cash Account</FieldLabel>
                <Combobox
                  data={cashAccountOptions}
                  displayField="name"
                  value={cashComboValue}
                  onChange={(selected: any) => {
                    setCashAccount(selected ? [selected] : []);
                    clearError("cashAccount");
                  }}
                  placeholder="Select Cash Account"
                  searchFields={["name"]}
                />
                {formErrors.cashAccount && (
                  <p className="mt-1 text-xs text-red-500">
                    {formErrors.cashAccount}
                  </p>
                )}
              </div>
            )}

            {termsValue === "Bank" && (
              <div>
                <FieldLabel required>Bank Account</FieldLabel>
                <div className="flex items-center gap-2">
                  <div className="min-w-0 flex-1">
                    <Combobox
                      data={bankAccountOptions}
                      displayField="name"
                      value={bankComboValue}
                      onChange={(selected: any) => {
                        setBankAccount(selected ? [selected] : []);
                        clearError("bankAccount");
                      }}
                      placeholder="Select Bank Account"
                      searchFields={["name"]}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => setBankDetailsOpen(true)}
                    className="text-primary flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg border border-gray-300 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-700"
                    title="Add Bank Details"
                  >
                    <Icon.Bank />
                  </button>
                </div>
                {(formErrors.bankAccount || formErrors.bankDetails) && (
                  <p className="mt-1 text-xs text-red-500">
                    {formErrors.bankAccount || formErrors.bankDetails}
                  </p>
                )}
              </div>
            )}

            <div className="sm:col-span-2 xl:col-span-2">
              <Input
                label="Narration"
                placeholder="Enter narration"
                value={hdr.narration}
                onChange={setHInput("narration")}
              />
            </div>
          </div>
        </Card>

        <Card title="Add Item" className="mb-5">
          <AddItemSelector
            itemCatalog={itemCatalog}
            onAdd={addItemFromPreview}
          />
        </Card>

        {/* ITEM DETAILS */}
        <Card title="Item Details" className="mb-5">
          {formErrors.items && (
            <p className="mb-2 text-xs text-red-500">{formErrors.items}</p>
          )}

          <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700">
            <table className="w-full min-w-[1100px]">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50 dark:border-gray-600 dark:bg-gray-700">
                  {[
                    "#",
                    "Item Code",
                    "Item Name",
                    "HSN Code",
                    "UOM",
                    "Qty",
                    "Rate (₹)",
                    "Disc (%)",
                    "Taxable (₹)",
                    "GST %",
                    "GST Amt (₹)",
                    "Total (₹)",
                    "Action",
                  ].map((h) => (
                    <th
                      key={h}
                      className="px-3 py-3 text-left text-xs font-bold tracking-wide whitespace-nowrap text-gray-500 uppercase dark:text-gray-400"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {items.map((item: any, idx: number) => (
                  <tr
                    key={item.id}
                    className="hover:bg-primary/5 border-b border-gray-100 transition-colors dark:border-gray-700"
                  >
                    <td className="px-3 py-2.5 text-sm font-medium text-gray-400">
                      {idx + 1}
                    </td>
                    <td className="text-primary px-3 py-2.5 text-sm font-bold">
                      {item.itemCode}
                    </td>
                    <td className="px-3 py-2.5 text-sm font-medium whitespace-nowrap text-gray-800 dark:text-gray-100">
                      {item.itemName}
                      {item.colour && (
                        <span className="block text-[10px] text-gray-400">
                          {item.colour}
                        </span>
                      )}
                    </td>
                    <td className="px-3 py-2.5 text-sm text-gray-600 dark:text-gray-300">
                      {item.hsnCode}
                    </td>
                    <td className="px-3 py-2.5 text-sm">
                      <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium dark:bg-gray-700 dark:text-gray-200">
                        {item.uom}
                      </span>
                    </td>
                    <td className="px-3 py-2.5 text-right text-sm font-medium text-gray-800 dark:text-gray-100">
                      {FMT3(item.qty)}
                    </td>
                    <td className="px-3 py-2.5 text-right text-sm text-gray-700 dark:text-gray-200">
                      {FMT2(item.rate)}
                    </td>
                    <td className="px-3 py-2.5 text-right text-sm text-gray-600 dark:text-gray-300">
                      {FMT2(item.discount)}
                    </td>
                    <td className="px-3 py-2.5 text-right text-sm font-medium text-gray-800 dark:text-gray-100">
                      {FMT2(item.taxable)}
                    </td>
                    <td className="px-3 py-2.5 text-center">
                      <span className="bg-primary/10 text-primary rounded-full px-2 py-0.5 text-xs font-bold">
                        {item.gstPct}%
                      </span>
                    </td>
                    <td className="px-3 py-2.5 text-right text-sm text-gray-700 dark:text-gray-200">
                      {FMT2(item.gstAmt)}
                    </td>
                    <td className="px-3 py-2.5 text-right text-sm font-extrabold text-gray-900 dark:text-white">
                      {FMT2(item.total)}
                    </td>
                    <td className="px-3 py-2.5">
                      <button
                        type="button"
                        onClick={() => removeItem(item.id)}
                        className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-900/30"
                      >
                        <Icon.Trash />
                      </button>
                    </td>
                  </tr>
                ))}
                {items.length === 0 && (
                  <tr>
                    <td
                      colSpan={13}
                      className="px-4 py-10 text-center text-sm text-gray-400"
                    >
                      No items added yet. Select items from the Add Item section
                      above.
                    </td>
                  </tr>
                )}
              </tbody>
              <tfoot>
                <tr className="bg-primary/5 border-primary/20 border-t-2">
                  <td
                    className="text-primary px-3 py-3 text-sm font-extrabold"
                    colSpan={5}
                  >
                    Total
                  </td>
                  <td className="text-primary px-3 py-3 text-right text-sm font-extrabold">
                    {FMT3(items.reduce((s: number, i: any) => s + i.qty, 0))}
                  </td>
                  <td colSpan={2} />
                  <td className="text-primary px-3 py-3 text-right text-sm font-extrabold">
                    {FMT2(totTaxable)}
                  </td>
                  <td />
                  <td className="text-primary px-3 py-3 text-right text-sm font-extrabold">
                    {FMT2(totGST)}
                  </td>
                  <td className="text-primary px-3 py-3 text-right text-sm font-extrabold">
                    {FMT2(totTaxable + totGST)}
                  </td>
                  <td />
                </tr>
              </tfoot>
            </table>
          </div>
        </Card>

        {/* ── BOTTOM 3-COL: Charges / Tax / Summary — GST logic UNCHANGED ── */}
        <div className="mb-5 grid grid-cols-1 gap-5 lg:grid-cols-3">
          <Card title="Charges & Discounts">
            <div className="space-y-3">
              {[
                ["Transport Charges", "transport"],
                ["Loading / Unloading", "loading"],
                ["Other Charges", "other"],
                ["Discount (%)", "discPct"],
                ["Discount Amount", "discAmt"],
                ["Round Off", "roundOff"],
              ].map(([lbl, key]) => (
                <div
                  key={key}
                  className="flex items-center justify-between gap-3"
                >
                  <label className="flex-1 text-sm text-gray-600 dark:text-gray-400">
                    {lbl}
                  </label>
                  <input
                    type="number"
                    value={(charges as any)[key]}
                    onChange={setC(key as any)}
                    step={key === "roundOff" ? "0.01" : "1"}
                    className="focus:ring-primary/40 focus:border-primary w-32 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-right text-sm text-gray-800 focus:ring-2 focus:outline-none dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
                  />
                </div>
              ))}
            </div>
          </Card>

          <Card title="Tax Summary">
            <div className="mb-4 overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50 dark:border-gray-600 dark:bg-gray-700">
                    <th className="px-3 py-2.5 text-left text-xs font-bold tracking-wide text-gray-500 uppercase">
                      Tax Type
                    </th>
                    <th className="px-3 py-2.5 text-right text-xs font-bold tracking-wide text-gray-500 uppercase">
                      Amount (₹)
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {isSameState ? (
                    <>
                      <tr className="border-t border-gray-100 dark:border-gray-700">
                        <td className="px-3 py-2 text-sm text-gray-700 dark:text-gray-200">
                          CGST
                        </td>
                        <td className="px-3 py-2 text-right text-sm text-gray-700 dark:text-gray-200">
                          {FMT2(cgstTotal)}
                        </td>
                      </tr>
                      <tr className="border-t border-gray-100 dark:border-gray-700">
                        <td className="px-3 py-2 text-sm text-gray-700 dark:text-gray-200">
                          SGST
                        </td>
                        <td className="px-3 py-2 text-right text-sm text-gray-700 dark:text-gray-200">
                          {FMT2(sgstTotal)}
                        </td>
                      </tr>
                    </>
                  ) : (
                    <tr className="border-t border-gray-100 dark:border-gray-700">
                      <td className="px-3 py-2 text-sm text-gray-700 dark:text-gray-200">
                        IGST
                      </td>
                      <td className="px-3 py-2 text-right text-sm text-gray-700 dark:text-gray-200">
                        {FMT2(igstTotal)}
                      </td>
                    </tr>
                  )}
                </tbody>
                <tfoot>
                  <tr className="bg-primary/5 border-primary/20 border-t-2 font-extrabold">
                    <td className="text-primary px-3 py-2.5 text-sm">
                      Taxable Total
                    </td>
                    <td className="text-primary px-3 py-2.5 text-right text-sm">
                      {FMT2(totTaxable)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
            <FieldLabel>Remarks</FieldLabel>
            <textarea
              rows={4}
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              className="focus:ring-primary/40 focus:border-primary w-full resize-none rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:ring-2 focus:outline-none dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200"
            />
          </Card>

          <Card title="Summary">
            <div className="mb-4 space-y-0">
              {[
                ["Total Taxable Value", totTaxable],
                ["Total GST", totGST],
                ["Total Other Charges", totOther],
                ["Total Discount", charges.discAmt],
              ].map(([lbl, val]) => (
                <div
                  key={lbl as string}
                  className="flex justify-between border-b border-gray-100 py-2.5 last:border-0 dark:border-gray-700"
                >
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {lbl as string}
                  </span>
                  <span className="text-sm font-semibold text-gray-800 dark:text-gray-100">
                    {INR(val as number)}
                  </span>
                </div>
              ))}
            </div>
            <div className="rounded-xl border border-blue-100 bg-blue-50 p-4 dark:border-blue-900 dark:bg-blue-900/20">
              <div className="mb-1 flex items-center justify-between">
                <span className="text-sm font-bold tracking-wide text-blue-700 uppercase dark:text-blue-300">
                  Grand Total
                </span>
              </div>
              <p className="text-2xl font-extrabold text-blue-700 dark:text-blue-300">
                {INR(grandTotal)}
              </p>
              <p className="mt-1.5 text-[10px] leading-relaxed text-blue-500/70 dark:text-blue-400/60">
                <span className="font-semibold">In Words:</span>{" "}
                {numInWords(grandTotal)}
              </p>
            </div>
          </Card>
        </div>

        {/* ── Attachments + Actions — same as before, unchanged ── */}
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
          <div className="lg:col-span-1">
            <Card title="Actions">
              <div className="flex flex-col gap-3">
                <button
                  type="button"
                  onClick={handleSaveBill}
                  disabled={submitting}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-green-500 px-4 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:bg-green-600 hover:shadow-md active:bg-green-700 disabled:opacity-50"
                >
                  <Icon.Save /> {submitting ? "Saving..." : "Save Bill"}
                </button>
                <button
                  type="button"
                  className="bg-primary hover:bg-primary/90 active:bg-primary/80 flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:shadow-md"
                >
                  <Icon.Print /> Save & Print
                </button>
                <button
                  type="button"
                  className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-gray-300 bg-white px-4 py-3 text-sm font-semibold text-gray-600 transition-all hover:border-red-400 hover:text-red-500 dark:border-gray-600 dark:bg-transparent dark:text-gray-300 dark:hover:border-red-500 dark:hover:text-red-400"
                  onClick={() => navigate("/purchase-master/purchase-register")}
                >
                  <Icon.Close /> Cancel
                </button>
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* All Drawers — UNCHANGED */}
      <AddItemDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onAdd={addItemFromPreview}
      />
      <CreateAccountDrawer
        open={accountDrawerOpen}
        onClose={() => setAccountDrawerOpen(false)}
      />
      <BankDetailsDrawer
        open={bankDetailsOpen}
        onClose={() => setBankDetailsOpen(false)}
        bankDetails={bankDetails}
        setBankDetails={setBankDetails}
      />
    </div>
  );
}
