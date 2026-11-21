import { ColumnDef } from "@tanstack/react-table";
import {
  SelectCell,
  SelectHeader,
} from "@/components/shared/table/SelectCheckbox";
import { createRowActions } from "../shared/createRowActions";
import { TextCell } from "../shared/tableCells";
import { ExportColumn } from "../shared/export";
import { formatDateDDMMYYYY } from "@/ApiHelper";

// ─── TYPES ──────────────────────────────────────────────────────────────────

export interface PriceComponent {
  id: string;
  item: string;
  type: "BOM" | "Manual" | "Quotation" | "";
  group: string;
  weight: string;
  rate: string;
  value: string;
}

export interface ModelPriceItem {
  id: string;
  modelPriceId?: number;
  modelName: string;
  itemCode?: string;
  currentDate: string;
  components: PriceComponent[];
  componentCount?: number;
  types?: string[];
  typesText?: string; // export only
  totalValue: number | string;
  status: string;
}

// ─── HELPERS ────────────────────────────────────────────────────────────────

// const typeBadgeClass: Record<string, string> = {
//   BOM: "bg-blue-500/15 text-blue-500",
//   Manual: "bg-amber-500/15 text-amber-500",
//   Quotation: "bg-emerald-500/15 text-emerald-500",
// };

// ─── COLUMNS ────────────────────────────────────────────────────────────────

const RowActions = createRowActions<ModelPriceItem>("modelprice");

export const columns: ColumnDef<ModelPriceItem>[] = [
  {
    id: "select",
    header: SelectHeader,
    cell: SelectCell,
    enableSorting: false,
  },
  {
    id: "modelName",
    accessorKey: "modelName",
    header: "Model Name",
    cell: TextCell,
  },
  {
    id: "currentDate",
    accessorKey: "currentDate",
    header: "Date",
    cell: (info) => formatDateDDMMYYYY(info.getValue<string>()),
  },
  //   {
  //     id: "types",
  //     accessorFn: (row) => (row.types || []).join(", "),
  //     header: "Type",
  //     cell: ({ row }) => {
  //       const types = row.original.types || [];
  //       if (types.length === 0) return "—";
  //       return (
  //         <div className="flex flex-wrap gap-1">
  //           {types.map((t) => (
  //             <span
  //               key={t}
  //               className={`rounded-full px-2 py-0.5 text-xs font-medium ${
  //                 typeBadgeClass[t] || "bg-gray-500/15 text-gray-500"
  //               }`}
  //             >
  //               {t}
  //             </span>
  //           ))}
  //         </div>
  //       );
  //     },
  //   },
  //   {
  //     id: "components",
  //     accessorFn: (row) => row.componentCount ?? row.components?.length ?? 0,
  //     header: "Components",
  //     cell: (info) => `${info.getValue<number>()} Items`,
  //   },
  {
    id: "totalValue",
    accessorKey: "totalValue",
    header: "Total Value",
    cell: (info) => {
      const val = Number(info.getValue());
      return `₹${Number.isNaN(val) ? "0.00" : val.toFixed(2)}`;
    },
  },
  {
    id: "actions",
    header: "Actions",
    cell: RowActions,
    enableSorting: false,
  },
];

export const exportColumns: ExportColumn<ModelPriceItem>[] = [
  { key: "modelName", header: "Model Name" },
  { key: "currentDate", header: "Date" },
  { key: "totalValue", header: "Total Value" },
];
