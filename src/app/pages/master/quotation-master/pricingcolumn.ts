// pricingcolumn.ts
import { ColumnDef } from "@tanstack/react-table";

import {
  SelectCell,
  SelectHeader,
} from "@/components/shared/table/SelectCheckbox";

import { createRowActions } from "../shared/createRowActions";
import { TextCell } from "../shared/tableCells";
import { ExportColumn } from "../shared/export";

export interface CreatePricingItem {
  id: string;
  createPricingId: number;
  companyId: number;
  code: string;
  description: string;
  effectiveDate: string;
  exShowroomPrice: string;
  status: string;
  created?: string;
}

const RowActions = createRowActions<CreatePricingItem>("createpricing");

export const columns: ColumnDef<CreatePricingItem>[] = [
  {
    id: "select",
    header: SelectHeader,
    cell: SelectCell,
    enableSorting: false,
  },

  {
    id: "code",
    accessorKey: "code",
    header: "Code",
    cell: TextCell,
  },

  {
    id: "description",
    accessorKey: "description",
    header: "Description",
    cell: TextCell,
  },

  {
    id: "effectiveDate",
    accessorKey: "effectiveDate",
    header: "Effective Date",
    cell: TextCell,
  },

  {
    id: "exShowroomPrice",
    accessorKey: "exShowroomPrice",
    header: "Ex-Showroom Price",
    cell: (info) => {
      const value = info.getValue<string>();
      const price = parseFloat(value) || 0;
      return `₹${price.toLocaleString()}`;
    },
  },

  {
    id: "actions",
    header: "Actions",
    cell: RowActions,
    enableSorting: false,
  },
];

export const exportColumns: ExportColumn<CreatePricingItem>[] = [
  {
    key: "code",
    header: "Code",
  },

  {
    key: "description",
    header: "Description",
  },

  {
    key: "effectiveDate",
    header: "Effective Date",
    format: () => "",
  },

  {
    key: "exShowroomPrice",
    header: "Ex-Showroom Price",
    format: () => "",
  },
];