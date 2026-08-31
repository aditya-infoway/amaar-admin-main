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
  weight: number;
}[];
  code: string;
totalWeight: string;
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
  id: "code",
  accessorKey: "code",
  header: "Code",
  cell: TextCell,
},

{
  id: "totalWeight",
  accessorKey: "totalWeight",
  header: "Total Weight",
  cell: TextCell,
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
  key: "code",
  header: "Code",
},

{
  key: "totalWeight",
  header: "Total Weight",
},
];