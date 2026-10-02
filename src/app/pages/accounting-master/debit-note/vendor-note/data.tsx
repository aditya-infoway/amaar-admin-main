// Dummy data for the design phase. Replace with API calls later.
export type DocType = "grr" | "qc";

export type VendorRow = {
  vendorId: string;
  vendorName: string;
  number: string;
  pending: { grr: number; qc: number };
  complete: { grr: number; qc: number };
};

export type DocRow = {
  id: string;
  docNo: string;
  docDate: string; // YYYY-MM-DD
  poNo: string;
  billNo?: string;
};

export type DebitItem = {
  itemName: string;
  itemCode: string;
  hsnCode: string;
  rate: number;
  qty: number;
  gstPercent: number;
};

export const vendors: VendorRow[] = [
  {
    vendorId: "1",
    vendorName: "Mukesh Bhai",
    number: "9041540725",
    pending: { grr: 1, qc: 1 },
    complete: { grr: 0, qc: 0 },
  },
  {
    vendorId: "2",
    vendorName: "Ramesh Traders",
    number: "9876543210",
    pending: { grr: 2, qc: 0 },
    complete: { grr: 1, qc: 1 },
  },
];

export const docsByVendor: Record<string, Record<DocType, DocRow[]>> = {
  "1": {
    grr: [
      { id: "101", docNo: "26-27/001", docDate: "2026-09-21", poNo: "PO-001" },
    ],
    qc: [
      { id: "201", docNo: "26-27/001", docDate: "2026-09-22", poNo: "PO-001" },
    ],
  },
  "2": {
    grr: [
      { id: "102", docNo: "26-27/002", docDate: "2026-09-23", poNo: "PO-002" },
      { id: "103", docNo: "26-27/003", docDate: "2026-09-25", poNo: "PO-003" },
    ],
    qc: [],
  },
};

export const debitNoteSource = {
  vendorName: "Mukesh Bhai",
  poNo: "PO-001",
  docNo: "26-27/001",
  docDate: "2026-09-21",
  items: [
    {
      itemName: "Item 4",
      itemCode: "XYZ",
      hsnCode: "0001",
      rate: 100,
      qty: 10,
      gstPercent: 18,
    },
  ] as DebitItem[],
};

export const fmtDate = (v: string) => {
  if (!v) return "";
  const [y, m, d] = v.slice(0, 10).split("-");
  return `${d}-${m}-${y}`;
};
