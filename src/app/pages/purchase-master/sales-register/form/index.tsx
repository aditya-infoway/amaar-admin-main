import { useState, useCallback, useEffect, useMemo } from "react";
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

/**
 * Sketch ke hisaab se:
 *   Taxable Amount = Qty × Basic Price
 *   Discount       = ₹ amount
 *   Net Amount     = (Taxable − Discount) + Tax
 */
function calcItem(item: any): any {
  const amount = (item.qty || 0) * (item.basicPrice || 0);
  const discount = Math.min(item.discount || 0, amount);
  const taxableAfterDisc = amount - discount;
  const taxAmt = (taxableAfterDisc * (item.taxPct || 0)) / 100;
  return {
    ...item,
    discount,
    taxable: amount,
    taxableAfterDisc,
    taxAmt,
    net: taxableAfterDisc + taxAmt,
  };
}

function formatDateForApi(date: Date): string {
  const yr = date.getFullYear();
  const mo = String(date.getMonth() + 1).padStart(2, "0");
  const dy = String(date.getDate()).padStart(2, "0");
  return `${yr}-${mo}-${dy}`;
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

/* ─────────────────────────────────────────────
   STATIC DATA
───────────────────────────────────────────── */
const TERMS_OPTIONS = [
  { id: "Credit", name: "Credit" },
  { id: "Cash", name: "Cash" },
  { id: "Bank", name: "Bank" },
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

const EMPTY_ROW = {
  itemId: null as number | null,
  itemCode: "",
  itemName: "",
  hsnCode: "",
  uom: "",
  qty: "1",
  basicPrice: "",
  discount: "0",
  taxPct: "",
  _filled: false,
};

/* ─────────────────────────────────────────────
   BANK DETAILS DRAWER
───────────────────────────────────────────── */
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
        <div className="bg-primary-600 flex flex-shrink-0 items-center justify-between px-5 py-4 text-white">
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
   ITEM CATALOG + ADD ITEM ROW
───────────────────────────────────────────── */
interface SalesCatalogItem {
  id: string;
  itemId: number | null;
  itemCode: string;
  itemName: string; // Item Description / Model
  unit: string;
  taxSlab: string;
  basicPrice: number;
  hsnCode: string;
  qty?: number; // Sales Order se aaye to prefill ke liye
}

const mapApiItem = (item: any): SalesCatalogItem => ({
  id: String(item.itemId),
  itemId: item.itemId || null,
  itemCode: item.itemCode || "",
  itemName: item.itemName || "",
  unit: item.unit || "",
  taxSlab: String(item.taxSlab ?? "0"),
  basicPrice: Number(item.salesPrice) || 0,
  hsnCode: item.hsnCode || "",
});

function AddItemSelector({
  itemCatalog,
  onAdd,
  lockFields = false,
}: {
  itemCatalog: SalesCatalogItem[];
  onAdd: (item: any) => void;
  lockFields?: boolean; // true => Sales Order mode: Qty / Price / Discount read-only
}) {
  const [row, setRow] = useState({ ...EMPTY_ROW });
  const [touched, setTouched] = useState(false);

  useEffect(() => {
    setRow({ ...EMPTY_ROW });
    setTouched(false);
    // Sales Order me item ek hi hota hai -> auto-select, user sirf ✓ dabaye
    if (lockFields && itemCatalog.length === 1) fill(itemCatalog[0]);
  }, [itemCatalog, lockFields]);

  const fill = (m: SalesCatalogItem) => {
    setRow({
      itemId: m.itemId,
      itemCode: m.itemCode,
      itemName: m.itemName,
      hsnCode: m.hsnCode,
      uom: m.unit,
      qty: m.qty && m.qty > 0 ? String(m.qty) : "1",
      basicPrice: String(m.basicPrice),
      discount: "0",
      taxPct: String(m.taxSlab),
      _filled: true,
    });
    setTouched(false);
  };

  const handleAdd = () => {
    setTouched(true);
    if (!row.itemId || !row.itemName || !(parseFloat(row.qty) > 0)) return;
    onAdd(
      calcItem({
        id: Date.now(),
        itemId: row.itemId,
        itemCode: row.itemCode,
        itemName: row.itemName,
        hsnCode: row.hsnCode,
        uom: row.uom,
        qty: parseFloat(row.qty) || 0,
        basicPrice: parseFloat(row.basicPrice) || 0,
        discount: parseFloat(row.discount) || 0,
        taxPct: parseFloat(row.taxPct) || 0,
      }),
    );
    setRow({ ...EMPTY_ROW });
    setTouched(false);
  };

  const preview = calcItem({
    qty: parseFloat(row.qty) || 0,
    basicPrice: parseFloat(row.basicPrice) || 0,
    discount: parseFloat(row.discount) || 0,
    taxPct: parseFloat(row.taxPct) || 0,
  });

  // Sales Order me item ek hi hota hai -> dropdown bhi lock (multiple items aaye to select karne dena)
  const itemLocked = lockFields && itemCatalog.length <= 1;
  const hasItem = !!row.itemId;
  const qtyInvalid = touched && !(parseFloat(row.qty) > 0);

  const iCls =
    "w-full px-2.5 py-[8px] text-xs border border-gray-300 rounded-lg bg-white dark:bg-gray-800 dark:border-gray-600 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary placeholder-gray-300 dark:placeholder-gray-600 transition-all";
  const roCls =
    "w-full px-2.5 py-[8px] text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700/50 text-gray-700 dark:text-gray-300 select-none";

  return (
    <div className="space-y-4">
      {/* ROW 1: Item Description / Model + HSN + Tax */}
      <div className="grid grid-cols-12 items-end gap-3">
        <div className="col-span-12 md:col-span-6">
          <FieldLabel required>Item Description / Model</FieldLabel>
          <Combobox
            data={itemCatalog}
            displayField="itemName"
            value={itemCatalog.find((m) => m.itemId === row.itemId) || null}
            onChange={(selected: any) => {
              if (itemLocked) return; // 🔒 Sales Order me item change nahi hoga
              if (selected) fill(selected);
              else setRow({ ...EMPTY_ROW });
            }}
            disabled={itemLocked}
            placeholder="Select item / model"
            searchFields={["itemCode", "itemName"]}
            renderItem={(item: any) => (
              <div className="flex w-full items-center text-inherit">
                <span className="w-16 shrink-0 text-xs font-bold">
                  {item.itemCode}
                </span>
                <span className="truncate text-sm">{item.itemName}</span>
              </div>
            )}
          />
        </div>
        <div className="col-span-6 md:col-span-3">
          <FieldLabel>HSN Code</FieldLabel>
          <div className={roCls + " text-center"}>{row.hsnCode || "—"}</div>
        </div>
        <div className="col-span-6 md:col-span-3">
          <FieldLabel>Tax (%)</FieldLabel>
          <div className={roCls + " text-center"}>
            {row.taxPct ? (
              <span className="bg-primary/10 text-primary inline-block rounded-full px-1.5 py-0.5 text-xs font-bold">
                {row.taxPct}%
              </span>
            ) : (
              "—"
            )}
          </div>
        </div>
      </div>

      {/* ROW 2: Qty, Basic Price, Taxable, Discount, Net, Action */}
      <div className="grid grid-cols-12 items-end gap-3">
        <div className="col-span-6 md:col-span-1">
          <FieldLabel required>Qty</FieldLabel>
          <input
            type="number"
            min={0}
            value={row.qty}
            readOnly={lockFields}
            onChange={(e) => {
              if (lockFields) return;
              setRow((r) => ({ ...r, qty: e.target.value }));
              setTouched(false);
            }}
            placeholder="Qty"
            className={[
              lockFields ? roCls + " cursor-not-allowed" : iCls,
              "text-right",
              !lockFields && qtyInvalid
                ? "border-red-400 bg-red-50 focus:border-red-400 focus:ring-red-300 dark:border-red-500 dark:bg-red-900/20"
                : "",
            ].join(" ")}
          />
        </div>

        <div className="col-span-6 md:col-span-2">
          <FieldLabel>Basic Price (₹)</FieldLabel>
          <input
            type="number"
            value={row.basicPrice}
            readOnly={lockFields}
            onChange={(e) => {
              if (lockFields) return;
              setRow((r) => ({ ...r, basicPrice: e.target.value }));
            }}
            placeholder="0.00"
            className={
              (lockFields ? roCls + " cursor-not-allowed" : iCls) +
              " text-right"
            }
          />
        </div>

        <div className="col-span-6 md:col-span-2">
          <FieldLabel>Taxable Amount (₹)</FieldLabel>
          <div className={roCls + " text-right"}>
            {row._filled ? FMT2(preview.taxable) : "—"}
          </div>
        </div>

        <div className="col-span-6 md:col-span-2">
          <FieldLabel>Discount (₹)</FieldLabel>
          <input
            type="number"
            min={0}
            value={row.discount}
            readOnly={lockFields}
            onChange={(e) => {
              if (lockFields) return;
              setRow((r) => ({ ...r, discount: e.target.value }));
            }}
            placeholder="0"
            className={
              (lockFields ? roCls + " cursor-not-allowed" : iCls) +
              " text-right"
            }
          />
        </div>

        <div className="col-span-6 md:col-span-3">
          <FieldLabel>Net Amount (₹)</FieldLabel>
          <div
            className={
              roCls +
              " text-right font-semibold text-gray-800 dark:text-gray-100"
            }
          >
            {row._filled ? FMT2(preview.net) : "—"}
          </div>
        </div>

        <div className="col-span-6 flex flex-col md:col-span-2">
          <FieldLabel>Action</FieldLabel>
          <button
            type="button"
            onClick={handleAdd}
            disabled={!hasItem || !(parseFloat(row.qty) > 0)}
            title={
              !hasItem
                ? "Select an item from the dropdown first"
                : !(parseFloat(row.qty) > 0)
                  ? "Enter quantity"
                  : "Add item"
            }
            className={[
              "flex h-9 w-9 items-center justify-center rounded-full transition-all duration-200",
              hasItem && parseFloat(row.qty) > 0
                ? "bg-primary-500 hover:bg-primary-500 text-white shadow-md hover:scale-105 active:scale-95"
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
   CREATE ACCOUNT DRAWER (party "+" button)
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
        <div className="bg-primary-600 flex flex-shrink-0 items-center justify-between px-5 py-4 text-white">
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
interface PartyOption {
  id: number | string;
  name: string;
  mobile?: string;
  balance?: number;
  drOrCr?: string;
  stateName?: string;
}

interface SalesOrderOption {
  id: number | string;
  name: string;
  salesOrderId?: string | number;
  [k: string]: any;
}

interface HdrState {
  soNo: SalesOrderOption[];
  salesDate: string;
  terms: string;
  partyName: PartyOption[];
  salesInvoiceNo: string;
  dueDate: string;
  narration: string;
  branchId: number | null;
}

export default function SalesInvoice() {
  const navigate = useNavigate();
  const [saleType, setSaleType] = useState("so"); // "so" | "manual"
  const [accountDrawerOpen, setAccountDrawerOpen] = useState(false);
  const [items, setItems] = useState(INIT_ITEMS);

  const [itemCatalog, setItemCatalog] = useState<SalesCatalogItem[]>([]);
  const [soItemCatalog, setSoItemCatalog] = useState<SalesCatalogItem[]>([]);

  // ---- Sales Order list ----
  const [soOptions, setSoOptions] = useState<SalesOrderOption[]>([]);
  const [loadingSo, setLoadingSo] = useState(false);

  // ---- Party (Customer) list ----
  const [partyOptions, setPartyOptions] = useState<any[]>([]);
  const [loadingParty, setLoadingParty] = useState(true);

  // ---- Cash / Bank ----
  const [cashAccountOptions, setCashAccountOptions] = useState<any[]>([]);
  const [bankAccountOptions, setBankAccountOptions] = useState<any[]>([]);
  const [cashAccount, setCashAccount] = useState<any[]>([]);
  const [bankAccount, setBankAccount] = useState<any[]>([]);
  const [bankDetailsOpen, setBankDetailsOpen] = useState(false);
  const [bankDetails, setBankDetails] = useState({
    paymentMode: "UPI",
    chequeNo: "",
    chequeDate: "",
    clearDate: "",
    narration: "",
  });

  const [companyState, setCompanyState] = useState<string>("");

  const [hdr, setHdr] = useState<HdrState>({
    soNo: [],
    salesDate: new Date().toISOString().slice(0, 10),
    terms: "Credit",
    partyName: [],
    salesInvoiceNo: "",
    dueDate: "",
    narration: "",
    branchId: null,
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const clearError = (key: string) =>
    setFormErrors((prev) => {
      if (!prev[key]) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });

  const [submitting, setSubmitting] = useState(false);

  const termsValue = hdr.terms;
  const isFromSo = saleType === "so" && hdr.soNo.length > 0;

  const setHInput = useCallback(
    (k: string) => (e: any) => setHdr((h) => ({ ...h, [k]: e.target.value })),
    [setHdr],
  );
  const setHDate = useCallback(
    (k: string) => (val: any) => setHdr((h) => ({ ...h, [k]: val })),
    [setHdr],
  );

  /* ───────── API loads ───────── */

  // Sales Orders — sirf jab "Sales Order" mode ho
  useEffect(() => {
    if (saleType !== "so") return;
    (async () => {
      setLoadingSo(true);
      try {
        const financialYearId = localStorage.getItem("financialYearId");
        const res = await Get(
          "salesorder/list",
          { financialYearId, excludeBilled: true },
          false,
        );
        if (res.data?.success) {
          setSoOptions(
            (res.data.data || []).map((s: any) => ({
              id: s.id || s.salesOrderId,
              salesOrderId: s.id || s.salesOrderId,
              name: s.soNo || "",
              soNumber: s.soNo || "",
              qNo: s.qNo || "",
              partyName: s.partyName || s.name || "",
              orderDate: s.created || "",
            })),
          );
        } else {
          toasterrormsg(res.data?.message || "Failed to load Sales Orders.");
        }
      } catch (err: any) {
        toasterrormsg(
          err?.response?.data?.message || "Failed to load Sales Orders.",
        );
      } finally {
        setLoadingSo(false);
      }
    })();
  }, [saleType]);

  // Item catalog
  useEffect(() => {
    (async () => {
      try {
        const res = await Get("master/itemmaster/vehicle-list", {}, false);
        if (res.data?.success) {
          setItemCatalog((res.data.data || []).map(mapApiItem));
        }
      } catch (err) {}
    })();
  }, []);

  // Next invoice no
  useEffect(() => {
    (async () => {
      try {
        const financialYearId = localStorage.getItem("financialYearId");
        const res = await Get(
          "sales/next-invoice-no",
          { financialYearId },
          false,
        );
        if (res.data?.success) {
          setHdr((h) => ({
            ...h,
            salesInvoiceNo: res.data.data?.invoiceNo || "",
          }));
        } else {
          toasterrormsg(
            res.data?.message || "Failed to generate Sales Invoice No.",
          );
        }
      } catch (err: any) {
        toasterrormsg(
          err?.response?.data?.message ||
            "Failed to generate Sales Invoice No.",
        );
      }
    })();
  }, []);

  // Party (customer) list
  useEffect(() => {
    (async () => {
      try {
        setLoadingParty(true);
        const res = await Get("master/account/customer/list", {}, false);
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
          toasterrormsg(res.data?.message || "Failed to load party list.");
        }
      } catch (err: any) {
        toasterrormsg(
          err?.response?.data?.message || "Failed to load party list.",
        );
      } finally {
        setLoadingParty(false);
      }
    })();
  }, []);

  // Cash accounts
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

  // Bank accounts
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

  // Company state (GST same-state check)
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

  /* ───────── Sales Order select ───────── */
  const handleSoSelect = async (selected: any) => {
    if (!selected) {
      setHdr((h) => ({ ...h, soNo: [], partyName: [], branchId: null }));
      setItems([]);
      setSoItemCatalog([]);
      return;
    }

    setHdr((h) => ({ ...h, soNo: [selected] }));

    try {
      const res = await Get(
        `salesorder/${selected.salesOrderId || selected.id}`,
        {},
        false,
      );
      if (!res.data?.success) {
        toasterrormsg(
          res.data?.message || "Failed to load Sales Order details.",
        );
        return;
      }
      const so = res.data.data;

      // 1. Party auto-fill
      const accountId = so.accountId ?? so.partyId;
      if (accountId) {
        const matched = partyOptions.find((p) => p.id === accountId);
        setHdr((h) => ({
          ...h,
          partyName: [
            matched || {
              id: accountId,
              name: selected.partyName || so.partyName || "Party",
              mobile: "",
              balance: 0,
              drOrCr: "",
              stateName: "",
            },
          ],
        }));
      }

      // 2. Branch
      if (so.branchId) setHdr((h) => ({ ...h, branchId: so.branchId }));

      // 3. SO ke items sirf dropdown catalog banate hain — table khaali, user ✓ dabake add karega
      let catalog: SalesCatalogItem[] = [];

      if (Array.isArray(so.items) && so.items.length > 0) {
        catalog = so.items.map((d: any) => ({
          id: String(d.itemId),
          itemId: d.itemId ?? null,
          itemCode: d.itemCode || "",
          itemName: d.itemName || "",
          unit: d.uom || d.unit || "",
          taxSlab: String(d.taxPct ?? d.gstPct ?? d.taxSlab ?? "0"),
          basicPrice: Number(d.basicPrice ?? d.rate ?? d.salesPrice) || 0,
          hsnCode: d.hsnCode || "",
          qty: Number(d.qty) || 0,
        }));
      } else {
        // Sales Order me single model hota hai (lead ka model) + qty + unitPrice
        const modelId = so.modelId ?? so.model;
        const modelName = String(so.modelName || "")
          .trim()
          .toLowerCase();
        const found = itemCatalog.find(
          (m) =>
            (modelId && String(m.itemId) === String(modelId)) ||
            (modelName && m.itemName.trim().toLowerCase() === modelName),
        );
        if (found) {
          catalog = [
            {
              ...found,
              qty: Number(so.qty) || 1,
              basicPrice: Number(so.unitPrice) || found.basicPrice,
            },
          ];
        } else {
          toasterrormsg("Is Sales Order ka model item list me nahi mila.");
        }
      }

      setSoItemCatalog(catalog);
      setItems([]);
      clearError("items");
      clearError("partyName");
    } catch (err: any) {
      toasterrormsg(
        err?.response?.data?.message || "Failed to load Sales Order items.",
      );
    }
  };

  /* ───────── Derived values ───────── */
  const selectedParty = hdr.partyName[0];

  // Combobox value hamesha data array ke object se hi derive karo (identity mismatch fix)
  const partyComboValue = useMemo(() => {
    if (!selectedParty) return null;
    return partyOptions.find((p) => p.id === selectedParty.id) || selectedParty;
  }, [selectedParty, partyOptions]);

  const cashComboValue = useMemo(() => {
    const sel = cashAccount[0];
    if (!sel) return null;
    return cashAccountOptions.find((c) => c.id === sel.id) || sel;
  }, [cashAccount, cashAccountOptions]);

  const bankComboValue = useMemo(() => {
    const sel = bankAccount[0];
    if (!sel) return null;
    return bankAccountOptions.find((b) => b.id === sel.id) || sel;
  }, [bankAccount, bankAccountOptions]);

  const companyStateClean = companyState?.trim().toLowerCase() || "";
  const partyStateClean = selectedParty?.stateName?.trim().toLowerCase() || "";
  const isSameState =
    !!companyStateClean &&
    !!partyStateClean &&
    companyStateClean === partyStateClean;

  // Summary (sketch): Sub Total, Taxable Amt, CGST, SGST, IGST, Discount, Grand Total
  const subTotal = items.reduce((s: number, i: any) => s + i.taxable, 0);
  const totDiscount = items.reduce((s: number, i: any) => s + i.discount, 0);
  const taxableAmt = subTotal - totDiscount;
  const totTax = items.reduce((s: number, i: any) => s + i.taxAmt, 0);
  const cgstTotal = isSameState ? totTax / 2 : 0;
  const sgstTotal = isSameState ? totTax / 2 : 0;
  const igstTotal = isSameState ? 0 : totTax;
  const grandTotal = taxableAmt + totTax;

  const availableItemCatalog = useMemo(() => {
    const base = isFromSo ? soItemCatalog : itemCatalog;
    return base.filter(
      (cat) => !items.some((it: any) => it.itemId === cat.itemId),
    );
  }, [isFromSo, soItemCatalog, itemCatalog, items]);

  /* ───────── Item actions ───────── */
  // Same itemId pehle se ho to Qty + Discount merge karke recalc, warna naya row
  const addItemFromPreview = (item: any) => {
    setItems((prev) => {
      const idx = prev.findIndex((i: any) => i.itemId === item.itemId);
      if (idx !== -1) {
        const existing = prev[idx];
        const merged = calcItem({
          ...existing,
          qty: (Number(existing.qty) || 0) + (Number(item.qty) || 0),
          discount:
            (Number(existing.discount) || 0) + (Number(item.discount) || 0),
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

  /* ───────── Validation + Save ───────── */
  const validateBeforeSave = (): Record<string, string> => {
    const errors: Record<string, string> = {};

    if (saleType === "so" && hdr.soNo.length === 0)
      errors.soNo = "Please select Sales Order No.";
    if (!selectedParty) errors.partyName = "Please select Party.";
    if (!hdr.salesInvoiceNo?.trim())
      errors.salesInvoiceNo = "Sales Invoice No is required.";
    if (!hdr.salesDate) errors.salesDate = "Sales Date is required.";
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

  const handleSave = async () => {
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
        financialYearId,
        terms: termsValue,
        salesOrderId: isFromSo
          ? hdr.soNo[0]?.salesOrderId || hdr.soNo[0]?.id || null
          : null,
        accountId: selectedParty.id,
        salesInvoiceNo: hdr.salesInvoiceNo,
        salesDate: hdr.salesDate,
        branchId: hdr.branchId,
        dueDate: termsValue === "Credit" ? hdr.dueDate : null,
        narration: hdr.narration,

        subTotal,
        taxableAmount: taxableAmt,
        discountAmount: totDiscount,
        cgstAmount: cgstTotal,
        sgstAmount: sgstTotal,
        igstAmount: igstTotal,
        grandTotal,

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
          itemDescription: i.itemName,
          hsnCode: i.hsnCode,
          uom: i.uom,
          qty: i.qty,
          basicPrice: i.basicPrice,
          amount: i.taxable, // qty × basicPrice
          discount: i.discount,
          taxableAmount: i.taxableAfterDisc, // discount ke baad
          taxPct: i.taxPct,
          taxAmount: i.taxAmt,
          netAmount: i.net,
        })),
      };

      const res = await Post("sales/create", payload, false);
      if (res.data?.success) {
        toastsuccessmsg(
          res.data?.message || "Sales invoice saved successfully.",
        );
        navigate("/purchase-master/sales-register");
      } else {
        toasterrormsg(res.data?.message || "Failed to save sales invoice.");
      }
    } catch (err: any) {
      toasterrormsg(
        err?.response?.data?.message || "Something went wrong while saving.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  /* ───────── UI ───────── */
  return (
    <div className="min-h-screen bg-gray-50 shadow-none dark:bg-gray-900">
      <div className="w-full px-4 py-6 sm:px-6 lg:px-8">
        {/* TOP BAR */}
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-primary border-primary border-b-4 pb-1 text-xl font-extrabold">
            Sales Register
          </h1>
          <Link
            to="/purchase-master/sales-register"
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
              { val: "so", label: "Sales Order" },
              { val: "manual", label: "Manual" },
            ].map(({ val, label }) => (
              <label
                key={val}
                className="group flex cursor-pointer items-center gap-2.5"
              >
                <div className="relative flex items-center">
                  <input
                    type="radio"
                    name="saleType"
                    value={val}
                    checked={saleType === val}
                    onChange={() => {
                      setSaleType(val);
                      // mode badalne par SO se aaya data reset
                      setHdr((h) => ({
                        ...h,
                        soNo: [],
                        partyName: [],
                        branchId: null,
                      }));
                      setItems([]);
                      setSoItemCatalog([]);
                      clearError("soNo");
                    }}
                    className="sr-only"
                  />
                  <div
                    className={
                      "flex h-5 w-5 items-center justify-center rounded-full border-2 transition-all " +
                      (saleType === val
                        ? "border-primary bg-primary"
                        : "group-hover:border-primary/60 border-gray-400 bg-white dark:bg-gray-700")
                    }
                  >
                    {saleType === val && (
                      <div className="h-2 w-2 rounded-full bg-white" />
                    )}
                  </div>
                </div>
                <span
                  className={
                    "text-sm transition-colors " +
                    (saleType === val
                      ? "text-primary font-medium"
                      : "text-gray-600 dark:text-gray-300")
                  }
                >
                  {label}
                </span>
              </label>
            ))}
          </div>

          {saleType === "so" && (
            <div className="mb-5 grid grid-cols-1 gap-4 border-b border-gray-100 pb-5 sm:grid-cols-2 lg:grid-cols-3 dark:border-gray-700">
              <div>
                <FieldLabel required>Select Sales Order No.</FieldLabel>
                <Combobox
                  data={soOptions}
                  displayField="name"
                  value={hdr.soNo[0] || null}
                  onChange={(sel: any) => {
                    handleSoSelect(sel);
                    clearError("soNo");
                  }}
                  placeholder={
                    loadingSo ? "Loading Sales Orders..." : "Select Sales Order"
                  }
                  searchFields={["name", "soNumber", "qNo", "partyName"]}
                />
                {formErrors.soNo && (
                  <p className="mt-1 text-xs text-red-500">{formErrors.soNo}</p>
                )}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
            <div>
              <DatePicker
                label="Sales Date"
                value={hdr.salesDate}
                onChange={(selectedDates: Date[]) => {
                  const picked = selectedDates?.[0];
                  setHDate("salesDate")(picked ? formatDateForApi(picked) : "");
                  clearError("salesDate");
                }}
                placeholder="Select Date"
              />
              {formErrors.salesDate && (
                <p className="mt-1 text-xs text-red-500">
                  {formErrors.salesDate}
                </p>
              )}
            </div>

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

            {termsValue === "Credit" && (
              <div>
                <DatePicker
                  label="Due Date"
                  value={hdr.dueDate}
                  onChange={(selectedDates: Date[]) => {
                    const picked = selectedDates?.[0];
                    setHDate("dueDate")(picked ? formatDateForApi(picked) : "");
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

            {/* Select Party + "+" */}
            <div className="sm:col-span-2">
              <div className="flex justify-between">
                <FieldLabel required>Select Party</FieldLabel>
                {selectedParty && (
                  <span className="text-primary bg-primary/10 border-primary/20 flex-shrink-0 rounded-lg border px-2.5 py-1.5 text-xs font-bold whitespace-nowrap">
                    Bal: ₹{selectedParty.balance?.toLocaleString() ?? "0"}{" "}
                    {selectedParty.drOrCr}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <div className="min-w-0 flex-1">
                  <Combobox
                    data={partyOptions}
                    displayField="name"
                    value={partyComboValue}
                    onChange={(selected: any) => {
                      if (isFromSo) return; // 🔒 SO se locked
                      setHdr((h) => ({
                        ...h,
                        partyName: selected ? [selected] : [],
                      }));
                      clearError("partyName");
                    }}
                    placeholder={
                      loadingParty
                        ? "Loading parties..."
                        : "Select or search party"
                    }
                    searchFields={["name"]}
                    disabled={isFromSo}
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

                {!isFromSo && (
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

            <div>
              <Input
                label="Sales Invoice No."
                placeholder="Enter Sales Invoice No."
                value={hdr.salesInvoiceNo}
                onChange={(e: any) => {
                  setHInput("salesInvoiceNo")(e);
                  clearError("salesInvoiceNo");
                }}
              />
              {formErrors.salesInvoiceNo && (
                <p className="mt-1 text-xs text-red-500">
                  {formErrors.salesInvoiceNo}
                </p>
              )}
            </div>

            <div className="sm:col-span-2 xl:col-span-3">
              <Input
                label="Narration"
                placeholder="Enter narration"
                value={hdr.narration}
                onChange={setHInput("narration")}
              />
            </div>
          </div>

          {/* ── Add Item section ── */}
          <div className="mt-6 border-t border-dashed border-gray-300 pt-5 dark:border-gray-600">
            <h3 className="mb-4 text-xs font-bold tracking-wider text-gray-500 uppercase dark:text-gray-400">
              Add Item
            </h3>
            <AddItemSelector
              itemCatalog={availableItemCatalog}
              onAdd={addItemFromPreview}
              lockFields={isFromSo}
            />
          </div>

          {/* ── Item Details section ── */}
          <div className="mt-6 border-t border-dashed border-gray-300 pt-5 dark:border-gray-600">
            <h3 className="mb-4 text-xs font-bold tracking-wider text-gray-500 uppercase dark:text-gray-400">
              Item Details
            </h3>
            {formErrors.items && (
              <p className="mb-2 text-xs text-red-500">{formErrors.items}</p>
            )}

            <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700">
              <table className="w-full min-w-[1000px]">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50 dark:border-gray-600 dark:bg-gray-700">
                    {[
                      "#",
                      "Item Description / Model",
                      "HSN Code",
                      "Qty",
                      "Basic Price (₹)",
                      "Taxable Amount (₹)",
                      "Discount (₹)",
                      "Tax %",
                      "Tax Amt (₹)",
                      "Net Amount (₹)",
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
                      <td className="px-3 py-2.5 text-sm font-medium whitespace-nowrap text-gray-800 dark:text-gray-100">
                        {item.itemName}
                        {item.itemCode && (
                          <span className="block text-[10px] text-gray-400">
                            {item.itemCode}
                          </span>
                        )}
                      </td>
                      <td className="px-3 py-2.5 text-sm text-gray-600 dark:text-gray-300">
                        {item.hsnCode}
                      </td>
                      <td className="px-3 py-2.5 text-right text-sm font-medium text-gray-800 dark:text-gray-100">
                        {FMT3(item.qty)}
                      </td>
                      <td className="px-3 py-2.5 text-right text-sm text-gray-700 dark:text-gray-200">
                        {FMT2(item.basicPrice)}
                      </td>
                      <td className="px-3 py-2.5 text-right text-sm font-medium text-gray-800 dark:text-gray-100">
                        {FMT2(item.taxable)}
                      </td>
                      <td className="px-3 py-2.5 text-right text-sm text-gray-600 dark:text-gray-300">
                        {FMT2(item.discount)}
                      </td>
                      <td className="px-3 py-2.5 text-center">
                        <span className="bg-primary/10 text-primary rounded-full px-2 py-0.5 text-xs font-bold">
                          {item.taxPct}%
                        </span>
                      </td>
                      <td className="px-3 py-2.5 text-right text-sm text-gray-700 dark:text-gray-200">
                        {FMT2(item.taxAmt)}
                      </td>
                      <td className="px-3 py-2.5 text-right text-sm font-extrabold text-gray-900 dark:text-white">
                        {FMT2(item.net)}
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
                        colSpan={11}
                        className="px-4 py-10 text-center text-sm text-gray-400"
                      >
                        No items added yet. Select items from the Add Item
                        section above.
                      </td>
                    </tr>
                  )}
                </tbody>
                <tfoot>
                  <tr className="bg-primary/5 border-primary/20 border-t-2">
                    <td
                      className="text-primary px-3 py-3 text-sm font-extrabold"
                      colSpan={3}
                    >
                      Total
                    </td>
                    <td className="text-primary px-3 py-3 text-right text-sm font-extrabold">
                      {FMT3(items.reduce((s: number, i: any) => s + i.qty, 0))}
                    </td>
                    <td />
                    <td className="text-primary px-3 py-3 text-right text-sm font-extrabold">
                      {FMT2(subTotal)}
                    </td>
                    <td className="text-primary px-3 py-3 text-right text-sm font-extrabold">
                      {FMT2(totDiscount)}
                    </td>
                    <td />
                    <td className="text-primary px-3 py-3 text-right text-sm font-extrabold">
                      {FMT2(totTax)}
                    </td>
                    <td className="text-primary px-3 py-3 text-right text-sm font-extrabold">
                      {FMT2(grandTotal)}
                    </td>
                    <td />
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </Card>

        {/* BOTTOM: Actions (left) + Summary (right) — sketch jaisa */}
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
          <div className="lg:col-span-1">
            <Card title="Actions">
              <div className="flex flex-col gap-3">
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={submitting}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-green-500 px-4 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:bg-green-600 hover:shadow-md active:bg-green-700 disabled:opacity-50"
                >
                  <Icon.Save /> {submitting ? "Saving..." : "Save"}
                </button>
                {/* <button
                  type="button"
                  className="bg-primary hover:bg-primary/90 active:bg-primary/80 flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:shadow-md"
                >
                  <Icon.Print /> Save & Print
                </button> */}
                <button
                  type="button"
                  className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-gray-300 bg-white px-4 py-3 text-sm font-semibold text-gray-600 transition-all hover:border-red-400 hover:text-red-500 dark:border-gray-600 dark:bg-transparent dark:text-gray-300 dark:hover:border-red-500 dark:hover:text-red-400"
                  onClick={() => navigate("/purchase-master/sales-register")}
                >
                  <Icon.Close /> Cancel
                </button>
              </div>
            </Card>
          </div>

          <div className="lg:col-span-1 lg:col-start-3">
            <Card title="Summary">
              <div className="mb-4 space-y-0">
                {[
                  ["Sub Total", subTotal],
                  ["Taxable Amt", taxableAmt],
                  ...(!selectedParty
                    ? []
                    : isSameState
                      ? [
                          ["CGST", cgstTotal],
                          ["SGST", sgstTotal],
                        ]
                      : [["IGST", igstTotal]]),
                  ["Discount", totDiscount],
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
                <span className="text-sm font-bold tracking-wide text-blue-700 uppercase dark:text-blue-300">
                  Grand Total
                </span>
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
        </div>
      </div>

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
