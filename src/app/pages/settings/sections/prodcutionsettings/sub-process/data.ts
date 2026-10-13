export interface SubProcess {
  id: string;
  financialYearId?: number | string;
  processId: string;
  processLabel?: string;
  subProcessName: string;
  subProcessCode: string;
  serialNo: number | string;
  status: boolean;
  statusLabel?: string;
  createdAt?: string;
  createdAtLabel?: string;
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

export const emptySubProcess = (): SubProcess => ({
  id: "",
  processId: "",
  subProcessName: "",
  subProcessCode: "",
  serialNo: "",
  status: true,
  createdAt: "",
  createdBy: "",
});