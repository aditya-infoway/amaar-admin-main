export interface ProcessRow {
  id?: string | number;
  processCode: string;
  processName: string;
  serialNo: number;
}

export interface ItemCategory {
  id: string;
  financialYearId?: number | string;
  mainProcess: string;
  processes: ProcessRow[];
  status: boolean;
  statusLabel?: string; // export ke liye
  createdAt?: string;
  createdAtLabel?: string; // export ke liye (formatted)
  createdBy?: string;
}

export const SERIAL_OPTIONS = Array.from({ length: 20 }, (_, i) => ({
  id: String(i + 1),
  label: String(i + 1),
}));

export const formatDateTime = (value?: string) =>
  value
    ? new Date(value).toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      })
    : "-";

export const emptyItemCategory = (): ItemCategory => ({
  id: "",
  mainProcess: "",
  processes: [],
  status: true,
  createdAt: "",
  createdBy: "",
});