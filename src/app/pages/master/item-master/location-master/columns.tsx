import { ColumnDef } from "@tanstack/react-table";

import {
  SelectCell,
  SelectHeader,
} from "@/components/shared/table/SelectCheckbox";
import { createRowActions } from "../shared/createRowActions";
import { StatusCell, TextCell } from "../shared/tableCells";
import { Location } from "./data";
import { ExportColumn } from "../shared/export";

const RowActions = createRowActions<Location>("location");

export const columns: ColumnDef<Location>[] = [
  {
    id: "select",
    header: SelectHeader,
    cell: SelectCell,
    enableSorting: false,
  },
  {
    id: "locationCode",
    accessorKey: "locationCode",
    header: "Location Code",
    cell: TextCell,
  },
  {
    id: "locationName",
    accessorKey: "locationName",
    header: "Location Name",
    cell: TextCell,
  },
 {
  id: "createdAt",
  accessorKey: "createdAt",
  header: "Created On",
  cell: (info) => {
    const value = info.getValue<string>();

    if (!value) return "—";

    const date = new Date(value);

    return `${String(date.getDate()).padStart(2, "0")}-${String(
      date.getMonth() + 1,
    ).padStart(2, "0")}-${date.getFullYear()}`;
  },
},
  {
    id: "status",
    accessorKey: "status",
    header: "Status",
    cell: StatusCell,
  },
  {
    id: "actions",
    header: "Actions",
    cell: RowActions,
    enableSorting: false,
  },
];

export const exportColumns: ExportColumn<Location>[] = [
  { key: "locationCode", header: "Location Code" },
  { key: "locationName", header: "Location Name" },
  {
    key: "createdAt",
    header: "Created On",
    format: (value: unknown) =>
      value ? new Date(value as string).toLocaleDateString() : "",
  },
  {
    key: "status",
    header: "Status",
    format: (value: unknown) => (value === "active" ? "Active" : "Inactive"),
  },
];