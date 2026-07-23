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
    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
    </svg>
  ),
  Plus: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
    </svg>
  ),
  Upload: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
    </svg>
  ),
  Trash: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </svg>
  ),
  Close: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  ),
  Save: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
    </svg>
  ),
  Print: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
    </svg>
  ),
  File: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  ),
  CloudUp: () => (
    <svg className="w-10 h-10" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
    </svg>
  ),
  Paperclip: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.586-6.586a4 4 0 00-5.656-5.656l-6.586 6.586a6 6 0 108.485 8.485L20.5 13" />
    </svg>
  ),
  Search: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
  ),
  Car: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M13 16H6l-2-5 3-3h8l3 3-1 5zm4-5h2l1 5h-4" />
    </svg>
  ),
  Check: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  ),
  UploadCloud: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
    </svg>
  ),
  Bank: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 21h18M4 10h16M12 3L4 7v3h16V7l-8-4zM6 10v8m4-8v8m4-8v8m4-8v8" />
    </svg>
  ),
};

/* ─────────────────────────────────────────────
   HELPERS
───────────────────────────────────────────── */
const INR = (n: number) =>
  "₹ " + Number(n || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const FMT3 = (n: number) =>
  Number(n || 0).toLocaleString("en-IN", { minimumFractionDigits: 3, maximumFractionDigits: 3 });

const FMT2 = (n: number) =>
  Number(n || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

function numInWords(amount: number): string {
  const a = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine",
    "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"];
  const b = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];
  const words = (n: number): string => {
    if (n === 0) return "";
    if (n < 20) return a[n] + " ";
    if (n < 100) return b[Math.floor(n / 10)] + " " + a[n % 10] + " ";
    if (n < 1000) return a[Math.floor(n / 100)] + " Hundred " + words(n % 100);
    if (n < 100000) return words(Math.floor(n / 1000)) + "Thousand " + words(n % 1000);
    if (n < 10000000) return words(Math.floor(n / 100000)) + "Lakh " + words(n % 100000);
    return words(Math.floor(n / 10000000)) + "Crore " + words(n % 10000000);
  };
  return (words(Math.round(amount)) + "Only").replace(/\s+/g, " ").trim();
}

function calcItem(item: any): any {
  const taxable = (item.qty || 0) * (item.rate || 0) * (1 - (item.discount || 0) / 100);
  const gstAmt = taxable * (item.gstPct || 18) / 100;
  return { ...item, taxable, gstAmt, total: taxable + gstAmt };
}

/* ─────────────────────────────────────────────
   SHARED FORM PRIMITIVES
───────────────────────────────────────────── */
function FieldLabel({ children, required }: any) {
  return (
    <label className="block text-sm mb-1 text-gray-700 dark:text-gray-300">
      {children}{required && <span className="text-red-500 ml-0.5">*</span>}
    </label>
  );
}

function Card({ title, titleRight, children, className = "" }: any) {
  return (
    <div className={"bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm " + className}>
      {title && (
        <div className="px-5 py-3 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">{title}</h3>
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

const PO_OPTIONS = [{ id: 1, name: "PO-2026-001" }, { id: 2, name: "PO-2026-002" }, { id: 3, name: "PO-2026-003" }];
const LOCATION_OPTIONS = [{ id: 0, name: "Main Branch" }];

const TERMS_OPTIONS = [
  { id: "Credit", name: "Credit" },
  { id: "Cash", name: "Cash" },
  { id: "Bank", name: "Bank" },
];

const UOM_OPTIONS = [{ id: 1, name: "KG" }, { id: 2, name: "NOS" }, { id: 3, name: "MTR" }, { id: 4, name: "LTR" }, { id: 5, name: "PCS" }, { id: 6, name: "SET" }];
const GST_OPTIONS = [{ id: 1, name: "28%" }, { id: 2, name: "18%" }, { id: 3, name: "12%" }, { id: 4, name: "5%" }, { id: 5, name: "0%" }];
const ITEM_NAME_OPTIONS = [{ id: 1, name: "MS Plate 10 MM" }, { id: 2, name: "MS Channel 100 MM" }, { id: 3, name: "MS Beam 200 MM" }, { id: 4, name: "Hydraulic Cylinder 5 Ton" }, { id: 5, name: "13T Axle" }];
const MODEL_OPTIONS = [{ id: 1, name: "ACCESS 125" }, { id: 2, name: "GIXXER" }, { id: 3, name: "BURGMAN" }, { id: 4, name: "AVENIS" }, { id: 5, name: "SWISH" }];
const VARIANT_OPTIONS = [{ id: 1, name: "STD" }, { id: 2, name: "DRUM" }, { id: 3, name: "DRUM SE" }, { id: 4, name: "DISC SE" }, { id: 5, name: "DISC BC" }];
const COLOUR_OPTIONS = [{ id: 1, name: "Pearl White" }, { id: 2, name: "Metallic Blue" }, { id: 3, name: "Solid Green" }, { id: 4, name: "Metallic Red" }, { id: 5, name: "Matte Black" }];
const TAX_TYPE_OPTIONS = [{ id: 1, name: "GST 28%" }, { id: 2, name: "GST 18%" }, { id: 3, name: "GST 12%" }, { id: 4, name: "GST 5%" }, { id: 5, name: "Exempt" }];
const MODEL_TYPE_OPTIONS = [{ id: 1, name: "Scooter" }, { id: 2, name: "Motorcycle" }, { id: 3, name: "Electric" }];
const VEHICLE_TYPE_OPTIONS = [{ id: 1, name: "2W" }, { id: 2, name: "3W" }, { id: 3, name: "4W" }, { id: 4, name: "CV" }];
const FUEL_TYPE_OPTIONS = [{ id: 1, name: "Petrol" }, { id: 2, name: "Diesel" }, { id: 3, name: "Electric" }, { id: 4, name: "CNG" }, { id: 5, name: "Hybrid" }];
const GROUP_OPTIONS = [{ id: 1, name: "Sundry Creditors" }, { id: 2, name: "Sundry Debtors" }, { id: 3, name: "Bank Accounts" }, { id: 4, name: "Cash in Hand" }, { id: 5, name: "Loans (Liability)" }];
const STATE_OPTIONS = [{ id: 1, name: "Gujarat" }, { id: 2, name: "Maharashtra" }, { id: 3, name: "Rajasthan" }, { id: 4, name: "Karnataka" }, { id: 5, name: "Tamil Nadu" }, { id: 6, name: "Delhi" }, { id: 7, name: "Punjab" }];
const DISTRICT_OPTIONS = [{ id: 1, name: "Ahmedabad" }, { id: 2, name: "Surat" }, { id: 3, name: "Rajkot" }, { id: 4, name: "Vadodara" }, { id: 5, name: "Amreli" }, { id: 6, name: "Bhavnagar" }, { id: 7, name: "Junagadh" }];

const ITEM_MASTER = [
  { itemCode: "RM-PLT-001", itemName: "MS Plate 10 MM", hsnCode: "72085100", uom: "KG", rate: 65, discount: 0, gstPct: 18 },
  { itemCode: "RM-CHN-001", itemName: "MS Channel 100 MM", hsnCode: "72166100", uom: "KG", rate: 62, discount: 0, gstPct: 18 },
  { itemCode: "RM-BEM-001", itemName: "MS Beam 200 MM", hsnCode: "72166100", uom: "KG", rate: 61, discount: 0, gstPct: 18 },
  { itemCode: "PI-HYD-001", itemName: "Hydraulic Cylinder 5 Ton", hsnCode: "84122100", uom: "NOS", rate: 18500, discount: 0, gstPct: 18 },
  { itemCode: "PI-AXL-001", itemName: "13T Axle", hsnCode: "87169090", uom: "NOS", rate: 45000, discount: 0, gstPct: 18 },
  { itemCode: "RM-ROD-001", itemName: "MS Round Rod 20 MM", hsnCode: "72141000", uom: "KG", rate: 58, discount: 0, gstPct: 18 },
  { itemCode: "RM-SQR-001", itemName: "MS Square Bar 25 MM", hsnCode: "72142000", uom: "KG", rate: 60, discount: 0, gstPct: 18 },
];

const INIT_ITEMS: any[] = [];

/* ─────────────────────────────────────────────
   INLINE SEARCH ROW
───────────────────────────────────────────── */
const EMPTY_ROW = { itemId: null as number | null, itemCode: "", itemName: "", hsnCode: "", uom: "", qty: "", rate: "", discount: "0", gstPct: "", _codeQ: "", _nameQ: "", _filled: false };

function InlineSearchRow({
  onAdd,
  initialRow,
  onClearPreview,
  onOpenVehicleDrawer,
  itemCatalog, // 👈 parent se aata hai (real API data)
}: {
  onAdd: (item: any) => void;
  initialRow?: any;
  onClearPreview?: () => void;
  onOpenVehicleDrawer: () => void;
  itemCatalog: VehicleCatalogItem[]; // 👈 same type jo VehicleItemDrawer use karta hai
}) {
  const [row, setRow] = useState({ ...EMPTY_ROW });
  const [codeSug, setCodeSug] = useState<VehicleCatalogItem[]>([]);
  const [nameSug, setNameSug] = useState<VehicleCatalogItem[]>([]);
  const [showCode, setShowCode] = useState(false);
  const [showName, setShowName] = useState(false);
  const [touched, setTouched] = useState(false);
  const codeRef = useRef<HTMLDivElement>(null);
  const nameRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (codeRef.current && !codeRef.current.contains(e.target as Node)) setShowCode(false);
      if (nameRef.current && !nameRef.current.contains(e.target as Node)) setShowName(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const fill = (m: VehicleCatalogItem) => {
    setRow({
      itemId: m.itemId,              // 👈 itemId bhi row mein store hota hai
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
    setShowCode(false); setShowName(false); setTouched(false);
  };

  useEffect(() => {
    if (initialRow) {
      setRow({ ...EMPTY_ROW, ...initialRow, _codeQ: initialRow.itemCode || "", _nameQ: initialRow.itemName || "", _filled: true });
      setTouched(false);
    }
  }, [initialRow]);

  const onCode = (v: string) => {
    setRow(r => ({ ...r, _codeQ: v, _filled: false, itemCode: v, itemId: null })); // 👈 typed manually to itemId reset
    const q = v.trim().toLowerCase();
    if (q) { setCodeSug(itemCatalog.filter(m => m.itemCode.toLowerCase().includes(q))); setShowCode(true); }
    else { setCodeSug([]); setShowCode(false); }
  };
  const onName = (v: string) => {
    setRow(r => ({ ...r, _nameQ: v, _filled: false, itemName: v, itemId: null }));
    const q = v.trim().toLowerCase();
    if (q) { setNameSug(itemCatalog.filter(m => m.itemName.toLowerCase().includes(q))); setShowName(true); }
    else { setNameSug([]); setShowName(false); }
  };

  const handleAdd = () => {
    setTouched(true);
    if (!row.itemCode || !row.itemName || !row.qty) return;
    if (!row.itemId) return; // 👈 itemId ke bina add hi nahi hone dena — validation ka core fix
    onAdd(calcItem({
      id: Date.now(),
      itemId: row.itemId,   // 👈 item ke saath itemId bhi jaata hai
      itemCode: row.itemCode,
      itemName: row.itemName,
      hsnCode: row.hsnCode,
      uom: row.uom,
      qty: parseFloat(row.qty) || 0,
      rate: parseFloat(row.rate) || 0,
      discount: parseFloat(row.discount) || 0,
      gstPct: parseFloat(row.gstPct) || 0,
    }));
    setRow({ ...EMPTY_ROW }); setTouched(false);
    if (onClearPreview) onClearPreview();
  };

  const qty = parseFloat(row.qty) || 0;
  const rate = parseFloat(row.rate) || 0;
  const disc = parseFloat(row.discount) || 0;
  const gstN = parseFloat(row.gstPct) || 0;
  const taxable = qty * rate * (1 - disc / 100);
  const gstAmt = taxable * gstN / 100;
  const total = taxable + gstAmt;

  const qtyInvalid = touched && !row.qty;
  const itemNotSelected = touched && (row.itemCode || row.itemName) && !row.itemId;

  const iCls = "w-full px-2 py-[7px] text-xs border rounded-lg bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary placeholder-gray-300 dark:placeholder-gray-600 transition-all";
  const roCls = "w-full px-2 py-[7px] text-xs border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed select-none";

  const SugDrop = ({ items, onSel }: { items: VehicleCatalogItem[], onSel: (m: VehicleCatalogItem) => void }) => (
    <div className="absolute top-full left-0 z-[100] w-72 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-600 max-h-52 overflow-y-auto mt-1">
      {items.length === 0
        ? <p className="px-3 py-3 text-xs text-gray-400 text-center">No items found</p>
        : items.map(m => (
          <div key={m.itemId} onMouseDown={() => onSel(m)} className="px-3 py-2.5 cursor-pointer hover:bg-primary/8 dark:hover:bg-primary/20 border-b border-gray-50 dark:border-gray-700 last:border-0 group">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-primary">{m.itemCode}</span>
              <span className="text-[10px] bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 px-1.5 py-0.5 rounded-full">{m.unit}</span>
            </div>
            <p className="text-xs text-gray-700 dark:text-gray-200 mt-0.5">{m.itemName}</p>
            <p className="text-[10px] text-gray-400 mt-0.5">₹{m.salesPrice.toLocaleString()} · GST {m.taxSlab}%</p>
          </div>
        ))
      }
    </div>
  );

  return (
    <tr className="border-b-2 border-primary/30 bg-gradient-to-r from-blue-50/80 to-indigo-50/40 dark:from-blue-900/20 dark:to-indigo-900/10">
      <td className="px-2 py-2.5 text-center">
        <Button color="primary" onClick={onOpenVehicleDrawer} className="gap-1.5">
          <Icon.Plus />
        </Button>
      </td>

      <td className="px-2 py-2.5">
        <div ref={codeRef} className="relative">
          <div className="relative flex items-center">
            <input type="text" value={row._codeQ} onChange={e => onCode(e.target.value)} placeholder="Search code..." className={iCls + " border-gray-300 dark:border-gray-600 pr-6"} />
            {row._codeQ && (
              <button type="button" onMouseDown={() => { setRow({ ...EMPTY_ROW }); if (onClearPreview) onClearPreview(); }} className="absolute right-1.5 text-gray-300 hover:text-gray-500 transition-colors">
                <Icon.Close />
              </button>
            )}
          </div>
          {showCode && <SugDrop items={codeSug} onSel={fill} />}
          {itemNotSelected && (
            <p className="text-[10px] font-medium text-red-500 mt-1">Please select an item from the list</p>
          )}
        </div>
      </td>

      <td className="px-2 py-2.5">
        <div ref={nameRef} className="relative min-w-[160px]">
          <input type="text" value={row._nameQ} onChange={e => onName(e.target.value)} placeholder="Search name..." className={iCls + " border-gray-300 dark:border-gray-600"} />
          {showName && <SugDrop items={nameSug} onSel={fill} />}
        </div>
      </td>

      <td className="px-2 py-2.5"><div className={roCls + " text-center"}>{row.hsnCode || "—"}</div></td>
      <td className="px-2 py-2.5"><div className={roCls + " text-center"}>{row.uom || "—"}</div></td>

      <td className="px-2 py-2.5 w-20">
        <div className="relative">
          <input
            type="number" min={0}
            value={row.qty}
            onChange={e => { setRow(r => ({ ...r, qty: e.target.value })); setTouched(false); }}
            placeholder="Qty"
            className={[
              iCls, "text-right",
              qtyInvalid
                ? "border-red-400 dark:border-red-500 bg-red-50 dark:bg-red-900/20 focus:ring-red-300 focus:border-red-400"
                : row.qty
                  ? "border-green-400 dark:border-green-600 focus:ring-green-300 focus:border-green-400"
                  : "border-orange-300 dark:border-orange-600",
            ].join(" ")}
          />
          {qtyInvalid && (
            <div className="absolute -bottom-5 left-0 flex items-center gap-1 whitespace-nowrap">
              <svg className="w-3 h-3 text-red-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <span className="text-[10px] font-medium text-red-500">Required</span>
            </div>
          )}
        </div>
      </td>

      <td className="px-2 py-2.5">
        <input type="number" value={row.rate} onChange={e => setRow(r => ({ ...r, rate: e.target.value }))} placeholder="0.00" className={iCls + " text-right border-gray-300 dark:border-gray-600"} />
      </td>

      <td className="px-2 py-2.5 w-20">
        <input type="number" value={row.discount} onChange={e => setRow(r => ({ ...r, discount: e.target.value }))} placeholder="0" className={iCls + " text-right border-gray-300 dark:border-gray-600"} />
      </td>

      <td className="px-2 py-2.5"><div className={roCls + " text-right"}>{(row._filled || row.qty) ? FMT2(taxable) : "—"}</div></td>

      <td className="px-2 py-2.5 text-center">
        {row.gstPct
          ? <span className="bg-primary/10 text-primary px-2 py-0.5 rounded-full font-bold text-xs">{row.gstPct}%</span>
          : <span className="text-gray-300 text-xs">—</span>}
      </td>

      <td className="px-2 py-2.5"><div className={roCls + " text-right"}>{(row._filled || row.qty) ? FMT2(gstAmt) : "—"}</div></td>

      <td className="px-2 py-2.5"><div className={roCls + " text-right font-semibold text-gray-700 dark:text-gray-300"}>{(row._filled || row.qty) ? FMT2(total) : "—"}</div></td>

      <td className="px-2 py-2.5 text-center">
        <button
          type="button" onClick={handleAdd}
          title={!row.itemId ? "Select an item from the list first" : !row.qty ? "Enter quantity" : "Add item"}
          className={[
            "w-8 h-8 rounded-full flex items-center justify-center mx-auto transition-all duration-200",
            row.itemId && row.qty
              ? "bg-green-500 hover:bg-green-600 text-white shadow-lg hover:shadow-green-200 hover:scale-110 active:scale-95"
              : "bg-gray-100 dark:bg-gray-700 text-gray-300 dark:text-gray-600 cursor-not-allowed",
          ].join(" ")}
        >
          <Icon.Check />
        </button>
      </td>
    </tr>
  );
}

function BankDetailsDrawer({ open, onClose, bankDetails, setBankDetails }: any) {
  const sf = (k: string, v: any) => setBankDetails((b: any) => ({ ...b, [k]: v }));
  const PAYMENT_MODES = ["UPI", "NEFT", "RTGS", "IMPS", "CHEQUE", "CARD"];
  const [touched, setTouched] = useState(false);

  const handleSave = () => {
    setTouched(true);
    if (!bankDetails.paymentMode) return;
    if (bankDetails.paymentMode === "CHEQUE" && (!bankDetails.chequeNo.trim() || !bankDetails.chequeDate.trim())) return;
    onClose();
    setTouched(false);
  };

  return (
    <>
      {open && <div className="fixed inset-0 bg-black/40 z-40" onClick={onClose} />}
      <div className={"fixed top-0 right-0 h-full lg:w-[40%] bg-white dark:bg-gray-800 z-50 shadow-2xl flex flex-col transition-transform duration-300 " + (open ? "translate-x-0" : "translate-x-full")}>
        <div className="flex items-center justify-between px-5 py-4 bg-primary text-white flex-shrink-0">
          <h3 className="font-bold text-base">Bank Details</h3>
          <Button variant="flat" onClick={onClose} className="!text-white hover:!bg-white/20"><Icon.Close /></Button>
        </div>
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          <div>
            <FieldLabel required>Payment Mode</FieldLabel>
            <div className="grid grid-cols-3 gap-2">
              {PAYMENT_MODES.map(mode => (
                <label key={mode} className="flex items-center gap-2 text-sm cursor-pointer border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 hover:border-primary/50">
                  <input type="radio" name="paymentMode" checked={bankDetails.paymentMode === mode} onChange={() => sf("paymentMode", mode)} />
                  {mode}
                </label>
              ))}
            </div>
            {touched && !bankDetails.paymentMode && (
              <p className="text-xs text-red-500 mt-1">Please select a payment mode.</p>
            )}
          </div>

          {bankDetails.paymentMode === "CHEQUE" && (
            <div className="grid grid-cols-2 gap-3">
              <Input label="Cheque No *" placeholder="Cheque No" value={bankDetails.chequeNo} onChange={(e: any) => sf("chequeNo", e.target.value)} />
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
              onChange={e => sf("narration", e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary dark:text-gray-200 bg-white dark:bg-gray-800"
            />
          </div>
        </div>
        <div className="px-5 py-4 border-t border-gray-100 dark:border-gray-700 flex gap-3 justify-end bg-gray-50 dark:bg-gray-900 flex-shrink-0">
          <Button variant="outlined" color="secondary" onClick={onClose}>Cancel</Button>
          <Button color="primary" onClick={handleSave} className="gap-2"><Icon.Save /> Save Bank Details</Button>
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
});

function VehicleItemDrawer({ open, onClose, onSelect, onOpenAdd }: any) {
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [catalog, setCatalog] = useState<VehicleCatalogItem[]>([]);
  const [loading, setLoading] = useState(false);

  // ---- Fetch vehicle items dynamically ----
  useEffect(() => {
    if (!open) return;
    (async () => {
      setLoading(true);
      try {
        const res = await Get("master/itemmaster/vehicle-list", {}, false);
        if (res.data?.success) {
          setCatalog((res.data.data || []).map(mapApiVehicleItem));
        }
      } catch (err) {
        // fail silently, empty table shown
      } finally {
        setLoading(false);
      }
    })();
  }, [open]);

  const filtered = catalog.filter(v =>
    v.itemName.toLowerCase().includes(search.toLowerCase()) ||
    v.itemCode.toLowerCase().includes(search.toLowerCase()) ||
    v.categoryName.toLowerCase().includes(search.toLowerCase()) ||
    v.groupName.toLowerCase().includes(search.toLowerCase()) ||
    v.barcode.toLowerCase().includes(search.toLowerCase())
  );

  const handleConfirm = () => {
    const v = catalog.find(v => v.id === selectedId);
    if (!v) return;

    // ---- Validation (jaisi purane InlineSearchRow/AddItemDrawer mein thi) ----
    if (!v.itemCode || !v.itemName) return;
    if (!v.salesPrice || v.salesPrice <= 0) return;

    onSelect(calcItem({
      id: Date.now() + Math.random(),
      itemId: v.itemId,
      itemCode: v.itemCode,
      itemName: v.itemName,
      hsnCode: v.hsnCode || "87112090",
      uom: v.unit,
      qty: 1,
      rate: v.salesPrice,
      discount: 0,
      gstPct: parseFloat(v.taxSlab) || 0,
    }));
    setSelectedId(null);
    onClose();
  };

  return (
    <>
      {open && <div className="fixed inset-0 bg-black/40 z-40" onClick={onClose} />}
      <div className={"fixed top-0 right-0 h-full lg:w-[60%] bg-white dark:bg-gray-800 z-50 shadow-2xl flex flex-col transition-transform duration-300 " + (open ? "translate-x-0" : "translate-x-full")}>
        <div className="flex items-center justify-between px-5 py-4 bg-primary text-white flex-shrink-0">
          <div className="flex items-center gap-2"><Icon.Car /><h3 className="font-bold text-base">Vehicle Details</h3></div>
          <Button variant="flat" onClick={onClose} className="!text-white hover:!bg-white/20"><Icon.Close /></Button>
        </div>
        <div className="px-5 py-3 flex gap-3 border-b border-gray-100 dark:border-gray-700 flex-shrink-0">
          <Input value={search} onChange={(e: any) => setSearch(e.target.value)} placeholder="Search by item code, name, category, group, barcode..." prefix={<Icon.Search />} />
          <Button color="primary" variant="outlined" onClick={() => onOpenAdd && onOpenAdd()} className="shrink-0 w-9 h-9 !p-0 flex items-center justify-center"><Icon.Plus /></Button>
        </div>
        <div className="flex-1 overflow-auto">
          <table className="w-full min-w-[800px]">
            <thead className="sticky top-0 bg-gray-50 dark:bg-gray-700 z-10">
              <tr className="border-b border-gray-200 dark:border-gray-600">
                <th className="px-3 py-3 w-10" />
                {["Item Code", "Item Name", "Category", "Group", "Unit", "Tax", "Sales Price", "Barcode"].map(h => (
                  <th key={h} className="px-3 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={9} className="px-4 py-8 text-center text-sm text-gray-400">Loading...</td></tr>
              ) : filtered.map(v => (
                <tr key={v.id} onClick={() => setSelectedId(p => p === v.id ? null : v.id)}
                  className={"border-b border-gray-100 dark:border-gray-700 cursor-pointer transition-colors " + (selectedId === v.id ? "bg-primary/5" : "hover:bg-gray-50 dark:hover:bg-gray-700")}>
                  <td className="px-3 py-2.5">
                    <div className={"w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all " + (selectedId === v.id ? "border-primary bg-primary" : "border-gray-300 dark:border-gray-500")}>
                      {selectedId === v.id && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                    </div>
                  </td>
                  <td className="px-3 py-2.5 text-sm font-medium text-gray-800 dark:text-gray-100">{v.itemCode}</td>
                  <td className="px-3 py-2.5 text-sm text-gray-600 dark:text-gray-300">{v.itemName}</td>
                  <td className="px-3 py-2.5 text-sm text-gray-600 dark:text-gray-300">{v.categoryName}</td>
                  <td className="px-3 py-2.5 text-sm text-gray-600 dark:text-gray-300">{v.groupName}</td>
                  <td className="px-3 py-2.5 text-sm text-gray-600 dark:text-gray-300">{v.unit}</td>
                  <td className="px-3 py-2.5 text-sm text-gray-600 dark:text-gray-300">{v.taxSlab}%</td>
                  <td className="px-3 py-2.5 text-sm font-medium text-gray-800 dark:text-gray-100">₹{v.salesPrice.toLocaleString()}</td>
                  <td className="px-3 py-2.5 text-sm text-gray-600 dark:text-gray-300">{v.barcode}</td>
                </tr>
              ))}
              {!loading && filtered.length === 0 && <tr><td colSpan={9} className="px-4 py-8 text-center text-sm text-gray-400">No items found.</td></tr>}
            </tbody>
          </table>
        </div>
        <div className="px-5 py-4 border-t border-gray-100 dark:border-gray-700 flex gap-3 justify-between items-center bg-gray-50 dark:bg-gray-900 flex-shrink-0">
          <span className="text-sm font-medium text-gray-500">{selectedId ? "1 item selected" : "No item selected"}</span>
          <div className="flex gap-3">
            <Button variant="outlined" color="secondary" onClick={onClose}>Cancel</Button>
            <Button color="primary" onClick={handleConfirm} disabled={!selectedId} className="gap-2"><Icon.Plus /> Add Selected</Button>
          </div>
        </div>
      </div>
    </>
  );
}

/* ─────────────────────────────────────────────
   ADD VEHICLE ITEM DRAWER
───────────────────────────────────────────── */
function AddVehicleItemDrawer({ open, onClose, onAdd }: any) {
  const empty: any = { model: [], variant: [], colour: [], itemName: "", itemCode: "", shortName: "", hsnCode: "", taxType: [], listOfGroup: "", unit: [], wireBattery: "", modelType: [], vehicleType: [], typeOfFuel: [], fuelCapacity: "", purchasePriceNoGST: "", purchasePrice: "", status: true };
  const [form, setForm] = useState(empty);
  const sf = (k: string, v: any) => setForm((f: any) => ({ ...f, [k]: v }));
  const handleAdd = () => {
    if (!form.itemName) return;
    onAdd(calcItem({ id: Date.now(), itemCode: form.itemCode || "VEH-" + Date.now(), itemName: form.itemName, hsnCode: form.hsnCode || "87112090", uom: form.unit[0]?.name || "NOS", qty: 1, rate: parseFloat(form.purchasePriceNoGST) || 0, discount: 0, gstPct: 28, colour: form.colour[0]?.name || "", model: form.model[0]?.name || "", variant: form.variant[0]?.name || "" }));
    setForm(empty); onClose();
  };
  return (
    <>
      {open && <div className="fixed inset-0 bg-black/40 z-40" onClick={onClose} />}
      <div className={"fixed top-0 right-0 h-full lg:w-[50%] bg-white dark:bg-gray-800 z-50 shadow-2xl flex flex-col transition-transform duration-300 " + (open ? "translate-x-0" : "translate-x-full")}>
        <div className="flex items-center justify-between px-5 py-4 bg-primary text-white flex-shrink-0">
          <h3 className="font-bold text-base">Add Vehicle Item</h3>
          <Button variant="flat" onClick={onClose} className="!text-white hover:!bg-white/20"><Icon.Close /></Button>
        </div>
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          <div className="grid grid-cols-3 gap-3">
            <div><FieldLabel>Select Model</FieldLabel><Listbox data={MODEL_OPTIONS} value={form.model} onChange={(v: any) => sf("model", v)} displayField="name" placeholder="Model" /></div>
            <div><FieldLabel>Select Variant</FieldLabel><Listbox data={VARIANT_OPTIONS} value={form.variant} onChange={(v: any) => sf("variant", v)} displayField="name" placeholder="Variant" /></div>
            <div><FieldLabel>Select Colour</FieldLabel><Listbox data={COLOUR_OPTIONS} value={form.colour} onChange={(v: any) => sf("colour", v)} displayField="name" placeholder="Colour" /></div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <Input label="Item Name *" placeholder="Item name" value={form.itemName} onChange={(e: any) => sf("itemName", e.target.value)} />
            <Input label="Code No." placeholder="Code" value={form.itemCode} onChange={(e: any) => sf("itemCode", e.target.value)} />
            <Input label="Short Name" placeholder="Short name" value={form.shortName} onChange={(e: any) => sf("shortName", e.target.value)} />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <Input label="HSN Code" placeholder="HSN Code" value={form.hsnCode} onChange={(e: any) => sf("hsnCode", e.target.value)} />
            <div><FieldLabel>Tax Type</FieldLabel><Listbox data={TAX_TYPE_OPTIONS} value={form.taxType} onChange={(v: any) => sf("taxType", v)} displayField="name" placeholder="Tax Type" /></div>
            <Input label="List of Group" placeholder="Enter groups" value={form.listOfGroup} onChange={(e: any) => sf("listOfGroup", e.target.value)} />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div><FieldLabel>Unit</FieldLabel><Listbox data={UOM_OPTIONS} value={form.unit} onChange={(v: any) => sf("unit", v)} displayField="name" placeholder="Unit" /></div>
            <Input label="Wire Battery" placeholder="Wire battery" value={form.wireBattery} onChange={(e: any) => sf("wireBattery", e.target.value)} />
            <div><FieldLabel>Model Type</FieldLabel><Listbox data={MODEL_TYPE_OPTIONS} value={form.modelType} onChange={(v: any) => sf("modelType", v)} displayField="name" placeholder="Model Type" /></div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div><FieldLabel>Vehicle Type</FieldLabel><Listbox data={VEHICLE_TYPE_OPTIONS} value={form.vehicleType} onChange={(v: any) => sf("vehicleType", v)} displayField="name" placeholder="Type" /></div>
            <div><FieldLabel>Type of Fuel</FieldLabel><Listbox data={FUEL_TYPE_OPTIONS} value={form.typeOfFuel} onChange={(v: any) => sf("typeOfFuel", v)} displayField="name" placeholder="Fuel" /></div>
            <Input label="Fuel Capacity" placeholder="Fuel capacity" value={form.fuelCapacity} onChange={(e: any) => sf("fuelCapacity", e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input label="Purchase Price (Without GST) *" placeholder="Price (no GST)" value={form.purchasePriceNoGST} onChange={(e: any) => sf("purchasePriceNoGST", e.target.value)} type="number" />
            <Input label="Purchase Price (Dealer) *" placeholder="Dealer price" value={form.purchasePrice} onChange={(e: any) => sf("purchasePrice", e.target.value)} type="number" />
          </div>
          <div className="flex items-center justify-between border border-gray-200 dark:border-gray-600 rounded-lg px-4 py-3 bg-gray-50 dark:bg-gray-700">
            <span className="text-sm dark:text-gray-300">Status</span>
            <button type="button" onClick={() => sf("status", !form.status)} className={"relative inline-flex w-10 h-5 rounded-full transition-colors " + (form.status ? "bg-primary" : "bg-gray-300")}>
              <span className={"inline-block w-4 h-4 mt-0.5 bg-white rounded-full shadow transform transition-transform " + (form.status ? "translate-x-5" : "translate-x-0.5")} />
            </button>
          </div>
        </div>
        <div className="px-5 py-4 border-t border-gray-100 dark:border-gray-700 flex gap-3 justify-end bg-gray-50 dark:bg-gray-900 flex-shrink-0">
          <Button variant="outlined" color="secondary" onClick={onClose}>Close</Button>
          <Button color="primary" onClick={handleAdd} className="gap-2"><Icon.Save /> Save</Button>
        </div>
      </div>
    </>
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
  const qty = parseFloat(form.qty) || 0, rate = parseFloat(form.rate) || 0, disc = parseFloat(form.discount) || 0;
  const gstNum = parseFloat(form.gstPct?.[0]?.name || "18") || 18;
  const taxable = qty * rate * (1 - disc / 100), total = taxable * (1 + gstNum / 100);
  const handleAdd = () => {
    if (!form.itemName[0] || !form.qty || !form.rate) return;
    onAdd(calcItem({ ...form, id: Date.now(), itemName: form.itemName[0]?.name || "", uom: form.uom[0]?.name || "KG", gstPct: gstNum, qty: parseFloat(form.qty), rate: parseFloat(form.rate), discount: parseFloat(form.discount) || 0 }));
    setForm(empty); onClose();
  };
  return (
    <>
      {open && <div className="fixed inset-0 bg-black/40 z-40" onClick={onClose} />}
      <div className={"fixed top-0 right-0 h-full w-[400px] bg-white dark:bg-gray-800 z-50 shadow-2xl flex flex-col transition-transform duration-300 " + (open ? "translate-x-0" : "translate-x-full")}>
        <div className="flex items-center justify-between px-5 py-4 bg-primary text-white flex-shrink-0">
          <h3 className="font-bold text-base">Add Item</h3>
          <Button variant="flat" onClick={onClose} className="!text-white hover:!bg-white/20"><Icon.Close /></Button>
        </div>
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Input label="Item Code" placeholder="Item code" value={form.itemCode} onChange={(e: any) => sf("itemCode", e.target.value)} />
            <div><FieldLabel>UOM</FieldLabel><Listbox data={UOM_OPTIONS} value={form.uom} onChange={(v: any) => sf("uom", v)} displayField="name" placeholder="UOM" /></div>
          </div>
          <div><FieldLabel required>Item Name</FieldLabel><Combobox data={ITEM_NAME_OPTIONS} displayField="name" value={form.itemName} onChange={(v: any) => sf("itemName", v)} placeholder="Select item" searchFields={["name"]} /></div>
          <Input label="HSN Code" placeholder="HSN Code" value={form.hsnCode} onChange={(e: any) => sf("hsnCode", e.target.value)} />
          <div className="grid grid-cols-2 gap-3">
            <Input label="Quantity *" placeholder="0" value={form.qty} onChange={(e: any) => sf("qty", e.target.value)} type="number" />
            <Input label="Rate (₹) *" placeholder="0.00" value={form.rate} onChange={(e: any) => sf("rate", e.target.value)} type="number" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input label="Discount (%)" placeholder="0" value={form.discount} onChange={(e: any) => sf("discount", e.target.value)} type="number" />
            <div><FieldLabel>GST %</FieldLabel><Listbox data={GST_OPTIONS} value={form.gstPct} onChange={(v: any) => sf("gstPct", v)} displayField="name" placeholder="GST %" /></div>
          </div>
          <div className="border-t border-gray-100 dark:border-gray-700 pt-4 space-y-2">
            <div className="flex justify-between text-sm"><span className="text-gray-500">Taxable Value</span><span className="font-medium">{INR(taxable)}</span></div>
            <div className="flex justify-between text-sm"><span className="text-gray-500">GST Amount ({gstNum}%)</span><span className="font-medium">{INR(taxable * gstNum / 100)}</span></div>
          </div>
          <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 flex items-center justify-between">
            <span className="text-sm font-bold text-primary">Total Amount</span>
            <span className="text-lg font-extrabold text-primary">{INR(total)}</span>
          </div>
        </div>
        <div className="px-5 py-4 border-t border-gray-100 dark:border-gray-700 flex gap-3 justify-end bg-gray-50 dark:bg-gray-900 flex-shrink-0">
          <Button variant="outlined" color="secondary" onClick={onClose}>Cancel</Button>
          <Button color="success" onClick={handleAdd} className="gap-2"><Icon.Plus /> Add Item</Button>
        </div>
      </div>
    </>
  );
}

/* ─────────────────────────────────────────────
   CREATE ACCOUNT DRAWER
───────────────────────────────────────────── */
function CreateAccountDrawer({ open, onClose }: any) {
  const [form, setForm] = useState({ accountName: "", mobile: "", group: [], openingBalance: "0", drCr: [], country: [], state: [], stateCode: "24", district: [], city: [], address: "", gstNo: "" });
  const sf = (k: string, v: any) => setForm(f => ({ ...f, [k]: v }));
  const DRCR = [{ id: 1, name: "CR – Credit" }, { id: 2, name: "DR – Debit" }];
  const COUNTRY = [{ id: 1, name: "India" }, { id: 2, name: "USA" }, { id: 3, name: "UAE" }, { id: 4, name: "UK" }, { id: 5, name: "Singapore" }];
  return (
    <>
      {open && <div className="fixed inset-0 bg-black/40 z-40" onClick={onClose} />}
      <div className={"fixed top-0 right-0 h-full lg:w-[50%] bg-white dark:bg-gray-800 z-50 shadow-2xl flex flex-col transition-transform duration-300 " + (open ? "translate-x-0" : "translate-x-full")}>
        <div className="flex items-center justify-between px-5 py-4 bg-primary text-white flex-shrink-0">
          <h3 className="font-bold text-base">Create Account</h3>
          <button type="button" onClick={onClose} className="w-7 h-7 cursor-pointer  rounded-full flex items-center justify-center text-white transition-colors"><Icon.Close /></button>
        </div>
        <div className="p-5 overflow-y-auto flex-1">
          <div className="grid grid-cols-2 gap-4">
            <Input label="Account Name *" placeholder="Enter account name" value={form.accountName} onChange={(e: any) => sf("accountName", e.target.value)} />
            <Input label="Mobile" placeholder="Mobile number" value={form.mobile} onChange={(e: any) => sf("mobile", e.target.value)} />
            <div><FieldLabel>Group</FieldLabel><Combobox data={GROUP_OPTIONS} displayField="name" value={form.group} onChange={(v: any) => sf("group", v)} placeholder="Select group" searchFields={["name"]} /></div>
            <Input label="Opening Balance" value={form.openingBalance} onChange={(e: any) => sf("openingBalance", e.target.value)} type="number" />
            <div><FieldLabel>Dr./Cr.</FieldLabel><Listbox data={DRCR} value={form.drCr} onChange={(v: any) => sf("drCr", v)} displayField="name" placeholder="Select" /></div>
            <div><FieldLabel>Country</FieldLabel><Listbox data={COUNTRY} value={form.country} onChange={(v: any) => sf("country", v)} displayField="name" placeholder="Country" /></div>
            <div><FieldLabel>State</FieldLabel><Combobox data={STATE_OPTIONS} displayField="name" value={form.state} onChange={(v: any) => sf("state", v)} placeholder="Select state" searchFields={["name"]} /></div>
            <Input label="State Code" value={form.stateCode} onChange={(e: any) => sf("stateCode", e.target.value)} />
            <div><FieldLabel>District</FieldLabel><Combobox data={DISTRICT_OPTIONS} displayField="name" value={form.district} onChange={(v: any) => sf("district", v)} placeholder="Select district" searchFields={["name"]} /></div>
            <div><FieldLabel>City</FieldLabel><Combobox data={DISTRICT_OPTIONS} displayField="name" value={form.city} onChange={(v: any) => sf("city", v)} placeholder="Select city" searchFields={["name"]} /></div>
            <div className="col-span-2"><Input label="Address" placeholder="Enter address" value={form.address} onChange={(e: any) => sf("address", e.target.value)} /></div>
            <div className="col-span-2">
              <FieldLabel>GST No.</FieldLabel>
              <div className="flex gap-2">
                <Input value={form.gstNo} onChange={(e: any) => sf("gstNo", e.target.value)} placeholder="Enter GST number" className="flex-1" />
                <Button color="success" variant="outlined">Verify</Button>
              </div>
            </div>
          </div>
        </div>
        <div className="px-5 py-4 border-t border-gray-100 dark:border-gray-700 flex justify-end gap-3 bg-gray-50 dark:bg-gray-900 flex-shrink-0">
          <Button variant="outlined" color="secondary" onClick={onClose}>Cancel</Button>
          <Button color="primary" className="gap-2"><Icon.Plus /> Create Account</Button>
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
  const [pendingItem, setPendingItem] = useState<any>(null);
  const [remarks, setRemarks] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);
  const barcodeRef = useRef<HTMLInputElement>(null);

  type UploadedFile = {
    name: string;
    size: string;
  };

  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);

  // ---- Shared item catalog (search row + vehicle drawer dono ke liye) ----
  const [itemCatalog, setItemCatalog] = useState<VehicleCatalogItem[]>([]);

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
    poNo: [], poLocation: [{ id: 1, name: "Main Branch" }], orderDate: "",
    date: new Date().toISOString().slice(0, 10),
    terms: "Credit", partyName: [],
    billNo: "", purchaseBillNo: "", purchaseDate: "",
    purchaseLocation: [{ id: 1, name: "Main Branch" }], dueDate: "", narration: "",
  });

  // ---- Field-level errors for client-side pre-submit checks ----
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const clearError = (key: string) => setFormErrors((prev) => {
    if (!prev[key]) return prev;
    const next = { ...prev };
    delete next[key];
    return next;
  });

  useEffect(() => {
    (async () => {
      try {
        const financialYearId = sessionStorage.getItem("financialYearId");
        const res = await Get("purchase/next-bill-no", { financialYearId }, false);
        if (res.data?.success) {
          setHdr((h) => ({ ...h, billNo: res.data.data?.billNo || "" }));
        } else {
          // API validation / error message -> toaster
          toasterrormsg(res.data?.message || "Failed to generate Bill No.");
        }
      } catch (err: any) {
        toasterrormsg(err?.response?.data?.message || "Failed to generate Bill No.");
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

  const setH = useCallback((k: string) => (v: any) => setHdr(h => ({ ...h, [k]: v })), []);
  const setHInput = useCallback((k: string) => (e: any) => setHdr(h => ({ ...h, [k]: e.target.value })), []);
  const setHDate = useCallback((k: string) => (val: any) => setHdr(h => ({ ...h, [k]: val })), []);

  const [charges, setCharges] = useState({ transport: 0, loading: 0, other: 0, discPct: 0, discAmt: 0, roundOff: 0 });
  const setC = (k: string) => (e: any) => setCharges(c => ({ ...c, [k]: parseFloat(e.target.value) || 0 }));

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
            }))
          );
        } else {
          toasterrormsg(res.data?.message || "Failed to load supplier list.");
        }
      } catch (err: any) {
        toasterrormsg(err?.response?.data?.message || "Failed to load supplier list.");
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
            (res.data.data || []).map((a: any) => ({ id: a.id, name: a.accountName, balance: Number(a.currentBalance) || 0 }))
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
            (res.data.data || []).map((a: any) => ({ id: a.id, name: a.accountName, balance: Number(a.currentBalance) || 0 }))
          );
        }
      } catch (err) {}
    })();
  }, []);

  // ---- Fetch Company's state (GST logic ke liye) — UNCHANGED ----
  useEffect(() => {
    (async () => {
      try {
        const companyDetailsId = sessionStorage.getItem("companyDetailsId");
        const res = await Get("superadmin/company-details", { companyDetailsId }, false);
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

  const isSameState = !!companyStateClean &&
                      !!partyStateClean &&
                      companyStateClean === partyStateClean;

  const totTaxable = items.reduce((s: number, i: any) => s + i.taxable, 0);
  const totGST = items.reduce((s: number, i: any) => s + i.gstAmt, 0);
  const totOther = charges.transport + charges.loading + charges.other;
  const grandTotal = totTaxable + totGST + totOther - charges.discAmt + charges.roundOff;

  // ---- CGST/SGST vs IGST — UNCHANGED ----
  const cgstTotal = isSameState ? totGST / 2 : 0;
  const sgstTotal = isSameState ? totGST / 2 : 0;
  const igstTotal = isSameState ? 0 : totGST;

  // ✅ CHANGED — same itemId already list me ho to Qty merge + recalc, warna naya row
  const addItemFromPreview = (item: any) => {
    setItems(prev => {
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
    setPendingItem(null);
    clearError("items");
  };

  const removeItem = (id: any) => setItems(prev => prev.filter((i: any) => i.id !== id));

  const handleFileChange = (e: any) => {
    Array.from(e.target.files || []).forEach((f: any) => setUploadedFiles(prev => [...prev, { name: f.name, size: `${Math.round(f.size / 1024)} KB` }]));
    if (e.target) e.target.value = "";
  };

  // ---- Barcode scan handling ----
  const [barcodeValue, setBarcodeValue] = useState("");
  const [barcodeError, setBarcodeError] = useState("");

  useEffect(() => {
    barcodeRef.current?.focus();
  }, []);

  const handleBarcodeScan = async (code: string) => {
    const trimmed = code.trim();
    if (!trimmed) return;
    setBarcodeError("");

    try {
      const res = await Get(`master/itemmaster/barcode/${encodeURIComponent(trimmed)}`, {}, false);
      if (res.data?.success && res.data.data) {
        const v = res.data.data;

        if (!v.salesPrice || Number(v.salesPrice) <= 0) {
          setBarcodeError("This item has no valid sales price.");
          setBarcodeValue("");
          return;
        }

        // ✅ CHANGED — ab direct items array me push nahi, sirf preview row me set hoga
        setPendingItem(calcItem({
          id: Date.now() + Math.random(),
          itemId: v.itemId,
          itemCode: v.itemCode,
          itemName: v.itemName,
          hsnCode: v.hsnCode || "",
          uom: v.unit,
          qty: 1,
          rate: Number(v.salesPrice),
          discount: 0,
          gstPct: parseFloat(v.taxSlab) || 0,
        }));
      } else {
        setBarcodeError(res.data?.message || "No item found for this barcode.");
      }
    } catch (err) {
      setBarcodeError("Something went wrong while scanning barcode.");
    } finally {
      setBarcodeValue("");
      setTimeout(() => barcodeRef.current?.focus(), 50);
    }
  };

  const handleBarcodeKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleBarcodeScan(barcodeValue);
    }
  };

  const [submitting, setSubmitting] = useState(false);

  // ---- Client-side pre-submit checks (field-level, not API errors) ----
  const validateBeforeSave = (): Record<string, string> => {
    const errors: Record<string, string> = {};

    if (!selectedParty) errors.partyName = "Please select Party Name.";
    if (!hdr.purchaseBillNo?.trim()) errors.purchaseBillNo = "Purchase Bill No is required.";
    if (!hdr.purchaseDate) errors.purchaseDate = "Purchase Date is required.";
    if (items.length === 0) errors.items = "Please add at least one item.";
    else if (items.some((i: any) => !i.itemId)) errors.items = "One or more items are missing item reference. Please re-add them.";

    if (termsValue === "Credit" && !hdr.dueDate) errors.dueDate = "Due Date is required for Credit terms.";
    if (termsValue === "Cash" && cashAccount.length === 0) errors.cashAccount = "Please select a Cash Account.";
    if (termsValue === "Bank") {
      if (bankAccount.length === 0) errors.bankAccount = "Please select a Bank Account.";
      if (!bankDetails.paymentMode) errors.bankDetails = "Please add Bank Details (Payment Mode).";
      if (bankDetails.paymentMode === "CHEQUE" && (!bankDetails.chequeNo.trim() || !bankDetails.chequeDate.trim())) {
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

      const financialYearId = sessionStorage.getItem("financialYearId");

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

        cashAccountId: termsValue === "Cash" ? cashAccount[0]?.id : null,
        bankAccountId: termsValue === "Bank" ? bankAccount[0]?.id : null,
        paymentMode: termsValue === "Bank" ? bankDetails.paymentMode : null,
        chequeNo: bankDetails.paymentMode === "CHEQUE" ? bankDetails.chequeNo : null,
        chequeDate: bankDetails.paymentMode === "CHEQUE" ? bankDetails.chequeDate : null,
        chequeClearDate: bankDetails.paymentMode === "CHEQUE" ? bankDetails.clearDate : null,
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
        toastsuccessmsg(res.data?.message || "Purchase bill saved successfully.");
        // 👇 create ke baad register list page par redirect
        navigate("/purchase-master/purchase-register");
      } else {
        // 👇 backend/API validation error message -> toaster
        toasterrormsg(res.data?.message || "Failed to save purchase bill.");
      }
    } catch (err: any) {
      toasterrormsg(err?.response?.data?.message || "Something went wrong while saving.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 shadow-none">
      <div className="w-full px-4 sm:px-6 lg:px-8 py-6">

        {/* TOP BAR */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl font-extrabold text-primary border-b-4 border-primary pb-1">Vehicle Purchase Bill</h1>
          <Link to="/purchase-master/purchase-register" className="text-sm text-primary hover:underline">
            <Button variant="outlined" className="gap-2"><Icon.Back /> Back</Button>
          </Link>
        </div>

        {/* HEADER FORM */}
        <Card className="mb-5 shadow-none">
          <div className="flex gap-8 mb-5">
            {[
              { val: "manual", label: "Manual" },
              { val: "po", label: "Purchase Order" },
            ].map(({ val, label }) => (
              <label key={val} className="flex items-center gap-2.5 cursor-pointer group">
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
                      "w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all " +
                      (billType === val
                        ? "border-primary bg-primary"
                        : "border-gray-400 bg-white dark:bg-gray-700 group-hover:border-primary/60")
                    }
                  >
                    {billType === val && <div className="w-2 h-2 rounded-full bg-white" />}
                  </div>
                </div>
                <span className={"text-sm transition-colors " + (billType === val ? "text-primary font-medium" : "text-gray-600 dark:text-gray-300")}>
                  {label}
                </span>
              </label>
            ))}
          </div>

          {billType === "po" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-5 pb-5 border-b border-gray-100 dark:border-gray-700 opacity-50 pointer-events-none">
              <div>
                <FieldLabel required>Purchase Order No</FieldLabel>
                <Combobox data={PO_OPTIONS} displayField="name" value={hdr.poNo} onChange={setH("poNo")} placeholder="Select" searchFields={["name"]} />
              </div>
              <div>
                <FieldLabel>Purchase Order Location</FieldLabel>
                <Listbox data={LOCATION_OPTIONS} value={hdr.poLocation} onChange={setH("poLocation")} displayField="name" placeholder="Location" />
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

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
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
                value={TERMS_OPTIONS.find(t => t.id === hdr.terms) || null}
                onChange={(val: any) => setHdr(h => ({ ...h, terms: val?.id || "" }))}
                displayField="name"
                placeholder="Terms"
              />
            </div>

            {/* Party Name — dynamic + fixed display (matched item from partyOptions) */}
            <div className="sm:col-span-2">
              <FieldLabel required>Party Name</FieldLabel>
              <div className="flex items-center gap-2">
                <div className="flex-1 min-w-0">
                  <Combobox
                    data={partyOptions}
                    displayField="name"
                    value={partyComboValue}
                    onChange={(selected: any) => {
                      setHdr(h => ({ ...h, partyName: selected ? [selected] : [] }));
                      clearError("partyName");
                    }}
                    placeholder={loadingParty ? "Loading suppliers..." : "Select or search party"}
                    searchFields={["name"]}
                    renderItem={(item: any) => (
                      <div className="flex items-center justify-between gap-3">
                        <div className="truncate">
                          <span className="text-sm text-gray-600 dark:text-gray-300">{item.name}</span>
                          <span className="text-sm font-medium ml-2">({item.mobile})</span>
                        </div>
                        <span className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                          ₹{item.balance?.toLocaleString() ?? "0"} {item.drOrCr}
                        </span>
                      </div>
                    )}
                  />
                  {formErrors.partyName && (
                    <p className="text-xs text-red-500 mt-1">{formErrors.partyName}</p>
                  )}
                </div>
                {selectedParty && (
                  <span className="flex-shrink-0 text-xs font-bold text-primary bg-primary/10 px-2.5 py-1.5 rounded-lg whitespace-nowrap border border-primary/20">
                    Bal: ₹{selectedParty.balance?.toLocaleString() ?? "0"} {selectedParty.drOrCr}
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => setAccountDrawerOpen(true)}
                  className="flex-shrink-0 w-9 h-9 rounded-lg bg-primary hover:bg-primary/90 text-white flex items-center justify-center transition-colors shadow-sm"
                  title="Create new account"
                >
                  <Icon.Plus />
                </button>
              </div>
            </div>

            <Input label="Bill No." value={hdr.billNo} onChange={setHInput("billNo")} />

            <div>
              <Input
                label="Purchase Bill No"
                placeholder="Enter Purchase Bill No."
                value={hdr.purchaseBillNo}
                onChange={(e: any) => { setHInput("purchaseBillNo")(e); clearError("purchaseBillNo"); }}
              />
              {formErrors.purchaseBillNo && (
                <p className="text-xs text-red-500 mt-1">{formErrors.purchaseBillNo}</p>
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
                <p className="text-xs text-red-500 mt-1">{formErrors.purchaseDate}</p>
              )}
            </div>

            <div>
              <FieldLabel>Purchase Bill Upload</FieldLabel>
              <div className="flex items-center w-full border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden bg-white dark:bg-gray-800 h-[38px]">
                <button type="button" onClick={() => fileRef.current && fileRef.current.click()}
                  className="h-full px-3 text-sm bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 dark:text-gray-200 border-r border-gray-300 dark:border-gray-600 transition-colors whitespace-nowrap">
                  Choose File
                </button>
                <span className="px-3 text-sm text-gray-400 truncate flex-1">No file chosen</span>
                <input ref={fileRef} type="file" className="hidden" onChange={handleFileChange} multiple />
              </div>
            </div>

            <div>
              <FieldLabel>Purchase Location</FieldLabel>
              <Listbox data={LOCATION_OPTIONS} value={hdr.purchaseLocation} onChange={setH("purchaseLocation")} displayField="name" placeholder="Location" />
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
                  <p className="text-xs text-red-500 mt-1">{formErrors.dueDate}</p>
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
                  <p className="text-xs text-red-500 mt-1">{formErrors.cashAccount}</p>
                )}
              </div>
            )}

            {termsValue === "Bank" && (
              <div>
                <FieldLabel required>Bank Account</FieldLabel>
                <div className="flex items-center gap-2">
                  <div className="flex-1 min-w-0">
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
                    className="flex-shrink-0 w-9 h-9 rounded-lg border border-gray-300 dark:border-gray-600 text-primary flex items-center justify-center hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    title="Add Bank Details"
                  >
                    <Icon.Bank />
                  </button>
                </div>
                {(formErrors.bankAccount || formErrors.bankDetails) && (
                  <p className="text-xs text-red-500 mt-1">{formErrors.bankAccount || formErrors.bankDetails}</p>
                )}
              </div>
            )}

            <div className="sm:col-span-2 xl:col-span-2">
              <Input label="Narration" placeholder="Enter narration" value={hdr.narration} onChange={setHInput("narration")} />
            </div>
          </div>
        </Card>

        {/* ITEM DETAILS */}
        <Card title="Item Details" className="mb-5">
          <div className="flex items-center justify-end gap-2 flex-wrap mb-3 w-full">
            <div>
              <Input
                ref={barcodeRef}
                label="Scan Barcode"
                placeholder="Scan or enter barcode"
                className="w-72"
                value={barcodeValue}
                onChange={(e: any) => setBarcodeValue(e.target.value)}
                onKeyDown={handleBarcodeKeyDown}
                error={barcodeError}
              />
            </div>
          </div>

          {formErrors.items && (
            <p className="text-xs text-red-500 mb-2">{formErrors.items}</p>
          )}

          <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700">
            <table className="w-full min-w-[1100px]">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
                  {["#", "Item Code", "Item Name", "HSN Code", "UOM", "Qty", "Rate (₹)", "Disc (%)", "Taxable (₹)", "GST %", "GST Amt (₹)", "Total (₹)", "Action"].map(h => (
                    <th key={h} className="px-3 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide whitespace-nowrap">{h}</th>
                  ))}
                </tr>
                <InlineSearchRow
                  onAdd={addItemFromPreview}
                  initialRow={pendingItem}
                  onClearPreview={() => setPendingItem(null)}
                  onOpenVehicleDrawer={() => setVehicleDrawerOpen(true)}
                  itemCatalog={itemCatalog}
                />
              </thead>
              <tbody>
                {items.map((item: any, idx: number) => (
                  <tr key={item.id} className="border-b border-gray-100 dark:border-gray-700 hover:bg-primary/5 transition-colors">
                    <td className="px-3 py-2.5 text-sm text-gray-400 font-medium">{idx + 1}</td>
                    <td className="px-3 py-2.5 text-sm font-bold text-primary">{item.itemCode}</td>
                    <td className="px-3 py-2.5 text-sm text-gray-800 dark:text-gray-100 font-medium whitespace-nowrap">
                      {item.itemName}
                      {item.colour && <span className="block text-[10px] text-gray-400">{item.colour}</span>}
                    </td>
                    <td className="px-3 py-2.5 text-sm text-gray-600 dark:text-gray-300">{item.hsnCode}</td>
                    <td className="px-3 py-2.5 text-sm">
                      <span className="bg-gray-100 dark:bg-gray-700 dark:text-gray-200 px-2 py-0.5 rounded-full text-xs font-medium">{item.uom}</span>
                    </td>
                    <td className="px-3 py-2.5 text-sm text-right font-medium text-gray-800 dark:text-gray-100">{FMT3(item.qty)}</td>
                    <td className="px-3 py-2.5 text-sm text-right text-gray-700 dark:text-gray-200">{FMT2(item.rate)}</td>
                    <td className="px-3 py-2.5 text-sm text-right text-gray-600 dark:text-gray-300">{FMT2(item.discount)}</td>
                    <td className="px-3 py-2.5 text-sm text-right font-medium text-gray-800 dark:text-gray-100">{FMT2(item.taxable)}</td>
                    <td className="px-3 py-2.5 text-center">
                      <span className="bg-primary/10 text-primary px-2 py-0.5 rounded-full font-bold text-xs">{item.gstPct}%</span>
                    </td>
                    <td className="px-3 py-2.5 text-sm text-right text-gray-700 dark:text-gray-200">{FMT2(item.gstAmt)}</td>
                    <td className="px-3 py-2.5 text-sm text-right font-extrabold text-gray-900 dark:text-white">{FMT2(item.total)}</td>
                    <td className="px-3 py-2.5">
                      <button type="button" onClick={() => removeItem(item.id)}
                        className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/30 hover:text-red-500 text-gray-400 transition-colors">
                        <Icon.Trash />
                      </button>
                    </td>
                  </tr>
                ))}
                {items.length === 0 && (
                  <tr><td colSpan={13} className="px-4 py-10 text-center text-sm text-gray-400">No items added. Use the search row above or scan a barcode.</td></tr>
                )}
              </tbody>
              <tfoot>
                <tr className="bg-primary/5 border-t-2 border-primary/20">
                  <td className="px-3 py-3 text-sm font-extrabold text-primary" colSpan={5}>Total</td>
                  <td className="px-3 py-3 text-sm text-right font-extrabold text-primary">{FMT3(items.reduce((s: number, i: any) => s + i.qty, 0))}</td>
                  <td colSpan={2} />
                  <td className="px-3 py-3 text-sm text-right font-extrabold text-primary">{FMT2(totTaxable)}</td>
                  <td />
                  <td className="px-3 py-3 text-sm text-right font-extrabold text-primary">{FMT2(totGST)}</td>
                  <td className="px-3 py-3 text-sm text-right font-extrabold text-primary">{FMT2(totTaxable + totGST)}</td>
                  <td />
                </tr>
              </tfoot>
            </table>
          </div>
        </Card>

        {/* ── BOTTOM 3-COL: Charges / Tax / Summary — GST logic UNCHANGED ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-5">
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
                <div key={key} className="flex items-center justify-between gap-3">
                  <label className="text-sm text-gray-600 dark:text-gray-400 flex-1">{lbl}</label>
                  <input type="number" value={(charges as any)[key]} onChange={setC(key as any)} step={key === "roundOff" ? "0.01" : "1"}
                    className="w-32 px-3 py-1.5 text-sm text-right border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100" />
                </div>
              ))}
            </div>
          </Card>

          <Card title="Tax Summary">
            <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700 mb-4">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
                    <th className="px-3 py-2.5 text-left text-xs font-bold text-gray-500 uppercase tracking-wide">Tax Type</th>
                    <th className="px-3 py-2.5 text-right text-xs font-bold text-gray-500 uppercase tracking-wide">Amount (₹)</th>
                  </tr>
                </thead>
                <tbody>
                  {isSameState ? (
                    <>
                      <tr className="border-t border-gray-100 dark:border-gray-700">
                        <td className="px-3 py-2 text-sm text-gray-700 dark:text-gray-200">CGST</td>
                        <td className="px-3 py-2 text-sm text-right text-gray-700 dark:text-gray-200">{FMT2(cgstTotal)}</td>
                      </tr>
                      <tr className="border-t border-gray-100 dark:border-gray-700">
                        <td className="px-3 py-2 text-sm text-gray-700 dark:text-gray-200">SGST</td>
                        <td className="px-3 py-2 text-sm text-right text-gray-700 dark:text-gray-200">{FMT2(sgstTotal)}</td>
                      </tr>
                    </>
                  ) : (
                    <tr className="border-t border-gray-100 dark:border-gray-700">
                      <td className="px-3 py-2 text-sm text-gray-700 dark:text-gray-200">IGST</td>
                      <td className="px-3 py-2 text-sm text-right text-gray-700 dark:text-gray-200">{FMT2(igstTotal)}</td>
                    </tr>
                  )}
                </tbody>
                <tfoot>
                  <tr className="bg-primary/5 border-t-2 border-primary/20 font-extrabold">
                    <td className="px-3 py-2.5 text-sm text-primary">Taxable Total</td>
                    <td className="px-3 py-2.5 text-sm text-right text-primary">{FMT2(totTaxable)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
            <FieldLabel>Remarks</FieldLabel>
            <textarea rows={4} value={remarks} onChange={e => setRemarks(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary dark:text-gray-200 bg-white dark:bg-gray-800" />
          </Card>

          <Card title="Summary">
            <div className="space-y-0 mb-4">
              {[
                ["Total Taxable Value", totTaxable],
                ["Total GST", totGST],
                ["Total Other Charges", totOther],
                ["Total Discount", charges.discAmt],
              ].map(([lbl, val]) => (
                <div key={lbl as string} className="flex justify-between py-2.5 border-b border-gray-100 dark:border-gray-700 last:border-0">
                  <span className="text-sm text-gray-500 dark:text-gray-400">{lbl as string}</span>
                  <span className="text-sm font-semibold text-gray-800 dark:text-gray-100">{INR(val as number)}</span>
                </div>
              ))}
            </div>
            <div className="rounded-xl border border-blue-100 dark:border-blue-900 bg-blue-50 dark:bg-blue-900/20 p-4">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-bold text-blue-700 dark:text-blue-300 uppercase tracking-wide">Grand Total</span>
              </div>
              <p className="text-2xl font-extrabold text-blue-700 dark:text-blue-300">{INR(grandTotal)}</p>
              <p className="text-[10px] text-blue-500/70 dark:text-blue-400/60 mt-1.5 leading-relaxed">
                <span className="font-semibold">In Words:</span> {numInWords(grandTotal)}
              </p>
            </div>
          </Card>
        </div>

        {/* ── Attachments + Actions — same as before, unchanged ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="lg:col-span-2">
            <Card
              title="Attachments"
              titleRight={
                <button type="button" onClick={() => fileRef.current && fileRef.current.click()}
                  className="flex items-center gap-1.5 text-xs font-semibold text-primary hover:text-primary/80 transition-colors">
                  <Icon.UploadCloud /> Upload File
                </button>
              }
            >
              <div onClick={() => fileRef.current && fileRef.current.click()}
                className="border-2 border-dashed border-gray-300 dark:border-gray-600 hover:border-primary dark:hover:border-primary rounded-xl p-6 text-center cursor-pointer transition-colors mb-4 group">
                <div className="flex justify-center mb-2 text-gray-300 group-hover:text-primary/60 transition-colors">
                  <Icon.CloudUp />
                </div>
                <p className="text-sm font-semibold text-gray-600 dark:text-gray-300 group-hover:text-primary transition-colors">Drag & Drop files here</p>
                <p className="text-xs text-gray-400 mt-1">
                  or <span className="text-primary underline font-medium">click to upload</span>
                  <span className="ml-1 text-gray-300">· PDF, DOC, Images supported</span>
                </p>
              </div>

              {uploadedFiles.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {uploadedFiles.map((f, i) => (
                    <div key={i} className="flex items-center gap-3 bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30 rounded-xl px-4 py-3">
                      <div className="flex-shrink-0 w-9 h-9 rounded-lg bg-red-100 dark:bg-red-900/30 flex items-center justify-center text-red-500">
                        <Icon.File />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-700 dark:text-gray-200 truncate">{f.name}</p>
                        <p className="text-xs text-gray-400">{f.size}</p>
                      </div>
                      <button type="button" onClick={() => setUploadedFiles(prev => prev.filter((_, j) => j !== i))}
                        className="flex-shrink-0 p-1 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/40 text-red-400 hover:text-red-600 transition-colors">
                        <Icon.Trash />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              <input ref={fileRef} type="file" className="hidden" onChange={handleFileChange} multiple />
            </Card>
          </div>

          <div className="lg:col-span-1">
            <Card title="Actions">
              <div className="flex flex-col gap-3">
                <button type="button" onClick={handleSaveBill} disabled={submitting}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-green-500 hover:bg-green-600 active:bg-green-700 text-white font-semibold text-sm transition-all shadow-sm hover:shadow-md disabled:opacity-50">
                  <Icon.Save /> {submitting ? "Saving..." : "Save Bill"}
                </button>
                <button type="button"
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-primary hover:bg-primary/90 active:bg-primary/80 text-white font-semibold text-sm transition-all shadow-sm hover:shadow-md">
                  <Icon.Print /> Save & Print
                </button>
                <button type="button"
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 border-gray-300 dark:border-gray-600 hover:border-red-400 hover:text-red-500 dark:hover:border-red-500 dark:hover:text-red-400 text-gray-600 dark:text-gray-300 font-semibold text-sm transition-all bg-white dark:bg-transparent"
                  onClick={() => navigate("/purchase-master/purchase-register")}>
                  <Icon.Close /> Cancel
                </button>
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* All Drawers — UNCHANGED */}
      <AddItemDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} onAdd={setPendingItem} />
      <VehicleItemDrawer open={vehicleDrawerOpen} onClose={() => setVehicleDrawerOpen(false)} onSelect={setPendingItem} onOpenAdd={() => setAddVehicleOpen(true)} />
      <AddVehicleItemDrawer open={addVehicleOpen} onClose={() => setAddVehicleOpen(false)} onAdd={setPendingItem} />
      <CreateAccountDrawer open={accountDrawerOpen} onClose={() => setAccountDrawerOpen(false)} />
      <BankDetailsDrawer
        open={bankDetailsOpen}
        onClose={() => setBankDetailsOpen(false)}
        bankDetails={bankDetails}
        setBankDetails={setBankDetails}
      />
    </div>
  );
}