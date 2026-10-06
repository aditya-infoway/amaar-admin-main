import { ColumnDef } from "@tanstack/react-table";

import {
  SelectCell,
  SelectHeader,
} from "@/components/shared/table/SelectCheckbox";
import { createRowActions } from "../shared/createRowActions";
import { TextCell } from "../shared/tableCells";
import { AccountGroup, formatCreatedDate, formatCreatedTime } from "./data";

const RowActions = createRowActions<AccountGroup>("account group");

export function createColumns(): ColumnDef<AccountGroup>[] {
  return [
    {
      id: "select",
      header: SelectHeader,
      cell: SelectCell,
      enableSorting: false,
    },
    {
      id: "groupName",
      accessorKey: "groupName",
      header: "Main Group",
      cell: TextCell,
    },
    {
      id: "subGroupName",
      accessorKey: "subGroupName",
      header: "Sub Group",
      cell: TextCell,
    },
    { id: "status", accessorKey: "status", header: "Status", cell: TextCell },
    {
      id: "createdDate",
      accessorFn: (row) => formatCreatedDate(row.created),
      header: "Created Date",
      cell: TextCell,
      sortingFn: (a, b) =>
        new Date(a.original.created).getTime() -
        new Date(b.original.created).getTime(),
    },
    {
      id: "createdTime",
      accessorFn: (row) => formatCreatedTime(row.created),
      header: "Created Time",
      cell: TextCell,
      sortingFn: (a, b) =>
        new Date(a.original.created).getTime() -
        new Date(b.original.created).getTime(),
    },
    { id: "actions", header: "Action", cell: RowActions, enableSorting: false },
  ];
}

export const exportColumns = [
  { key: "groupName" as const, header: "Main Group" },
  { key: "subGroupName" as const, header: "Sub Group" },
  { key: "status" as const, header: "Status" },
  { key: "createdDate" as const, header: "Created Date" },
  { key: "createdTime" as const, header: "Created Time" },
];
