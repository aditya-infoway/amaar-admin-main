import { ColumnDef } from "@tanstack/react-table";

import {
  SelectCell,
  SelectHeader,
} from "@/components/shared/table/SelectCheckbox";
import { createRowActions } from "../shared/createRowActions";
import { TextCell } from "../shared/tableCells";
import { ExportColumn } from "../shared/export";
import { masterStorage, getModelLabel } from "../shared/storage";
import { Enquiry } from "./data";

const RowActions = createRowActions<Enquiry>("enquiry");

const modelLabel = (modelId: string) =>
  getModelLabel(masterStorage.getModels(), modelId);

export const columns: ColumnDef<Enquiry>[] = [
  {
    id: "select",
    header: SelectHeader,
    cell: SelectCell,
    enableSorting: false,
  },
  {
    id: "leadId",
    accessorKey: "leadId",
    header: "Lead Id",
    cell: TextCell,
  },
  {
    id: "name",
    accessorKey: "name",
    header: "Name",
    cell: TextCell,
  },
  {
    id: "number",
    accessorKey: "number",
    header: "Number",
    cell: TextCell,
  },
  {
    id: "email",
    accessorKey: "email",
    header: "Email",
    cell: TextCell,
  },
  {
    id: "address",
    accessorKey: "address",
    header: "Address",
    cell: TextCell,
  },
  {
    id: "city",
    accessorKey: "city",
    header: "City",
    cell: TextCell,
  },
  {
    id: "model",
    accessorKey: "model",
    header: "Select Model",
    cell: (info) => modelLabel(info.getValue<string>()),
  },
  {
    id: "remark",
    accessorKey: "remark",
    header: "Remark",
    cell: TextCell,
  },
  {
    id: "nextFollowupDate",
    accessorKey: "nextFollowupDate",
    header: "Next Followup Date",
    cell: TextCell,
  },
  {
    id: "actions",
    header: "Action",
    cell: RowActions,
    enableSorting: false,
  },
];

export const exportColumns: ExportColumn<Enquiry>[] = [
  { key: "leadId", header: "Lead Id" },
  { key: "name", header: "Name" },
  { key: "number", header: "Number" },
  { key: "email", header: "Email" },
  { key: "address", header: "Address" },
  { key: "city", header: "City" },
  {
    key: "model",
    header: "Select Model",
    format: (value: unknown) => modelLabel(value as string),
  },
  { key: "remark", header: "Remark" },
  { key: "nextFollowupDate", header: "Next Followup Date" },
];