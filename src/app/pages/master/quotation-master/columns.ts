import { ColumnDef } from "@tanstack/react-table";

import {
  SelectCell,
  SelectHeader,
} from "@/components/shared/table/SelectCheckbox";

import { createRowActions } from "../shared/createRowActions";
import { TextCell } from "../shared/tableCells";
import { ExportColumn } from "../shared/export";

export interface CreateMasterItem {
  id: string;
  createMasterId: number;
  companyId: number;
  type: string;
  description: string;
  actualItem: {
    id: string;
    name: string;
  }[];
  exShowroom: string;
  effectiveDate: string;
  status: string;
  created?: string;
}

const RowActions = createRowActions<CreateMasterItem>("createmaster");

export const columns: ColumnDef<CreateMasterItem>[] = [
  {
    id: "select",
    header: SelectHeader,
    cell: SelectCell,
    enableSorting: false,
  },

  {
    id: "type",
    accessorKey: "type",
    header: "Type",
    cell: TextCell,
  },

  {
    id: "description",
    accessorKey: "description",
    header: "Description",
    cell: TextCell,
  },

  {
    id: "actualItem",
    accessorKey: "actualItem",
    header: "Actual Item",
    cell: (info) => {
      const value = info.getValue<CreateMasterItem["actualItem"]>();

      return Array.isArray(value)
        ? value.map((item) => item.name).join(", ")
        : "—";
    },
  },

  {
    id: "exShowroom",
    accessorKey: "exShowroom",
    header: "Ex-Showroom",
    cell: TextCell,
  },

  {
    id: "effectiveDate",
    accessorKey: "effectiveDate",
    header: "Effective Date",
    cell: (info) => {
      const value = info.getValue<string>();

      if (!value) return "—";

      return value;
    },
  },

  {
    id: "actions",
    header: "Actions",
    cell: RowActions,
    enableSorting: false,
  },
];

export const exportColumns: ExportColumn<CreateMasterItem>[] = [
  {
    key: "type",
    header: "Type",
  },

  {
    key: "description",
    header: "Description",
  },

  {
    key: "actualItem",
    header: "Actual Item",
    format: (value: unknown) => {
      if (!Array.isArray(value)) return "";

      return value
        .map((item: any) => item?.name)
        .filter(Boolean)
        .join(", ");
    },
  },

  {
    key: "exShowroom",
    header: "Ex-Showroom",
  },

  {
    key: "effectiveDate",
    header: "Effective Date",
    format: (value: unknown) => {
      if (!value) return "";

      return String(value);
    },
  },
];