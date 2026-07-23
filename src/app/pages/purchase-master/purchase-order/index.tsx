import { useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import { ChevronLeftIcon, PlusIcon, TrashIcon } from "@heroicons/react/24/outline";
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
import { MasterTable } from "../shared/MasterTable";
import { MasterToolbar } from "../shared/MasterToolbar";
import { exportToExcel, exportToPdf } from "../shared/export";
import { TextCell } from "../shared/tableCells";

type OrderItem = {
  id: number;
  item: string;
  hsn: string;
  qty: number;
  unit: string;
  rate: number;
  discount: number;
  gst: number;
};

type DraftItem = {
  item: string;
  hsn: string;
  qty: number;
  unit: string;
  rate: number;
  discount: number;
  gst: number;
};

const emptyDraft: DraftItem = { item: "", hsn: "", qty: 1, unit: "", rate: 0, discount: 0, gst: 18 };

const suppliers = [
  { id: 1, name: "ABC Steel Pvt. Ltd.", rate: "₹ 66.00 / KG" },
  { id: 2, name: "Tata Steel Ltd.", rate: "₹ 68.00 / KG" },
  { id: 3, name: "SAIL Dealer", rate: "₹ 65.00 / KG" },
];
const locations = [{ id: 1, name: "Main Warehouse" }, { id: 2, name: "Branch Warehouse" }];
const itemOptions = [
  { id: 1, name: "Steel Plate 10mm", hsn: "7208", unit: "KG", rate: 66 },
  { id: 2, name: "MS Channel 100mm", hsn: "7216", unit: "NOS", rate: 950 },
  { id: 3, name: "Hydraulic Cylinder", hsn: "8412", unit: "NOS", rate: 4500 },
  { id: 4, name: "Industrial Paint Red", hsn: "3208", unit: "LTR", rate: 360 },
];
const unitOptions = ["NOS", "KG", "LTR", "BOX", "SET"].map((name) => ({ id: name, name }));
type PurchaseOrder = {
  id: string;
  poNumber: string;
  poDate: string;
  supplierName: string;
  deliveryLocation: string;
  totalAmount: string;
  status: string;
};

const purchaseOrders: PurchaseOrder[] = [
  { id: "1", poNumber: "PO/26-27/000123", poDate: "23-07-2026", supplierName: "ABC Steel Pvt. Ltd.", deliveryLocation: "Main Warehouse", totalAmount: "129800", status: "Draft" },
  { id: "2", poNumber: "PO/26-27/000122", poDate: "21-07-2026", supplierName: "Tata Steel Ltd.", deliveryLocation: "Branch Warehouse", totalAmount: "68440", status: "Approved" },
  { id: "3", poNumber: "PO/26-27/000121", poDate: "18-07-2026", supplierName: "SAIL Dealer", deliveryLocation: "Main Warehouse", totalAmount: "212400", status: "Sent" },
];

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
      const color = status === "Approved" ? "success" : status === "Sent" ? "info" : "warning";
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

function FormDate({ label, value, onChange, required }: { label: string; value: string; onChange: (value: string) => void; required?: boolean }) {
  return <div><FieldLabel required={required}>{label}</FieldLabel><DatePicker value={value} onChange={(dates) => { const date = dates?.[0]; onChange(date ? `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}` : ""); }} options={{ dateFormat: "d-m-Y", defaultDate: value || undefined }} placeholder="Select date" /></div>;
}

function PurchaseOrderList() {
  const navigate = useNavigate();
  const [globalFilter, setGlobalFilter] = useState("");
  const [sorting, setSorting] = useState<SortingState>([]);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [showFilters, setShowFilters] = useState(false);
  const [filterSupplier, setFilterSupplier] = useState("");
  const [filterLocation, setFilterLocation] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const locationOptions = useMemo(
    () => [...new Set(purchaseOrders.map((order) => order.deliveryLocation))].map((label) => ({ id: label, label })),
    [],
  );
  const statusOptions = useMemo(
    () => [...new Set(purchaseOrders.map((order) => order.status))].map((label) => ({ id: label, label })),
    [],
  );
  const filteredPurchaseOrders = useMemo(
    () => purchaseOrders.filter((order) =>
      (!filterSupplier || order.supplierName.toLowerCase().includes(filterSupplier.toLowerCase())) &&
      (!filterLocation || order.deliveryLocation === filterLocation) &&
      (!filterStatus || order.status === filterStatus),
    ),
    [filterSupplier, filterLocation, filterStatus],
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
        <MasterTable table={table} columnCount={purchaseOrderColumns.length} emptyMessage="No purchase orders found. Click Create Purchase Order to add one." />
      </div>
    </Page>
  );
}

export default function PurchaseOrderPage() {
  const location = useLocation();
  const isCreateView = location.pathname.endsWith("/create");
  const [items, setItems] = useState<OrderItem[]>([]);
  const [draft, setDraft] = useState<DraftItem>(emptyDraft);
  const [notice, setNotice] = useState("");
  const [poDate, setPoDate] = useState(new Date().toISOString().slice(0, 10));
  const [requiredDate, setRequiredDate] = useState("");
  const [selectedSupplier, setSelectedSupplier] = useState(suppliers[0]);
  const [selectedLocation, setSelectedLocation] = useState(locations[0]);

  const updateDraft = (key: keyof DraftItem, value: string | number) => {
    setDraft(current => ({ ...current, [key]: value }));
  };

  const chooseDraftItem = (selected: (typeof itemOptions)[number] | null) => {
    if (!selected) return;
    setDraft(current => ({ ...current, item: selected.name, hsn: selected.hsn, unit: selected.unit, rate: selected.rate }));
  };

  const draftAmount = useMemo(() => {
    const gross = Number(draft.qty) * Number(draft.rate);
    const discount = gross * Number(draft.discount || 0) / 100;
    const taxable = gross - discount;
    const tax = taxable * Number(draft.gst || 0) / 100;
    return taxable + tax;
  }, [draft]);

  const canAddDraft = draft.item.trim() !== "" && Number(draft.qty) > 0;

  const addDraftToItems = () => {
    if (!canAddDraft) return;
    setItems(current => [...current, { id: Date.now(), ...draft }]);
    setDraft(emptyDraft);
  };

  const removeItem = (id: number) => setItems(current => current.filter(item => item.id !== id));

  const totals = useMemo(() => items.reduce((summary, item) => {
    const gross = Number(item.qty) * Number(item.rate);
    const discount = gross * Number(item.discount || 0) / 100;
    const taxable = gross - discount;
    const tax = taxable * Number(item.gst || 0) / 100;
    return { taxable: summary.taxable + taxable, tax: summary.tax + tax, discount: summary.discount + discount };
  }, { taxable: 0, tax: 0, discount: 0 }), [items]);
  const grandTotal = totals.taxable + totals.tax;

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
            <Button variant="outlined" color="primary" onClick={() => setNotice("Purchase order saved as a draft.")}>Save Draft</Button>
            <Button color="primary" onClick={() => setNotice("Purchase order has been created successfully.")}>Generate PO</Button>
          </div>
        </div>

        {notice && <div className="mb-5 flex items-center justify-between rounded-lg border border-success/30 bg-success/10 px-4 py-3 text-sm font-medium text-success"><span>{notice}</span><button onClick={() => setNotice("")} aria-label="Dismiss message">×</button></div>}

        <div className="grid grid-cols-1 gap-5 2xl:grid-cols-[minmax(0,1fr)_300px]">
          <div className="space-y-5">
            <SectionCard title="PO Details">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <Input label="PO Number" classNames={{ labelText: "font-semibold text-gray-700 dark:text-dark-100" }} defaultValue="PO/26-27/000123" placeholder="PO number" />
                <FormDate label="Required Date" required value={requiredDate} onChange={setRequiredDate} />
                <FormDate label="PO Date" value={poDate} onChange={setPoDate} />
                <div><FieldLabel required>Delivery Location</FieldLabel><Listbox data={locations} displayField="name" value={selectedLocation} onChange={setSelectedLocation} placeholder="Select location" /></div>
                <Textarea label="Remarks" rows={3} placeholder="Enter remarks..." classNames={{ root: "sm:col-span-2 xl:col-span-4", labelText: "font-semibold text-gray-700 dark:text-dark-100" }} />
              </div>
            </SectionCard>

            <SectionCard title="Item Details">
              <div className="mb-4 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                <p className="text-sm text-gray-500 dark:text-dark-200">Search an item in the row below, then confirm to add it to the order.</p>
                <div className="flex gap-2"><Button variant="outlined" className="self-start">Import Items</Button></div>
              </div>
              <div className="table-wrapper overflow-x-auto rounded-lg border border-gray-200 dark:border-dark-500">
                <Table hoverable className="w-full min-w-[1100px] text-left rtl:text-right">
                  <THead>
                    <Tr>
                      <Th className="w-12 bg-gray-200 text-center font-semibold uppercase text-gray-800 dark:bg-dark-800 dark:text-dark-100">#</Th><Th className="min-w-56 bg-gray-200 font-semibold uppercase text-gray-800 dark:bg-dark-800 dark:text-dark-100">Item Details</Th><Th className="w-28 bg-gray-200 font-semibold uppercase text-gray-800 dark:bg-dark-800 dark:text-dark-100">HSN/SAC</Th><Th className="w-24 bg-gray-200 text-right font-semibold uppercase text-gray-800 dark:bg-dark-800 dark:text-dark-100">Qty</Th><Th className="w-28 bg-gray-200 font-semibold uppercase text-gray-800 dark:bg-dark-800 dark:text-dark-100">UOM</Th><Th className="w-32 bg-gray-200 text-right font-semibold uppercase text-gray-800 dark:bg-dark-800 dark:text-dark-100">Rate (₹)</Th><Th className="w-28 bg-gray-200 text-right font-semibold uppercase text-gray-800 dark:bg-dark-800 dark:text-dark-100">Discount %</Th><Th className="w-28 bg-gray-200 text-right font-semibold uppercase text-gray-800 dark:bg-dark-800 dark:text-dark-100">GST %</Th><Th className="w-36 bg-gray-200 text-right font-semibold uppercase text-gray-800 dark:bg-dark-800 dark:text-dark-100">Amount (₹)</Th><Th className="w-16 bg-gray-200 font-semibold uppercase text-gray-800 dark:bg-dark-800 dark:text-dark-100">Action</Th>
                    </Tr>
                  </THead>
                  <TBody>
                    {/* Entry row: the only editable row. Adding an item here pushes a read-only row below. */}
                    <Tr className="border-b-2 border-primary/20 bg-primary/5">
                      <Td className="text-center text-gray-300">—</Td>
                      <Td>
                        <Combobox
                          data={itemOptions}
                          displayField="name"
                          value={itemOptions.find(option => option.name === draft.item) || null}
                          onChange={(selected: any) => chooseDraftItem(selected)}
                          placeholder="Search item"
                          searchFields={["name", "hsn"]}
                        />
                      </Td>
                      <Td><Input value={draft.hsn} placeholder="HSN" onChange={e => updateDraft("hsn", e.target.value)} /></Td>
                      <Td><Input className="text-right" min="1" type="number" value={draft.qty} onChange={e => updateDraft("qty", Number(e.target.value))} /></Td>
                      <Td>
                        <Listbox
                          data={unitOptions}
                          displayField="name"
                          classNames={{ root: "min-w-24" }}
                          value={unitOptions.find(option => option.name === draft.unit) || null}
                          onChange={(selected: any) => selected && updateDraft("unit", selected.name)}
                          placeholder="UOM"
                        />
                      </Td>
                      <Td><Input className="text-right" min="0" type="number" value={draft.rate} onChange={e => updateDraft("rate", Number(e.target.value))} /></Td>
                      <Td><Input className="text-right" min="0" type="number" value={draft.discount} onChange={e => updateDraft("discount", Number(e.target.value))} /></Td>
                      <Td><Input className="text-right" min="0" max="100" type="number" value={draft.gst} onChange={e => updateDraft("gst", Number(e.target.value))} placeholder="GST %" /></Td>
                      <Td className="text-right font-semibold text-primary">{money(draftAmount)}</Td>
                      <Td className="text-center">
                        <Button
                          variant="soft"
                          color="primary"
                          className="size-8 rounded-full p-0"
                          onClick={addDraftToItems}
                          disabled={!canAddDraft}
                          aria-label="Add item to order"
                        >
                          <PlusIcon className="size-4.5" />
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
                      const amount = taxable * (1 + item.gst / 100);
                      return (
                        <Tr key={item.id} className="border-b border-gray-200 dark:border-b-dark-500">
                          <Td className="bg-white text-center font-medium text-gray-400 dark:bg-dark-700">{index + 1}</Td>
                          <Td className="bg-white font-medium text-gray-700 dark:bg-dark-700 dark:text-dark-50">{item.item}</Td>
                          <Td className="bg-white text-gray-500 dark:bg-dark-700 dark:text-dark-200">{item.hsn}</Td>
                          <Td className="bg-white text-right text-gray-500 dark:bg-dark-700 dark:text-dark-200">{item.qty}</Td>
                          <Td className="bg-white text-gray-500 dark:bg-dark-700 dark:text-dark-200">{item.unit}</Td>
                          <Td className="bg-white text-right text-gray-500 dark:bg-dark-700 dark:text-dark-200">{money(item.rate)}</Td>
                          <Td className="bg-white text-right text-gray-500 dark:bg-dark-700 dark:text-dark-200">{item.discount}%</Td>
                          <Td className="bg-white text-right text-gray-500 dark:bg-dark-700 dark:text-dark-200">{item.gst}%</Td>
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
                  <tfoot><Tr className="border-t-2 border-primary/20 bg-primary/5 font-bold text-primary"><Td colSpan={3}>Total</Td><Td className="text-right">{items.reduce((total, item) => total + Number(item.qty), 0)}</Td><Td colSpan={4} /><Td className="text-right">{money(grandTotal)}</Td><Td /></Tr></tfoot>
                </Table>
              </div>
            </SectionCard>

            <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">
              <SectionCard title="Attachments"><div className="flex min-h-36 flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-200 px-4 text-center text-sm text-gray-400 dark:border-dark-500"><label className="cursor-pointer font-medium text-primary hover:underline">Drag & Drop files here or Browse<input type="file" className="hidden" multiple /></label><span className="mt-1 text-xs">Supports: PDF, JPG, PNG (Max. 5MB)</span></div></SectionCard>
              <SectionCard title="Terms & Conditions"><textarea rows={5} className="form-textarea w-full text-sm" defaultValue={"1. Material should be as per the quality mentioned in our enquiry.\n2. Delivery should be completed on or before the required date.\n3. Please mention our PO number in your challan.\n4. Subject to local jurisdiction."} /></SectionCard>
              <SectionCard title="Order Summary"><div className="space-y-3"><div className="flex justify-between text-sm text-gray-500 dark:text-dark-200"><span>Sub Total</span><strong className="text-gray-800 dark:text-dark-50">{money(totals.taxable + totals.discount)}</strong></div><div className="flex justify-between text-sm text-gray-500 dark:text-dark-200"><span>Discount</span><strong className="text-gray-800 dark:text-dark-50">{money(totals.discount)}</strong></div><div className="flex justify-between text-sm text-gray-500 dark:text-dark-200"><span>Taxable Amount</span><strong className="text-gray-800 dark:text-dark-50">{money(totals.taxable)}</strong></div><div className="flex justify-between text-sm text-gray-500 dark:text-dark-200"><span>GST (9% + 9%)</span><strong className="text-gray-800 dark:text-dark-50">{money(totals.tax)}</strong></div><div className="border-t border-gray-100 pt-3 dark:border-dark-500"><span className="text-xs font-bold uppercase tracking-wide text-gray-400">Total Amount</span><p className="mt-1 text-2xl font-extrabold text-primary">{money(grandTotal)}</p></div></div></SectionCard>
            </div>

            <div className="flex flex-col-reverse gap-3 border-t border-gray-200 pt-5 dark:border-dark-500 sm:flex-row sm:justify-end">
              <Link to="/purchase-master/purchase-order"><Button variant="outlined">Cancel</Button></Link>
              <Button variant="outlined" color="primary" onClick={() => setNotice("Purchase order saved as a draft.")}>Save as Draft</Button>
              <Button color="primary" onClick={() => setNotice("Purchase order has been created successfully.")}>Create Purchase Order</Button>
            </div>
          </div>
          <aside className="space-y-5">
            <SectionCard title="Supplier Suggestions"><p className="mb-3 text-xs text-primary">AI Recommended</p>{suppliers.map((supplier, index) => <button type="button" key={supplier.id} onClick={() => setSelectedSupplier(supplier)} className={`mb-3 w-full rounded-lg border p-3 text-left transition-colors ${selectedSupplier.id === supplier.id ? "border-success/50 bg-success/5" : "border-gray-200 hover:border-primary/40 dark:border-dark-500"}`}><div className="flex items-start justify-between gap-2"><span className="flex gap-2 text-sm font-semibold text-gray-700 dark:text-dark-50"><Radio checked={selectedSupplier.id === supplier.id} onChange={() => setSelectedSupplier(supplier)} name="supplier" color="primary" />{supplier.name}</span>{index === 0 && <span className="rounded bg-success/15 px-1.5 py-0.5 text-[10px] font-bold text-success">Recommended</span>}</div><div className="mt-3 grid grid-cols-2 gap-y-1 text-xs text-gray-500"><span>Rate</span><strong className="text-right text-gray-700 dark:text-dark-50">{supplier.rate}</strong><span>Lead Time</span><strong className="text-right text-gray-700 dark:text-dark-50">{2 + index} Days</strong><span>Rating</span><strong className="text-right text-warning">★★★★★</strong><span>Score</span><strong className="text-right text-success">{96 - index * 10}/100</strong></div></button>)}<Button variant="outlined" color="primary" className="w-full">View All Suppliers</Button></SectionCard>
            <SectionCard title="Last Purchase History"><dl className="grid grid-cols-2 gap-y-2 text-xs"><dt className="text-gray-500">Last Rate</dt><dd className="text-right font-semibold text-gray-700 dark:text-dark-50">₹ 66.00 / KG</dd><dt className="text-gray-500">Last Qty</dt><dd className="text-right font-semibold text-gray-700 dark:text-dark-50">5,000 KG</dd><dt className="text-gray-500">Last PO</dt><dd className="text-right font-semibold text-primary">PO/26-27/000089</dd><dt className="text-gray-500">Last Date</dt><dd className="text-right font-semibold text-gray-700 dark:text-dark-50">15/05/2026</dd></dl><button className="mt-4 text-xs font-semibold text-primary hover:underline">View Price History</button></SectionCard>
          </aside>
        </div>
      </div>
    </div>
  );
}
